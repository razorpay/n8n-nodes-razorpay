import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { buildApiUrl, getUserAgent, toBoundedInteger } from '../utils';
import { API_ENDPOINTS, LIST_QUERY_LIMITS } from '../constants';
import type { SettlementListResponse, FetchOptions } from '../types';

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
): Promise<SettlementListResponse> {
	try {
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as FetchOptions;

		const { MIN_SETTLEMENT_TIMESTAMP, MAX_SETTLEMENT_TIMESTAMP } = LIST_QUERY_LIMITS;
		const query = {
			from: additionalOptions.from
				? toBoundedInteger(additionalOptions.from, 'From timestamp', MIN_SETTLEMENT_TIMESTAMP, MAX_SETTLEMENT_TIMESTAMP)
				: undefined,
			to: additionalOptions.to
				? toBoundedInteger(additionalOptions.to, 'To timestamp', MIN_SETTLEMENT_TIMESTAMP, MAX_SETTLEMENT_TIMESTAMP)
				: undefined,
			count:
				additionalOptions.count && additionalOptions.count !== 10
					? toBoundedInteger(additionalOptions.count, 'Count', LIST_QUERY_LIMITS.MIN_COUNT, LIST_QUERY_LIMITS.MAX_COUNT)
					: undefined,
			skip:
				additionalOptions.skip
					? toBoundedInteger(additionalOptions.skip, 'Skip', LIST_QUERY_LIMITS.MIN_SKIP, LIST_QUERY_LIMITS.MAX_SKIP) || undefined
					: undefined,
		};

		const url = buildApiUrl(`${API_ENDPOINTS.SETTLEMENTS}/`, query);

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
			const errorDesc = err.response.data?.error?.description;
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
			|| 'An error occurred while fetching settlements';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}