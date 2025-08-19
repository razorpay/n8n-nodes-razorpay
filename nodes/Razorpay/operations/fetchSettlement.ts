import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getUserAgent } from '../utils';
import type { SettlementResponse } from '../types';

export const fetchSettlementDescription: INodeProperties[] = [
	// =======================
	// FETCH SETTLEMENT FIELDS
	// =======================
	{
		displayName: 'Settlement ID',
		name: 'settlementId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['fetchSettlement'],
			},
		},
		default: '',
		placeholder: 'setl_DGlQ1Rj8os78Ec',
		description: 'Unique identifier of the settlement to be retrieved',
	},
];

export async function executeFetchSettlement(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<SettlementResponse> {
	try {
		const credentials = await this.getCredentials('razorpayApi');
		const settlementId = this.getNodeParameter('settlementId', itemIndex) as string;

		// Validate settlement ID format
		if (!settlementId || !settlementId.startsWith('setl_')) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid Settlement ID format. Settlement ID should start with "setl_"',
				{ itemIndex }
			);
		}

		const url = `https://api.razorpay.com/v1/settlements/${settlementId}`;

		// Prepare basic auth
		const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');

		// Make API request
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url,
			headers: {
				'Authorization': `Basic ${auth}`,
				'Content-Type': 'application/json',
				'User-Agent': getUserAgent(),
			},
		});

		return response;
	} catch (error: unknown) {
		const err = error as any; // Temporary for error handling
		// Handle specific Razorpay API errors
		if (err.response?.status === 400) {
			throw new NodeOperationError(
				this.getNode(),
				`Bad Request: ${err.response.data?.error?.description || 'Invalid settlement ID or request parameters'}`,
				{ itemIndex }
			);
		}
		
		if (err.response?.status === 401) {
			throw new NodeOperationError(
				this.getNode(),
				'Unauthorized: Invalid API credentials. Please check your Razorpay API key and secret.',
				{ itemIndex }
			);
		}

		if (err.response?.status === 404) {
			throw new NodeOperationError(
				this.getNode(),
				`Settlement not found: The settlement ID "${this.getNodeParameter('settlementId', itemIndex)}" does not exist or does not belong to your account.`,
				{ itemIndex }
			);
		}

		// Generic error handling
		const errorMessage = err.response?.data?.error?.description 
			|| err.message 
			|| 'An error occurred while fetching the settlement';

		throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
	}
}