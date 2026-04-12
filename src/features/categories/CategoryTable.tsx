import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { Category } from '../../models/categories';
import CategoryTableRow from './CategoryTableRow';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ categories, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('categories.columns.id')}</TableCell>
            <TableCell>{t('categories.columns.name')}</TableCell>
            <TableCell align="right">{t('categories.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <CategoryTableRow
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CategoryTable;
