import React, { useEffect } from 'react';
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
import type {
  TransactionType,
  TransactionTypeMutationPayload,
} from '../../models/transactionTypes';

interface TransactionTypeFormDialogProps {
  open: boolean;
  editingTransactionType: TransactionType | null;
  initialValues: TransactionTypeMutationPayload;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: TransactionTypeMutationPayload) => void;
}

const TransactionTypeFormDialog: React.FC<TransactionTypeFormDialogProps> = ({
  open,
  editingTransactionType,
  initialValues,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<TransactionTypeMutationPayload>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {editingTransactionType ? t('transactionTypes.edit') : t('transactionTypes.create')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="transaction-type-form"
          spacing={2}
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactionTypes.form.code')}
                required
                fullWidth
                autoFocus
              />
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField {...field} label={t('transactionTypes.form.name')} required fullWidth />
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
          form="transaction-type-form"
          variant="contained"
          disabled={isSubmitting}
        >
          {editingTransactionType ? t('common.saveChanges') : t('transactionTypes.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionTypeFormDialog;