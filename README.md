# n8n-nodes-razorpay

This is an n8n community node. It lets you use Razorpay in your n8n workflows.

Razorpay is a comprehensive payment solution that allows businesses to accept, process and disburse payments with its product suite. It gives you access to all payment modes including credit card, debit card, netbanking, UPI and popular wallets including JioMoney, Mobikwik, Airtel Money, FreeCharge, Ola Money and PayZapp.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials) 
[Compatibility](#compatibility)  
[Usage](#usage) 
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports the following operations across different Razorpay resources:

### Orders
- **Fetch All Orders** - Retrieve details of all orders with optional filters (authorization status, date range, receipt number, etc.)

### Payment Links
- **Create Payment Link** - Create a payment link for customers with customizable options (amount, currency, customer details, expiry, etc.)
- **Fetch Payment Link** - Fetch payment link details by ID

### Payments
- **Fetch Payment** - Fetch payment details by payment ID with optional expansion of card, EMI, offer, and UPI details
- **Fetch All Payments** - Retrieve details of all payments with optional filters (date range, pagination)

### Refunds
- **Fetch All Refunds** - Retrieve details of all refunds with optional filters (date range, pagination)

### Settlements
- **Fetch Settlement** - Fetch settlement details by settlement ID
- **Fetch All Settlements** - Retrieve details of all settlements with optional filters (date range, pagination)

### Invoices
- **Fetch Invoices for Subscription** - Retrieve all invoices of a subscription

### Disputes
- **Fetch All Disputes** - Retrieve all disputes raised by customers with optional expansion of payment and settlement details

## Credentials

To use this node, you need to authenticate with Razorpay using your API credentials.

### Prerequisites

1. **Sign up for a Razorpay account**: If you don't have one already, create an account at [razorpay.com](https://razorpay.com)
2. **Complete your KYC**: Ensure your account is activated and KYC is completed to access live mode

### Getting Your API Credentials

1. Log in to your Razorpay Dashboard at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys** or directly visit [https://dashboard.razorpay.com/#/app/keys](https://dashboard.razorpay.com/#/app/keys)
3. You'll find two types of keys:
   - **Test Keys**: For testing and development (starts with `rzp_test_`)
   - **Live Keys**: For production use (starts with `rzp_live_`)

### Setting up Credentials in n8n

1. In n8n, create a new **Razorpay API** credential
2. Enter your credentials:
   - **Key ID**: Your Razorpay Key ID (e.g., `rzp_test_1234567890` or `rzp_live_1234567890`)
   - **Key Secret**: Your Razorpay Key Secret
3. **Test the connection** to ensure your credentials are working correctly


### Authentication Methods

This node supports the standard Razorpay API authentication method using:
- **Key ID and Key Secret**: The primary authentication method for most API operations

## Compatibility

Tested locally against n8n v1.104.2.

## Usage

### Installing the Razorpay Community Node in n8n

There are several ways to install this community node in your n8n instance:

#### Method 1: Install via n8n Community Nodes (Recommended)

1. **Open n8n**: Access your n8n instance
2. **Go to Settings**: Click on "Settings" in the left sidebar
3. **Navigate to Community Nodes**: Click on "Community Nodes" in the settings menu
4. **Install the Node**: 
   - Click "Install a community node"
   - Enter the package name: `@razorpay/n8n-nodes-razorpay`
   - Click "Install"
5. **Restart n8n**: The node will be available after n8n restarts

#### Method 2: Install via npm (Self-hosted)

If you're running n8n in a self-hosted environment:

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the community node
npm install @razorpay/n8n-nodes-razorpay

# Restart your n8n instance
```

#### Method 3: Install via Docker

If you're using n8n with Docker, add the package to your Docker setup:

```dockerfile
# In your Dockerfile or docker-compose.yml
FROM n8nio/n8n:latest
USER root
RUN npm install -g @razorpay/n8n-nodes-razorpay
USER node
```

### Using the Razorpay Node

Once installed:

1. **Create a new workflow** or open an existing one
2. **Add the Razorpay node**: Search for "Razorpay" in the node panel and drag it into your workflow
3. **Configure credentials**: Set up your Razorpay API credentials (see [Credentials](#credentials) section)
4. **Select operation**: Choose the operation you want to perform (Create Order, Fetch Payment, etc.)
5. **Configure parameters**: Fill in the required parameters for your selected operation
6. **Test and execute**: Test your workflow to ensure everything works correctly

### Getting Started Tips

- **Start with Test Mode**: Always use test credentials when setting up and testing your workflows
- **Check API Documentation**: Refer to [Razorpay's API documentation](https://docs.razorpay.com) for detailed parameter information
- **Use Webhooks**: Consider setting up Razorpay webhooks for real-time payment updates in your workflows

If you're new to n8n, check out the [Try it out](https://docs.n8n.io/try-it-out/) documentation to help you get started with workflow automation.

## Resources

* [Razorpay API Documentation](https://docs.razorpay.com)
* [Razorpay Dashboard](https://dashboard.razorpay.com)
* [Getting Started with Razorpay](https://docs.razorpay.com/docs/getting-started)