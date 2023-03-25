const { request, gql } = require("graphql-request");
const jwt = require("jsonwebtoken");

const apiKeys = ["123", "456", "789"];
const secret = "mysidrsecret";

exports.handler = async (event, context) => {
  const apiKey = event.headers['x-api-key'];
  console.log("apikey:", apiKey);
  console.log(event.body);

  if (!apiKey || !apiKeys.includes(apiKey)) return {
    statusCode: 401,
    body: JSON.stringify({ message: 'Unauthorized' })
  };

  // check if sender, receiver and token are provided
  if (!event.body || ['sender', 'receiver', 'token'].some(key => !event.body[key])) return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Bad Request' })
  };

  const { sender, receiver, token } = event.body;

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
    return {
      statusCode: 307,
      headers: {
        Location: `https://superfluid-protected-page.netlify.app/?token=${jwtToken}`
      },
      body: JSON.stringify({ message: 'Success' })
    };

    // or just return the token and redirectUrl
    return {
      statusCode: 200,
      body: JSON.stringify({ token: jwtToken, redirectUrl: 'https://superfluid-protected-page.netlify.app/' })
    };
  }

  //  no stream found to authenticate
  return {
    statusCode: 401,
    body: JSON.stringify({ message: 'Unauthorized' })
  };
};