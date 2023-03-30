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
      url: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli",
      document: STREAMS_QUERY,
      variables: {
        first: 1,
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
      const jwtToken = jwt.sign(
        { sender, receiver, token },
        secret,
        { expiresIn: "1h" }
      );
      const decoded = jwt.verify(jwtToken, secret);
      console.log({ status: 200, token: jwtToken, decoded });
    } else {
      console.log({ status: 404, message: "Stream not found" });
    }
  } else {
    console.log({ message: "Unauthorized", status: 401 });
  }
};

main({
  apiKey: "123",
  sender: "0xc2009d705d37a9341d6cd21439cf6b4780eaf2d7",
  receiver: "0xc7203561ef179333005a9b81215092413ab86ae9",
  token: "0xf2d68898557ccb2cf4c10c3ef2b034b2a69dad00"
});
