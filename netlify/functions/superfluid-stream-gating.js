const { request, gql } = require("graphql-request");
const jwt = require("jsonwebtoken");

const whitelistedApiKeys = process.env.WHITELISTED_API_KEYS
  ? process.env.WHITELISTED_API_KEYS.split(",")
  : [];
const secret = process.env.JWT_SECRET;
const subgraphUrl = process.env.SUBGRAPH_URL;
const appUrl = process.env.APP_URL;

// Check if the API key is authorized
const isApiKeyAuthorized = (apiKey) => whitelistedApiKeys.includes(apiKey);

// Check if the request body has all the required parameters
const isRequestBodyValid = (body) =>
  ["sender", "receiver", "token"].every((param) => body.hasOwnProperty(param));

// Retrieve streams using the Superfluid subgraph
async function getStreams(sender, receiver, token) {
  const STREAMS_QUERY = gql`
    query GetStreams($first: Int, $where: Stream_filter!) {
      streams(first: $first, where: $where) {
        id
      }
    }
  `;
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
function generateJwtToken(sender, receiver, token) {
  return jwt.sign({ sender, receiver, token }, secret, {
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

  const { sender, receiver, token } = body;
  const streams = await getStreams(sender, receiver, token);
  if (!streams || streams.length === 0)
    return {
      statusCode: 401,
      body: JSON.stringify({
        code: "Unauthorized",
        message: "No stream found to authorize!"
      })
    };

  // Generate JWT token if stream exists
  const jwtToken = generateJwtToken(sender, receiver, token);

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
