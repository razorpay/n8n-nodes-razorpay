import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const fetchPaymentDescription: INodeProperties[] = [
	// =======================
	// FETCH PAYMENT FIELDS
	// =======================
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['fetchPayment'],
			},
		},
		default: '',
		placeholder: 'pay_DG4ZdRK8ZnXC3k',
		description: 'Unique identifier of the payment to be retrieved',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: ['fetchPayment'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Expand Card Details',
				name: 'expand_card',
				type: 'boolean',
				default: false,
				description: 'Whether to expand card details in the response',
			},
			{
				displayName: 'Expand EMI Details',
				name: 'expand_emi',
				type: 'boolean',
				default: false,
				description: 'Whether to expand EMI details in the response',
			},
			{
				displayName: 'Expand Offer Details',
				name: 'expand_offers',
				type: 'boolean',
				default: false,
				description: 'Whether to expand offer details in the response',
			},
			{
				displayName: 'Expand UPI Details',
				name: 'expand_upi',
				type: 'boolean',
				default: false,
				description: 'Whether to expand UPI details in the response',
			},
		],
	},
];

export async function executeFetchPayment(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const paymentId = this.getNodeParameter('paymentId', itemIndex) as string;
		const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		// Validate payment ID format
		if (!paymentId || !paymentId.startsWith('pay_')) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid Payment ID format. Payment ID should start with "pay_"',
				{ itemIndex }
			);
		}

		// Build query parameters for expand options
		const queryParams: string[] = [];
		if (additionalOptions.expand_card) {
			queryParams.push('expand[]=card');
		}
		if (additionalOptions.expand_emi) {
			queryParams.push('expand[]=emi');
		}
		if (additionalOptions.expand_offers) {
			queryParams.push('expand[]=offers');
		}
		if (additionalOptions.expand_upi) {
			queryParams.push('expand[]=upi');
		}

		const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
		const url = `https://api.razorpay.com/v1/payments/${paymentId}${queryString}`;

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
				`Bad Request: ${error.response.data?.error?.description || 'Invalid payment ID or request parameters'}`,
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

		if (error.response?.status === 404) {
			throw new NodeOperationError(
				this.getNode(),
				`Payment not found: The payment ID "${this.getNodeParameter('paymentId', itemIndex)}" does not exist.`,
				{ itemIndex }
			);
		}

		// Generic error handling
		const errorMessage = error.response?.data?.error?.description 
			|| error.message 
			|| 'An error occurred while fetching the payment';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}