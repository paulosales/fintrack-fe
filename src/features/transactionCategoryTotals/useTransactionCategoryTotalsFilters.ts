import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import type { AppDispatch } from '../../store';
import { fetchTransactionCategoryTotals } from './transactionCategoryTotalsSlice';

const parseYear = (value: string): number | null => {
  const trimmedValue = value.trim();
  if (trimmedValue === '') return null;
  const parsedYear = Number(trimmedValue);
  return Number.isNaN(parsedYear) ? null : parsedYear;
};

function useTransactionCategoryTotalsFilters() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const monthOptions = [
    { value: '', label: t('common.allMonths') },
    { value: 1, label: t('months.january') },
    { value: 2, label: t('months.february') },
    { value: 3, label: t('months.march') },
    { value: 4, label: t('months.april') },
    { value: 5, label: t('months.may') },
    { value: 6, label: t('months.june') },
    { value: 7, label: t('months.july') },
    { value: 8, label: t('months.august') },
    { value: 9, label: t('months.september') },
    { value: 10, label: t('months.october') },
    { value: 11, label: t('months.november') },
    { value: 12, label: t('months.december') },
  ];

  const debouncedApplyYear = useDebouncedCallback((value: string) => {
    setYear(parseYear(value));
    setPage(1);
  }, 600);

  useEffect(() => () => debouncedApplyYear.cancel(), [debouncedApplyYear]);

  useEffect(() => {
    dispatch(fetchTransactionCategoryTotals({ month, year, categoryId, page, pageSize }));
  }, [dispatch, month, year, categoryId, page, pageSize]);

  const handleReload = () => {
    dispatch(fetchTransactionCategoryTotals({ month, year, categoryId, page, pageSize }));
  };

  const handleMonthChange = (value: string) => {
    setMonth(value ? Number(value) : null);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value ? Number(value) : null);
    setPage(1);
  };

  const handleYearChange = (value: string) => {
    debouncedApplyYear(value);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  return {
    month,
    year,
    categoryId,
    page,
    setPage,
    pageSize,
    monthOptions,
    handleReload,
    handleMonthChange,
    handleCategoryChange,
    handleYearChange,
    handlePageSizeChange,
  };
}

export default useTransactionCategoryTotalsFilters;
