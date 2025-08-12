/**
 * User Agent utility inspired by Stripe's Java SDK implementation
 * Creates a comprehensive user agent string with library and runtime information
 */

// Package information
const PACKAGE_VERSION = '0.1.0';
const N8N_INTEGRATION = 'n8n';

/**
 * Generate a comprehensive user agent string
 * Format: n8n-razorpay/0.1.0 (n8n; Node.js/v20.15.0; OS/platform)
 */
export function getUserAgent(): string {
	// Base library identification
	const libraryInfo = `n8n-razorpay/${PACKAGE_VERSION}`;
	
	// Runtime information
	const nodeVersion = process.version;
	const platform = process.platform;
	const arch = process.arch;
	
	// Build the user agent string
	const userAgent = `${libraryInfo} (${N8N_INTEGRATION}; Node.js/${nodeVersion}; ${platform}/${arch})`;
	return userAgent;
}

/**
 * Get a simple user agent for basic identification
 */
export function getSimpleUserAgent(): string {
	return N8N_INTEGRATION;
} 