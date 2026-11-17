import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { buildApiUrl, getUserAgent, toBoundedInteger, toUnixTimestamp } from '../utils';
import { API_ENDPOINTS, LIST_QUERY_LIMITS } from '../constants';
import type { PaymentListResponse, FetchOptions } from '../types';

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
): Promise<PaymentListResponse> {
	try {
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as FetchOptions;

		const query = {
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
		};

		const url = buildApiUrl(API_ENDPOINTS.PAYMENTS, query);

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
			const errorDescription = err.response.data?.error?.description;
			
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
			|| 'An error occurred while fetching payments';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}