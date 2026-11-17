import { ApplicationError } from 'n8n-workflow';

/**
 * Razorpay entity id prefixes used by this node.
 */
export type RazorpayIdPrefix = 'pay' | 'plink' | 'setl' | 'sub';

/**
 * Razorpay ids are "<prefix>_" followed by an alphanumeric body.
 */
const ID_BODY_PATTERN = '[A-Za-z0-9]{10,}';

export function isValidRazorpayId(id: unknown, prefix: RazorpayIdPrefix): boolean {
	if (typeof id !== 'string') {
		return false;
	}
	return new RegExp(`^${prefix}_${ID_BODY_PATTERN}$`).test(id);
}

/**
 * Append a single path segment to a base URL, URL-encoding the segment so it
 * can never change the path structure or introduce a query string.
 */
export function appendPathSegment(baseUrl: string, segment: string): string {
	return `${baseUrl}/${encodeURIComponent(segment)}`;
}

export type QueryValue = string | number | boolean | ReadonlyArray<string | number> | undefined | null;
export type QueryParams = Readonly<Record<string, QueryValue>>;

/**
 * Serialize query parameters with URLSearchParams. Undefined, null and empty
 * string values are omitted; array values repeat the key. Keys ending in "[]"
 * keep literal brackets for readability (values are always fully encoded).
 */
export function buildQueryString(params: QueryParams = {}): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		const values = Array.isArray(value) ? value : [value];
		for (const item of values) {
			if (item === undefined || item === null || item === '') {
				continue;
			}
			search.append(key, String(item));
		}
	}
	const serialized = search.toString().replace(/%5B%5D=/g, '[]=');
	return serialized ? `?${serialized}` : '';
}

export function buildApiUrl(baseUrl: string, params?: QueryParams): string {
	return `${baseUrl}${buildQueryString(params)}`;
}

/**
 * Coerce a value to an integer within [min, max], or throw.
 */
export function toBoundedInteger(value: unknown, name: string, min: number, max: number): number {
	const numeric = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
	if (typeof numeric !== 'number' || !Number.isInteger(numeric) || numeric < min || numeric > max) {
		throw new ApplicationError(`${name} must be an integer between ${min} and ${max}`);
	}
	return numeric;
}

/**
 * Convert a date-like value (ISO string or Date) to a Unix timestamp in seconds, or throw.
 */
export function toUnixTimestamp(value: unknown, name: string): number {
	const millis = new Date(value as string).getTime();
	if (!Number.isFinite(millis)) {
		throw new ApplicationError(`${name} must be a valid date`);
	}
	return Math.floor(millis / 1000);
}

/**
 * Ensure every value is one of the allowed options, or throw.
 */
export function toAllowedValues(
	values: ReadonlyArray<unknown>,
	allowed: ReadonlyArray<string>,
	name: string,
): string[] {
	return values.map((value) => {
		if (typeof value !== 'string' || !allowed.includes(value)) {
			throw new ApplicationError(`${name} must be one of: ${allowed.join(', ')}`);
		}
		return value;
	});
}
