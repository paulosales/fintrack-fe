import React from 'react';
import { useTranslation } from 'react-i18next';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import PaginationControls from '../../components/PaginationControls';
import { formatCurrency } from '../../utils/currencyUtils';
import type { PaginationMeta } from '../../types/pagination';
import type { TransactionCategoryTotal, TransactionCategoryTotalDetailState } from './types';
import { getTransactionCategoryDetailKey } from './types';
import TransactionCategoryTotalsTableRow from './TransactionCategoryTotalsTableRow';

interface MonthGroup {
  key: string;
  year: number;
  month: number;
  monthLabel: string;
  total: number;
  rows: TransactionCategoryTotal[];
}

export const getMonthKey = (year: number, month: number) => `${year}-${month}`;

interface TransactionCategoryTotalsTableProps {
  rows: TransactionCategoryTotal[];
  pagination: PaginationMeta;
  expandedKeys: Record<string, boolean>;
  expandedMonths: Record<string, boolean>;
  detailsByKey: Record<string, TransactionCategoryTotalDetailState>;
  onToggle: (row: TransactionCategoryTotal) => void;
  onToggleMonth: (year: number, month: number) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const TransactionCategoryTotalsTable: React.FC<TransactionCategoryTotalsTableProps> = ({
  rows,
  pagination,
  expandedKeys,
  expandedMonths,
  detailsByKey,
  onToggle,
  onToggleMonth,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();

  const monthGroups = React.useMemo<MonthGroup[]>(() => {
    const groups: MonthGroup[] = [];
    const keyToIndex: Record<string, number> = {};
    for (const row of rows) {
      const key = getMonthKey(row.year, row.month);
      if (keyToIndex[key] === undefined) {
        keyToIndex[key] = groups.length;
        groups.push({
          key,
          year: row.year,
          month: row.month,
          monthLabel: row.monthLabel,
          total: 0,
          rows: [],
        });
      }
      const idx = keyToIndex[key];
      if (row.totalAmount < 0) groups[idx].total += row.totalAmount;
      groups[idx].rows.push(row);
    }
    return groups;
  }, [rows]);

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
            {monthGroups.map((group) => {
              const monthExpanded = expandedMonths[group.key] !== false;
              return (
                <React.Fragment key={group.key}>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ width: 72 }}>
                      <IconButton
                        aria-label={
                          monthExpanded ? t('common.collapseRow') : t('common.expandRow')
                        }
                        size="small"
                        onClick={() => onToggleMonth(group.year, group.month)}
                      >
                        {monthExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{group.monthLabel}</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(group.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ py: 0 }} colSpan={4}>
                      <Collapse in={monthExpanded} timeout="auto" unmountOnExit>
                        <Table size="small">
                          <TableBody>
                            {group.rows.map((row) => {
                              const key = getTransactionCategoryDetailKey({
                                year: row.year,
                                month: row.month,
                                categoryId: row.categoryId,
                              });
                              const detailsState = detailsByKey[key] ?? {
                                loading: false,
                                error: null,
                                data: [],
                              };
                              const expanded = expandedKeys[key] === true;
                              return (
                                <TransactionCategoryTotalsTableRow
                                  key={key}
                                  row={row}
                                  expanded={expanded}
                                  detailsState={detailsState}
                                  onToggle={onToggle}
                                  hideMonth
                                />
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
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
