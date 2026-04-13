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
import type { AccountType } from '../../models/accountTypes';
import AccountTypeTableRow from './AccountTypeTableRow';

interface AccountTypeTableProps {
  accountTypes: AccountType[];
  onEdit: (accountType: AccountType) => void;
  onDelete: (accountType: AccountType) => void;
}

const AccountTypeTable: React.FC<AccountTypeTableProps> = ({ accountTypes, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('accountTypes.columns.id')}</TableCell>
            <TableCell>{t('accountTypes.columns.code')}</TableCell>
            <TableCell>{t('accountTypes.columns.name')}</TableCell>
            <TableCell align="right">{t('accountTypes.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accountTypes.map((accountType) => (
            <AccountTypeTableRow
              key={accountType.id}
              accountType={accountType}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountTypeTable;
