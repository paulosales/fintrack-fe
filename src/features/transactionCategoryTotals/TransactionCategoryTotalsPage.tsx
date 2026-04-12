import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Typography } from '@mui/material';
import TransactionCategoryTotalsFilters, {
  type TransactionCategoryTotalsFilterFormValues,
} from './TransactionCategoryTotalsFilters';
import TransactionCategoryTotalsTable from './TransactionCategoryTotalsTable';
import useTransactionCategoryTotalsFilters from './useTransactionCategoryTotalsFilters';
import { fetchCategories } from '../categories/categoriesSlice';
import { fetchTransactionCategoryTotalDetails } from './transactionCategoryTotalsSlice';
import type { TransactionCategoryTotal } from './types';
import { getTransactionCategoryDetailKey } from './types';
import type { RootState, AppDispatch } from '../../store';

const TransactionCategoryTotalsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.categories);
  const { data, loading, error, detailsByKey, pagination } = useSelector(
    (state: RootState) => state.transactionCategoryTotals
  );
  const { control } = useForm<TransactionCategoryTotalsFilterFormValues>({
    defaultValues: { month: '', year: '', categoryId: '' },
  });

  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const {
    setPage,
    monthOptions,
    handleReload,
    handleMonthChange,
    handleCategoryChange,
    handleYearChange,
    handlePageSizeChange,
  } = useTransactionCategoryTotalsFilters();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleToggleRow = (row: TransactionCategoryTotal) => {
    const key = getTransactionCategoryDetailKey({
      year: row.year,
      month: row.month,
      categoryId: row.categoryId,
    });
    const nextExpanded = !(expandedKeys[key] === true);
    setExpandedKeys((current) => ({ ...current, [key]: nextExpanded }));
    if (nextExpanded) {
      dispatch(
        fetchTransactionCategoryTotalDetails({
          year: row.year,
          month: row.month,
          categoryId: row.categoryId,
        })
      );
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('transactionCategoryTotals.title')}
      </Typography>

      <TransactionCategoryTotalsFilters
        control={control}
        monthOptions={monthOptions}
        categories={categories}
        categoriesLoading={categoriesLoading}
        loading={loading}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        onCategoryChange={handleCategoryChange}
        onReload={handleReload}
      />

      {categoriesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactionCategoryTotals.failedLoadCategories', { error: categoriesError })}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactionCategoryTotals.failedLoadTotals', { error })}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('transactionCategoryTotals.empty')}</Alert>
      )}

      {data.length > 0 && (
        <TransactionCategoryTotalsTable
          rows={data}
          pagination={pagination}
          expandedKeys={expandedKeys}
          detailsByKey={detailsByKey}
          onToggle={handleToggleRow}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Box>
  );
};

export default TransactionCategoryTotalsPage;
