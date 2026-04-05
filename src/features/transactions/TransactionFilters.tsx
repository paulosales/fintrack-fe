import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import type { TransactionFiltersProps } from './types';
import { useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';

interface TransactionFilterFormValues {
  accountId: string;
  transactionTypeId: string;
  categoryId: string;
  description: string;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  options,
  loadingState,
  actions,
}) => {
  const { t } = useTranslation();
  const { control, reset } = useForm<TransactionFilterFormValues>({
    defaultValues: {
      accountId: filters.accountId !== null ? String(filters.accountId) : '',
      transactionTypeId:
        filters.transactionTypeId !== null ? String(filters.transactionTypeId) : '',
      categoryId: filters.categoryId !== null ? String(filters.categoryId) : '',
      description: filters.descriptionInput || '',
    },
  });

  const values = useWatch({ control });
  const debouncedDescriptionChange = useDebouncedCallback((value: string) => {
    actions.onDescriptionChange(value);
  }, 600);

  useEffect(() => {
    reset({
      accountId: filters.accountId !== null ? String(filters.accountId) : '',
      transactionTypeId:
        filters.transactionTypeId !== null ? String(filters.transactionTypeId) : '',
      categoryId: filters.categoryId !== null ? String(filters.categoryId) : '',
      description: filters.descriptionInput || '',
    });
  }, [
    filters.accountId,
    filters.transactionTypeId,
    filters.categoryId,
    filters.descriptionInput,
    reset,
  ]);

  useEffect(() => {
    const nextAccountId = values.accountId ? Number(values.accountId) : null;

    if (nextAccountId !== filters.accountId) {
      actions.onAccountChange(nextAccountId);
    }
  }, [actions, filters.accountId, values.accountId]);

  useEffect(() => {
    const nextTransactionTypeId = values.transactionTypeId ? Number(values.transactionTypeId) : null;

    if (nextTransactionTypeId !== filters.transactionTypeId) {
      actions.onTransactionTypeChange(nextTransactionTypeId);
    }
  }, [actions, filters.transactionTypeId, values.transactionTypeId]);

  useEffect(() => {
    const nextCategoryId = values.categoryId ? Number(values.categoryId) : null;

    if (nextCategoryId !== filters.categoryId) {
      actions.onCategoryChange(nextCategoryId);
    }
  }, [actions, filters.categoryId, values.categoryId]);

  useEffect(() => {
    const nextDescription = values.description || '';

    if (nextDescription !== (filters.descriptionInput || '')) {
      debouncedDescriptionChange(nextDescription);
    }
  }, [debouncedDescriptionChange, filters.descriptionInput, values.description]);

  useEffect(() => () => debouncedDescriptionChange.cancel(), [debouncedDescriptionChange]);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('transactions.filters.account')}</InputLabel>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select
                {...field}
                label={t('transactions.filters.account')}
                disabled={loadingState.accounts}
              >
                <MenuItem value="">
                  <em>{t('common.allAccounts')}</em>
                </MenuItem>
                {loadingState.accounts ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('common.loadingAccounts')}
                  </MenuItem>
                ) : (
                  options.accounts.map((account) => (
                    <MenuItem key={account.id} value={String(account.id)}>
                      {account.code} - {account.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          />
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('transactions.filters.type')}</InputLabel>
          <Controller
            control={control}
            name="transactionTypeId"
            render={({ field }) => (
              <Select
                {...field}
                label={t('transactions.filters.type')}
                disabled={loadingState.transactionTypes}
              >
                <MenuItem value="">
                  <em>{t('common.allTypes')}</em>
                </MenuItem>
                {loadingState.transactionTypes ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('common.loadingTypes')}
                  </MenuItem>
                ) : (
                  options.transactionTypes.map((transactionType) => (
                    <MenuItem key={transactionType.id} value={String(transactionType.id)}>
                      {transactionType.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          />
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('transactions.filters.category')}</InputLabel>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                {...field}
                label={t('transactions.filters.category')}
                disabled={loadingState.categories}
              >
                <MenuItem value="">
                  <em>{t('common.allCategories')}</em>
                </MenuItem>
                {loadingState.categories ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('common.loadingCategories')}
                  </MenuItem>
                ) : (
                  options.categories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          />
        </FormControl>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              {...field}
              label={t('transactions.filters.description')}
              placeholder={t('transactions.filters.descriptionPlaceholder')}
              sx={{ minWidth: 200 }}
            />
          )}
        />
        <Button variant="contained" onClick={actions.onReload} disabled={loadingState.transactions}>
          {loadingState.transactions ? <CircularProgress size={20} color="inherit" /> : t('common.reload')}
        </Button>
      </Box>
    </Paper>
  );
};

export default TransactionFilters;
