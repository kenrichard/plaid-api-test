import useFetchData from "./api";

/**
 * useFiscalScore - Hook to get the fiscal score from the API via
 * useFetchData
 */

type FiscalScore = {
  accountId: string;
  accountName: string;
  accountType: string;
  accountSubType: string;
  endingBalance: number;
  startingBalance: number;
  totalTransactions: number;
  positiveTransactions: number;
  negativeTransactions: number;
  fiscalScore: number;
};

const useFiscalScore = () => useFetchData<FiscalScore[]>("/api/fiscal_score");

export { useFiscalScore, type FiscalScore };
