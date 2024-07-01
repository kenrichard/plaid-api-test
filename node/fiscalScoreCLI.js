require('dotenv').config();

/**
 * CLI to run the scoring for an access token - Allows faster
 * dev iteration than clicking through the UI
 */

const accessToken = process.argv[2];
if (!accessToken) {
  console.log('USAGE: fiscalScoreCLI <access_token>');
  process.exit();
}

const {
  Configuration,
  PlaidApi,
  Products,
  PlaidEnvironments,
} = require('plaid');

const { fiscalScore } = require('./fiscalScore');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

async function main() {
  const client = new PlaidApi(configuration);
  const data = await fiscalScore(client, accessToken);
  console.log(JSON.stringify(data, null, 2));
}

main();
