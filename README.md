# Superfluid Stream Gating

Streamline your content access with Superfluid Stream Gating.

### Problem Statement:

![sfsg-idea](https://user-images.githubusercontent.com/29351207/227696398-9bf8bf6d-b676-4f74-9b65-68f19b93b652.png)

### Solution Overview:

This project tried to implement superfluid streams gating mechanism as mentioned in the problem statement by providing a serverless function that generates JWTs on-demand for authorized users.
This function is built using the Netlify/AWS Lambda serverless architecture and is written in Node.js. It requires a list of authorized API keys and a secret key to generate JWT tokens. When a user sends a request to the function with a valid API key, it uses the Superfluid protocol subgraph to check if a stream exists for the specified sender, receiver, and token. If a stream exists, it generates a JWT token using the secret key and either returns the token and redirect URL or redirects the user to the protected resource with the token appended as a query parameter.

## Getting Started

To deploy the Superfluid Stream Gating serverless function, you need to have a Netlify account and the Netlify CLI installed. Follow these steps to deploy the function:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/superfluid-stream-gating.git
```

2. Install the dependencies:

```bash
npm install
```

3. Rename the `.env.example` file to `.env` and add your Superfluid Protocol Subgraph URL and the JWT secret key.

```
JWT_SECRET=
APP_URL=
SUBGRAPH_URL=
WHITELISTED_API_KEYS=api_key_1,api_key_2,api_key_3
```

Replace `api_key_1,api_key_2,api_key_3` with your desired API keys,

4. Deploy the function to Netlify:

```bash
netlify deploy
```

5. Follow the prompts to deploy the function to your Netlify account.

## Usage

To use the Superfluid Stream Gating function, you need to make a POST request to the deployed function endpoint with the following parameters in the request body:

`sender`: the Ethereum address of the sender of the stream

`receiver`: the Ethereum address of the receiver of the stream

`token`: the Ethereum address of the token being streamed

`x-api-key`: the API key in the request header

Here is an example curl command for making a request:

```bash
curl -X POST https://superfluid-stream-gating.netlify.app/.netlify/functions/superfluid-stream-gating \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: zaLcG9' \
  -d '{
    "sender": "0x123456789...",
    "receiver": "0x987654321...",
    "token": "0xabcde12345..."
  }'

```

## Credits & Resources:

- [Superfluid Wavepool ideas](https://superfluidhq.notion.site/Superfluid-Wave-Project-Ideas-7e8c792758004bd2ae452d1f9810cc58)
- [Superfluid Protocol Subgraph](https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai)
- [Netlify Functions](https://docs.netlify.com/functions/build/?fn-language=js)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
