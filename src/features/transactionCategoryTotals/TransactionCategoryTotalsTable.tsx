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
import type { PaginationMeta } from '../../types/pagination';
import type { TransactionCategoryTotal, TransactionCategoryTotalDetailState } from './types';
import { getTransactionCategoryDetailKey } from './types';
import TransactionCategoryTotalsTableRow from './TransactionCategoryTotalsTableRow';

interface TransactionCategoryTotalsTableProps {
  rows: TransactionCategoryTotal[];
  pagination: PaginationMeta;
  expandedKeys: Record<string, boolean>;
  detailsByKey: Record<string, TransactionCategoryTotalDetailState>;
  onToggle: (row: TransactionCategoryTotal) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const TransactionCategoryTotalsTable: React.FC<TransactionCategoryTotalsTableProps> = ({
  rows,
  pagination,
  expandedKeys,
  detailsByKey,
  onToggle,
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
              <TableCell>{t('transactionCategoryTotals.columns.month')}</TableCell>
              <TableCell>{t('transactionCategoryTotals.columns.category')}</TableCell>
              <TableCell align="right">{t('transactionCategoryTotals.columns.total')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const key = getTransactionCategoryDetailKey({
                year: row.year,
                month: row.month,
                categoryId: row.categoryId,
              });
              const detailsState = detailsByKey[key] ?? { loading: false, error: null, data: [] };
              const expanded = expandedKeys[key] === true;

              return (
                <TransactionCategoryTotalsTableRow
                  key={key}
                  row={row}
                  expanded={expanded}
                  detailsState={detailsState}
                  onToggle={onToggle}
                />
              );
            })}
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

export default TransactionCategoryTotalsTable;
