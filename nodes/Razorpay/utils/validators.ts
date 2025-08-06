import { ApplicationError } from 'n8n-workflow';
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '../constants';

/**
 * Validate amount is above minimum threshold
 */
export function validateAmount(amount: number): void {
	if (amount < VALIDATION_LIMITS.MIN_AMOUNT) {
		throw new ApplicationError(ERROR_MESSAGES.MIN_AMOUNT);
	}
}

/**
 * Validate receipt length
 */
export function validateReceipt(receipt: string): void {
	if (receipt && receipt.length > VALIDATION_LIMITS.MAX_RECEIPT_LENGTH) {
		throw new ApplicationError(ERROR_MESSAGES.MAX_RECEIPT_LENGTH);
	}
}

/**
 * Validate reference ID length
 */
export function validateReferenceId(referenceId: string): void {
	if (referenceId && referenceId.length > VALIDATION_LIMITS.MAX_REFERENCE_ID_LENGTH) {
		throw new ApplicationError(ERROR_MESSAGES.MAX_REFERENCE_ID_LENGTH);
	}
}

/**
 * Validate description length
 */
export function validateDescription(description: string): void {
	if (description && description.length > VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH) {
		throw new ApplicationError(ERROR_MESSAGES.MAX_DESCRIPTION_LENGTH);
	}
}

/**
 * Validate notes structure and limits
 */
export function validateNotes(notes: any[]): Record<string, string> {
	const processedNotes: Record<string, string> = {};
	
	for (const note of notes) {
		if (note.key && note.value) {
			if (note.key.length > VALIDATION_LIMITS.MAX_NOTE_KEY_LENGTH || 
				note.value.length > VALIDATION_LIMITS.MAX_NOTE_VALUE_LENGTH) {
				throw new ApplicationError(ERROR_MESSAGES.MAX_NOTE_LENGTH);
			}
			processedNotes[note.key] = note.value;
		}
	}
	
	if (Object.keys(processedNotes).length > VALIDATION_LIMITS.MAX_NOTES_COUNT) {
		throw new ApplicationError(ERROR_MESSAGES.MAX_NOTES_COUNT);
	}
	
	return processedNotes;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): void {
	try {
		new URL(url);
	} catch (error) {
		throw new ApplicationError(ERROR_MESSAGES.INVALID_CALLBACK_URL);
	}
}

/**
 * Validate Razorpay payment ID format
 */
export function validatePaymentId(paymentId: string): void {
	if (!paymentId) {
		throw new ApplicationError('Payment ID is required');
	}
	
	// Razorpay payment IDs start with 'pay_' followed by alphanumeric characters (typically 14+ chars)
	const paymentIdPattern = /^pay_[A-Za-z0-9]{10,}$/;
	if (!paymentIdPattern.test(paymentId)) {
		throw new ApplicationError('Invalid payment ID format. Payment ID should start with "pay_" followed by alphanumeric characters');
	}
}

/**
 * Validate refund amount (different rules than payment amount)
 */
export function validateRefundAmount(amount: number): void {
	if (amount <= 0) {
		throw new ApplicationError('Refund amount must be greater than 0');
	}
} 