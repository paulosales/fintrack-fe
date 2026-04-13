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
import type { AccountType, AccountTypeMutationPayload } from '../../models/accountTypes';

interface AccountTypeFormDialogProps {
  open: boolean;
  editingAccountType: AccountType | null;
  initialValues: AccountTypeMutationPayload;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AccountTypeMutationPayload) => void;
}

const AccountTypeFormDialog: React.FC<AccountTypeFormDialogProps> = ({
  open,
  editingAccountType,
  initialValues,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<AccountTypeMutationPayload>({
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
        {editingAccountType ? t('accountTypes.edit') : t('accountTypes.create')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="account-type-form"
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
                label={t('accountTypes.form.code')}
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
              <TextField {...field} label={t('accountTypes.form.name')} required fullWidth />
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
          form="account-type-form"
          variant="contained"
          disabled={isSubmitting}
        >
          {editingAccountType ? t('common.saveChanges') : t('accountTypes.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountTypeFormDialog;
