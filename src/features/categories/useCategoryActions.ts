import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import type { Category, CategoryMutationPayload } from '../../models/categories';
import type { AppDispatch } from '../../store';
import { createCategory, deleteCategory, updateCategory } from './categoriesSlice';

export const buildCategoryFormDefaults = (category: Category | null): CategoryMutationPayload => ({
  name: category?.name ?? '',
});

const useCategoryActions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    open: confirmOpen,
    payload: confirmPayload,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog<Category>();

  const closeFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

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
    if (isSubmitting) return;
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
    if (!payload) return;

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
    openConfirm(category);
    setActionError(null);
    setActionMessage(null);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
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

  return {
    dialogOpen,
    editingCategory,
    formError,
    isSubmitting,
    actionError,
    actionMessage,
    closeFeedback,
    confirmOpen,
    confirmPayload,
    closeConfirm,
    handleCreateClick,
    handleEditClick,
    handleDialogClose,
    handleSubmit,
    handleDeleteClick,
    handleConfirm,
  };
};

export default useCategoryActions;
