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
} from '@mui/material';
import type { BudgetGenerateDialogProps } from './types';

const BudgetGenerateDialog: React.FC<BudgetGenerateDialogProps> = ({
  open,
  initialValues,
  formError,
  isSubmitting,
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
  }, [open, initialValues.endDate, initialValues.generateOnlyForFuture, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('budgets.generateDialog.title')}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="budget-generate-form" spacing={2} sx={{ mt: 1 }} onSubmit={handleSubmit(onSubmit)}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgets.generateDialog.endDate')}
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
                name="generateOnlyForFuture"
                render={({ field }) => (
                  <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                )}
              />
            }
            label={t('budgets.generateDialog.futureOnly')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" form="budget-generate-form" variant="contained" disabled={isSubmitting}>
          {t('common.generate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetGenerateDialog;