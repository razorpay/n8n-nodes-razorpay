import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getUserAgent } from '../utils';
import type { InvoiceListResponse } from '../types';

export const fetchInvoicesForSubscriptionDescription: INodeProperties[] = [
	// =======================
	// FETCH INVOICES FOR SUBSCRIPTION FIELDS
	// =======================
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['fetchInvoicesForSubscription'],
			},
		},
		default: '',
		placeholder: 'sub_00000000000001',
		description: 'Unique identifier of the subscription to fetch invoices for',
	},
];

export async function executeFetchInvoicesForSubscription(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<InvoiceListResponse> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const subscriptionId = this.getNodeParameter('subscriptionId', itemIndex) as string;

		// Validate subscription ID format
		if (!subscriptionId || !subscriptionId.startsWith('sub_')) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid Subscription ID format. Subscription ID should start with "sub_"',
				{ itemIndex }
			);
		}

		const url = `https://api.razorpay.com/v1/invoices?subscription_id=${subscriptionId}`;

		// Prepare basic auth
		const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');

		// Make API request
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url,
			headers: {
				'Authorization': `Basic ${auth}`,
				'Content-Type': 'application/json',
				'User-Agent': getUserAgent(),
			},
		});

		return response;
	} catch (error: unknown) {
		const err = error as any; // Temporary for error handling
		// Handle specific Razorpay API errors
		if (err.response?.status === 400) {
			throw new NodeOperationError(
				this.getNode(),
				`Bad Request: ${err.response.data?.error?.description || 'Invalid subscription ID or request parameters'}`,
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

		if (err.response?.status === 404) {
			throw new NodeOperationError(
				this.getNode(),
				`Subscription not found: The subscription ID "${this.getNodeParameter('subscriptionId', itemIndex)}" does not exist or does not belong to your account.`,
				{ itemIndex }
			);
		}

		// Generic error handling
		const errorMessage = err.response?.data?.error?.description 
			|| err.message 
			|| 'An error occurred while fetching invoices for the subscription';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}