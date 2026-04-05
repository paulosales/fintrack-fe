import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={mode === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}>
      <IconButton onClick={toggleTheme} color="inherit" aria-label={t('theme.toggleAria')}>
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
