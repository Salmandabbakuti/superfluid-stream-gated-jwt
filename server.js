const express = require('express');
const app = express();
const { request, gql } = require("graphql-request");
const jwt = require("jsonwebtoken");

app.use(express.json());

const apiKeys = ["123", "456", "789"];
const secret = "mysidrsecret";

const STREAMS_QUERY = gql`
  query streams(
    $skip: Int
    $first: Int
    $where: Stream_filter
    $orderBy: Stream_orderBy
    $orderDirection: OrderDirection
  ) {
    streams(
      skip: $skip
      first: $first
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      sender
      receiver
      token
    }
  }
`;

app.post('/authenticate', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  console.log("apikey:", apiKey);
  console.log(req.body);

  if (!apiKey || !apiKeys.includes(apiKey)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // check if sender, receiver and token are provided

  if (!req.body || ['sender', 'receiver', 'token'].some(key => !req.body[key])) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const { sender, receiver, token } = req.body;

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
  console.log({ streams });
  if (streams.length > 0) {
    // create jwt token
    const createdAt = new Date().getTime();
    const jwtToken = jwt.sign(
      { sender, receiver, token, apiKey, createdAt },
      secret,
      { expiresIn: "1h" }
    );
    // 307 redirect to protected page get request with token
    // return res.status(307).redirect(`https://superfluid-token-gating.vercel.app/protected?token=${jwtToken}`);
    // or just return the token and redirectUrl
    return res.status(200).json({ token: jwtToken, redirectUrl: 'https://token-gating.vercel.app/protected' });
  } else {
    return res.status(404).json({ message: 'Stream not found to autenticate' });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello Superfluid!' });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
