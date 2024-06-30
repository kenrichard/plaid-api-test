/**
 * Get accounts for an item's access token
 */
async function getAccounts(client, accessToken) {
  const accountsResponse = await client.accountsGet({
    access_token: accessToken,
  });
  return accountsResponse.data.accounts;
}

/**
 * Use Sync Transactions to load transaction data
 *
 * This implementation syncs all data needed for this
 * exercise and ignores the "added" and "modified" that
 * would be required if this was a real sync triggered
 * manually or from the web hooks.
 */
async function getTransactions(client, accessToken) {
  let cursor = null;
  let transactions = [];
  let hasMore = true;

  while (hasMore) {
    const request = {
      access_token: accessToken,
      cursor: cursor,
      options: { days_requested: 365 },
    };
    const response = await client.transactionsSync(request);
    const data = response.data;
    transactions = transactions.concat(data.added);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  // Sort Newest => Oldest
  const compareTxnsByDateDescending = (a, b) =>
    (b.date > a.date) - (b.date < a.date);

  return transactions.sort(compareTxnsByDateDescending);
}

/**
 * Calculate the fiscal score for given transactions
 *
 * We know the "current balance" and need to work backwards
 * through the transactions to create a running balance
 * from before each transaction.
 *
 * Works for deposit accounts like checking/savings
 */
function fiscalScoreForTransactions(accounts, transactions) {
  // Process each account
  const data = accounts.map((a) => {
    // Starting Data
    const row = {
      accountId: a.account_id,
      accountName: a.official_name,
      accountType: a.type,
      accountSubType: a.subtype,
      endingBalance: a.balances.current,
      startingBalance: a.balances.current,
      totalTransactions: 0,
      positiveTransactions: 0,
      negativeTransactions: 0,
      fiscalScore: 0,
    };

    // Transactions for this account
    const accountTransactions = transactions.filter(
      (t) => row.accountId === t.account_id,
    );

    console.log(`Balance AFTER all transactions ${row.endingBalance}`);

    // Each Transaction
    accountTransactions.forEach((t) => {
      // What was the balance BEFORE this transaction?
      const balanceBeforeTransaction = row.startingBalance + t.amount;

      row.totalTransactions = row.totalTransactions + 1;

      // Count Positive/Negative Transactions
      if (balanceBeforeTransaction < 0) {
        row.negativeTransactions = row.negativeTransactions + 1;
      } else {
        row.positiveTransactions = row.positiveTransactions + 1;
      }

      console.log(
        `${t.date} ${row.accountName} Before=${balanceBeforeTransaction} ${
          t.amount > 0 ? 'OUT' : 'IN'
        } ${Math.abs(t.amount)} After=${row.startingBalance}  -- ${t.name}`,
      );

      // Update the starting balance for the next transaction
      row.startingBalance = balanceBeforeTransaction;
    });

    console.log(`Balance BEFORE all transactions ${row.startingBalance}`);

    // Fiscal Score - Percent of transactions in the positive
    row.fiscalScore = row.positiveTransactions / row.totalTransactions;

    return row;
  });

  return data;
}

async function fiscalScore(client, accessToken) {
  if (!accessToken) {
    throw new Error('Missing Access Token');
  }
  const accounts = await getAccounts(client, accessToken);
  const transactions = await getTransactions(client, accessToken);
  return fiscalScoreForTransactions(accounts, transactions);
}

// Main Export
exports.fiscalScore = fiscalScore;

// For Tests Only
exports.fiscalScoreForTransactions = fiscalScoreForTransactions;
