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
  Stack,
  TextField,
} from '@mui/material';
import type { BudgetGenerateDialogProps } from './types';

const BudgetGenerateDialog: React.FC<BudgetGenerateDialogProps> = ({
  open,
  endDate,
  generateOnlyForFuture,
  formError,
  isSubmitting,
  onClose,
  onEndDateChange,
  onGenerateOnlyForFutureChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Generate Budgets</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label="Generate Until"
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={generateOnlyForFuture}
                onChange={(event) => onGenerateOnlyForFutureChange(event.target.checked)}
              />
            }
            label="Generate only for the future"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={isSubmitting}>
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetGenerateDialog;