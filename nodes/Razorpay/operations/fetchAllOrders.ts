import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const fetchAllOrdersDescription: INodeProperties[] = [
	// =======================
	// FETCH ALL ORDERS FIELDS
	// =======================
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: ['fetchAllOrders'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Authorization Status',
				name: 'authorized',
				type: 'options',
				options: [
					{
						name: 'All Orders',
						value: '',
					},
					{
						name: 'Authorized Only',
						value: 1,
					},
					{
						name: 'Not Authorized Only',
						value: 0,
					},
				],
				default: '',
				description: 'Filter orders by payment authorization status',
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
				description: 'Number of orders to fetch (1-100, default: 10)',
			},
			{
				displayName: 'Expand Details',
				name: 'expand',
				type: 'multiOptions',
				options: [
					{
						name: 'Payments',
						value: 'payments',
						description: 'Include payment details for each order',
					},
					{
						name: 'Payment Card Details',
						value: 'payments.card',
						description: 'Include card details for each payment',
					},
				],
				default: [],
				description: 'Additional information to include in the response',
			},
			{
				displayName: 'From Date',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Start date to fetch orders from',
			},
			{
				displayName: 'Receipt',
				name: 'receipt',
				type: 'string',
				default: '',
				placeholder: 'Receipt No. 1',
				description: 'Filter orders by receipt number',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
				},
				description: 'Number of orders to skip for pagination (default: 0)',
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'End date to fetch orders until',
			},
		],
	},
];

export async function executeFetchAllOrders(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		// Build query parameters
		const queryParams: string[] = [];

		// Authorization filter
		if (additionalOptions.authorized !== undefined && additionalOptions.authorized !== '') {
			queryParams.push(`authorized=${additionalOptions.authorized}`);
		}

		// Receipt filter
		if (additionalOptions.receipt) {
			queryParams.push(`receipt=${encodeURIComponent(additionalOptions.receipt)}`);
		}

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

		// Expand options
		if (additionalOptions.expand && additionalOptions.expand.length > 0) {
			additionalOptions.expand.forEach((expandOption: string) => {
				queryParams.push(`expand[]=${expandOption}`);
			});
		}

		const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
		const url = `https://api.razorpay.com/v1/orders${queryString}`;

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
			throw new NodeOperationError(
				this.getNode(),
				`Bad Request: ${error.response.data?.error?.description || 'Invalid request parameters'}`,
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
			|| 'An error occurred while fetching orders';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}