'use strict';

/**
 * Minimal stand-in for n8n's IExecuteFunctions that records outgoing requests.
 */
function createContext(params) {
	const requests = [];
	return {
		requests,
		getNode: () => ({ id: 'test', name: 'Razorpay', type: 'razorpay', typeVersion: 1, position: [0, 0], parameters: {} }),
		getNodeParameter: (name, _itemIndex, fallback) => (name in params ? params[name] : fallback),
		helpers: {
			httpRequestWithAuthentication: {
				call: async (_thisArg, _credentialType, options) => {
					requests.push(options);
					return { count: 0, items: [] };
				},
			},
		},
	};
}

async function run(executeFn, params) {
	const ctx = createContext(params);
	await executeFn.call(ctx, 0);
	return ctx.requests;
}

module.exports = { createContext, run };
