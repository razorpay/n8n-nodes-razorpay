import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const resendPaymentLinkNotificationDescription: INodeProperties[] = [
	// =======================
	// RESEND PAYMENT LINK NOTIFICATION FIELDS
	// =======================
	{
		displayName: 'Payment Link ID',
		name: 'paymentLinkId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['resendPaymentLinkNotification'],
			},
		},
		default: '',
		placeholder: 'plink_KBnb7I424Rc1R9',
		description: 'Unique identifier of the payment link for which notification should be sent',
	},
	{
		displayName: 'Notification Medium',
		name: 'medium',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				operation: ['resendPaymentLinkNotification'],
			},
		},
		options: [
			{
				name: 'SMS',
				value: 'sms',
				description: 'Send notification via SMS',
			},
			{
				name: 'Email',
				value: 'email',
				description: 'Send notification via Email',
			},
		],
		default: 'email',
		description: 'Medium through which the payment link notification should be sent',
	},
];

export async function executeResendPaymentLinkNotification(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const paymentLinkId = this.getNodeParameter('paymentLinkId', itemIndex) as string;
		const medium = this.getNodeParameter('medium', itemIndex) as string;

		// Validate payment link ID format
		if (!paymentLinkId || !paymentLinkId.startsWith('plink_')) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid Payment Link ID format. Payment Link ID should start with "plink_"',
				{ itemIndex }
			);
		}

		// Validate medium
		if (!['sms', 'email'].includes(medium)) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid notification medium. Must be either "sms" or "email"',
				{ itemIndex }
			);
		}

		const url = `https://api.razorpay.com/v1/payment_links/${paymentLinkId}/notify_by/${medium}`;

		// Prepare basic auth
		const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');

		// Make API request
		const response = await this.helpers.httpRequest({
			method: 'POST',
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
			
			// Handle specific error for invalid notification medium
			if (errorDescription?.includes('not a valid notification medium')) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid notification medium: The medium "${this.getNodeParameter('medium', itemIndex)}" is not valid. Use "sms" or "email".`,
					{ itemIndex }
				);
			}

			if (errorDescription?.includes('invalid input')) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid Payment Link ID: The provided ID "${this.getNodeParameter('paymentLinkId', itemIndex)}" is not valid.`,
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

		if (error.response?.status === 404) {
			throw new NodeOperationError(
				this.getNode(),
				`Payment Link not found: The payment link ID "${this.getNodeParameter('paymentLinkId', itemIndex)}" does not exist or does not belong to your account.`,
				{ itemIndex }
			);
		}

		// Generic error handling
		const errorMessage = error.response?.data?.error?.description 
			|| error.message 
			|| 'An error occurred while sending the payment link notification';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}