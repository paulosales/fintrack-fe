import React from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { TransactionFormDialogProps, TransactionFormState } from './types';

const TransactionFormDialog: React.FC<TransactionFormDialogProps> = ({
  open,
  editingTransaction,
  initialValues,
  formError,
  isSubmitting,
  accounts,
  transactionTypes,
  categories,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { accountId, transactionTypeId, categoryIds, datetime, amount, description, note } =
    initialValues;
  const categoryIdsKey = categoryIds.join(',');
  const { control, handleSubmit, reset } = useForm<TransactionFormState>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset({
        accountId,
        transactionTypeId,
        categoryIds: categoryIdsKey === '' ? [] : categoryIdsKey.split(','),
        datetime,
        amount,
        description,
        note,
      });
    }
  }, [
    open,
    accountId,
    transactionTypeId,
    categoryIdsKey,
    datetime,
    amount,
    description,
    note,
    reset,
  ]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingTransaction ? t('transactions.edit') : t('transactions.create')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="transaction-form"
          spacing={2}
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('transactions.form.account')}
                required
                fullWidth
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>
                    {account.code} - {account.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="transactionTypeId"
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('transactions.form.transactionType')}
                required
                fullWidth
              >
                {transactionTypes.map((transactionType) => (
                  <MenuItem key={transactionType.id} value={String(transactionType.id)}>
                    {transactionType.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="categoryIds"
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('transactions.form.categories')}
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    const selectedIds = Array.isArray(selected) ? selected : [];

                    return categories
                      .filter((category) => selectedIds.includes(String(category.id)))
                      .map((category) => category.name)
                      .join(', ');
                  },
                }}
                onChange={(event) =>
                  field.onChange(
                    typeof event.target.value === 'string'
                      ? event.target.value.split(',')
                      : event.target.value
                  )
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="datetime"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactions.form.date')}
                type="datetime-local"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactions.form.amount')}
                type="number"
                required
                fullWidth
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField {...field} label={t('transactions.form.description')} required fullWidth />
            )}
          />
          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactions.form.note')}
                multiline
                minRows={2}
                fullWidth
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" form="transaction-form" variant="contained" disabled={isSubmitting}>
          {editingTransaction ? t('common.saveChanges') : t('transactions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionFormDialog;
