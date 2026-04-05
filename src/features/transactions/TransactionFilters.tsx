import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import type { TransactionFiltersProps } from './types';
import { useEffect } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Autocomplete } from '@mui/material';

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
    const nextTransactionTypeId = values.transactionTypeId
      ? Number(values.transactionTypeId)
      : null;

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
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => {
            const value = field.value
              ? options.accounts.find((a) => a.id === Number(field.value))
              : null;

            return (
              <Autocomplete
                options={options.accounts}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={value}
                onChange={(_, newVal) => field.onChange(newVal ? String(newVal.id) : '')}
                disabled={loadingState.accounts}
                sx={{ minWidth: 200 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('transactions.filters.account')}
                    placeholder={t('common.allAccounts')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingState.accounts ? (
                            <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="transactionTypeId"
          render={({ field }) => {
            const value = field.value
              ? options.transactionTypes.find((t) => t.id === Number(field.value))
              : null;

            return (
              <Autocomplete
                options={options.transactionTypes}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={value}
                onChange={(_, newVal) => field.onChange(newVal ? String(newVal.id) : '')}
                disabled={loadingState.transactionTypes}
                sx={{ minWidth: 200 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('transactions.filters.type')}
                    placeholder={t('common.allTypes')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingState.transactionTypes ? (
                            <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => {
            const value = field.value
              ? options.categories.find((c) => c.id === Number(field.value))
              : null;

            return (
              <Autocomplete
                options={options.categories}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={value}
                onChange={(_, newVal) => field.onChange(newVal ? String(newVal.id) : '')}
                disabled={loadingState.categories}
                sx={{ minWidth: 200 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('transactions.filters.category')}
                    placeholder={t('common.allCategories')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingState.categories ? (
                            <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            );
          }}
        />
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
          {loadingState.transactions ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t('common.reload')
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default TransactionFilters;
