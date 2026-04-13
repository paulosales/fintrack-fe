import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import type { Account, AccountMutationPayload } from '../../models/accounts';
import type { AppDispatch } from '../../store';
import { createAccount, deleteAccount, updateAccount } from './accountsSlice';

export const buildAccountFormDefaults = (account: Account | null): AccountMutationPayload => ({
  code: account?.code ?? '',
  name: account?.name ?? '',
  accountTypeId: account?.accountTypeId ?? 0,
});

const useAccountActions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    open: confirmOpen,
    payload: confirmPayload,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog<Account>();

  const closeFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

  const handleCreateClick = () => {
    setEditingAccount(null);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEditingAccount(null);
    setFormError(null);
  };

  const buildPayload = (formValues: AccountMutationPayload): AccountMutationPayload | null => {
    const code = formValues.code.trim();
    const name = formValues.name.trim();
    if (!code || !name || !formValues.accountTypeId) {
      setFormError(t('accounts.requiredError'));
      return null;
    }
    setFormError(null);
    return { code, name, accountTypeId: formValues.accountTypeId };
  };

  const handleSubmit = async (formValues: AccountMutationPayload) => {
    const payload = buildPayload(formValues);
    if (!payload) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingAccount) {
        await dispatch(updateAccount({ id: editingAccount.id, payload })).unwrap();
        setActionMessage(t('accounts.updated'));
      } else {
        await dispatch(createAccount(payload)).unwrap();
        setActionMessage(t('accounts.created'));
      }
      setDialogOpen(false);
      setEditingAccount(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (account: Account) => {
    openConfirm(account);
    setActionError(null);
    setActionMessage(null);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
    setActionError(null);
    setActionMessage(null);
    try {
      await dispatch(deleteAccount(confirmPayload.id)).unwrap();
      setActionMessage(t('accounts.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      closeConfirm();
    }
  };

  return {
    dialogOpen,
    editingAccount,
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

export default useAccountActions;
