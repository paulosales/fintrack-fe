import React from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Autocomplete,
} from '@mui/material';
import type { BudgetFormDialogProps } from './types';

const BudgetFormDialog: React.FC<BudgetFormDialogProps> = ({
  open,
  editingBudget,
  initialValues,
  formError,
  isSubmitting,
  accounts,
  isSetupLocked,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [
    open,
    initialValues.accountId,
    initialValues.date,
    initialValues.amount,
    initialValues.description,
    initialValues.processed,
    initialValues.note,
    initialValues,
    reset,
  ]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingBudget ? t('budgets.edit') : t('budgets.create')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="budget-form"
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
                  disabled={isSetupLocked}
                  renderInput={(params) => (
                    <TextField {...params} label={t('budgets.form.account')} required fullWidth />
                  )}
                />
              );
            }}
          />
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgets.form.date')}
                type="date"
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
                label={t('budgets.form.amount')}
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
              <TextField {...field} label={t('budgets.form.description')} required fullWidth />
            )}
          />
          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgets.form.note')}
                disabled={isSetupLocked}
                multiline
                minRows={2}
                fullWidth
              />
            )}
          />
          <FormControlLabel
            control={
              <Controller
                control={control}
                name="processed"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
            }
            label={t('budgets.form.processed')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" form="budget-form" variant="contained" disabled={isSubmitting}>
          {editingBudget ? t('common.saveChanges') : t('budgets.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetFormDialog;
