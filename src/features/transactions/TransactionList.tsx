import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from './transactionSlice';
import { fetchAccounts } from '../accounts/accountsSlice';
import { fetchCategories } from '../categories/categoriesSlice';
import { fetchTransactionTypes } from '../transactionTypes/transactionTypesSlice';
import TransactionFormDialog from './TransactionFormDialog';
import TransactionFilters from './TransactionFilters';
import PaginationControls from '../../components/PaginationControls';
import type { Transaction, TransactionFormState, TransactionMutationPayload } from './types';
import type { RootState, AppDispatch } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDateTime } from '../../utils/dateUtils';
import {
  Alert,
  Box,
  Button,
  Container,
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

const getCurrentLocalDateTime = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

const toDateTimeLocalValue = (value: string): string => value.replace(' ', 'T').slice(0, 16);

const TransactionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, pagination } = useSelector(
    (state: RootState) => state.transactions
  );
  const {
    data: accounts,
    loading: accountsLoading,
    error: accountsError,
  } = useSelector((state: RootState) => state.accounts);
  const {
    data: transactionTypes,
    loading: transactionTypesLoading,
    error: transactionTypesError,
  } = useSelector((state: RootState) => state.transactionTypes);
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.categories);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [transactionTypeId, setTransactionTypeId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TransactionFormState>({
    accountId: '',
    transactionTypeId: '',
    categoryIds: [],
    datetime: getCurrentLocalDateTime(),
    amount: '',
    description: '',
    note: '',
  });

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

  const handleReload = () => {
    reloadTransactions();
  };

  const handleAccountChange = (nextAccountId: number | null) => {
    setAccountId(nextAccountId);
    setPage(1);
  };

  const handleTransactionTypeChange = (nextTransactionTypeId: number | null) => {
    setTransactionTypeId(nextTransactionTypeId);
    setPage(1);
  };

  const handleCategoryChange = (nextCategoryId: number | null) => {
    setCategoryId(nextCategoryId);
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

  const getAccountName = (id: number): string => {
    const account = accounts.find((acc) => acc.id === id);
    return account ? `${account.code} - ${account.name}` : `Account ${id}`;
  };

  const resetForm = (transaction: Transaction | null) => {
    setForm({
      accountId: transaction
        ? String(transaction.accountId)
        : accounts[0]
          ? String(accounts[0].id)
          : '',
      transactionTypeId: transaction
        ? String(transaction.transactionTypeId)
        : transactionTypes[0]
          ? String(transactionTypes[0].id)
          : '',
      categoryIds: transaction?.categoryIds
        ? transaction.categoryIds.split(',').filter(Boolean)
        : [],
      datetime: transaction
        ? toDateTimeLocalValue(transaction.datetime)
        : getCurrentLocalDateTime(),
      amount: transaction ? String(transaction.amount) : '',
      description: transaction?.description ?? '',
      note: transaction?.note ?? '',
    });
    setFormError(null);
  };

  const handleCreateClick = () => {
    setEditingTransaction(null);
    resetForm(null);
    setActionError(null);
    setDialogOpen(true);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    resetForm(transaction);
    setActionError(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) {
      return;
    }

    setDialogOpen(false);
    setEditingTransaction(null);
    setFormError(null);
  };

  const handleFormChange = (
    field: keyof TransactionFormState,
    value: TransactionFormState[keyof TransactionFormState]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const buildPayload = (): TransactionMutationPayload | null => {
    const parsedAccountId = Number(form.accountId);
    const parsedTransactionTypeId = Number(form.transactionTypeId);
    const parsedCategoryIds = form.categoryIds.map(Number).filter((value) => !Number.isNaN(value));
    const parsedAmount = Number(form.amount);

    if (
      !parsedAccountId ||
      !parsedTransactionTypeId ||
      !form.datetime ||
      !form.description.trim()
    ) {
      setFormError('Account, type, date, and description are required.');
      return null;
    }

    if (Number.isNaN(parsedAmount)) {
      setFormError('Amount must be a valid number.');
      return null;
    }

    setFormError(null);

    return {
      accountId: parsedAccountId,
      transactionTypeId: parsedTransactionTypeId,
      categoryIds: parsedCategoryIds,
      datetime: form.datetime,
      amount: parsedAmount,
      description: form.description.trim(),
      note: form.note.trim() || undefined,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();

    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      if (editingTransaction) {
        await dispatch(updateTransaction({ id: editingTransaction.id, payload })).unwrap();
        reloadTransactions();
      } else {
        await dispatch(createTransaction(payload)).unwrap();

        if (page !== 1) {
          setPage(1);
        } else {
          reloadTransactions(1);
        }
      }

      setDialogOpen(false);
      setEditingTransaction(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (transaction: Transaction) => {
    const confirmed = window.confirm(`Delete transaction ${transaction.id}?`);

    if (!confirmed) {
      return;
    }

    setActionError(null);

    try {
      await dispatch(deleteTransaction(transaction.id)).unwrap();

      if (data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reloadTransactions();
      }
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
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
          Transaction List
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          Create Transaction
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
          accounts: accountsLoading,
          transactionTypes: transactionTypesLoading,
          categories: categoriesLoading,
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

      {accountsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load accounts: {accountsError}
        </Alert>
      )}

      {transactionTypesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load transaction types: {transactionTypesError}
        </Alert>
      )}

      {categoriesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load categories: {categoriesError}
        </Alert>
      )}

      {error && <Alert severity="error">Error: {error}</Alert>}

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">No transactions found.</Alert>
      )}

      {data.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Categories</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((tx: Transaction) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>{getAccountName(tx.accountId)}</TableCell>
                    <TableCell>{tx.transactionTypeName || '-'}</TableCell>
                    <TableCell>{formatDateTime(tx.datetime)}</TableCell>
                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.categories || '-'}</TableCell>
                    <TableCell>{tx.note || '-'}</TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <IconButton
                        aria-label={`edit transaction ${tx.id}`}
                        onClick={() => handleEditClick(tx)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`delete transaction ${tx.id}`}
                        color="error"
                        onClick={() => handleDeleteClick(tx)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
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
        form={form}
        formError={formError}
        isSubmitting={isSubmitting}
        accounts={accounts}
        transactionTypes={transactionTypes}
        categories={categories}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />
    </Container>
  );
};

export default TransactionList;
