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
      {data?.map((row) => {
        const formattedScore = row.fiscalScore.toLocaleString("en-US", {
          style: "percent",
        });
        return (
          <div key={row.accountId}>
            <h3 className={styles.accountHeading}>{row.accountName}</h3>
            <p className={styles.fiscalScore}>{formattedScore}</p>
            <p className={styles.fiscalScoreExplain}>
              Your account balance was positive {formattedScore} of the time.
            </p>
          </div>
        );
      })}
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
