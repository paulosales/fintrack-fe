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
import PaginationControls from '../../components/PaginationControls';
import TransactionTableRow from './TransactionTableRow';
import type { SubTransaction, Transaction, TransactionDetailsState } from './types';
import type { PaginationMeta } from '../../types/pagination';

interface TransactionTableProps {
  transactions: Transaction[];
  expandedIds: number[];
  subTransactionsByTransactionId: Record<number, TransactionDetailsState>;
  pagination: PaginationMeta;
  getAccountName: (id: number) => string;
  onToggleExpand: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onEditSub: (sub: SubTransaction) => void;
  onDeleteSub: (subId: number, transactionId: number) => void;
  onCreateSub: (transactionId: number) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  expandedIds,
  subTransactionsByTransactionId,
  pagination,
  getAccountName,
  onToggleExpand,
  onEdit,
  onDelete,
  onEditSub,
  onDeleteSub,
  onCreateSub,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>{t('transactions.columns.account')}</TableCell>
              <TableCell>{t('transactions.columns.type')}</TableCell>
              <TableCell>{t('transactions.columns.date')}</TableCell>
              <TableCell>{t('transactions.columns.amount')}</TableCell>
              <TableCell>{t('transactions.columns.description')}</TableCell>
              <TableCell>{t('transactions.columns.categories')}</TableCell>
              <TableCell>{t('transactions.columns.note')}</TableCell>
              <TableCell align="right">{t('transactions.columns.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TransactionTableRow
                key={tx.id}
                transaction={tx}
                expanded={expandedIds.includes(tx.id)}
                subTransactions={subTransactionsByTransactionId[tx.id]}
                accountName={getAccountName(tx.accountId)}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onEditSub={onEditSub}
                onDeleteSub={onDeleteSub}
                onCreateSub={onCreateSub}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};

export default TransactionTable;
