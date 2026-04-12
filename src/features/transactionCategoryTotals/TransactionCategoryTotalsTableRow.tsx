import React from 'react';
import { useTranslation } from 'react-i18next';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Collapse, IconButton, TableCell, TableRow } from '@mui/material';
import { formatCurrency } from '../../utils/currencyUtils';
import type { TransactionCategoryTotal, TransactionCategoryTotalDetailState } from './types';
import TransactionCategoryTotalDetailTable from './TransactionCategoryTotalDetailTable';

interface TransactionCategoryTotalsTableRowProps {
  row: TransactionCategoryTotal;
  expanded: boolean;
  detailsState: TransactionCategoryTotalDetailState;
  onToggle: (row: TransactionCategoryTotal) => void;
}

const TransactionCategoryTotalsTableRow: React.FC<TransactionCategoryTotalsTableRowProps> = ({
  row,
  expanded,
  detailsState,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <TableRow>
        <TableCell sx={{ width: 72 }}>
          <IconButton
            aria-label={expanded ? t('common.collapseRow') : t('common.expandRow')}
            size="small"
            onClick={() => onToggle(row)}
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.monthLabel}</TableCell>
        <TableCell>{row.category}</TableCell>
        <TableCell align="right">{formatCurrency(row.totalAmount)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={4}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <TransactionCategoryTotalDetailTable detailsState={detailsState} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default TransactionCategoryTotalsTableRow;
