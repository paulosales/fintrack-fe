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
import type { Setting } from '../../models/settings';
import SettingTableRow from './SettingTableRow';

interface SettingTableProps {
  settings: Setting[];
  onEdit: (setting: Setting) => void;
  onDelete: (setting: Setting) => void;
}

const SettingTable: React.FC<SettingTableProps> = ({ settings, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('settings.columns.id')}</TableCell>
            <TableCell>{t('settings.columns.code')}</TableCell>
            <TableCell>{t('settings.columns.description')}</TableCell>
            <TableCell>{t('settings.columns.value')}</TableCell>
            <TableCell align="right">{t('settings.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {settings.map((setting) => (
            <SettingTableRow
              key={setting.id}
              setting={setting}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SettingTable;
