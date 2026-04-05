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
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1);
  const lastOfThreeMonthsAhead = new Date(
    threeMonthsAhead.getFullYear(),
    threeMonthsAhead.getMonth() + 1,
    0
  );

  const defaults = {
    startDate: formatYMD(firstOfThisMonth),
    endDate: formatYMD(lastOfThreeMonthsAhead),
    ...(initialValues || {}),
  };

  const { control, handleSubmit, reset } = useForm({
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) {
      reset({
        startDate: defaults.startDate,
        endDate: defaults.endDate,
        ...(initialValues || {}),
      });
    }
  }, [open, initialValues, defaults.startDate, defaults.endDate, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('budgets.generateDialog.title')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="budget-generate-form"
          spacing={2}
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('budgets.generateDialog.startDate', { defaultValue: 'Generates from' })}
                type="date"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="budget-generate-form"
          variant="contained"
          disabled={isSubmitting}
        >
          {t('common.generate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetGenerateDialog;
