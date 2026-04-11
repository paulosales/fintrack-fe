import React from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow } from '@mui/material';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDateTime } from '../../utils/dateUtils';
import SubTransactionTable from './SubTransactionTable';
import type { SubTransaction, Transaction, TransactionDetailsState } from './types';

interface TransactionTableRowProps {
  transaction: Transaction;
  expanded: boolean;
  subTransactions: TransactionDetailsState | undefined;
  accountName: string;
  onToggleExpand: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onEditSub: (sub: SubTransaction) => void;
  onDeleteSub: (subId: number, transactionId: number) => void;
  onCreateSub: (transactionId: number) => void;
}

const TransactionTableRow: React.FC<TransactionTableRowProps> = ({
  transaction: tx,
  expanded,
  subTransactions,
  accountName,
  onToggleExpand,
  onEdit,
  onDelete,
  onEditSub,
  onDeleteSub,
  onCreateSub,
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <TableRow>
        <TableCell sx={{ width: 56 }}>
          <IconButton
            aria-label={expanded ? t('common.collapseRow') : t('common.expandRow')}
            size="small"
            onClick={() => onToggleExpand(tx)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{tx.id}</TableCell>
        <TableCell>{accountName}</TableCell>
        <TableCell>{tx.transactionTypeName || t('common.notAvailable')}</TableCell>
        <TableCell>{formatDateTime(tx.datetime)}</TableCell>
        <TableCell>{formatCurrency(tx.amount)}</TableCell>
        <TableCell>{tx.description}</TableCell>
        <TableCell>{tx.categories || t('common.notAvailable')}</TableCell>
        <TableCell>{tx.note || t('common.notAvailable')}</TableCell>
        <TableCell align="right" sx={{ minWidth: 120 }}>
          <IconButton
            aria-label={t('transactions.actions.editAria', { id: tx.id })}
            onClick={() => onEdit(tx)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label={t('transactions.actions.deleteAria', { id: tx.id })}
            color="error"
            onClick={() => onDelete(tx)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={10} sx={{ backgroundColor: 'background.paper' }}>
            <SubTransactionTable
              transactionId={tx.id}
              subTransactions={subTransactions?.data || []}
              onEdit={onEditSub}
              onDelete={onDeleteSub}
              onCreate={onCreateSub}
            />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

export default TransactionTableRow;
