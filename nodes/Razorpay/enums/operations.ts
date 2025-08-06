export enum Resource {
	ORDER = 'order',
	PAYMENT_LINK = 'paymentLink',
	PAYMENT = 'payment',
	REFUND = 'refund',
	SETTLEMENT = 'settlement',
	INVOICE = 'invoice',
	DISPUTE = 'dispute',
}

export enum Operation {
	FETCH_ALL_ORDERS = 'fetchAllOrders',
	CREATE_PAYMENT_LINK = 'createPaymentLink',
	FETCH_PAYMENT_LINK = 'fetchPaymentLink',
	RESEND_PAYMENT_LINK_NOTIFICATION = 'resendPaymentLinkNotification',
	CREATE_REFUND = 'createRefund',
	FETCH_ALL_REFUNDS = 'fetchAllRefunds',
	FETCH_PAYMENT = 'fetchPayment',
	FETCH_ALL_PAYMENTS = 'fetchAllPayments',
	FETCH_SETTLEMENT = 'fetchSettlement',
	FETCH_ALL_SETTLEMENTS = 'fetchAllSettlements',
	FETCH_INVOICES_FOR_SUBSCRIPTION = 'fetchInvoicesForSubscription',
	FETCH_ALL_DISPUTES = 'fetchAllDisputes',
}

export const RESOURCE_OPTIONS = [
	{
		name: 'Orders',
		value: Resource.ORDER,
		description: 'Work with Razorpay Orders',
	},
	{
		name: 'Payment Links',
		value: Resource.PAYMENT_LINK,
		description: 'Work with Razorpay Payment Links',
	},
	{
		name: 'Payments',
		value: Resource.PAYMENT,
		description: 'Work with Razorpay Payments',
	},
	{
		name: 'Refunds',
		value: Resource.REFUND,
		description: 'Work with Razorpay Refunds',
	},
	{
		name: 'Settlements',
		value: Resource.SETTLEMENT,
		description: 'Work with Razorpay Settlements',
	},
	{
		name: 'Invoices',
		value: Resource.INVOICE,
		description: 'Work with Razorpay Invoices',
	},
	{
		name: 'Disputes',
		value: Resource.DISPUTE,
		description: 'Work with Razorpay Disputes',
	},
];

export const ORDER_OPERATIONS = [
	{
		name: 'Fetch All',
		value: Operation.FETCH_ALL_ORDERS,
		description: 'Retrieve details of all orders with optional filters',
		action: 'Fetch all orders',
	},
];

export const PAYMENT_LINK_OPERATIONS = [
	{
		name: 'Create',
		value: Operation.CREATE_PAYMENT_LINK,
		description: 'Create a payment link for customers',
		action: 'Create a payment link',
	},
	{
		name: 'Fetch',
		value: Operation.FETCH_PAYMENT_LINK,
		description: 'Fetch payment link details by ID',
		action: 'Fetch a payment link',
	},
	{
		name: 'Resend Notification',
		value: Operation.RESEND_PAYMENT_LINK_NOTIFICATION,
		description: 'Send or resend payment link notifications via email or SMS',
		action: 'Resend a payment link notification',
	},
];

export const PAYMENT_OPERATIONS = [
	{
		name: 'Fetch Payment',
		value: Operation.FETCH_PAYMENT,
		description: 'Fetch payment details by payment ID',
		action: 'Fetch a payment',
	},
	{
		name: 'Fetch All',
		value: Operation.FETCH_ALL_PAYMENTS,
		description: 'Retrieve details of all payments with optional filters',
		action: 'Fetch all payments',
	},
];

export const REFUND_OPERATIONS = [
	{
		name: 'Create',
		value: Operation.CREATE_REFUND,
		description: 'Create a refund for a payment',
		action: 'Create a refund',
	},
	{
		name: 'Fetch All',
		value: Operation.FETCH_ALL_REFUNDS,
		description: 'Retrieve details of all refunds with optional filters',
		action: 'Fetch all refunds',
	},
];

export const SETTLEMENT_OPERATIONS = [
	{
		name: 'Fetch Settlement',
		value: Operation.FETCH_SETTLEMENT,
		description: 'Fetch settlement details by settlement ID',
		action: 'Fetch a settlement',
	},
	{
		name: 'Fetch All',
		value: Operation.FETCH_ALL_SETTLEMENTS,
		description: 'Retrieve details of all settlements with optional filters',
		action: 'Fetch all settlements',
	},
];

export const INVOICE_OPERATIONS = [
	{
		name: 'Fetch Invoices for Subscription',
		value: Operation.FETCH_INVOICES_FOR_SUBSCRIPTION,
		description: 'Retrieve all invoices of a subscription',
		action: 'Fetch invoices for a subscription',
	},
];

export const DISPUTE_OPERATIONS = [
	{
		name: 'Fetch All',
		value: Operation.FETCH_ALL_DISPUTES,
		description: 'Retrieve all disputes raised by customers',
		action: 'Fetch all disputes',
	},
]; 
