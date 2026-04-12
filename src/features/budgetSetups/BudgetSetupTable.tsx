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
import type { BudgetSetupRecord } from './types';
import BudgetSetupTableRow from './BudgetSetupTableRow';

interface BudgetSetupTableProps {
  budgetSetups: BudgetSetupRecord[];
  pagination: PaginationMeta;
  onEdit: (budgetSetup: BudgetSetupRecord) => void;
  onDelete: (budgetSetup: BudgetSetupRecord) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const BudgetSetupTable: React.FC<BudgetSetupTableProps> = ({
  budgetSetups,
  pagination,
  onEdit,
  onDelete,
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
              <TableCell>{t('transactions.columns.id')}</TableCell>
              <TableCell>{t('budgetSetups.columns.account')}</TableCell>
              <TableCell>{t('budgetSetups.columns.date')}</TableCell>
              <TableCell>{t('budgetSetups.columns.isRepeatle')}</TableCell>
              <TableCell>{t('budgetSetups.columns.repeatFrequency')}</TableCell>
              <TableCell>{t('budgetSetups.columns.endDate')}</TableCell>
              <TableCell>{t('budgetSetups.columns.description')}</TableCell>
              <TableCell align="right">{t('budgetSetups.columns.amount')}</TableCell>
              <TableCell>{t('budgetSetups.columns.note')}</TableCell>
              <TableCell align="right">{t('budgetSetups.columns.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgetSetups.map((budgetSetup) => (
              <BudgetSetupTableRow
                key={budgetSetup.id}
                budgetSetup={budgetSetup}
                onEdit={onEdit}
                onDelete={onDelete}
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

export default BudgetSetupTable;
