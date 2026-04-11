import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import type { AppDispatch, RootState } from '../../store';
import type { Transaction, TransactionFormState } from './types';
import {
  createTransaction,
  deleteTransaction,
  fetchSubTransactions,
  updateTransaction,
  deleteSubTransaction,
} from './transactionSlice';

const getCurrentLocalDateTime = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const toDateTimeLocalValue = (value: string): string => value.replace(' ', 'T').slice(0, 16);

export const buildTransactionFormDefaults = (
  transaction: Transaction | null,
  accountOptions: RootState['accounts']['data'],
  transactionTypeOptions: RootState['transactionTypes']['data']
): TransactionFormState => ({
  accountId: transaction
    ? String(transaction.accountId)
    : accountOptions[0]
      ? String(accountOptions[0].id)
      : '',
  transactionTypeId: transaction
    ? String(transaction.transactionTypeId)
    : transactionTypeOptions[0]
      ? String(transactionTypeOptions[0].id)
      : '',
  categoryIds: transaction?.categoryIds ? transaction.categoryIds.split(',').filter(Boolean) : [],
  datetime: transaction ? toDateTimeLocalValue(transaction.datetime) : getCurrentLocalDateTime(),
  amount: transaction ? String(transaction.amount) : '',
  description: transaction?.description ?? '',
  note: transaction?.note ?? '',
});

type ConfirmPayload =
  | { kind: 'transaction'; id: number; transactionId: number; title?: string; content?: string }
  | { kind: 'sub'; id: number; transactionId: number; title?: string; content?: string };

interface UseTransactionActionsOptions {
  dataLength: number;
  page: number;
  setPage: (page: number) => void;
  reloadTransactions: (page?: number) => void;
}

const useTransactionActions = ({
  dataLength,
  page,
  setPage,
  reloadTransactions,
}: UseTransactionActionsOptions) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { open: confirmOpen, payload: confirmPayload, openConfirm, closeConfirm } =
    useConfirmDialog<ConfirmPayload>();

  const closeFeedback = () => setActionError(null);

  const handleCreateClick = () => {
    setEditingTransaction(null);
    setActionError(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setActionError(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEditingTransaction(null);
    setFormError(null);
  };

  const buildPayload = (formValues: TransactionFormState) => {
    const parsedAccountId = Number(formValues.accountId);
    const parsedTransactionTypeId = Number(formValues.transactionTypeId);
    const parsedCategoryIds = formValues.categoryIds.map(Number).filter((v) => !Number.isNaN(v));
    const parsedAmount = Number(formValues.amount);

    if (
      !parsedAccountId ||
      !parsedTransactionTypeId ||
      !formValues.datetime ||
      !formValues.description.trim()
    ) {
      setFormError(t('transactions.requiredError'));
      return null;
    }
    if (Number.isNaN(parsedAmount)) {
      setFormError(t('transactions.amountInvalid'));
      return null;
    }

    setFormError(null);
    return {
      accountId: parsedAccountId,
      transactionTypeId: parsedTransactionTypeId,
      categoryIds: parsedCategoryIds,
      datetime: formValues.datetime,
      amount: parsedAmount,
      description: formValues.description.trim(),
      note: formValues.note.trim() || undefined,
    } as const;
  };

  const handleSubmit = async (formValues: TransactionFormState) => {
    const payload = buildPayload(formValues);
    if (!payload) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (editingTransaction) {
        await dispatch(updateTransaction({ id: editingTransaction.id, payload })).unwrap();
        reloadTransactions();
      } else {
        await dispatch(createTransaction(payload)).unwrap();
        if (page !== 1) setPage(1);
        else reloadTransactions(1);
      }
      setDialogOpen(false);
      setEditingTransaction(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (transaction: Transaction) => {
    openConfirm({
      kind: 'transaction',
      id: transaction.id,
      transactionId: transaction.id,
      title: t('transactions.deleteConfirm', { id: transaction.id }),
      content: t('transactions.deleteConfirm', { id: transaction.id }),
    });
  };

  const handleDeleteSub = (subId: number, transactionId: number) => {
    openConfirm({
      kind: 'sub',
      id: subId,
      transactionId,
      title: `Delete sub-transaction ${subId}?`,
      content: `Delete sub-transaction ${subId}?`,
    });
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
    setActionError(null);
    try {
      if (confirmPayload.kind === 'transaction') {
        await dispatch(deleteTransaction(confirmPayload.id)).unwrap();
        if (dataLength === 1 && page > 1) setPage(page - 1);
        else reloadTransactions();
      } else {
        await dispatch(
          deleteSubTransaction({
            id: confirmPayload.id,
            transactionId: confirmPayload.transactionId,
          })
        ).unwrap();
        void dispatch(fetchSubTransactions(confirmPayload.transactionId));
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      closeConfirm();
    }
  };

  return {
    // dialog state
    dialogOpen,
    editingTransaction,
    formError,
    isSubmitting,
    // feedback
    actionError,
    closeFeedback,
    // confirm dialog
    confirmOpen,
    confirmPayload,
    closeConfirm,
    // handlers
    handleCreateClick,
    handleEditClick,
    handleDialogClose,
    handleSubmit,
    handleDeleteClick,
    handleDeleteSub,
    handleConfirm,
  };
};

export default useTransactionActions;
