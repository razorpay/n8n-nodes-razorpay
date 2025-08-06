import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

import { CURRENCY_OPTIONS, Operation } from '../enums';
import { API_ENDPOINTS, DOCUMENTATION_URLS } from '../constants';
import { 
	validateAmount, 
	validateReferenceId, 
	validateDescription, 
	validateNotes, 
	validateUrl,
	formatAmount, 
	formatTimestamp, 
	getCurrentTimestamp 
} from '../utils';

export const createPaymentLinkDescription: INodeProperties[] = [
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: 100000,
		placeholder: '100000',
		description: 'Amount to be paid using the Payment Link. Must be in the smallest unit of the currency (paise for INR). For ₹1000, enter 100000.',
		required: true,
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		options: CURRENCY_OPTIONS,
		default: 'INR',
		description: 'ISO code for the currency',
		required: true,
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: '',
		placeholder: 'Payment for policy no #23456',
		description: 'A brief description of the Payment Link. Maximum 2048 characters.',
	},
	{
		displayName: 'Reference ID',
		name: 'reference_id',
		type: 'string',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: '',
		placeholder: 'TS1989',
		description: 'Reference number tagged to a Payment Link. Must be unique for each Payment Link. Maximum 40 characters.',
	},
	{
		displayName: 'Customer Details',
		name: 'customerDetails',
		type: 'collection',
		placeholder: 'Add Customer Detail',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Customer Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'John Smith',
				description: 'Name of the customer',
			},
			{
				displayName: 'Customer Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'john.smith@example.com',
				description: 'Email address of the customer',
			},
			{
				displayName: 'Customer Contact',
				name: 'contact',
				type: 'string',
				default: '',
				placeholder: '+919876543210',
				description: 'Phone number of the customer',
			},
		],
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				operation: [Operation.CREATE_PAYMENT_LINK],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Accept Partial Payment',
				name: 'accept_partial',
				type: 'boolean',
				default: false,
				description: 'Whether customers can make partial payments using the Payment Link',
			},
			{
				displayName: 'Callback Method',
				name: 'callback_method',
				type: 'options',
				default: 'get',
				options: [
					{
						name: 'GET',
						value: 'get',
					},
				],
				description: 'HTTP method for callback. Must be "get" if callback_url is provided.',
				displayOptions: {
					show: {
						callback_url: ['/.+/'],
					},
				},
			},
			{
				displayName: 'Callback URL',
				name: 'callback_url',
				type: 'string',
				default: '',
				placeholder: 'https://example-callback-url.com/',
				description: 'Redirect URL after payment completion. Must be a valid URL format.',
			},
			{
				displayName: 'Enable Reminders',
				name: 'reminder_enable',
				type: 'boolean',
				default: true,
				description: 'Whether to send reminders for the Payment Link',
			},
			{
				displayName: 'Expire By',
				name: 'expire_by',
				type: 'dateTime',
				default: '',
				description: 'Timestamp at which the Payment Link will expire. By default, valid for six months from creation.',
			},
			{
				displayName: 'First Min Partial Amount',
				name: 'first_min_partial_amount',
				type: 'number',
				default: 100,
				description: 'Minimum amount that must be paid as the first partial payment. Must be passed along with accept_partial parameter.',
				displayOptions: {
					show: {
						accept_partial: [true],
					},
				},
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'fixedCollection',
				description: 'Key-value pairs for additional information. Maximum 15 pairs, 256 characters each.',
				placeholder: 'Add Note',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'note',
						displayName: 'Note',
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
			{
				displayName: 'Send Email Notification',
				name: 'notify_email',
				type: 'boolean',
				default: true,
				description: 'Whether to send email notification to customer',
			},
			{
				displayName: 'Send SMS Notification',
				name: 'notify_sms',
				type: 'boolean',
				default: true,
				description: 'Whether to send SMS notification to customer',
			},
		],
	},
];

export async function executeCreatePaymentLink(this: IExecuteFunctions, itemIndex: number): Promise<any> {

	const amount = this.getNodeParameter('amount', itemIndex) as number;
	const currency = this.getNodeParameter('currency', itemIndex) as string;
	const description = this.getNodeParameter('description', itemIndex) as string;
	const reference_id = this.getNodeParameter('reference_id', itemIndex) as string;
	const customerDetails = this.getNodeParameter('customerDetails', itemIndex) as any;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex) as any;

	validateAmount(amount);
	validateDescription(description);
	validateReferenceId(reference_id);

	const body: any = {
		amount,
		currency,
	};

	if (description) {
		body.description = description;
	}

	if (reference_id) {
		body.reference_id = reference_id;
	}

	if (customerDetails && (customerDetails.name || customerDetails.email || customerDetails.contact)) {
		body.customer = {};
		if (customerDetails.name) body.customer.name = customerDetails.name;
		if (customerDetails.email) body.customer.email = customerDetails.email;
		if (customerDetails.contact) body.customer.contact = customerDetails.contact;
	}

	if (additionalOptions.accept_partial !== undefined) {
		body.accept_partial = additionalOptions.accept_partial;
		
		if (additionalOptions.accept_partial && additionalOptions.first_min_partial_amount) {
			body.first_min_partial_amount = additionalOptions.first_min_partial_amount;
		}
	}

	if (additionalOptions.expire_by) {
		const expireDate = new Date(additionalOptions.expire_by);
		body.expire_by = Math.floor(expireDate.getTime() / 1000);
	}

	if (additionalOptions.notify_sms !== undefined || additionalOptions.notify_email !== undefined) {
		body.notify = {};
		if (additionalOptions.notify_sms !== undefined) body.notify.sms = additionalOptions.notify_sms;
		if (additionalOptions.notify_email !== undefined) body.notify.email = additionalOptions.notify_email;
	}

	if (additionalOptions.reminder_enable !== undefined) {
		body.reminder_enable = additionalOptions.reminder_enable;
	}

	if (additionalOptions.callback_url) {
		validateUrl(additionalOptions.callback_url);
		body.callback_url = additionalOptions.callback_url;
		body.callback_method = additionalOptions.callback_method || 'get';
	}

	if (additionalOptions.notes?.note && additionalOptions.notes.note.length > 0) {
		const notes = validateNotes(additionalOptions.notes.note);
		if (Object.keys(notes).length > 0) {
			body.notes = notes;
		}
	}

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: API_ENDPOINTS.PAYMENT_LINKS,
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
		amount_formatted: formatAmount(response.amount, currency),
		created_at_formatted: formatTimestamp(response.created_at),
		expire_by_formatted: response.expire_by ? formatTimestamp(response.expire_by) : null,
		api_info: {
			endpoint: 'POST /v1/payment_links',
			documentation: DOCUMENTATION_URLS.CREATE_PAYMENT_LINK,
			timestamp: getCurrentTimestamp(),
		},
	};
} 