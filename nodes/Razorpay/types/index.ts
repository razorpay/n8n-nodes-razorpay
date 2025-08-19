/**
 * Comprehensive TypeScript type definitions for Razorpay API
 * These types replace 'any' usages throughout the codebase
 */

import type { IDataObject } from 'n8n-workflow';

// =================
// COMMON TYPES
// =================

export interface RazorpayCredentials {
	keyId: string;
	keySecret: string;
	environment?: 'live' | 'test';
}

export interface RazorpayError {
	code: string;
	description: string;
	source: string;
	step: string;
	reason: string;
	metadata?: Record<string, unknown>;
}

export interface RazorpayErrorResponse {
	error: RazorpayError;
}

export interface ApiInfo {
	endpoint: string;
	documentation: string;
	timestamp: string;
}

// =================
// NOTES AND METADATA
// =================

export interface NoteItem {
	key: string;
	value: string;
}

export interface NotesCollection {
	note: NoteItem[];
}

export interface CustomerDetails {
	name?: string;
	email?: string;
	contact?: string;
}

export interface Address {
	line1?: string;
	line2?: string;
	zipcode?: string;
	city?: string;
	state?: string;
	country?: string;
}

// =================
// PAYMENT LINK TYPES
// =================

export interface PaymentLinkCustomer {
	name?: string;
	email?: string;
	contact?: string;
}

export interface PaymentLinkNotify {
	sms?: boolean;
	email?: boolean;
	whatsapp?: boolean;
}

export interface PaymentLinkOptions {
	accept_partial?: boolean;
	callback_method?: 'get';
	callback_url?: string;
	reminder_enable?: boolean;
	expire_by?: number;
	first_min_partial_amount?: number;
	notes?: Record<string, string>;
	notify_sms?: boolean;
	notify_email?: boolean;
}

export interface CreatePaymentLinkRequest {
	amount: number;
	currency: string;
	description?: string;
	reference_id?: string;
	customer?: PaymentLinkCustomer;
	notify?: PaymentLinkNotify;
	reminder_enable?: boolean;
	expire_by?: number;
	callback_url?: string;
	callback_method?: 'get';
	accept_partial?: boolean;
	first_min_partial_amount?: number;
	notes?: Record<string, string>;
}

export interface PaymentLinkResponse {
	id: string;
	entity: 'payment_link';
	status: 'created' | 'partially_paid' | 'paid' | 'cancelled' | 'expired';
	amount: number;
	amount_paid: number;
	currency: string;
	description?: string;
	reference_id?: string;
	customer: PaymentLinkCustomer;
	notify: PaymentLinkNotify;
	reminder_enable: boolean;
	short_url: string;
	user_id: string;
	created_at: number;
	updated_at?: number;
	expire_by?: number;
	expired_at?: number;
	cancelled_at?: number;
	notes: Record<string, string>;
	upi_link?: string;
	accept_partial: boolean;
	first_min_partial_amount?: number;
	// Formatted fields added by our utility
	amount_formatted?: string;
	created_at_formatted?: string;
	expire_by_formatted?: string;
	api_info?: ApiInfo;
}

// =================
// PAYMENT TYPES
// =================

export interface PaymentCard {
	id: string;
	entity: 'card';
	name?: string;
	last4: string;
	network: string;
	type: 'credit' | 'debit' | 'prepaid';
	issuer?: string;
	international: boolean;
	emi?: boolean;
	sub_type?: string;
}

export interface PaymentUpi {
	payer_account_type: string;
	vpa?: string;
}

export interface PaymentEmi {
	issuer: string;
	rate: number;
	duration: number;
}

export interface PaymentResponse {
	id: string;
	entity: 'payment';
	amount: number;
	currency: string;
	status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
	order_id?: string;
	invoice_id?: string;
	international: boolean;
	method: 'card' | 'netbanking' | 'wallet' | 'emi' | 'upi' | 'cardless_emi' | 'paylater';
	amount_refunded: number;
	refund_status?: 'null' | 'partial' | 'full';
	captured: boolean;
	description?: string;
	card_id?: string;
	bank?: string;
	wallet?: string;
	vpa?: string;
	email: string;
	contact: string;
	notes: Record<string, string>;
	fee?: number;
	tax?: number;
	error_code?: string;
	error_description?: string;
	error_source?: string;
	error_step?: string;
	error_reason?: string;
	acquirer_data?: Record<string, unknown>;
	created_at: number;
	card?: PaymentCard;
	upi?: PaymentUpi;
	emi?: PaymentEmi;
}

