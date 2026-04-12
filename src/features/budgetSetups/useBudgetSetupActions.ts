import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import type { AppDispatch, RootState } from '../../store';
import type { BudgetSetupFormState, BudgetSetupMutationPayload, BudgetSetupRecord } from './types';
import { createBudgetSetup, deleteBudgetSetup, updateBudgetSetup } from './budgetSetupSlice';

const getCurrentLocalDate = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
};

export const buildBudgetSetupFormDefaults = (
  budgetSetup: BudgetSetupRecord | null,
  accountOptions: RootState['accounts']['data']
): BudgetSetupFormState => ({
  accountId: budgetSetup
    ? String(budgetSetup.accountId)
    : accountOptions[0]
      ? String(accountOptions[0].id)
      : '',
  date: budgetSetup?.date ?? getCurrentLocalDate(),
  isRepeatle: budgetSetup?.isRepeatle ?? false,
  repeatFrequency: budgetSetup?.repeatFrequency ?? '',
  endDate: budgetSetup?.endDate ?? '',
  description: budgetSetup?.description ?? '',
  amount: budgetSetup ? String(budgetSetup.amount) : '',
  note: budgetSetup?.note ?? '',
});

type ConfirmPayload = { id: number; title?: string; content?: string };

interface UseBudgetSetupActionsOptions {
  dataLength: number;
  page: number;
  setPage: (page: number) => void;
  reloadBudgetSetups: (page?: number) => void;
}

const useBudgetSetupActions = ({
  dataLength,
  page,
  setPage,
  reloadBudgetSetups,
}: UseBudgetSetupActionsOptions) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudgetSetup, setEditingBudgetSetup] = useState<BudgetSetupRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    open: confirmOpen,
    payload: confirmPayload,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog<ConfirmPayload>();

  const closeFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

  const handleCreateClick = () => {
    setEditingBudgetSetup(null);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (budgetSetup: BudgetSetupRecord) => {
    setEditingBudgetSetup(budgetSetup);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEditingBudgetSetup(null);
    setFormError(null);
  };

  const buildPayload = (formValues: BudgetSetupFormState): BudgetSetupMutationPayload | null => {
    const parsedAccountId = Number(formValues.accountId);
    const parsedAmount = Number(formValues.amount);

    if (!parsedAccountId || !formValues.date || !formValues.description.trim()) {
      setFormError(t('budgetSetups.requiredError'));
      return null;
    }

    if (Number.isNaN(parsedAmount)) {
      setFormError(t('budgetSetups.amountInvalid'));
      return null;
    }

    if (formValues.isRepeatle && !formValues.repeatFrequency) {
      setFormError(t('budgetSetups.repeatFrequencyRequired'));
      return null;
    }

    setFormError(null);

    return {
      accountId: parsedAccountId,
      date: formValues.date,
      isRepeatle: formValues.isRepeatle,
      repeatFrequency: formValues.isRepeatle ? formValues.repeatFrequency : undefined,
      endDate: formValues.isRepeatle && formValues.endDate ? formValues.endDate : undefined,
      description: formValues.description.trim(),
      amount: parsedAmount,
      note: formValues.note.trim() || undefined,
    };
  };

  const handleSubmit = async (formValues: BudgetSetupFormState) => {
    const payload = buildPayload(formValues);
    if (!payload) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingBudgetSetup) {
        await dispatch(updateBudgetSetup({ id: editingBudgetSetup.id, payload })).unwrap();
        setActionMessage(t('budgetSetups.updated'));
      } else {
        await dispatch(createBudgetSetup(payload)).unwrap();
        setActionMessage(t('budgetSetups.created'));
      }

      reloadBudgetSetups(editingBudgetSetup ? page : 1);
      if (!editingBudgetSetup) setPage(1);
      setDialogOpen(false);
      setEditingBudgetSetup(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (budgetSetup: BudgetSetupRecord) => {
    openConfirm({
      id: budgetSetup.id,
      title: t('budgetSetups.deleteConfirm', { id: budgetSetup.id }),
      content: t('budgetSetups.deleteConfirm', { id: budgetSetup.id }),
    });
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
    setActionError(null);
    setActionMessage(null);
    try {
      await dispatch(deleteBudgetSetup(confirmPayload.id)).unwrap();
      if (dataLength === 1 && page > 1) setPage(page - 1);
      else reloadBudgetSetups();
      setActionMessage(t('budgetSetups.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      closeConfirm();
    }
  };

  return {
    dialogOpen,
    editingBudgetSetup,
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

export default useBudgetSetupActions;
