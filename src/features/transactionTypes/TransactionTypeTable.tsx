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
import type { TransactionType } from '../../models/transactionTypes';
import TransactionTypeTableRow from './TransactionTypeTableRow';

interface TransactionTypeTableProps {
  transactionTypes: TransactionType[];
  onEdit: (transactionType: TransactionType) => void;
  onDelete: (transactionType: TransactionType) => void;
}

const TransactionTypeTable: React.FC<TransactionTypeTableProps> = ({
  transactionTypes,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('transactionTypes.columns.id')}</TableCell>
            <TableCell>{t('transactionTypes.columns.code')}</TableCell>
            <TableCell>{t('transactionTypes.columns.name')}</TableCell>
            <TableCell align="right">{t('transactionTypes.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactionTypes.map((transactionType) => (
            <TransactionTypeTableRow
              key={transactionType.id}
              transactionType={transactionType}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionTypeTable;