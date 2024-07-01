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
  let accounts = null;

  while (hasMore) {
    console.log('Fetching...');
    const request = {
      access_token: accessToken,
      cursor: cursor,
      // Use a lower count to ensure pagination is working
      count: 10,
      // This option isn't returning more than 90 days of test data
      options: { days_requested: 365 },
    };
    const response = await client.transactionsSync(request);
    const data = response.data;
    console.log(
      JSON.stringify(
        {
          added: data.added.length,
          has_more: data.has_more,
        },
        null,
        2,
      ),
    );
    transactions = transactions.concat(data.added);
    if (!accounts) {
      accounts = data.accounts;
    }
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  // Sort Newest => Oldest
  const compareTxnsByDateDescending = (a, b) =>
    (b.date > a.date) - (b.date < a.date);

  return {
    transactions: transactions.sort(compareTxnsByDateDescending),
    accounts,
  };
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
      startDate: new Date().getTime(),
      endDate: new Date().getTime(),
      totalTransactions: 0,
      positiveTransactions: 0,
      negativeTransactions: 0,
      totalTimeElapsedHours: 0,
      timeElapsedPositive: 0,
      timeElapsedNegative: 0,
      fiscalScore: 0,
      logs: [],
    };

    // Transactions for this account
    const accountTransactions = transactions.filter(
      (t) => row.accountId === t.account_id,
    );

    console.log(
      `Balance AFTER all transactions ${row.endingBalance} - ${row.endDate}`,
    );

    // Each Transaction
    accountTransactions.forEach((t) => {
      // What was the balance BEFORE this transaction?
      const balanceBeforeTransaction = row.startingBalance + t.amount;

      // Time Elapsed (Data only has dates - dateTime is null in sample data)
      const transactionDate = Date.parse(t.date);
      const timeElapsedHours =
        (row.startDate - transactionDate) / (1000 * 60 * 60);
      row.startDate = transactionDate;

      // Totals
      row.totalTransactions = row.totalTransactions + 1;
      row.totalTimeElapsedHours = row.totalTimeElapsedHours + timeElapsedHours;

      // Positive/Negative
      if (balanceBeforeTransaction < 0) {
        row.negativeTransactions = row.negativeTransactions + 1;
        row.timeElapsedNegative = row.timeElapsedNegative + timeElapsedHours;
      } else {
        row.positiveTransactions = row.positiveTransactions + 1;
        row.timeElapsedPositive = row.timeElapsedPositive + timeElapsedHours;
      }

      const log = `${t.date} ${
        balanceBeforeTransaction < 0 ? 'NEG' : 'POS'
      } ${Math.floor(timeElapsedHours)} Before=${balanceBeforeTransaction} ${
        t.amount > 0 ? 'OUT' : 'IN'
      }=${Math.abs(t.amount)} After=${row.startingBalance} -- ${t.name}`;

      row.logs.push(log);
      console.log(log);

      // Update the starting balance for the next transaction
      row.startingBalance = balanceBeforeTransaction;
    });

    console.log(`Balance BEFORE all transactions ${row.startingBalance}`);

    // Fiscal Score - Percent of transactions in the positive
    if (row.totalTimeElapsedHours > 0) {
      row.fiscalScore = row.timeElapsedPositive / row.totalTimeElapsedHours;
    }

    return row;
  });

  return data;
}

async function fiscalScore(client, accessToken) {
  if (!accessToken) {
    throw new Error('Missing Access Token');
  }
  const { transactions, accounts } = await getTransactions(client, accessToken);
  return fiscalScoreForTransactions(accounts, transactions);
}

// Main Export
exports.fiscalScore = fiscalScore;

// For Tests Only
exports.fiscalScoreForTransactions = fiscalScoreForTransactions;
