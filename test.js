const chai = require("chai");

// Set environment variables just for testing. Make sure you don't set confidential values here.
process.env.WHITELISTED_API_KEYS = "apikey1,apikey2";
process.env.JWT_SECRET = "randomsecret";
process.env.SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli";
process.env.APP_URL = "https://superfluid-stream-gating.netlify.app";

const { handler } = require("./netlify/functions/superfluid-stream-gating");
const { expect } = chai;

describe("Superfluid stream gating function tests", () => {
  it("should return a 405 error on GET request", async () => {
    const event = {
      httpMethod: "GET"
    };
    const response = await handler(event);
    expect(response.statusCode).to.equal(405);
    expect(JSON.parse(response.body).message).to.equal(
      "Only POST requests are allowed"
    );
  });

  it("should return a 401 error upon missing/invalid API key", async () => {
    const event = {
      httpMethod: "POST",
      headers: {}
    };
    const response = await handler(event);
    expect(response.statusCode).to.equal(401);
    expect(JSON.parse(response.body).message).to.equal("Invalid API key");
  });

  it("should return a 400 error on missing request body", async () => {
    const event = {
      httpMethod: "POST",
      headers: {
        "x-api-key": "apikey1"
      },
      body: "{}"
    };
    const response = await handler(event);
    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response.body).message).to.equal(
      "Missing required parameters/bad request body format"
    );
  });

  it("should return a 401 error if no stream present", async () => {
    const event = {
      httpMethod: "POST",
      headers: {
        "x-api-key": "apikey1"
      },
      body: JSON.stringify({
        sender: "0xc1203561ef179333005a9b81215092413ab86ae9",
        receiver: "0x6348943c8d263ea253c0541656c36b88becd77b9",
        token: "0xf2d68898557ccb2cf4c10c3ef2b034b2a69dad00"
      })
    };
    const response = await handler(event);
    expect(response.statusCode).to.equal(401);
    expect(JSON.parse(response.body).message).to.equal(
      "No stream found to authorize!"
    );
  });

  it("should return a 200 response with token", async () => {
    const event = {
      httpMethod: "POST",
      headers: {
        "x-api-key": "apikey1"
      },
      body: JSON.stringify({
        sender: "0xc7203561ef179333005a9b81215092413ab86ae9",
        receiver: "0x7348943c8d263ea253c0541656c36b88becd77b9",
        token: "0xf2d68898557ccb2cf4c10c3ef2b034b2a69dad00"
      })
    };
    const response = await handler(event);
    expect(response.statusCode).to.equal(200);
    expect(JSON.parse(response.body).token).to.be.a("string");
  });
});
