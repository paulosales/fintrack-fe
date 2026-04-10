import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import type { Category, CategoryMutationPayload } from '../../models/categories';
import type { AppDispatch, RootState } from '../../store';
import CategoryFormDialog from './CategoryFormDialog';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from './categoriesSlice';

const buildCategoryFormDefaults = (category: Category | null): CategoryMutationPayload => ({
  name: category?.name ?? '',
});

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.categories);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<Category | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreateClick = () => {
    setEditingCategory(null);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) {
      return;
    }

    setDialogOpen(false);
    setEditingCategory(null);
    setFormError(null);
  };

  const buildPayload = (formValues: CategoryMutationPayload): CategoryMutationPayload | null => {
    const name = formValues.name.trim();

    if (!name) {
      setFormError(t('categories.requiredError'));
      return null;
    }

    setFormError(null);
    return { name };
  };

  const handleSubmit = async (formValues: CategoryMutationPayload) => {
    const payload = buildPayload(formValues);

    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, payload })).unwrap();
        setActionMessage(t('categories.updated'));
      } else {
        await dispatch(createCategory(payload)).unwrap();
        setActionMessage(t('categories.created'));
      }

      setDialogOpen(false);
      setEditingCategory(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setConfirmPayload(category);
    setConfirmOpen(true);
    setActionError(null);
    setActionMessage(null);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmPayload(null);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) {
      closeConfirm();
      return;
    }

    setActionError(null);
    setActionMessage(null);

    try {
      await dispatch(deleteCategory(confirmPayload.id)).unwrap();
      setActionMessage(t('categories.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      closeConfirm();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h4" component="h1">
          {t('categories.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('categories.create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('categories.failedLoadCategories', { error })}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {actionMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {actionMessage}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && data.length === 0 && <Alert severity="info">{t('categories.empty')}</Alert>}

      {!loading && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('categories.columns.id')}</TableCell>
                <TableCell>{t('categories.columns.name')}</TableCell>
                <TableCell align="right">{t('categories.columns.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell align="right" sx={{ minWidth: 120 }}>
                    <IconButton
                      aria-label={t('categories.actions.editAria', { id: category.id })}
                      onClick={() => handleEditClick(category)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label={t('categories.actions.deleteAria', { id: category.id })}
                      color="error"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        editingCategory={editingCategory}
        initialValues={buildCategoryFormDefaults(editingCategory)}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('categories.deleteConfirm', { id: confirmPayload?.id ?? '' })}
        content={t('categories.deleteConfirm', { id: confirmPayload?.id ?? '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
    </Box>
  );
};

export default CategoriesPage;