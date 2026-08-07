import { useState, useEffect } from 'react';
import { MonetizationService, Transaction } from '@/services/monetization.service';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true);
        const data = await MonetizationService.getTransactions();
        setTransactions(data);
      } catch (err: any) {
        console.error('Failed to load transactions:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
  };
}
