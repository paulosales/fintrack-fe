import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import type { AppDispatch } from '../../store';
import { fetchTransactions } from './transactionSlice';

function useTransactionFilters() {
  const dispatch = useDispatch<AppDispatch>();

  const [accountId, setAccountId] = useState<number | null>(null);
  const [transactionTypeId, setTransactionTypeId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const debouncedApplyDescription = useDebouncedCallback((nextDescription: string) => {
    setDescription(nextDescription);
    setPage(1);
  }, 600);

  useEffect(() => () => debouncedApplyDescription.cancel(), [debouncedApplyDescription]);

  useEffect(() => {
    dispatch(
      fetchTransactions({ accountId, transactionTypeId, categoryId, description, page, pageSize })
    );
  }, [dispatch, accountId, transactionTypeId, categoryId, description, page, pageSize]);

  const reloadTransactions = (nextPage = page) => {
    dispatch(
      fetchTransactions({
        accountId,
        transactionTypeId,
        categoryId,
        description,
        page: nextPage,
        pageSize,
      })
    );
  };

  const handleReload = () => reloadTransactions();

  const handleAccountChange = (nextAccountId: number | null) => {
    setAccountId(nextAccountId);
    setPage(1);
  };

  const handleTransactionTypeChange = (next: number | null) => {
    setTransactionTypeId(next);
    setPage(1);
  };

  const handleCategoryChange = (next: number | null) => {
    setCategoryId(next);
    setPage(1);
  };

  const handleDescriptionChange = (nextDescription: string) => {
    setDescriptionInput(nextDescription);
    debouncedApplyDescription(nextDescription);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  return {
    filters: { accountId, transactionTypeId, categoryId, description, descriptionInput, page, pageSize },
    setPage,
    reloadTransactions,
    handleReload,
    handleAccountChange,
    handleTransactionTypeChange,
    handleCategoryChange,
    handleDescriptionChange,
    handlePageSizeChange,
  };
}

export default useTransactionFilters;
