import { useCallback, useEffect, useState } from "react";

/**
 * useFetchData - A general api fetch helper. I didn't want to bring in
 * code from another project so I started with ChatGPT and then modified
 * the code to work the way I wanted. I normally like to use something like
 * react query.
 */

interface ApiResponse<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | undefined;
}

const useFetchData = <ResponseType,>(
  url: string
): ApiResponse<ResponseType> => {
  const [data, setData] = useState<ResponseType | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  // Data Fetcher
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = (await response.json()) as ResponseType;
      setData(result);
      setError(undefined);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError("Failed to fetch data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!isLoading && !error && !data) {
      fetchData();
    }
  }, [isLoading, url, error, data, fetchData]);

  return { data, isLoading, error };
};

export default useFetchData;
