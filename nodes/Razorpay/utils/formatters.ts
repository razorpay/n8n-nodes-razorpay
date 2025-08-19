import { Currency } from '../enums';

/**
 * Format amount to human-readable currency string
 */
export function formatAmount(amount: number, currency: string): string {
	const formattedAmount = (amount / 100).toFixed(2);
	
	if (currency === Currency.INR) {
		return `₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
	}
	
	return `${currency} ${formattedAmount}`;
}

/**
 * Format Unix timestamp to ISO string
 */
export function formatTimestamp(timestamp: number): string {
	return new Date(timestamp * 1000).toISOString();
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
	return new Date().toISOString();
} 