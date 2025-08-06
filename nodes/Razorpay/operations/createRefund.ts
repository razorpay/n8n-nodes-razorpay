import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

import { Operation } from '../enums';
import { API_ENDPOINTS, DOCUMENTATION_URLS } from '../constants';
import { validateRefundAmount, validateReceipt, validateNotes, validatePaymentId, formatAmount, formatTimestamp, getCurrentTimestamp } from '../utils';

export const createRefundDescription: INodeProperties[] = [
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_REFUND],
			},
		},
		default: '',
		placeholder: 'pay_29QQoUBi66xm2f',
		description: 'The unique identifier of the payment which needs to be refunded. Must start with "pay_".',
		required: true,
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_REFUND],
			},
		},
		default: null,
		placeholder: '10000',
		description: 'Refund amount in smallest currency sub-unit (paise for INR). Leave empty to refund full amount.',
	},
	{
		displayName: 'Receipt',
		name: 'receipt',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_REFUND],
			},
		},
		default: '',
		placeholder: 'refund_receipt_001',
		description: 'A unique identifier provided by you for your internal reference. Max 40 characters.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_REFUND],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'fixedCollection',
				default: { note: [] },
				description: 'Key-value pairs for storing additional information. Maximum 15 pairs allowed.',
				options: [
					{
						displayName: 'Note',
						name: 'note',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Note key (max 256 characters)',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Note value (max 256 characters)',
							},
						],
					},
				],
			},
		],
	},
];

export async function executeCreateRefund(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Get parameters
	const paymentId = (this.getNodeParameter('paymentId', itemIndex) as string).trim();
	const amount = this.getNodeParameter('amount', itemIndex) as number;
	const receipt = this.getNodeParameter('receipt', itemIndex) as string;
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as any;

	// Validate inputs
	validatePaymentId(paymentId);
	if (amount && amount > 0) {
		validateRefundAmount(amount);
	}
	validateReceipt(receipt);

	// Build request body
	const body: any = {};

	// Add optional fields - only add amount if it's provided and greater than 0
	if (amount && amount > 0) {
		body.amount = amount;
	}

	if (receipt) {
		body.receipt = receipt;
	}

	// Add notes if provided
	if (additionalFields.notes?.note && additionalFields.notes.note.length > 0) {
		const notes = validateNotes(additionalFields.notes.note);
		if (Object.keys(notes).length > 0) {
			body.notes = notes;
		}
	}

	// Make API request
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${API_ENDPOINTS.REFUNDS}/${paymentId}/refund`,
		body,
		json: true,
	};

	const response = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'razorpayApi',
		options,
	);

	// Format the response
	return {
		...response,
		// Add human-readable amount
		amount_formatted: formatAmount(response.amount, response.currency || 'INR'),
		// Add creation date
		created_at_formatted: formatTimestamp(response.created_at),
		// Add API call info
		api_info: {
			endpoint: `POST /v1/payments/${paymentId}/refund`,
			documentation: DOCUMENTATION_URLS.CREATE_REFUND,
			timestamp: getCurrentTimestamp(),
		},
	};
} 