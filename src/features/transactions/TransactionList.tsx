import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIconSmall from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';

import type { SubTransaction, Transaction, TransactionFormState } from './types';
import type { RootState, AppDispatch } from '../../store';
import TransactionFormDialog from './TransactionFormDialog';
import TransactionFilters from './TransactionFilters';
import PaginationControls from '../../components/PaginationControls';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDateTime } from '../../utils/dateUtils';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
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

  const [accountId, setAccountId] = useState<number | null>(null);
  const [transactionTypeId, setTransactionTypeId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactionTypes());
    dispatch(fetchCategories());
  }, [dispatch]);

  const debouncedApplyDescription = useDebouncedCallback((nextDescription: string) => {
    setDescription(nextDescription);
    setPage(1);
  }, 600);

  useEffect(() => () => debouncedApplyDescription.cancel(), [debouncedApplyDescription]);

  useEffect(() => {
    dispatch(
      fetchTransactions({
        accountId,
        transactionTypeId,
        categoryId,
        description,
        page,
        pageSize,
      })
    );
  }, [dispatch, accountId, transactionTypeId, categoryId, description, page, pageSize]);

  const reloadTransactions = (nextPage = page) => {
    dispatch(
      fetchTransactions({
        accountId,
        transactionTypeId,
        categoryId,
        description,
        page: nextPage,
        pageSize,
      })
    );
  };

  const handleReload = () => reloadTransactions();

  const handleAccountChange = (nextAccountId: number | null) => {
    setAccountId(nextAccountId);
    setPage(1);
  };
  const handleTransactionTypeChange = (next: number | null) => {
    setTransactionTypeId(next);
    setPage(1);
  };
  const handleCategoryChange = (next: number | null) => {
    setCategoryId(next);
    setPage(1);
  };
  const handleDescriptionChange = (nextDescription: string) => {
    setDescriptionInput(nextDescription);
    debouncedApplyDescription(nextDescription);
  };
  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload | null>(null);

  const openConfirm = (payload: ConfirmPayload) => {
    setConfirmPayload(payload);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmPayload(null);
  };

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
  const [newSubValues, setNewSubValues] = useState({
    productCode: '',
    description: '',
    amount: '',
    note: '',
  });
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
          },
        })
      ).unwrap();
      setEditingSub(null);
      void dispatch(fetchSubTransactions(values.transactionId));
    } catch (e) {
      // noop
    }
  };

  const handleOpenCreateSub = (transactionId: number) => {
    setCreatingSubFor(transactionId);
    setNewSubValues({ productCode: '', description: '', amount: '', note: '' });
  };

  const handleCancelCreateSub = () => setCreatingSubFor(null);

  const handleCreateSub = async () => {
    if (!creatingSubFor) return;
    try {
      const payload = {
        productCode: newSubValues.productCode || null,
        amount: Number(newSubValues.amount || 0),
        description: newSubValues.description || '',
        note: newSubValues.note || null,
      };
      await dispatch(createSubTransaction({ transactionId: creatingSubFor, payload })).unwrap();
      void dispatch(fetchSubTransactions(creatingSubFor));
      setCreatingSubFor(null);
    } catch (e) {
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
        filters={{
          accountId,
          transactionTypeId,
          categoryId,
          description,
          descriptionInput,
          page,
          pageSize,
        }}
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
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('transactions.empty')}</Alert>
      )}

      {data.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>ID</TableCell>
                  <TableCell>{t('transactions.columns.account')}</TableCell>
                  <TableCell>{t('transactions.columns.type')}</TableCell>
                  <TableCell>{t('transactions.columns.date')}</TableCell>
                  <TableCell>{t('transactions.columns.amount')}</TableCell>
                  <TableCell>{t('transactions.columns.description')}</TableCell>
                  <TableCell>{t('transactions.columns.categories')}</TableCell>
                  <TableCell>{t('transactions.columns.note')}</TableCell>
                  <TableCell align="right">{t('transactions.columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((tx: Transaction) => (
                  <React.Fragment key={tx.id}>
                    <TableRow>
                      <TableCell sx={{ width: 56 }}>
                        <IconButton
                          aria-label={
                            expandedIds.includes(tx.id)
                              ? t('common.collapseRow')
                              : t('common.expandRow')
                          }
                          size="small"
                          onClick={() => toggleExpand(tx)}
                        >
                          {expandedIds.includes(tx.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{getAccountName(tx.accountId)}</TableCell>
                      <TableCell>{tx.transactionTypeName || t('common.notAvailable')}</TableCell>
                      <TableCell>{formatDateTime(tx.datetime)}</TableCell>
                      <TableCell>{formatCurrency(tx.amount)}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.categories || t('common.notAvailable')}</TableCell>
                      <TableCell>{tx.note || t('common.notAvailable')}</TableCell>
                      <TableCell align="right" sx={{ minWidth: 120 }}>
                        <IconButton
                          aria-label={t('transactions.actions.editAria', { id: tx.id })}
                          onClick={() => handleEditClick(tx)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label={t('transactions.actions.deleteAria', { id: tx.id })}
                          color="error"
                          onClick={() => handleDeleteClick(tx)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {expandedIds.includes(tx.id) && (
                      <TableRow>
                        <TableCell colSpan={10} sx={{ backgroundColor: 'background.paper' }}>
                          <Typography variant="subtitle2">
                            {t('transactions.subTransactions') || 'Sub transactions'}
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Product</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Note</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(subTransactionsByTransactionId[tx.id]?.data || []).map(
                                (subTransaction: SubTransaction) => (
                                  <TableRow key={subTransaction.id}>
                                    <TableCell>{subTransaction.id}</TableCell>
                                    <TableCell>{subTransaction.productCode || '-'}</TableCell>
                                    <TableCell>{subTransaction.description}</TableCell>
                                    <TableCell>{formatCurrency(subTransaction.amount)}</TableCell>
                                    <TableCell>{subTransaction.note || '-'}</TableCell>
                                    <TableCell align="right">
                                      <IconButton
                                        aria-label={`edit sub ${subTransaction.id}`}
                                        size="small"
                                        onClick={() =>
                                          handleEditSub({ ...subTransaction, transactionId: tx.id })
                                        }
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        aria-label={`delete sub ${subTransaction.id}`}
                                        size="small"
                                        onClick={() => handleDeleteSub(subTransaction.id, tx.id)}
                                      >
                                        <DeleteIconSmall fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                              <TableRow>
                                <TableCell colSpan={6}>
                                  <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenCreateSub(tx.id)}
                                  >
                                    Add sub-transaction
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <PaginationControls
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
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

      <Dialog open={Boolean(editingSub)} onClose={() => setEditingSub(null)}>
        <DialogTitle>Edit Sub-transaction</DialogTitle>
        <DialogContent>
          {editingSub && (
            <Box
              component="form"
              id="sub-edit-form"
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
            >
              <TextField
                label="Product Code"
                value={editingSub.productCode ?? ''}
                onChange={(e) => setEditingSub({ ...editingSub, productCode: e.target.value })}
              />
              <TextField
                label="Description"
                value={editingSub.description}
                onChange={(e) => setEditingSub({ ...editingSub, description: e.target.value })}
              />
              <TextField
                label="Amount"
                type="number"
                value={String(editingSub.amount ?? '')}
                onChange={(e) =>
                  setEditingSub({ ...editingSub, amount: Number.parseFloat(e.target.value) })
                }
              />
              <TextField
                label="Note"
                value={editingSub.note ?? ''}
                onChange={(e) => setEditingSub({ ...editingSub, note: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingSub(null)}>Cancel</Button>
          <Button onClick={() => editingSub && handleSaveSub(editingSub)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(creatingSubFor)} onClose={handleCancelCreateSub}>
        <DialogTitle>Create Sub-transaction</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="sub-create-form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
          >
            <TextField
              label="Product Code"
              value={newSubValues.productCode}
              onChange={(e) => setNewSubValues({ ...newSubValues, productCode: e.target.value })}
            />
            <TextField
              label="Description"
              value={newSubValues.description}
              onChange={(e) => setNewSubValues({ ...newSubValues, description: e.target.value })}
            />
            <TextField
              label="Amount"
              type="number"
              value={newSubValues.amount}
              onChange={(e) => setNewSubValues({ ...newSubValues, amount: e.target.value })}
            />
            <TextField
              label="Note"
              value={newSubValues.note}
              onChange={(e) => setNewSubValues({ ...newSubValues, note: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCreateSub}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSub}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        title={confirmPayload?.title}
        content={confirmPayload?.content}
        confirmText={t('common.yes') || 'Delete'}
        cancelText={t('common.no') || 'Cancel'}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
    </Box>
  );
};

export default TransactionList;
