'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { run, createContext } = require('./helpers');
const { executeFetchAllOrders } = require('../dist/nodes/Razorpay/operations/fetchAllOrders');
const { executeFetchAllPayments } = require('../dist/nodes/Razorpay/operations/fetchAllPayments');
const { executeFetchAllDisputes } = require('../dist/nodes/Razorpay/operations/fetchAllDisputes');
const { executeFetchAllRefunds } = require('../dist/nodes/Razorpay/operations/fetchAllRefunds');
const { executeFetchAllSettlements } = require('../dist/nodes/Razorpay/operations/fetchAllSettlements');

async function expectRejected(fn, additionalOptions) {
	const ctx = createContext({ additionalOptions });
	await assert.rejects(() => fn.call(ctx, 0));
	assert.equal(ctx.requests.length, 0);
}

function queryOf(url) {
	return new URL(url).searchParams;
}

test('fetchAllOrders builds an encoded query string from valid options', async () => {
	const requests = await run(executeFetchAllOrders, {
		additionalOptions: { authorized: 1, receipt: 'Receipt No. 1&x=y', count: 25, skip: 5, expand: ['payments', 'payments.card'] },
	});
	const url = requests[0].url;
	assert.ok(url.startsWith('https://api.razorpay.com/v1/orders?'));
	const q = queryOf(url);
	assert.equal(q.get('authorized'), '1');
	assert.equal(q.get('receipt'), 'Receipt No. 1&x=y');
	assert.equal(q.get('count'), '25');
	assert.equal(q.get('skip'), '5');
	assert.deepEqual(q.getAll('expand[]'), ['payments', 'payments.card']);
	assert.equal(q.get('x'), null);
});

test('fetchAllOrders omits the authorized filter for "All Orders"', async () => {
	const requests = await run(executeFetchAllOrders, { additionalOptions: { authorized: '' } });
	assert.equal(requests[0].url, 'https://api.razorpay.com/v1/orders');
});

test('fetchAllOrders rejects non-numeric or out-of-range pagination and unknown filter values', async () => {
	await expectRejected(executeFetchAllOrders, { authorized: '1&count=100' });
	await expectRejected(executeFetchAllOrders, { count: '10&skip=0' });
	await expectRejected(executeFetchAllOrders, { count: 1000 });
	await expectRejected(executeFetchAllOrders, { skip: '0&count=100' });
	await expectRejected(executeFetchAllOrders, { skip: -1 });
	await expectRejected(executeFetchAllOrders, { expand: ['payments&count=100'] });
	await expectRejected(executeFetchAllOrders, { from: 'not-a-date' });
});

test('fetchAllPayments builds an encoded query string and validates pagination', async () => {
	const requests = await run(executeFetchAllPayments, { additionalOptions: { count: 50, skip: 0 } });
	assert.equal(requests[0].url, 'https://api.razorpay.com/v1/payments?count=50&skip=0');
	await expectRejected(executeFetchAllPayments, { count: '10&expand[]=card' });
	await expectRejected(executeFetchAllPayments, { skip: '1&expand[]=card' });
});

test('fetchAllDisputes only accepts the documented expand values', async () => {
	const requests = await run(executeFetchAllDisputes, { additionalOptions: { expand: ['payments', 'transaction.settlement'] } });
	assert.equal(requests[0].url, 'https://api.razorpay.com/v1/disputes?expand[]=payments&expand[]=transaction.settlement');
	await expectRejected(executeFetchAllDisputes, { expand: ['payments&count=100'] });
});

test('fetchAllRefunds builds an encoded query string and validates values', async () => {
	const requests = await run(executeFetchAllRefunds, { additionalOptions: { from: 1700000000, to: 1700100000, count: 20, skip: 3 } });
	assert.equal(requests[0].url, 'https://api.razorpay.com/v1/refunds?from=1700000000&to=1700100000&count=20&skip=3');
	await expectRejected(executeFetchAllRefunds, { from: 'abc' });
	await expectRejected(executeFetchAllRefunds, { skip: '1&count=100' });
});

test('fetchAllSettlements builds an encoded query string and validates values', async () => {
	const requests = await run(executeFetchAllSettlements, { additionalOptions: { from: 1700000000, count: 20, skip: 3 } });
	assert.equal(requests[0].url, 'https://api.razorpay.com/v1/settlements/?from=1700000000&count=20&skip=3');
	await expectRejected(executeFetchAllSettlements, { from: 'abc' });
	await expectRejected(executeFetchAllSettlements, { skip: '1&count=100' });
});
