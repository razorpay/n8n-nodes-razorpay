import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const fetchAllSettlementsDescription: INodeProperties[] = [
	// =======================
	// FETCH ALL SETTLEMENTS FIELDS
	// =======================
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: ['fetchAllSettlements'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'From Timestamp',
				name: 'from',
				type: 'number',
				default: '',
				placeholder: '1568176960',
				description: 'Unix timestamp (in seconds) from when settlements are to be fetched',
			},
			{
				displayName: 'To Timestamp',
				name: 'to',
				type: 'number',
				default: '',
				placeholder: '1568263360',
				description: 'Unix timestamp (in seconds) till when settlements are to be fetched',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 10,
				placeholder: '10',
				description: 'Number of settlement records to be fetched (1 to 100)',
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
				description: 'Number of settlement records to be skipped for pagination',
				typeOptions: {
					minValue: 0,
				},
			},
		],
	},
];

export async function executeFetchAllSettlements(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		// Build query parameters
		const queryParams: string[] = [];
		
		if (additionalOptions.from) {
			// Validate timestamp range
			const fromTimestamp = Number(additionalOptions.from);
			if (fromTimestamp < 946684800 || fromTimestamp > 4765046400) {
				throw new NodeOperationError(
					this.getNode(),
					'From timestamp must be between 946684800 and 4765046400',
					{ itemIndex }
				);
			}
			queryParams.push(`from=${fromTimestamp}`);
		}

		if (additionalOptions.to) {
			// Validate timestamp range
			const toTimestamp = Number(additionalOptions.to);
			if (toTimestamp < 946684800 || toTimestamp > 4765046400) {
				throw new NodeOperationError(
					this.getNode(),
					'To timestamp must be between 946684800 and 4765046400',
					{ itemIndex }
				);
			}
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
		const url = `https://api.razorpay.com/v1/settlements/${queryString}`;

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
			if (errorDesc?.includes('from must be between')) {
				throw new NodeOperationError(
					this.getNode(),
					'From timestamp must be between 946684800 and 4765046400',
					{ itemIndex }
				);
			}
			if (errorDesc?.includes('to must be between')) {
				throw new NodeOperationError(
					this.getNode(),
					'To timestamp must be between 946684800 and 4765046400',
					{ itemIndex }
				);
			}
			if (errorDesc?.includes('count must be at least 1')) {
				throw new NodeOperationError(
					this.getNode(),
					'Count must be at least 1',
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

		// Generic error handling
		const errorMessage = error.response?.data?.error?.description 
			|| error.message 
			|| 'An error occurred while fetching settlements';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}