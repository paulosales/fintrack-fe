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
import type { Category, CategoryMutationPayload } from '../../models/categories';

interface CategoryFormDialogProps {
  open: boolean;
  editingCategory: Category | null;
  initialValues: CategoryMutationPayload;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryMutationPayload) => void;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  editingCategory,
  initialValues,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<CategoryMutationPayload>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editingCategory ? t('categories.edit') : t('categories.create')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="category-form"
          spacing={2}
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField {...field} label={t('categories.form.name')} required fullWidth autoFocus />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" form="category-form" variant="contained" disabled={isSubmitting}>
          {editingCategory ? t('common.saveChanges') : t('categories.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;