export interface PaymentListResponse {
	entity: 'collection';
	count: number;
	items: PaymentResponse[];
}

// =================
// ORDER TYPES
// =================

export interface OrderResponse {
	id: string;
	entity: 'order';
	amount: number;
	amount_paid: number;
	amount_due: number;
	currency: string;
	receipt?: string;
	offer_id?: string;
	status: 'created' | 'attempted' | 'paid';
	attempts: number;
	notes: Record<string, string>;
	created_at: number;
}

export interface OrderListResponse {
	entity: 'collection';
	count: number;
	items: OrderResponse[];
}

// =================
// REFUND TYPES
// =================

export interface RefundResponse {
	id: string;
	entity: 'refund';
	amount: number;
	currency: string;
	payment_id: string;
	notes: Record<string, string>;
	receipt?: string;
	acquirer_data?: Record<string, unknown>;
	created_at: number;
	batch_id?: string;
	status: 'pending' | 'processed' | 'failed';
	speed_processed: 'normal' | 'optimum' | 'instant';
	speed_requested: 'normal' | 'optimum' | 'instant';
}

export interface RefundListResponse {
	entity: 'collection';
	count: number;
	items: RefundResponse[];
}

// =================
// SETTLEMENT TYPES
// =================

export interface SettlementResponse {
	id: string;
	entity: 'settlement';
	amount: number;
	status: 'created' | 'partially_processed' | 'processed' | 'failed';
	fees: number;
	tax: number;
	utr?: string;
	created_at: number;
	updated_at?: number;
}

export interface SettlementListResponse {
	entity: 'collection';
	count: number;
	items: SettlementResponse[];
}

// =================
// DISPUTE TYPES
// =================

export interface DisputeResponse {
	id: string;
	entity: 'dispute';
	payment_id: string;
	amount: number;
	currency: string;
	amount_deducted: number;
	reason_code: string;
	respond_by: number;
	status: 'open' | 'under_review' | 'won' | 'lost' | 'closed';
	phase: 'chargeback' | 'pre_arbitration' | 'arbitration';
	created_at: number;
	evidence?: Record<string, unknown>;
}

export interface DisputeListResponse {
	entity: 'collection';
	count: number;
	items: DisputeResponse[];
}

// =================
// INVOICE TYPES
// =================

export interface InvoiceResponse {
	id: string;
	entity: 'invoice';
	receipt?: string;
	invoice_number?: string;
	customer_id?: string;
	customer_details?: CustomerDetails;
	order_id?: string;
	line_items?: unknown[];
	payment_id?: string;
	status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'cancelled' | 'expired' | 'deleted';
	expire_by?: number;
	issued_at?: number;
	paid_at?: number;
	cancelled_at?: number;
	expired_at?: number;
	sms_status?: string;
	email_status?: string;
	date: number;
	terms?: string;
	partial_payment: boolean;
	gross_amount: number;
	tax_amount: number;
	taxable_amount: number;
	amount: number;
	amount_paid: number;
	amount_due: number;
	currency: string;
	currency_symbol?: string;
	description?: string;
	notes: Record<string, string>;
	comment?: string;
	short_url?: string;
	view_less: boolean;
	billing_start?: number;
	billing_end?: number;
	type: 'invoice' | 'ecod' | 'link';
	group_taxes_discounts: boolean;
	created_at: number;
	idempotency_key?: string;
}

export interface InvoiceListResponse {
	entity: 'collection';
	count: number;
	items: InvoiceResponse[];
}

// =================
// REQUEST BODY TYPES
// =================

export type CreatePaymentLinkBody = CreatePaymentLinkRequest;
export type PaymentLinkAdditionalOptions = PaymentLinkOptions;
export type CustomerDetailsInput = CustomerDetails;

// =================
// UTILITY TYPES
// =================

export interface FetchOptions {
	from?: string;
	to?: string;
	count?: number;
	skip?: number;
	expand_card?: boolean;
	expand_emi?: boolean;
	expand_offers?: boolean;
	expand_upi?: boolean;
	expand?: string[]; // For disputes and other endpoints
	payment_id?: string; // For refunds
	subscription_id?: string; // For invoices
	authorized?: boolean | string; // For orders - can be boolean or string in n8n forms
	receipt?: string; // For orders
}

export type RazorpayApiResponse = 
	(PaymentLinkResponse | PaymentResponse | PaymentListResponse | OrderResponse | OrderListResponse | RefundResponse | RefundListResponse | SettlementResponse | SettlementListResponse | DisputeResponse | DisputeListResponse | InvoiceResponse | InvoiceListResponse) & IDataObject; 