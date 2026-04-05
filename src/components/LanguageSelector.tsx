import React from 'react';
import { IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n, { supportedLanguages } from '../i18n';
import enUSFlag from '../assets/flags/en-US.svg';
import enCAFlag from '../assets/flags/en-CA.svg';
import frFRFlag from '../assets/flags/fr-FR.svg';
import frCAFlag from '../assets/flags/fr-CA.svg';
import ptBRFlag from '../assets/flags/pt-BR.svg';
import ptPTFlag from '../assets/flags/pt-PT.svg';
import esESFlag from '../assets/flags/es-ES.svg';
import zhCHFlag from '../assets/flags/zh-CH.svg';

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

const flagMap: Record<string, string> = {
  'en-US': enUSFlag,
  'en-CA': enCAFlag,
  'fr-FR': frFRFlag,
  'fr-CA': frCAFlag,
  'pt-BR': ptBRFlag,
  'pt-PT': ptPTFlag,
  'es-ES': esESFlag,
  'zh-CH': zhCHFlag,
};

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const current = (i18n.resolvedLanguage || i18n.language) as string;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (lang: string) => {
    void i18n.changeLanguage(lang);
    handleClose();
  };

  return (
    <Box>
      <IconButton onClick={handleOpen} size="small" sx={{ p: 0 }} aria-label={t('language.label')}>
        <Avatar src={flagMap[current]} alt={current} sx={{ width: 32, height: 32 }} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        {supportedLanguages.map((language) => (
          <MenuItem
            key={language}
            selected={language === current}
            onClick={() => handleSelect(language)}
          >
            <ListItemIcon>
              <Avatar src={flagMap[language]} alt={language} sx={{ width: 20, height: 20 }} />
            </ListItemIcon>
            <ListItemText>{languageLabels[language]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
