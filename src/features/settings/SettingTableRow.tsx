import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow } from '@mui/material';
import type { Setting } from '../../models/settings';

interface SettingTableRowProps {
  setting: Setting;
  onEdit: (setting: Setting) => void;
  onDelete: (setting: Setting) => void;
}

const SettingTableRow: React.FC<SettingTableRowProps> = ({ setting, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell>{setting.id}</TableCell>
      <TableCell>{setting.code}</TableCell>
      <TableCell>{setting.description}</TableCell>
      <TableCell>{setting.value ?? t('common.notAvailable')}</TableCell>
      <TableCell align="right" sx={{ minWidth: 120 }}>
        <IconButton
          aria-label={t('settings.actions.editAria', { code: setting.code })}
          onClick={() => onEdit(setting)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label={t('settings.actions.deleteAria', { code: setting.code })}
          color="error"
          onClick={() => onDelete(setting)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default SettingTableRow;
