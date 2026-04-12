import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import type { Category } from '../../models/categories';
import type { SubTransaction } from './types';

export interface SubTransactionFormValues {
  productCode: string;
  description: string;
  amount: string;
  note: string;
  categoryIds: string[];
}

interface SubTransactionFormDialogProps {
  open: boolean;
  editing: SubTransaction | null;
  categories: Category[];
  onClose: () => void;
  onSave: (values: SubTransaction) => void;
  onCreate: (values: SubTransactionFormValues) => void;
}

const emptyForm: SubTransactionFormValues = {
  productCode: '',
  description: '',
  amount: '',
  note: '',
  categoryIds: [],
};

const deriveInitialValues = (editing: SubTransaction | null): SubTransactionFormValues => {
  if (editing) {
    return {
      productCode: editing.productCode ?? '',
      description: editing.description,
      amount: String(editing.amount ?? ''),
      note: editing.note ?? '',
      categoryIds: editing.categoryIds ? editing.categoryIds.split(',').filter(Boolean) : [],
    };
  }
  return emptyForm;
};

const SubTransactionFormDialog: React.FC<SubTransactionFormDialogProps> = ({
  open,
  editing,
  categories,
  onClose,
  onSave,
  onCreate,
}) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<SubTransactionFormValues>(() =>
    deriveInitialValues(editing)
  );

  const handleChange =
    (field: keyof SubTransactionFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const selectedCategories: Category[] = Array.isArray(values.categoryIds)
    ? values.categoryIds
        .map((id) => categories.find((c) => c.id === Number(id)))
        .filter((c): c is Category => Boolean(c))
    : [];

  const handleSubmit = () => {
    if (editing) {
      onSave({
        ...editing,
        productCode: values.productCode,
        description: values.description,
        amount: Number.parseFloat(values.amount),
        note: values.note,
        categoryIds: values.categoryIds.join(','),
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
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
          <TextField label="Note" value={values.note} onChange={handleChange('note')} />
          <Autocomplete<Category, true, false, false>
            multiple
            disableCloseOnSelect
            options={categories}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={selectedCategories}
            onChange={(_, newVal: Category[]) =>
              setValues((prev) => ({ ...prev, categoryIds: newVal.map((c) => String(c.id)) }))
            }
            limitTags={2}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.id}>
                {selected ? (
                  <CheckBoxIcon fontSize="small" style={{ marginRight: 8 }} />
                ) : (
                  <CheckBoxOutlineBlankIcon fontSize="small" style={{ marginRight: 8 }} />
                )}
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('transactions.form.categories')}
                placeholder={t('transactions.form.categories')}
                fullWidth
              />
            )}
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
