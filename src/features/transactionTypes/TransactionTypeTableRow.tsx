import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow } from '@mui/material';
import type { TransactionType } from '../../models/transactionTypes';

interface TransactionTypeTableRowProps {
  transactionType: TransactionType;
  onEdit: (transactionType: TransactionType) => void;
  onDelete: (transactionType: TransactionType) => void;
}

const TransactionTypeTableRow: React.FC<TransactionTypeTableRowProps> = ({
  transactionType,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell>{transactionType.id}</TableCell>
      <TableCell>{transactionType.code}</TableCell>
      <TableCell>{transactionType.name}</TableCell>
      <TableCell align="right" sx={{ minWidth: 120 }}>
        <IconButton
          aria-label={t('transactionTypes.actions.editAria', { id: transactionType.id })}
          onClick={() => onEdit(transactionType)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label={t('transactionTypes.actions.deleteAria', { id: transactionType.id })}
          color="error"
          onClick={() => onDelete(transactionType)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default TransactionTypeTableRow;