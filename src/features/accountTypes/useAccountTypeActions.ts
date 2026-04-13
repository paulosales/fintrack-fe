import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import type { AccountType, AccountTypeMutationPayload } from '../../models/accountTypes';
import type { AppDispatch } from '../../store';
import {
  createAccountType,
  deleteAccountType,
  updateAccountType,
} from '../accounts/accountTypesSlice';

export const buildAccountTypeFormDefaults = (
  accountType: AccountType | null
): AccountTypeMutationPayload => ({
  code: accountType?.code ?? '',
  name: accountType?.name ?? '',
});

const useAccountTypeActions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccountType, setEditingAccountType] = useState<AccountType | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    open: confirmOpen,
    payload: confirmPayload,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog<AccountType>();

  const closeFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

  const handleCreateClick = () => {
    setEditingAccountType(null);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (accountType: AccountType) => {
    setEditingAccountType(accountType);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEditingAccountType(null);
    setFormError(null);
  };

  const buildPayload = (
    formValues: AccountTypeMutationPayload
  ): AccountTypeMutationPayload | null => {
    const code = formValues.code.trim();
    const name = formValues.name.trim();
    if (!code || !name) {
      setFormError(t('accountTypes.requiredError'));
      return null;
    }
    setFormError(null);
    return { code, name };
  };

  const handleSubmit = async (formValues: AccountTypeMutationPayload) => {
    const payload = buildPayload(formValues);
    if (!payload) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingAccountType) {
        await dispatch(updateAccountType({ id: editingAccountType.id, payload })).unwrap();
        setActionMessage(t('accountTypes.updated'));
      } else {
        await dispatch(createAccountType(payload)).unwrap();
        setActionMessage(t('accountTypes.created'));
      }
      setDialogOpen(false);
      setEditingAccountType(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (accountType: AccountType) => {
    openConfirm(accountType);
    setActionError(null);
    setActionMessage(null);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
    setActionError(null);
    setActionMessage(null);
    try {
      await dispatch(deleteAccountType(confirmPayload.id)).unwrap();
      setActionMessage(t('accountTypes.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      closeConfirm();
    }
  };

  return {
    dialogOpen,
    editingAccountType,
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

export default useAccountTypeActions;
