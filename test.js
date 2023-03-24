const { request, gql } = require("graphql-request");
const jwt = require("jsonwebtoken");

const apiKeys = ["123", "456", "789"];
const secret = "mysupersecret";
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
const main = async ({ apiKey, sender, receiver, token }) => {
  if (apiKeys.includes(apiKey)) {
    // check if stream exists using superfluid subgraph with given params and then create jwt token
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
      console.log({ status: 200, message: "Success" });
      // create jwt token
      const createdAt = new Date().getTime();
      const jwtToken = jwt.sign(
        { sender, receiver, token, apiKey, createdAt },
        secret,
        { expiresIn: "1h" }
      );
      console.log({ status: 200, token: jwtToken });
    } else {
      console.log({ status: 404, message: "Stream not found" });
    }
  } else {
    console.log({ message: "Unauthorized", status: 401 });
  }
};

main({
  apiKey: "123",
  sender: "0x00008cca528fee04c6a94a0011e7857d471ba3e0",
  receiver: "0x48c5a279c75c3482d2196a12c40a1c8155debe47",
  token: "0x42bb40bf79730451b11f6de1cba222f17b87afd7"
});
