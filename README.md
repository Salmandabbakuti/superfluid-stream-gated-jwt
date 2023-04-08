# Superfluid Stream Gating

Streamline your content access with Superfluid Stream Gating.

### Abour Superfluid:

Superfluid is a revolutionary asset streaming protocol that brings subscriptions, salaries, vesting, and rewards to DAOs and crypto-native businesses worldwide - https://www.superfluid.finance/

### Problem Statement:

![sfsg-idea](https://user-images.githubusercontent.com/29351207/227696398-9bf8bf6d-b676-4f74-9b65-68f19b93b652.png)

### Solution Overview:

This project tried to implement superfluid streams gating mechanism as mentioned in the problem statement by providing a serverless function that generates JWTs on-demand for authorized users.
This function is built using the Netlify/AWS Lambda serverless architecture and is written in Node.js. It requires a list of authorized API keys and a secret key to generate JWT tokens. When a user sends a request to the function with a valid API key, it uses the Superfluid protocol subgraph to check if a stream exists for the specified sender, receiver, and token. If a stream exists with active flow rate, it generates a JWT token using the secret key and either returns the token and redirect URL or redirects the user to the protected resource with the token appended as a query parameter.

## Deployment

To deploy the Superfluid Stream Gating serverless function, you need to have a Netlify account. Follow these steps to deploy the function:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Salmandabbakuti/superfluid-stream-gated-jwt#JWT_SECRET=somesupersecret&SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli&WHITELISTED_API_KEYS=api_key_1,api_key_2,api_key_3&APP_URL=https://superfluid-stream-gating.netlify.app/)

Click the button above to deploy the function to your Netlify account. Follow the instructions to deploy your function.

Once the function is deployed, you need to update the following environment variables. You can do this by going to the `Site settings` tab of your Netlify site and clicking on `Environment Variables` > Select a variable > `Options` > `Edit`.

```
JWT_SECRET=
APP_URL=
SUBGRAPH_URL=
WHITELISTED_API_KEYS=api_key_1,api_key_2,api_key_3
```

After updating the environment variables, you can access the function endpoint by going to the `Functions` tab of your Netlify site and clicking on the `superfluid-stream-gating` function.

## Usage

To use the Superfluid Stream Gating function [`superfluid-stream-gating.js`](netlify/functions/superfluid-stream-gating.js), you need to make a POST request to the deployed function endpoint with the following parameters in the request body:

`sender`: the Ethereum address of the sender of the stream

`receiver`: the Ethereum address of the receiver of the stream

`token`: the Ethereum address of the token being streamed

`chain` (optional): The Ethereum network where the stream is taking place. Defaults to goerli if not provided. Possible values: `goerli`, `mumbai`, `matic`

`x-api-key`: the API key in the request header

> Note: This project uses subgraph to verify the existence of the stream before authenticating access. You can specify `chain` in request body to use the subgraph of the specified chain. The supported chains are `goerli`, `mumbai`, `matic`. If no `chain` is specified, the function will use the `goerli` subgraph by default.

Here is an example curl command for making a request:

```bash
curl -X POST https://superfluid-stream-gating.netlify.app/.netlify/functions/superfluid-stream-gating \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: zaLcG9' \
  -d '{
    "chain": "goerli",
    "sender": "0xc7203561ef179333005a9b81215092413ab86ae9",
    "receiver": "0x7348943c8d263ea253c0541656c36b88becd77b9",
    "token": "0xf2d68898557ccb2cf4c10c3ef2b034b2a69dad00"
  }'

```

## Roadmap:

- [ ] Create a standalone npm package for the Superfluid stream gating function with in-built token verfication functionality.
- [ ] Add more example integrations with various app frameworks such as React, Nextjs, Nodejs(Server-side).
- [ ] Add support for more Ethereum networks and improve error handling

## Credits & Resources:

- [Superfluid Wavepool ideas](https://superfluidhq.notion.site/Superfluid-Wave-Project-Ideas-7e8c792758004bd2ae452d1f9810cc58)
- [Superfluid Protocol Subgraph](https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai)
- [Netlify Functions](https://docs.netlify.com/functions/build/?fn-language=js)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
