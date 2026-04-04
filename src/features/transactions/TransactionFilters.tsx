import React from 'react';
import type { TransactionFiltersProps } from './types';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@mui/material';

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  options,
  loadingState,
  actions,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Account</InputLabel>
          <Select
            value={filters.accountId ?? ''}
            onChange={(event) =>
              actions.onAccountChange(event.target.value ? Number(event.target.value) : null)
            }
            label="Select Account"
            disabled={loadingState.accounts}
          >
            <MenuItem value="">
              <em>All Accounts</em>
            </MenuItem>
            {loadingState.accounts ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading accounts...
              </MenuItem>
            ) : (
              options.accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Type</InputLabel>
          <Select
            value={filters.transactionTypeId ?? ''}
            onChange={(event) =>
              actions.onTransactionTypeChange(
                event.target.value ? Number(event.target.value) : null
              )
            }
            label="Select Type"
            disabled={loadingState.transactionTypes}
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            {loadingState.transactionTypes ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading types...
              </MenuItem>
            ) : (
              options.transactionTypes.map((transactionType) => (
                <MenuItem key={transactionType.id} value={transactionType.id}>
                  {transactionType.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Category</InputLabel>
          <Select
            value={filters.categoryId ?? ''}
            onChange={(event) =>
              actions.onCategoryChange(event.target.value ? Number(event.target.value) : null)
            }
            label="Select Category"
            disabled={loadingState.categories}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {loadingState.categories ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading categories...
              </MenuItem>
            ) : (
              options.categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={actions.onReload} disabled={loadingState.transactions}>
          {loadingState.transactions ? <CircularProgress size={20} color="inherit" /> : 'Reload'}
        </Button>
      </Box>
    </Paper>
  );
};

export default TransactionFilters;
