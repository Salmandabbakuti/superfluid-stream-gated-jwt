const { request, gql } = require("graphql-request");
const jwt = require("jsonwebtoken");

const apiKeys = ["123", "456", "789"];
const secret = "mysidrsecret";

// Check if the API key is authorized
const isApiKeyAuthorized = (apiKey) => apiKeys.includes(apiKey);

// Check if the request body has all the required parameters
const isRequestBodyValid = (body) => ["sender", "receiver", "token"].every(param => body.hasOwnProperty(param));

// Retrieve streams using the Superfluid subgraph
async function getStreams(sender, receiver, token) {
  const STREAMS_QUERY = gql`
    query GetStreams($where: Stream_filter!) {
      streams(where: $where) {
        id
      }
    }
  `;
  const { streams } = await request({
    url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
    document: STREAMS_QUERY,
    variables: {
      where: {
        sender,
        receiver,
        token
      }
    }
  });
  return streams;
}

// Generate a JWT token with an expiration time of 1 hour
function generateJwtToken(sender, receiver, token, apiKey) {
  const createdAt = new Date().getTime();
  return jwt.sign(
    { sender, receiver, token, apiKey, createdAt },
    secret,
    { expiresIn: "1h" }
  );
}

exports.handler = async (event, context) => {
  const apiKey = event.headers['x-api-key'];
  console.log("apikey:", apiKey);
  console.log(event.body);

  if (!isApiKeyAuthorized(apiKey)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  const body = JSON.parse(event.body);
  if (!isRequestBodyValid(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' })
    };
  }

  const { sender, receiver, token } = body;
  const streams = await getStreams(sender, receiver, token);
  console.log({ streams });

  if (streams.length > 0) {
    const jwtToken = generateJwtToken(sender, receiver, token, apiKey);

    // 307 redirect to protected page get request with token
    return {
      statusCode: 307,
      headers: {
        Location: `https://superfluid-protected-page.netlify.app/?token=${jwtToken}`
      },
      body: JSON.stringify({ message: 'Success' })
    };

    // or just return the token and redirectUrl
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ token: jwtToken, redirectUrl: 'https://superfluid-protected-page.netlify.app/' })
    // };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: 'Unauthorized' })
  };
};
