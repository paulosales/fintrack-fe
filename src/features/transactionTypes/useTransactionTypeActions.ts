import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import type {
  TransactionType,
  TransactionTypeMutationPayload,
} from '../../models/transactionTypes';
import type { AppDispatch } from '../../store';
import {
  createTransactionType,
  deleteTransactionType,
  updateTransactionType,
} from './transactionTypesSlice';

export const buildTransactionTypeFormDefaults = (
  transactionType: TransactionType | null
): TransactionTypeMutationPayload => ({
  code: transactionType?.code ?? '',
  name: transactionType?.name ?? '',
});

const useTransactionTypeActions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransactionType, setEditingTransactionType] = useState<TransactionType | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    open: confirmOpen,
    payload: confirmPayload,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog<TransactionType>();

  const closeFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

  const handleCreateClick = () => {
    setEditingTransactionType(null);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (transactionType: TransactionType) => {
    setEditingTransactionType(transactionType);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEditingTransactionType(null);
    setFormError(null);
  };

  const buildPayload = (
    formValues: TransactionTypeMutationPayload
  ): TransactionTypeMutationPayload | null => {
    const code = formValues.code.trim();
    const name = formValues.name.trim();
    if (!code || !name) {
      setFormError(t('transactionTypes.requiredError'));
      return null;
    }
    setFormError(null);
    return { code, name };
  };

  const handleSubmit = async (formValues: TransactionTypeMutationPayload) => {
    const payload = buildPayload(formValues);
    if (!payload) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingTransactionType) {
        await dispatch(updateTransactionType({ id: editingTransactionType.id, payload })).unwrap();
        setActionMessage(t('transactionTypes.updated'));
      } else {
        await dispatch(createTransactionType(payload)).unwrap();
        setActionMessage(t('transactionTypes.created'));
      }
      setDialogOpen(false);
      setEditingTransactionType(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (transactionType: TransactionType) => {
    openConfirm(transactionType);
    setActionError(null);
    setActionMessage(null);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
    setActionError(null);
    setActionMessage(null);
    try {
      await dispatch(deleteTransactionType(confirmPayload.id)).unwrap();
      setActionMessage(t('transactionTypes.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      closeConfirm();
    }
  };

  return {
    dialogOpen,
    editingTransactionType,
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

export default useTransactionTypeActions;