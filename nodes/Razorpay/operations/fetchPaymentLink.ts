import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getUserAgent } from '../utils';
import type { PaymentLinkResponse } from '../types';

export const fetchPaymentLinkDescription: INodeProperties[] = [
	// =======================
	// FETCH PAYMENT LINK FIELDS
	// =======================
	{
		displayName: 'Payment Link ID',
		name: 'paymentLinkId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['fetchPaymentLink'],
			},
		},
		default: '',
		placeholder: 'plink_KBnb7I424Rc1R9',
		description: 'Unique identifier of the payment link to be retrieved',
	},
];

export async function executeFetchPaymentLink(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<PaymentLinkResponse> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const paymentLinkId = this.getNodeParameter('paymentLinkId', itemIndex) as string;

		// Validate payment link ID format
		if (!paymentLinkId || !paymentLinkId.startsWith('plink_')) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid Payment Link ID format. Payment Link ID should start with "plink_"',
				{ itemIndex }
			);
		}

		const url = `https://api.razorpay.com/v1/payment_links/${paymentLinkId}`;

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
			const errorDescription = err.response.data?.error?.description;
			if (errorDescription?.includes('invalid input')) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid Payment Link ID: The provided ID "${this.getNodeParameter('paymentLinkId', itemIndex)}" is not valid.`,
					{ itemIndex }
				);
			}
			throw new NodeOperationError(
				this.getNode(),
				`Bad Request: ${errorDescription || 'Invalid payment link ID or request parameters'}`,
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
				`Payment Link not found: The payment link ID "${this.getNodeParameter('paymentLinkId', itemIndex)}" does not exist or does not belong to your account.`,
				{ itemIndex }
			);
		}

		// Generic error handling
		const errorMessage = err.response?.data?.error?.description 
			|| err.message 
			|| 'An error occurred while fetching the payment link';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}