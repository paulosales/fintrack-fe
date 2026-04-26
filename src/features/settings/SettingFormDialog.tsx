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
import type { Setting, SettingMutationPayload } from '../../models/settings';

interface SettingFormDialogProps {
  open: boolean;
  editingSetting: Setting | null;
  initialValues: SettingMutationPayload;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: SettingMutationPayload) => void;
}

const SettingFormDialog: React.FC<SettingFormDialogProps> = ({
  open,
  editingSetting,
  initialValues,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<SettingMutationPayload>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingSetting ? t('settings.edit') : t('settings.create')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="setting-form"
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
                label={t('settings.form.code')}
                required
                fullWidth
                autoFocus={!editingSetting}
                disabled={!!editingSetting}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('settings.form.description')}
                required
                fullWidth
                autoFocus={!!editingSetting}
              />
            )}
          />
          <Controller
            control={control}
            name="value"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('settings.form.value')}
                fullWidth
                value={field.value ?? ''}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" form="setting-form" variant="contained" disabled={isSubmitting}>
          {editingSetting ? t('common.saveChanges') : t('settings.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingFormDialog;
