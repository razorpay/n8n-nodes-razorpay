import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError, ApplicationError } from 'n8n-workflow';

import {
	fetchAllOrdersDescription,
	executeFetchAllOrders,
	createPaymentLinkDescription,
	executeCreatePaymentLink,
	fetchPaymentLinkDescription,
	executeFetchPaymentLink,
	resendPaymentLinkNotificationDescription,
	executeResendPaymentLinkNotification,
	createRefundDescription,
	executeCreateRefund,
	fetchAllRefundsDescription,
	executeFetchAllRefunds,
	fetchPaymentDescription,
	executeFetchPayment,
	fetchAllPaymentsDescription,
	executeFetchAllPayments,
	fetchSettlementDescription,
	executeFetchSettlement,
	fetchAllSettlementsDescription,
	executeFetchAllSettlements,
	fetchInvoicesForSubscriptionDescription,
	executeFetchInvoicesForSubscription,
	fetchAllDisputesDescription,
	executeFetchAllDisputes,
} from './operations';
import { 
	ORDER_OPERATIONS, 
	PAYMENT_LINK_OPERATIONS, 
	PAYMENT_OPERATIONS,
	REFUND_OPERATIONS,
	SETTLEMENT_OPERATIONS,
	INVOICE_OPERATIONS,
	DISPUTE_OPERATIONS,
	Resource,
	Operation 
} from './enums';
import { NODE_CONFIG } from './constants';

export class Razorpay implements INodeType {
	description: INodeTypeDescription = {
		displayName: NODE_CONFIG.DISPLAY_NAME,
		name: NODE_CONFIG.NAME,
		icon: NODE_CONFIG.ICON as any,
		group: NODE_CONFIG.GROUP,
		version: NODE_CONFIG.VERSION,
		subtitle: NODE_CONFIG.SUBTITLE,
		description: NODE_CONFIG.DESCRIPTION,
		defaults: {
			name: NODE_CONFIG.DISPLAY_NAME,
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: NODE_CONFIG.CREDENTIAL_NAME,
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				default: '',
				noDataExpression: true,
				options: [
					{
						name: 'Order',
						value: Resource.ORDER,
						description: 'Work with Razorpay Orders',
					},
					{
						name: 'Payment Link',
						value: Resource.PAYMENT_LINK,
						description: 'Work with Razorpay Payment Links',
					},
					{
						name: 'Payment',
						value: Resource.PAYMENT,
						description: 'Work with Razorpay Payments',
					},
					{
						name: 'Refund',
						value: Resource.REFUND,
						description: 'Work with Razorpay Refunds',
					},
					{
						name: 'Settlement',
						value: Resource.SETTLEMENT,
						description: 'Work with Razorpay Settlements',
					},
					{
						name: 'Invoice',
						value: Resource.INVOICE,
						description: 'Work with Razorpay Invoices',
					},
					{
						name: 'Dispute',
						value: Resource.DISPUTE,
						description: 'Work with Razorpay Disputes',
					},
				],
			},
			
			// =================
			// ORDER ACTIONS
			// =================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'cre',
				displayOptions: {
					show: {
						resource: [Resource.ORDER],
					},
				},
				noDataExpression: true,
				options: ORDER_OPERATIONS,
			},
			
			// =================
			// PAYMENT LINK ACTIONS  
			// =================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'createPaymentLink',
				displayOptions: {
					show: {
						resource: [Resource.PAYMENT_LINK],
					},
				},
				noDataExpression: true,
				options: PAYMENT_LINK_OPERATIONS,
			},
			
			// =================
			// PAYMENT ACTIONS
			// =================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'fetchPayment',
				displayOptions: {
					show: {
						resource: [Resource.PAYMENT],
					},
				},
				noDataExpression: true,
				options: PAYMENT_OPERATIONS,
			},
			
			// =================
			// REFUND ACTIONS
			// =================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'createRefund',
				displayOptions: {
					show: {
						resource: [Resource.REFUND],
					},
				},
				noDataExpression: true,
				options: REFUND_OPERATIONS,
			},
			
			// =================
			// SETTLEMENT ACTIONS
			// =================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.SETTLEMENT],
					},
				},
				noDataExpression: true,
				options: SETTLEMENT_OPERATIONS,
			},
			
			// =================
			// INVOICE ACTIONS
			// =================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'fetchInvoicesForSubscription',
				displayOptions: {
					show: {
						resource: [Resource.INVOICE],
					},
				},
				noDataExpression: true,
				options: INVOICE_OPERATIONS,
			},
			
			// =================
			// DISPUTE ACTIONS
			// =================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.DISPUTE],
					},
				},
				default: 'fetchAllDisputes',
				noDataExpression: true,
				options: DISPUTE_OPERATIONS,
			},
			
			// Import operation-specific properties
			...fetchAllOrdersDescription,
			...createPaymentLinkDescription,
			...fetchPaymentLinkDescription,
			...resendPaymentLinkNotificationDescription,
			...createRefundDescription,
			...fetchAllRefundsDescription,
			...fetchPaymentDescription,
			...fetchAllPaymentsDescription,
			...fetchSettlementDescription,
			...fetchAllSettlementsDescription,
			...fetchInvoicesForSubscriptionDescription,
			...fetchAllDisputesDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let result: any;

				switch (operation) {
					case Operation.FETCH_ALL_ORDERS:
						result = await executeFetchAllOrders.call(this, itemIndex);
						break;
					case Operation.CREATE_PAYMENT_LINK:
						result = await executeCreatePaymentLink.call(this, itemIndex);
						break;
					case Operation.FETCH_PAYMENT_LINK:
						result = await executeFetchPaymentLink.call(this, itemIndex);
						break;
					case Operation.RESEND_PAYMENT_LINK_NOTIFICATION:
						result = await executeResendPaymentLinkNotification.call(this, itemIndex);
						break;
					case Operation.CREATE_REFUND:
						result = await executeCreateRefund.call(this, itemIndex);
						break;
					case Operation.FETCH_ALL_REFUNDS:
						result = await executeFetchAllRefunds.call(this, itemIndex);
						break;
					case Operation.FETCH_PAYMENT:
						result = await executeFetchPayment.call(this, itemIndex);
						break;
					case Operation.FETCH_ALL_PAYMENTS:
						result = await executeFetchAllPayments.call(this, itemIndex);
						break;
					case Operation.FETCH_SETTLEMENT:
						result = await executeFetchSettlement.call(this, itemIndex);
						break;
					case Operation.FETCH_ALL_SETTLEMENTS:
						result = await executeFetchAllSettlements.call(this, itemIndex);
						break;
					case Operation.FETCH_INVOICES_FOR_SUBSCRIPTION:
						result = await executeFetchInvoicesForSubscription.call(this, itemIndex);
						break;
					case Operation.FETCH_ALL_DISPUTES:
						result = await executeFetchAllDisputes.call(this, itemIndex);
						break;
					default:
						throw new ApplicationError(`Unknown operation: ${operation}`);
				}

				const newItem: INodeExecutionData = {
					json: result,
					pairedItem: { item: itemIndex },
				};

				returnData.push(newItem);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							error: error.message,
							operation: this.getNodeParameter('operation', itemIndex),
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: itemIndex },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
} 