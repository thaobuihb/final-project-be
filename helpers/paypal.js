const axios = require("axios");
require("dotenv").config();

const getAccessToken = async () => {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

const refundPayment = async (captureId) => {

  console.log("💳 Capture ID:", captureId);
  

  const accessToken = await getAccessToken();
  console.log("🔐 PayPal Access Token:", accessToken);

  const response = await axios.post(
    `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

module.exports = { refundPayment };
