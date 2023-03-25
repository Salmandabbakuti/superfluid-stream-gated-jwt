const express = require('express');
const app = express();
const { request, gql } = require("graphql-request");
const jwt = require("jsonwebtoken");

app.use(express.json());

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

app.post('/authenticate', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  console.log("apikey:", apiKey);
  console.log(req.body);

  if (!isApiKeyAuthorized(apiKey)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // check if sender, receiver and token are provided

  if (!isRequestBodyValid(req.body)) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const { sender, receiver, token } = req.body;
  const streams = await getStreams(sender, receiver, token);
  if (streams.length === 0) return res.status(404).json({ message: 'Stream not found to autenticate' });
  const jwtToken = generateJwtToken(sender, receiver, token, apiKey);
  // 307 redirect to protected page get request with token
  return res.status(307).redirect(`https://superfluid-token-gating.vercel.app/protected?token=${jwtToken}`);
  //or just return the token and redirect url
  // return res.status(200).json({ token, redirectUrl: `https://superfluid-token-gating.vercel.app/protected?token=${jwtToken}` });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello Superfluid!' });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
