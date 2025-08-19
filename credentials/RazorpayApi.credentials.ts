import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RazorpayApi implements ICredentialType {
	name = 'razorpayApi';

	displayName = 'Razorpay API';

	documentationUrl = 'https://razorpay.com/docs/api/';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Live',
					value: 'live',
				},
				{
					name: 'Test',
					value: 'test',
				},
			],
			default: 'test',
			description: 'The environment to use',
		},
		{
			displayName: 'Key ID',
			name: 'keyId',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Razorpay Key ID',
		},
		{
			displayName: 'Key Secret',
			name: 'keySecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Razorpay Key Secret',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.keyId}}',
				password: '={{$credentials.keySecret}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.razorpay.com',
			url: '/v1/orders',
			method: 'GET',
			qs: {
				count: 1,
			},
		},
	};
} 