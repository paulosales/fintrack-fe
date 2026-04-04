import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from './transactionSlice';
import { fetchAccounts } from '../accounts/accountsSlice';
import { fetchTransactionTypes } from '../transactionTypes/transactionTypesSlice';
import TransactionFilters from './TransactionFilters';
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
  const { data, loading, error } = useSelector((state: RootState) => state.transactions);
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
  const [accountId, setAccountId] = useState<number | null>(null);
  const [transactionTypeId, setTransactionTypeId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactionTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTransactions({ accountId, transactionTypeId }));
  }, [dispatch, accountId, transactionTypeId]);

  const handleReload = () => {
    dispatch(fetchTransactions({ accountId, transactionTypeId }));
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
        filters={{ accountId, transactionTypeId }}
        options={{ accounts, transactionTypes }}
        loadingState={{
          accounts: accountsLoading,
          transactionTypes: transactionTypesLoading,
          transactions: loading,
        }}
        actions={{
          onAccountChange: setAccountId,
          onTransactionTypeChange: setTransactionTypeId,
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

      {error && <Alert severity="error">Error: {error}</Alert>}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">No transactions found.</Alert>
      )}

      {data.length > 0 && (
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
                  <TableCell>{tx.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default TransactionList;
