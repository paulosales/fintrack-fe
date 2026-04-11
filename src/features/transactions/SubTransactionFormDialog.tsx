import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { SubTransaction } from './types';

export interface SubTransactionFormValues {
  productCode: string;
  description: string;
  amount: string;
  note: string;
}

interface SubTransactionFormDialogProps {
  open: boolean;
  editing: SubTransaction | null;
  onClose: () => void;
  onSave: (values: SubTransaction) => void;
  onCreate: (values: SubTransactionFormValues) => void;
}

const emptyForm: SubTransactionFormValues = {
  productCode: '',
  description: '',
  amount: '',
  note: '',
};

const deriveInitialValues = (editing: SubTransaction | null): SubTransactionFormValues => {
  if (editing) {
    return {
      productCode: editing.productCode ?? '',
      description: editing.description,
      amount: String(editing.amount ?? ''),
      note: editing.note ?? '',
    };
  }
  return emptyForm;
};

const SubTransactionFormDialog: React.FC<SubTransactionFormDialogProps> = ({
  open,
  editing,
  onClose,
  onSave,
  onCreate,
}) => {
  const [values, setValues] = useState<SubTransactionFormValues>(() => deriveInitialValues(editing));

  const handleChange = (field: keyof SubTransactionFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (editing) {
      onSave({
        ...editing,
        productCode: values.productCode,
        description: values.description,
        amount: Number.parseFloat(values.amount),
        note: values.note,
      });
    } else {
      onCreate(values);
    }
  };

  const isEditing = Boolean(editing);
  const title = isEditing ? 'Edit Sub-transaction' : 'Create Sub-transaction';
  const submitLabel = isEditing ? 'Save' : 'Create';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
        >
          <TextField
            label="Product Code"
            value={values.productCode}
            onChange={handleChange('productCode')}
          />
          <TextField
            label="Description"
            value={values.description}
            onChange={handleChange('description')}
          />
          <TextField
            label="Amount"
            type="number"
            value={values.amount}
            onChange={handleChange('amount')}
          />
          <TextField
            label="Note"
            value={values.note}
            onChange={handleChange('note')}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubTransactionFormDialog;
