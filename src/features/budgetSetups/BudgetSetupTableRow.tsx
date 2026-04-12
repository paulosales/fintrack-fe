import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow } from '@mui/material';
import { formatCurrency } from '../../utils/currencyUtils';
import type { BudgetSetupRecord } from './types';

interface BudgetSetupTableRowProps {
  budgetSetup: BudgetSetupRecord;
  onEdit: (budgetSetup: BudgetSetupRecord) => void;
  onDelete: (budgetSetup: BudgetSetupRecord) => void;
}

const BudgetSetupTableRow: React.FC<BudgetSetupTableRowProps> = ({
  budgetSetup,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell>{budgetSetup.id}</TableCell>
      <TableCell>
        {budgetSetup.accountCode} - {budgetSetup.accountName}
      </TableCell>
      <TableCell>{budgetSetup.date}</TableCell>
      <TableCell>{budgetSetup.isRepeatle ? t('common.yes') : t('common.no')}</TableCell>
      <TableCell>{budgetSetup.repeatFrequency || t('common.notAvailable')}</TableCell>
      <TableCell>{budgetSetup.endDate || t('common.notAvailable')}</TableCell>
      <TableCell>{budgetSetup.description}</TableCell>
      <TableCell align="right">{formatCurrency(budgetSetup.amount)}</TableCell>
      <TableCell>{budgetSetup.note || t('common.notAvailable')}</TableCell>
      <TableCell align="right" sx={{ minWidth: 120 }}>
        <IconButton
          aria-label={t('budgetSetups.actions.editAria', { id: budgetSetup.id })}
          onClick={() => onEdit(budgetSetup)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label={t('budgetSetups.actions.deleteAria', { id: budgetSetup.id })}
          color="error"
          onClick={() => onDelete(budgetSetup)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default BudgetSetupTableRow;
