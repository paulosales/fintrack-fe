import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, Transaction } from './transactionSlice';
import type { RootState, AppDispatch } from '../../store';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert
} from '@mui/material';

const TransactionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.transactions);
  const [accountId, setAccountId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchTransactions(accountId));
  }, [dispatch, accountId]);

  const handleReload = () => {
    dispatch(fetchTransactions(accountId));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction List
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Account ID"
            type="number"
            value={accountId ?? ''}
            onChange={event => setAccountId(event.target.value ? Number(event.target.value) : null)}
          />
          <Button variant="contained" onClick={handleReload}>Reload</Button>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((tx: Transaction) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.account_id}</TableCell>
                  <TableCell>{tx.transaction_type_id}</TableCell>
                  <TableCell>{tx.datetime}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.description}</TableCell>
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
