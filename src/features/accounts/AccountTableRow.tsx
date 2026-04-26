import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow } from '@mui/material';
import type { Account } from '../../models/accounts';
import type { AccountType } from '../../models/accountTypes';

interface AccountTableRowProps {
  account: Account;
  accountTypes: AccountType[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const AccountTableRow: React.FC<AccountTableRowProps> = ({
  account,
  accountTypes,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const accountTypeName =
    accountTypes.find((at) => at.id === account.accountTypeId)?.name ?? account.accountTypeId;

  return (
    <TableRow>
      <TableCell>{account.id}</TableCell>
      <TableCell>{account.code}</TableCell>
      <TableCell>{account.name}</TableCell>
      <TableCell>{accountTypeName}</TableCell>
      <TableCell>{account.currency ?? '—'}</TableCell>
      <TableCell align="right" sx={{ minWidth: 120 }}>
        <IconButton
          aria-label={t('accounts.actions.editAria', { id: account.id })}
          onClick={() => onEdit(account)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label={t('accounts.actions.deleteAria', { id: account.id })}
          color="error"
          onClick={() => onDelete(account)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default AccountTableRow;
