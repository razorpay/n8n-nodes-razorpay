import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const fetchAllPaymentsDescription: INodeProperties[] = [
	// =======================
	// FETCH ALL PAYMENTS FIELDS
	// =======================
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: ['fetchAllPayments'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'From Date',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Start date to fetch payments from',
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'End date to fetch payments until',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 10,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Number of payments to fetch (1-100, default: 10)',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
				},
				description: 'Number of payments to skip for pagination (default: 0)',
			},
		],
	},
];

export async function executeFetchAllPayments(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		// Build query parameters
		const queryParams: string[] = [];

		// Date range filters
		if (additionalOptions.from) {
			const fromTimestamp = Math.floor(new Date(additionalOptions.from).getTime() / 1000);
			queryParams.push(`from=${fromTimestamp}`);
		}

		if (additionalOptions.to) {
			const toTimestamp = Math.floor(new Date(additionalOptions.to).getTime() / 1000);
			queryParams.push(`to=${toTimestamp}`);
		}

		// Pagination
		if (additionalOptions.count !== undefined) {
			queryParams.push(`count=${additionalOptions.count}`);
		}

		if (additionalOptions.skip !== undefined) {
			queryParams.push(`skip=${additionalOptions.skip}`);
		}

		const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
		const url = `https://api.razorpay.com/v1/payments${queryString}`;

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
			const errorDescription = error.response.data?.error?.description;
			
			// Handle specific error for invalid time range
			if (errorDescription?.includes('from must be between')) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid date range: The time range entered is invalid. Please check the from and to dates.',
					{ itemIndex }
				);
			}
			
			throw new NodeOperationError(
				this.getNode(),
				`Bad Request: ${errorDescription || 'Invalid request parameters'}`,
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
			|| 'An error occurred while fetching payments';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}