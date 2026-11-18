'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { run } = require('./helpers');
const { executeFetchPayment } = require('../dist/nodes/Razorpay/operations/fetchPayment');
const { executeFetchPaymentLink } = require('../dist/nodes/Razorpay/operations/fetchPaymentLink');
const { executeFetchSettlement } = require('../dist/nodes/Razorpay/operations/fetchSettlement');
const { executeFetchInvoicesForSubscription } = require('../dist/nodes/Razorpay/operations/fetchInvoicesForSubscription');

const cases = [
	{ name: 'fetchPayment', fn: executeFetchPayment, param: 'paymentId', id: 'pay_DG4ZdRK8ZnXC3k', url: 'https://api.razorpay.com/v1/payments/pay_DG4ZdRK8ZnXC3k' },
	{ name: 'fetchPaymentLink', fn: executeFetchPaymentLink, param: 'paymentLinkId', id: 'plink_ExjpAUN3gVHrPJ', url: 'https://api.razorpay.com/v1/payment_links/plink_ExjpAUN3gVHrPJ' },
	{ name: 'fetchSettlement', fn: executeFetchSettlement, param: 'settlementId', id: 'setl_DGlQ1Rj8os78Ec', url: 'https://api.razorpay.com/v1/settlements/setl_DGlQ1Rj8os78Ec' },
	{ name: 'fetchInvoicesForSubscription', fn: executeFetchInvoicesForSubscription, param: 'subscriptionId', id: 'sub_00000000000001', url: 'https://api.razorpay.com/v1/invoices?subscription_id=sub_00000000000001' },
];

for (const c of cases) {
	const prefix = c.id.split('_')[0] + '_';

	test(`${c.name} requests the expected URL for a well-formed id`, async () => {
		const requests = await run(c.fn, { [c.param]: c.id });
		assert.equal(requests.length, 1);
		assert.equal(requests[0].url, c.url);
		assert.equal(requests[0].method, 'GET');
	});

	for (const suffix of ['../../../v1/customers', 'x/y', 'abcdefghij?count=100', 'abcdefghij&count=100', 'abcdefghij#frag', 'abc%2e%2e']) {
		test(`${c.name} rejects malformed id ${JSON.stringify(prefix + suffix)} without sending a request`, async () => {
			const params = { [c.param]: prefix + suffix };
			const { createContext } = require('./helpers');
			const ctx = createContext(params);
			await assert.rejects(() => c.fn.call(ctx, 0), /Invalid .* ID format/);
			assert.equal(ctx.requests.length, 0);
		});
	}
}

test('fetchPayment keeps expand options as fixed query parameters', async () => {
	const requests = await run(executeFetchPayment, {
		paymentId: 'pay_DG4ZdRK8ZnXC3k',
		additionalOptions: { expand_card: true, expand_upi: true },
	});
	assert.equal(requests[0].url, 'https://api.razorpay.com/v1/payments/pay_DG4ZdRK8ZnXC3k?expand[]=card&expand[]=upi');
});
