import React from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIconSmall from '@mui/icons-material/DeleteOutline';
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../../utils/currencyUtils';
import type { SubTransaction } from './types';

interface SubTransactionTableProps {
  transactionId: number;
  subTransactions: SubTransaction[];
  onEdit: (subTransaction: SubTransaction) => void;
  onDelete: (subId: number, transactionId: number) => void;
  onCreate: (transactionId: number) => void;
}

const SubTransactionTable: React.FC<SubTransactionTableProps> = ({
  transactionId,
  subTransactions,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="subtitle2">
        {t('transactions.subTransactions') || 'Sub transactions'}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Categories</TableCell>
            <TableCell>Note</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subTransactions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.id}</TableCell>
              <TableCell>{sub.productCode || '-'}</TableCell>
              <TableCell>{sub.description}</TableCell>
              <TableCell>{formatCurrency(sub.amount)}</TableCell>
              <TableCell>{sub.categories || '-'}</TableCell>
              <TableCell>{sub.note || '-'}</TableCell>
              <TableCell align="right">
                <IconButton
                  aria-label={`edit sub ${sub.id}`}
                  size="small"
                  onClick={() => onEdit({ ...sub, transactionId })}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label={`delete sub ${sub.id}`}
                  size="small"
                  onClick={() => onDelete(sub.id, transactionId)}
                >
                  <DeleteIconSmall fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={7}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => onCreate(transactionId)}
              >
                Add sub-transaction
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};

export default SubTransactionTable;
