const { request, gql } = require("graphql-request");
const jwt = require("jsonwebtoken");

const whitelistedApiKeys = process.env.WHITELISTED_API_KEYS
  ? process.env.WHITELISTED_API_KEYS.split(",")
  : [];
const secret = process.env.JWT_SECRET;
const appUrl = process.env.APP_URL;

const subgraphUrls = {
  "goerli": "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli",
  "mumbai": "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
  "matic": "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic"
};

// Check if the API key is authorized
const isApiKeyAuthorized = (apiKey) => whitelistedApiKeys.includes(apiKey);

// Check if the request body has all the required parameters
const isRequestBodyValid = (body) =>
  ["sender", "receiver", "token"].every((param) => body.hasOwnProperty(param));

// Retrieve streams using the Superfluid subgraph
async function getStreams({ chain, sender, receiver, token }) {
  const STREAMS_QUERY = gql`
    query GetStreams($first: Int, $where: Stream_filter!) {
      streams(first: $first, where: $where) {
        id
      }
    }
  `;
  // Get the subgraph URL based on the chain or fallback to goerli
  const subgraphUrl = subgraphUrls[chain] || subgraphUrls["goerli"];
  const { streams } = await request({
    url: subgraphUrl,
    document: STREAMS_QUERY,
    variables: {
      first: 1,
      where: {
        sender,
        receiver,
        token,
        currentFlowRate_gt: 0
      }
    }
  });
  return streams;
}

// Generate a JWT token with an expiration time of 1 hour
function generateJwtToken({ chain, sender, receiver, token }) {
  return jwt.sign({ chain, sender, receiver, token }, secret, {
    expiresIn: "1h"
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return {
      statusCode: 405,
      body: JSON.stringify({
        code: "Method Not Allowed",
        message: "Only POST requests are allowed"
      })
    };
  const apiKey = event.headers["x-api-key"];

  if (!isApiKeyAuthorized(apiKey)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ code: "Unauthorized", message: "Invalid API key" })
    };
  }

  const body = event.body && JSON.parse(event.body);
  if (!isRequestBodyValid(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: "Bad Request",
        message: "Missing required parameters/bad request body format"
      })
    };
  }

  const { chain = "goerli", sender, receiver, token } = body;
  const streams = await getStreams({ chain, sender, receiver, token });
  if (!streams || streams.length === 0)
    return {
      statusCode: 401,
      body: JSON.stringify({
        code: "Unauthorized",
        message: "No stream found to authorize!"
      })
    };

  // Generate JWT token if stream exists
  const jwtToken = generateJwtToken({ chain, sender, receiver, token });

  // 307 redirect to protected page with token
  // event.httpMethod = "GET";
  // return {
  //   statusCode: 307,
  //   headers: {
  //     Location: `${appUrl}?token=${jwtToken}`
  //   },
  //   body: ""
  // };

  // or just return the token and redirectUrl
  return {
    statusCode: 200,
    body: JSON.stringify({ token: jwtToken, redirectUrl: `${appUrl}?token=${jwtToken}` })
  };
};
