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
import type { Account } from '../../models/accounts';
import type { AccountType } from '../../models/accountTypes';
import AccountTableRow from './AccountTableRow';

interface AccountTableProps {
  accounts: Account[];
  accountTypes: AccountType[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  accountTypes,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('accounts.columns.id')}</TableCell>
            <TableCell>{t('accounts.columns.code')}</TableCell>
            <TableCell>{t('accounts.columns.name')}</TableCell>
            <TableCell>{t('accounts.columns.type')}</TableCell>
            <TableCell>{t('accounts.columns.currency')}</TableCell>
            <TableCell align="right">{t('accounts.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => (
            <AccountTableRow
              key={account.id}
              account={account}
              accountTypes={accountTypes}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountTable;
