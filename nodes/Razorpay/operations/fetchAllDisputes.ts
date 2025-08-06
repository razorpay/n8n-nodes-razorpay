import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const fetchAllDisputesDescription: INodeProperties[] = [
	// =======================
	// FETCH ALL DISPUTES FIELDS
	// =======================
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: ['fetchAllDisputes'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Expand Details',
				name: 'expand',
				type: 'multiOptions',
				default: [],
				description: 'Expand specific details in the response',
				options: [
					{
						name: 'Payment Details',
						value: 'payments',
						description: 'Expand payment details for each dispute',
					},
					{
						name: 'Transaction Settlement Details',
						value: 'transaction.settlement',
						description: 'Expand transaction settlement details for each dispute',
					},
				],
			},
		],
	},
];

export async function executeFetchAllDisputes(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		// Build query parameters
		const queryParams: string[] = [];
		
		// Handle expand options
		if (additionalOptions.expand && additionalOptions.expand.length > 0) {
			additionalOptions.expand.forEach((expandOption: string) => {
				queryParams.push(`expand[]=${expandOption}`);
			});
		}

		const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
		const url = `https://api.razorpay.com/v1/disputes${queryString}`;

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
			if (errorDesc?.includes('expand must be one of following types')) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid expand parameter. Must be one of: payments, transaction.settlement',
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
			|| 'An error occurred while fetching disputes';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}