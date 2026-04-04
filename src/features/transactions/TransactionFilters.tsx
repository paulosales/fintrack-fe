import React from 'react';
import type { Account } from '../../models/accounts';
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

interface TransactionFiltersProps {
  accountId: number | null;
  accounts: Account[];
  accountsLoading: boolean;
  onAccountChange: (accountId: number | null) => void;
  onReload: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  accountId,
  accounts,
  accountsLoading,
  onAccountChange,
  onReload,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Account</InputLabel>
          <Select
            value={accountId ?? ''}
            onChange={(event) =>
              onAccountChange(event.target.value ? Number(event.target.value) : null)
            }
            label="Select Account"
            disabled={accountsLoading}
          >
            <MenuItem value="">
              <em>All Accounts</em>
            </MenuItem>
            {accountsLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading accounts...
              </MenuItem>
            ) : (
              accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={onReload}>
          Reload
        </Button>
      </Box>
    </Paper>
  );
};

export default TransactionFilters;
