import React, { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { BudgetSetupFormDialogProps, BudgetSetupFormState } from './types';
import { repeatFrequencyOptions } from './types';

const BudgetSetupFormDialog: React.FC<BudgetSetupFormDialogProps> = ({
  open,
  editingBudgetSetup,
  initialValues,
  formError,
  isSubmitting,
  accounts,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<BudgetSetupFormState>({
    defaultValues: initialValues,
  });
  const isRepeatle = useWatch({ control, name: 'isRepeatle' });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [
    open,
    initialValues.accountId,
    initialValues.date,
    initialValues.isRepeatle,
    initialValues.repeatFrequency,
    initialValues.endDate,
    initialValues.description,
    initialValues.amount,
    initialValues.note,
    initialValues,
    reset,
  ]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingBudgetSetup ? t('budgetSetups.edit') : t('budgetSetups.create')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="budget-setup-form"
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
                label={t('budgetSetups.form.account')}
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
            name="date"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgetSetups.form.date')}
                type="date"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <FormControlLabel
            control={
              <Controller
                control={control}
                name="isRepeatle"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
            }
            label={t('budgetSetups.form.isRepeatle')}
          />
          <Controller
            control={control}
            name="repeatFrequency"
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('budgetSetups.form.repeatFrequency')}
                disabled={!isRepeatle}
                fullWidth
              >
                <MenuItem value="">
                  <em>{t('budgetSetups.form.noRepeatFrequency')}</em>
                </MenuItem>
                {repeatFrequencyOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgetSetups.form.endDate')}
                type="date"
                disabled={!isRepeatle}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField {...field} label={t('budgetSetups.form.description')} required fullWidth />
            )}
          />
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgetSetups.form.amount')}
                type="number"
                required
                fullWidth
              />
            )}
          />
          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgetSetups.form.note')}
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
        <Button type="submit" form="budget-setup-form" variant="contained" disabled={isSubmitting}>
          {editingBudgetSetup ? t('common.saveChanges') : t('budgetSetups.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetSetupFormDialog;
