import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const fetchAllRefundsDescription: INodeProperties[] = [
	// =======================
	// FETCH ALL REFUNDS FIELDS
	// =======================
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: ['fetchAllRefunds'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'From Timestamp',
				name: 'from',
				type: 'number',
				default: '',
				placeholder: '1594982363',
				description: 'Unix timestamp at which the refunds were created',
			},
			{
				displayName: 'To Timestamp',
				name: 'to',
				type: 'number',
				default: '',
				placeholder: '1600856650',
				description: 'Unix timestamp till which the refunds were created',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 10,
				placeholder: '10',
				description: 'Number of refunds to fetch (1 to 100)',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				placeholder: '0',
				description: 'Number of refunds to be skipped for pagination',
				typeOptions: {
					minValue: 0,
				},
			},
		],
	},
];

export async function executeFetchAllRefunds(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		// Build query parameters
		const queryParams: string[] = [];
		
		if (additionalOptions.from) {
			const fromTimestamp = Number(additionalOptions.from);
			queryParams.push(`from=${fromTimestamp}`);
		}

		if (additionalOptions.to) {
			const toTimestamp = Number(additionalOptions.to);
			queryParams.push(`to=${toTimestamp}`);
		}

		if (additionalOptions.count && additionalOptions.count !== 10) {
			const count = Number(additionalOptions.count);
			if (count < 1 || count > 100) {
				throw new NodeOperationError(
					this.getNode(),
					'Count must be between 1 and 100',
					{ itemIndex }
				);
			}
			queryParams.push(`count=${count}`);
		}

		if (additionalOptions.skip && additionalOptions.skip > 0) {
			queryParams.push(`skip=${additionalOptions.skip}`);
		}

		const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
		const url = `https://api.razorpay.com/v1/refunds${queryString}`;

		// Prepare basic auth
		const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');

		// Make API request
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url,
			headers: {
				'Authorization': `Basic ${auth}`,
				'Content-Type': 'application/json',
			},
		});

		return response;
	} catch (error: any) {
		// Handle specific Razorpay API errors
		if (error.response?.status === 400) {
			const errorDesc = error.response.data?.error?.description;
			if (errorDesc?.includes('payment id field is required')) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid request: The endpoint was accessed incorrectly',
					{ itemIndex }
				);
			}
			throw new NodeOperationError(
				this.getNode(),
				`Bad Request: ${errorDesc || 'Invalid request parameters'}`,
				{ itemIndex }
			);
		}
		
		if (error.response?.status === 401) {
			throw new NodeOperationError(
				this.getNode(),
				'Unauthorized: Invalid API credentials. Please check your Razorpay API key and secret.',
				{ itemIndex }
			);
		}

		if (error.response?.status === 404) {
			throw new NodeOperationError(
				this.getNode(),
				'Not Found: The requested URL was not found on the server. Please check the endpoint.',
				{ itemIndex }
			);
		}

		// Generic error handling
		const errorMessage = error.response?.data?.error?.description 
			|| error.message 
			|| 'An error occurred while fetching refunds';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}