// API Endpoints
export const API_ENDPOINTS = {
	ORDERS: 'https://api.razorpay.com/v1/orders',
	PAYMENT_LINKS: 'https://api.razorpay.com/v1/payment_links',
	REFUNDS: 'https://api.razorpay.com/v1/refunds',
	PAYMENTS: 'https://api.razorpay.com/v1/payments',
} as const;

// Documentation URLs
export const DOCUMENTATION_URLS = {
	CREATE_ORDER: 'https://razorpay.com/docs/api/orders/create/',
	CREATE_PAYMENT_LINK: 'https://razorpay.com/docs/api/payments/payment-links/create-standard/',
	CREATE_REFUND: 'https://razorpay.com/docs/api/refunds/create-normal/',
	FETCH_ALL_REFUNDS: 'https://razorpay.com/docs/api/refunds/fetch-all/',
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
	MIN_AMOUNT: 100,
	MAX_RECEIPT_LENGTH: 40,
	MAX_REFERENCE_ID_LENGTH: 40,
	MAX_DESCRIPTION_LENGTH: 2048,
	MAX_NOTE_KEY_LENGTH: 256,
	MAX_NOTE_VALUE_LENGTH: 256,
	MAX_NOTES_COUNT: 15,
	DEFAULT_EXPIRY_MONTHS: 6,
} as const;

// Default Values
export const DEFAULT_VALUES = {
	CURRENCY: 'INR',
	CREATE_ORDER_AMOUNT: 50000,
	CREATE_PAYMENT_LINK_AMOUNT: 100000,
	CREATE_REFUND_AMOUNT: 10000,
	FIRST_MIN_PARTIAL_AMOUNT: 100,
	NOTIFY_SMS: true,
	NOTIFY_EMAIL: true,
	REMINDER_ENABLE: true,
	CALLBACK_METHOD: 'get',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
	MIN_AMOUNT: 'Amount must be at least ₹1.00 (100 paise)',
	MAX_RECEIPT_LENGTH: 'Receipt must be maximum 40 characters',
	MAX_REFERENCE_ID_LENGTH: 'Reference ID must be maximum 40 characters',
	MAX_DESCRIPTION_LENGTH: 'Description must be maximum 2048 characters',
	MAX_NOTE_LENGTH: 'Note key and value must be maximum 256 characters each',
	MAX_NOTES_COUNT: 'Maximum 15 key-value pairs allowed in notes',
	INVALID_CALLBACK_URL: 'Callback URL must be a valid URL format',
} as const;

// Node Configuration
export const NODE_CONFIG = {
	DISPLAY_NAME: 'Razorpay',
	NAME: 'razorpay',
	ICON: 'file:assets/razorpay-glyph.svg',
	GROUP: ['transform'],
	VERSION: 1,
	SUBTITLE: '={{$parameter["operation"]}}',
	DESCRIPTION: 'Interact with Razorpay payment gateway API',
	CREDENTIAL_NAME: 'razorpayApi',
}; 