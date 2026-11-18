'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { appendPathSegment, buildApiUrl, isValidRazorpayId } = require('../dist/nodes/Razorpay/utils/request');

test('appendPathSegment URL-encodes the id segment', () => {
	assert.equal(appendPathSegment('https://api.razorpay.com/v1/payments', 'pay_ABC123'), 'https://api.razorpay.com/v1/payments/pay_ABC123');
	assert.equal(
		appendPathSegment('https://api.razorpay.com/v1/payments', 'a/../b?c=d#e'),
		'https://api.razorpay.com/v1/payments/a%2F..%2Fb%3Fc%3Dd%23e',
	);
});

test('buildApiUrl encodes query values and keeps array keys readable', () => {
	assert.equal(buildApiUrl('https://api.razorpay.com/v1/orders'), 'https://api.razorpay.com/v1/orders');
	assert.equal(
		buildApiUrl('https://api.razorpay.com/v1/orders', {
			count: 10,
			skip: undefined,
			receipt: 'a&b=c',
			'expand[]': ['payments', 'payments.card'],
		}),
		'https://api.razorpay.com/v1/orders?count=10&receipt=a%26b%3Dc&expand[]=payments&expand[]=payments.card',
	);
});

test('isValidRazorpayId accepts well-formed ids and rejects others', () => {
	assert.equal(isValidRazorpayId('pay_DG4ZdRK8ZnXC3k', 'pay'), true);
	assert.equal(isValidRazorpayId('sub_00000000000001', 'sub'), true);
	assert.equal(isValidRazorpayId('plink_ExjpAUN3gVHrPJ', 'plink'), true);
	assert.equal(isValidRazorpayId('setl_DGlQ1Rj8os78Ec', 'setl'), true);
	for (const bad of ['', 'pay_', 'pay_short', 'pay_DG4ZdRK8Zn/../x', 'pay_DG4ZdRK8Zn?count=1', 'setl_DGlQ1Rj8os78Ec', ' pay_DG4ZdRK8ZnXC3k']) {
		assert.equal(isValidRazorpayId(bad, 'pay'), false, bad);
	}
	assert.equal(isValidRazorpayId(undefined, 'pay'), false);
});
