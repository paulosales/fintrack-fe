import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n, { supportedLanguages } from '../i18n';

const languageLabels: Record<(typeof supportedLanguages)[number], string> = {
  'en-US': 'English (US)',
  'en-CA': 'English (CA)',
  'fr-FR': 'Français (FR)',
  'fr-CA': 'Français (CA)',
  'pt-BR': 'Português (BR)',
  'pt-PT': 'Português (PT)',
  'es-ES': 'Español (ES)',
  'zh-CH': '中文 (CH)',
};

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();

  return (
    <FormControl size="small" variant="outlined" sx={{ minWidth: 160 }}>
      <InputLabel sx={{ color: 'inherit' }}>{t('language.label')}</InputLabel>
      <Select
        value={i18n.resolvedLanguage || i18n.language}
        label={t('language.label')}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        sx={{
          color: 'inherit',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
          '.MuiSvgIcon-root': { color: 'inherit' },
        }}
      >
        {supportedLanguages.map((language) => (
          <MenuItem key={language} value={language}>
            {languageLabels[language]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;