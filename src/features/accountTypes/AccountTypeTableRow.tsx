import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow } from '@mui/material';
import type { AccountType } from '../../models/accountTypes';

interface AccountTypeTableRowProps {
  accountType: AccountType;
  onEdit: (accountType: AccountType) => void;
  onDelete: (accountType: AccountType) => void;
}

const AccountTypeTableRow: React.FC<AccountTypeTableRowProps> = ({
  accountType,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell>{accountType.id}</TableCell>
      <TableCell>{accountType.code}</TableCell>
      <TableCell>{accountType.name}</TableCell>
      <TableCell align="right" sx={{ minWidth: 120 }}>
        <IconButton
          aria-label={t('accountTypes.actions.editAria', { id: accountType.id })}
          onClick={() => onEdit(accountType)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label={t('accountTypes.actions.deleteAria', { id: accountType.id })}
          color="error"
          onClick={() => onDelete(accountType)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default AccountTypeTableRow;
