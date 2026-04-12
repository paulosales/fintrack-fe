import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow } from '@mui/material';
import type { Category } from '../../models/categories';

interface CategoryTableRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTableRow: React.FC<CategoryTableRowProps> = ({ category, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell>{category.id}</TableCell>
      <TableCell>{category.name}</TableCell>
      <TableCell align="right" sx={{ minWidth: 120 }}>
        <IconButton
          aria-label={t('categories.actions.editAria', { id: category.id })}
          onClick={() => onEdit(category)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label={t('categories.actions.deleteAria', { id: category.id })}
          color="error"
          onClick={() => onDelete(category)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default CategoryTableRow;
