const { fiscalScoreForTransactions } = require('./fiscalScore');

/**
 * The fiscalScoreForTransactions function runs the calculations
 * without fetching so it can be tested independently with
 * something like JEST. Tests were not actually written for this
 * exercise.
 */
const accounts = [
  {
    account_id: 'account-1',
    official_name: 'account 1',
    type: 'type',
    subtype: 'subtype',
    balances: { current: 1000 },
  },
  {
    account_id: 'account-2',
    official_name: 'account 2',
    type: 'type',
    subtype: 'subtype',
    balances: { current: 500 },
  },
];
const transactions = [
  {
    account_id: 'account-1',
    amount: 100,
    date: '2024-01-01',
    name: 'charge',
  },
  {
    account_id: 'account-1',
    amount: -2000,
    date: '2024-01-02',
    name: 'deposit',
  },
  {
    account_id: 'account-1',
    amount: 1000,
    date: '2024-01-03',
    name: 'charge',
  },
  {
    account_id: 'account-1',
    amount: 1000,
    date: '2024-01-04',
    name: 'charge',
  },
  {
    account_id: 'account-1',
    amount: 1000,
    date: '2024-01-04',
    name: 'charge',
  },
];

const result = fiscalScoreForTransactions(accounts, transactions);
console.log(JSON.stringify(result, null, 2));
