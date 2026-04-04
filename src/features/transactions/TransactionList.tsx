import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from './transactionSlice';
import { fetchAccounts } from '../accounts/accountsSlice';
import { fetchCategories } from '../categories/categoriesSlice';
import { fetchTransactionTypes } from '../transactionTypes/transactionTypesSlice';
import TransactionFilters from './TransactionFilters';
import PaginationControls from '../../components/PaginationControls';
import type { Transaction } from './types';
import type { RootState, AppDispatch } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDateTime } from '../../utils/dateUtils';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from '@mui/material';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactionTypes());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTransactions({ accountId, transactionTypeId, categoryId, page, pageSize }));
  }, [dispatch, accountId, transactionTypeId, categoryId, page, pageSize]);

  const handleReload = () => {
    dispatch(fetchTransactions({ accountId, transactionTypeId, categoryId, page, pageSize }));
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

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const getAccountName = (id: number): string => {
    const account = accounts.find((acc) => acc.id === id);
    return account ? `${account.code} - ${account.name}` : `Account ${id}`;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction List
      </Typography>

      <TransactionFilters
        filters={{ accountId, transactionTypeId, categoryId, page, pageSize }}
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
    </Container>
  );
};

export default TransactionList;
