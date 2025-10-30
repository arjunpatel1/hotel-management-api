// paypalClient.js
const paypal = require('@paypal/checkout-server-sdk');

function client() {
  const environment = new paypal.core.SandboxEnvironment(
    process.env.Client_Id,
    process.env.Secret_Id
  );
  return new paypal.core.PayPalHttpClient(environment);
}

module.exports = { client };
