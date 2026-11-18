import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { buildApiUrl, getUserAgent, toAllowedValues } from '../utils';
import { API_ENDPOINTS, EXPAND_OPTIONS } from '../constants';
import type { DisputeListResponse, FetchOptions } from '../types';

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
): Promise<DisputeListResponse> {
	try {
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as FetchOptions;

		const url = buildApiUrl(API_ENDPOINTS.DISPUTES, {
			'expand[]': toAllowedValues(additionalOptions.expand ?? [], EXPAND_OPTIONS.DISPUTES, 'Expand Details'),
		});

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
			|| 'An error occurred while fetching disputes';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}