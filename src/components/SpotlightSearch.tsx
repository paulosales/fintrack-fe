import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const useIsMac = () => {
  try {
    return /Mac|iPhone|iPad|MacIntel/.test(navigator.platform);
  } catch {
    return false;
  }
};

const navItems = (t: (k: string) => string) => [
  { key: 'transactions', label: t('nav.transactions'), path: '/transactions' },
  {
    key: 'transactionCategoryTotals',
    label: t('nav.transactionCategoryTotals'),
    path: '/transaction-category-totals',
  },
  { key: 'categories', label: t('nav.categories'), path: '/categories' },
  { key: 'budgetSetups', label: t('nav.budgetSetups'), path: '/budget-setups' },
  { key: 'budgets', label: t('nav.budgets'), path: '/budgets' },
];

const SpotlightSearch: React.FC = () => {
  const { t } = useTranslation();
  const isMac = useIsMac();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const items = React.useMemo(() => navItems(t), [t]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q));
  }, [items, query]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'k' && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        setOpen((s) => !s);
      }
      if (k === 'escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMac]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) handleSelect(filtered[active].path);
    }
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={() => setOpen(true)}
        aria-label={t('search.open')}
        size="large"
      >
        <SearchIcon />
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', ml: 0.5 }}>
          <Typography variant="body2" sx={{ ml: 0.5, color: 'inherit' }}>
            {isMac ? '⌘' : 'Ctrl'} K
          </Typography>
        </Box>
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('search.title')}</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={inputRef}
            fullWidth
            variant="outlined"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDownInput}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <List>
            {filtered.map((it, idx) => (
              <ListItemButton
                key={it.key}
                selected={idx === active}
                onClick={() => handleSelect(it.path)}
              >
                <ListItemIcon>
                  <SearchIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpotlightSearch;
