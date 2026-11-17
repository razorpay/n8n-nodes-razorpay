import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError, NodeOperationError } from 'n8n-workflow';
import { buildApiUrl, getUserAgent, toAllowedValues, toBoundedInteger, toUnixTimestamp } from '../utils';
import { API_ENDPOINTS, EXPAND_OPTIONS, LIST_QUERY_LIMITS } from '../constants';
import type { OrderListResponse, FetchOptions } from '../types';

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

/**
 * Map the authorization filter to Razorpay's 1/0 flag; empty means "all orders".
 */
function normalizeAuthorized(value: unknown): number | undefined {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}
	if (value === 1 || value === true || value === '1' || value === 'true') {
		return 1;
	}
	if (value === 0 || value === false || value === '0' || value === 'false') {
		return 0;
	}
	throw new ApplicationError('Authorization Status must be 1 (authorized) or 0 (not authorized)');
}

export async function executeFetchAllOrders(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<OrderListResponse> {
	try {
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as FetchOptions;

		const query = {
			authorized: normalizeAuthorized(additionalOptions.authorized),
			receipt: additionalOptions.receipt || undefined,
			from: additionalOptions.from ? toUnixTimestamp(additionalOptions.from, 'From Date') : undefined,
			to: additionalOptions.to ? toUnixTimestamp(additionalOptions.to, 'To Date') : undefined,
			count:
				additionalOptions.count !== undefined
					? toBoundedInteger(additionalOptions.count, 'Count', LIST_QUERY_LIMITS.MIN_COUNT, LIST_QUERY_LIMITS.MAX_COUNT)
					: undefined,
			skip:
				additionalOptions.skip !== undefined
					? toBoundedInteger(additionalOptions.skip, 'Skip', LIST_QUERY_LIMITS.MIN_SKIP, LIST_QUERY_LIMITS.MAX_SKIP)
					: undefined,
			'expand[]': toAllowedValues(additionalOptions.expand ?? [], EXPAND_OPTIONS.ORDERS, 'Expand Details'),
		};

		const url = buildApiUrl(API_ENDPOINTS.ORDERS, query);

		// Make API request using n8n's authentication helper
		const options: IHttpRequestOptions = {
			method: 'GET',
			url,
			json: true,
			headers: {
				'User-Agent': getUserAgent(),
			},
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'razorpayApi',
			options,
		);

		return response;
	} catch (error: unknown) {
		const err = error as any; // Temporary for error handling
		// Handle specific Razorpay API errors
		if (err.response?.status === 400) {
			throw new NodeOperationError(
				this.getNode(),
				`Bad Request: ${err.response.data?.error?.description || 'Invalid request parameters'}`,
				{ itemIndex }
			);
		}
		
		if (err.response?.status === 401) {
			throw new NodeOperationError(
				this.getNode(),
				'Unauthorized: Invalid API credentials. Please check your Razorpay API key and secret.',
				{ itemIndex }
			);
		}

		// Generic error handling
		const errorMessage = err.response?.data?.error?.description 
			|| err.message 
			|| 'An error occurred while fetching orders';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}