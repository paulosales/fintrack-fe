import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, Typography } from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';

import type { SubTransaction, Transaction, TransactionFormState } from './types';
import SubTransactionFormDialog from './SubTransactionFormDialog';
import type { SubTransactionFormValues } from './SubTransactionFormDialog';
import type { RootState, AppDispatch } from '../../store';
import TransactionFormDialog from './TransactionFormDialog';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import useTransactionFilters from './useTransactionFilters';
import {
  createTransaction,
  deleteTransaction,
  fetchSubTransactions,
  updateTransaction,
  updateSubTransaction,
  deleteSubTransaction,
  createSubTransaction,
} from './transactionSlice';
import { fetchAccounts } from '../accounts/accountsSlice';
import { fetchCategories } from '../categories/categoriesSlice';
import { fetchTransactionTypes } from '../transactionTypes/transactionTypesSlice';

const getCurrentLocalDateTime = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const toDateTimeLocalValue = (value: string): string => value.replace(' ', 'T').slice(0, 16);

const buildTransactionFormDefaults = (
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

const TransactionList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error, pagination } = useSelector(
    (state: RootState) => state.transactions
  );
  const accountsState = useSelector((state: RootState) => state.accounts);
  const categoriesState = useSelector((state: RootState) => state.categories);
  const transactionTypesState = useSelector((state: RootState) => state.transactionTypes);
  const subTransactionsByTransactionId =
    useSelector((state: RootState) => state.transactions.detailsByTransactionId) || {};

  const accounts = accountsState.data;
  const transactionTypes = transactionTypesState.data;
  const categories = categoriesState.data;

  const {
    filters,
    setPage,
    reloadTransactions,
    handleReload,
    handleAccountChange,
    handleTransactionTypeChange,
    handleCategoryChange,
    handleDescriptionChange,
    handlePageSizeChange,
  } = useTransactionFilters();

  const { page } = filters;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const closeFeedback = () => {
    setActionError(null);
  };

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactionTypes());
    dispatch(fetchCategories());
  }, [dispatch]);

  const getAccountName = (id: number) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? `${acc.code} - ${acc.name}` : `${t('transactions.form.account')} ${id}`;
  };

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

  type ConfirmPayload =
    | { kind: 'transaction'; id: number; transactionId: number; title?: string; content?: string }
    | { kind: 'sub'; id: number; transactionId: number; title?: string; content?: string };

  const { open: confirmOpen, payload: confirmPayload, openConfirm, closeConfirm } =
    useConfirmDialog<ConfirmPayload>();

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
    setActionError(null);
    try {
      if (confirmPayload.kind === 'transaction') {
        await dispatch(deleteTransaction(confirmPayload.id)).unwrap();
        if (data.length === 1 && page > 1) setPage(page - 1);
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

  const toggleExpand = (tx: Transaction) => {
    const isExpanded = expandedIds.includes(tx.id);
    if (isExpanded) setExpandedIds(expandedIds.filter((id) => id !== tx.id));
    else {
      setExpandedIds([...expandedIds, tx.id]);
      void dispatch(fetchSubTransactions(tx.id));
    }
  };

  const [editingSub, setEditingSub] = useState<SubTransaction | null>(null);
  const [creatingSubFor, setCreatingSubFor] = useState<number | null>(null);

  const subDialogOpen = Boolean(editingSub) || Boolean(creatingSubFor);

  const handleEditSub = (subTransaction: SubTransaction) => setEditingSub(subTransaction);

  const handleDeleteSub = (subId: number, transactionId: number) => {
    openConfirm({
      kind: 'sub',
      id: subId,
      transactionId,
      title: `Delete sub-transaction ${subId}?`,
      content: `Delete sub-transaction ${subId}?`,
    });
  };

  const handleSaveSub = async (values: SubTransaction) => {
    try {
      await dispatch(
        updateSubTransaction({
          id: values.id,
          transactionId: values.transactionId,
          payload: {
            productCode: values.productCode,
            amount: Number(values.amount),
            description: values.description,
            note: values.note,
            categoryIds: values.categoryIds
              ? values.categoryIds.split(',').map(Number).filter((v) => !Number.isNaN(v))
              : [],
          },
        })
      ).unwrap();
      setEditingSub(null);
      void dispatch(fetchSubTransactions(values.transactionId));
    } catch {
      // noop
    }
  };

  const handleOpenCreateSub = (transactionId: number) => {
    setCreatingSubFor(transactionId);
  };

  const handleCloseSubDialog = () => {
    setEditingSub(null);
    setCreatingSubFor(null);
  };

  const handleCreateSub = async (values: SubTransactionFormValues) => {
    if (!creatingSubFor) return;
    try {
      const payload = {
        productCode: values.productCode || null,
        amount: Number(values.amount || 0),
        description: values.description || '',
        note: values.note || null,
        categoryIds: values.categoryIds
          ? values.categoryIds.map(Number).filter((v) => !Number.isNaN(v))
          : [],
      };
      await dispatch(createSubTransaction({ transactionId: creatingSubFor, payload })).unwrap();
      void dispatch(fetchSubTransactions(creatingSubFor));
      setCreatingSubFor(null);
    } catch {
      // ignore for now
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
        }}
      >
        <Typography variant="h4" component="h1">
          {t('transactions.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('transactions.create')}
        </Button>
      </Box>

      <TransactionFilters
        filters={filters}
        options={{ accounts, transactionTypes, categories }}
        loadingState={{
          accounts: accountsState.loading,
          transactionTypes: transactionTypesState.loading,
          categories: categoriesState.loading,
          transactions: loading,
        }}
        actions={{
          onAccountChange: handleAccountChange,
          onTransactionTypeChange: handleTransactionTypeChange,
          onCategoryChange: handleCategoryChange,
          onDescriptionChange: handleDescriptionChange,
          onReload: handleReload,
        }}
      />

      {accountsState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactions.failedLoadAccounts', { error: accountsState.error })}
        </Alert>
      )}
      {transactionTypesState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactions.failedLoadTypes', { error: transactionTypesState.error })}
        </Alert>
      )}
      {categoriesState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactions.failedLoadCategories', { error: categoriesState.error })}
        </Alert>
      )}
      {error && <Alert severity="error">{t('transactions.error', { error })}</Alert>}
      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('transactions.empty')}</Alert>
      )}

      {data.length > 0 && (
        <TransactionTable
          transactions={data}
          expandedIds={expandedIds}
          subTransactionsByTransactionId={subTransactionsByTransactionId}
          pagination={pagination}
          getAccountName={getAccountName}
          onToggleExpand={toggleExpand}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onEditSub={handleEditSub}
          onDeleteSub={handleDeleteSub}
          onCreateSub={handleOpenCreateSub}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <TransactionFormDialog
        open={dialogOpen}
        editingTransaction={editingTransaction}
        initialValues={buildTransactionFormDefaults(editingTransaction, accounts, transactionTypes)}
        formError={formError}
        isSubmitting={isSubmitting}
        accounts={accounts}
        transactionTypes={transactionTypes}
        categories={categories}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <SubTransactionFormDialog
        key={editingSub?.id ?? 'new'}
        open={subDialogOpen}
        editing={editingSub}
        categories={categories}
        onClose={handleCloseSubDialog}
        onSave={handleSaveSub}
        onCreate={handleCreateSub}
      />
      <ConfirmDialog
        open={confirmOpen}
        title={confirmPayload?.title}
        content={confirmPayload?.content}
        confirmText={t('common.yes') || 'Delete'}
        cancelText={t('common.no') || 'Cancel'}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />

      <FeedbackSnackbar
        open={Boolean(actionError)}
        message={actionError || ''}
        severity="error"
        onClose={closeFeedback}
      />
    </Box>
  );
};

export default TransactionList;
