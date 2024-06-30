import { useFiscalScore } from "./useFiscalScore";

import styles from "./index.module.scss";
import { useState } from "react";

const FiscalScore = () => {
  const { data, isLoading, error } = useFiscalScore();
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const toggleDebug = () => setShowDebug(!showDebug);

  if (isLoading || !data) {
    return <p>Loading Fiscal Score...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }
  return (
    <div className={styles.grid}>
      <h2>Your Fiscal Score</h2>
      {data?.map((row) => (
        <div key={row.accountId}>
          <h3 className={styles.accountHeading}>{row.accountName}</h3>
          <p className={styles.fiscalScore}>
            {row.fiscalScore.toLocaleString("en-US", { style: "percent" })}
          </p>
          <p className={styles.fiscalScoreExplain}>
            {row.positiveTransactions}/{row.totalTransactions} transaction ended
            up with positive account balances.
          </p>
        </div>
      ))}
      <div className={styles.toggleButtonContainer}>
        <button onClick={toggleDebug} type="button">
          Toggle Debug Data
        </button>
      </div>
      {showDebug && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

export default FiscalScore;
