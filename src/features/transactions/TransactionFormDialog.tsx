import React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { Account } from '../../models/accounts';
import type { Category } from '../../models/categories';
import type { TransactionType } from '../../models/transactionTypes';
import type { Transaction, TransactionFormState } from './types';

interface TransactionFormDialogProps {
  open: boolean;
  editingTransaction: Transaction | null;
  form: TransactionFormState;
  formError: string | null;
  isSubmitting: boolean;
  accounts: Account[];
  transactionTypes: TransactionType[];
  categories: Category[];
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (
    field: keyof TransactionFormState,
    value: TransactionFormState[keyof TransactionFormState]
  ) => void;
}

const TransactionFormDialog: React.FC<TransactionFormDialogProps> = ({
  open,
  editingTransaction,
  form,
  formError,
  isSubmitting,
  accounts,
  transactionTypes,
  categories,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Create Transaction'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            select
            label="Account"
            value={form.accountId}
            onChange={(event) => onFormChange('accountId', event.target.value)}
            required
            fullWidth
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={String(account.id)}>
                {account.code} - {account.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Transaction Type"
            value={form.transactionTypeId}
            onChange={(event) => onFormChange('transactionTypeId', event.target.value)}
            required
            fullWidth
          >
            {transactionTypes.map((transactionType) => (
              <MenuItem key={transactionType.id} value={String(transactionType.id)}>
                {transactionType.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Categories"
            value={form.categoryIds}
            onChange={(event) =>
              onFormChange(
                'categoryIds',
                typeof event.target.value === 'string'
                  ? event.target.value.split(',')
                  : event.target.value
              )
            }
            fullWidth
            SelectProps={{
              multiple: true,
              renderValue: (selected) => {
                const selectedIds = Array.isArray(selected) ? selected : [];

                return categories
                  .filter((category) => selectedIds.includes(String(category.id)))
                  .map((category) => category.name)
                  .join(', ');
              },
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={String(category.id)}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="datetime-local"
            value={form.datetime}
            onChange={(event) => onFormChange('datetime', event.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(event) => onFormChange('amount', event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(event) => onFormChange('description', event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Note"
            value={form.note}
            onChange={(event) => onFormChange('note', event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={isSubmitting}>
          {editingTransaction ? 'Save Changes' : 'Create Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionFormDialog;
