import React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { BudgetFormDialogProps } from './types';

const BudgetFormDialog: React.FC<BudgetFormDialogProps> = ({
  open,
  editingBudget,
  form,
  formError,
  isSubmitting,
  accounts,
  isSetupLocked,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            select
            label="Account"
            value={form.accountId}
            onChange={(event) => onFormChange('accountId', event.target.value)}
            required
            disabled={isSetupLocked}
            fullWidth
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={String(account.id)}>
                {account.code} - {account.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) => onFormChange('date', event.target.value)}
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
            disabled={isSetupLocked}
            multiline
            minRows={2}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.processed}
                onChange={(event) => onFormChange('processed', event.target.checked)}
              />
            }
            label="Processed"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={isSubmitting}>
          {editingBudget ? 'Save Changes' : 'Create Budget'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetFormDialog;