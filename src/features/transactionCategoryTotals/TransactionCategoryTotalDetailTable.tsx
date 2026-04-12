import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDateTime } from '../../utils/dateUtils';
import type { TransactionCategoryTotalDetailState } from './types';

interface TransactionCategoryTotalDetailTableProps {
  detailsState: TransactionCategoryTotalDetailState;
}

const TransactionCategoryTotalDetailTable: React.FC<TransactionCategoryTotalDetailTableProps> = ({
  detailsState,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('transactionCategoryTotals.title')}
      </Typography>

      {detailsState.loading && <CircularProgress size={24} />}

      {detailsState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {detailsState.error}
        </Alert>
      )}

      {!detailsState.loading && !detailsState.error && detailsState.data.length === 0 && (
        <Alert severity="info">{t('transactionCategoryTotals.detailsEmpty')}</Alert>
      )}

      {detailsState.data.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('transactions.columns.id')}</TableCell>
              <TableCell>{t('transactionCategoryTotals.columns.type')}</TableCell>
              <TableCell>{t('transactionCategoryTotals.columns.description')}</TableCell>
              <TableCell>{t('transactionCategoryTotals.columns.datetime')}</TableCell>
              <TableCell>{t('transactionCategoryTotals.columns.note')}</TableCell>
              <TableCell>{t('transactionCategoryTotals.columns.category')}</TableCell>
              <TableCell align="right">{t('transactionCategoryTotals.columns.amount')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detailsState.data.map((detail) => (
              <TableRow key={`${detail.type}-${detail.id}`}>
                <TableCell>{detail.id}</TableCell>
                <TableCell>{detail.type}</TableCell>
                <TableCell>{detail.description}</TableCell>
                <TableCell>{formatDateTime(detail.datetime)}</TableCell>
                <TableCell>{detail.note || t('common.notAvailable')}</TableCell>
                <TableCell>{detail.category}</TableCell>
                <TableCell align="right">{formatCurrency(detail.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default TransactionCategoryTotalDetailTable;
