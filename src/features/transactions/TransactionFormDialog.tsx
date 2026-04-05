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
  Stack,
  TextField,
  Autocomplete,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import type { TransactionFormDialogProps, TransactionFormState } from './types';
import type { Category } from '../../models/categories';

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
            render={({ field }) => {
              const value = field.value ? accounts.find((a) => a.id === Number(field.value)) : null;

              return (
                <Autocomplete
                  options={accounts}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  value={value}
                  onChange={(_, newVal) => field.onChange(newVal ? String(newVal.id) : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('transactions.form.account')}
                      required
                      fullWidth
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
                ? transactionTypes.find((t) => t.id === Number(field.value))
                : null;

              return (
                <Autocomplete
                  options={transactionTypes}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  value={value}
                  onChange={(_, newVal) => field.onChange(newVal ? String(newVal.id) : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('transactions.form.transactionType')}
                      required
                      fullWidth
                    />
                  )}
                />
              );
            }}
          />
          <Controller
            control={control}
            name="categoryIds"
            render={({ field }) => {
              const selectedValues: Category[] = Array.isArray(field.value)
                ? field.value
                    .map((id) => categories.find((c) => c.id === Number(id)))
                    .filter((c): c is Category => Boolean(c))
                : [];

              const CheckBoxOutline = CheckBoxOutlineBlankIcon;
              const CheckBoxFilled = CheckBoxIcon;

              return (
                <Autocomplete<Category, true, false, false>
                  multiple
                  disableCloseOnSelect
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  value={selectedValues}
                  onChange={(_, newVal: Category[]) =>
                    field.onChange(newVal.map((c) => String(c.id)))
                  }
                  limitTags={2}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.id}>
                      {selected ? (
                        <CheckBoxFilled fontSize="small" style={{ marginRight: 8 }} />
                      ) : (
                        <CheckBoxOutline fontSize="small" style={{ marginRight: 8 }} />
                      )}
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('transactions.form.categories')}
                      placeholder={t('transactions.form.categories')}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: <>{params.InputProps.endAdornment}</>,
                      }}
                    />
                  )}
                />
              );
            }}
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
