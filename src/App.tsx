import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import { Link as RouterLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TransactionList from './features/transactions/TransactionList';
import TransactionCategoryTotalsPage from './features/transactionCategoryTotals/TransactionCategoryTotalsPage';
import CategoriesPage from './features/categories/CategoriesPage';
import BudgetListPage from './features/budgets/BudgetListPage';
import BudgetSetupListPage from './features/budgetSetups/BudgetSetupListPage';
import LanguageSelector from './components/LanguageSelector';
import ThemeToggle from './components/ThemeToggle';
import fintrackIcon from './assets/icons/fintrack.svg';
import SpotlightSearch from './components/SpotlightSearch';

const App: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentTab =
    location.pathname === '/transaction-category-totals'
      ? '/transaction-category-totals'
      : location.pathname === '/categories'
        ? '/categories'
        : location.pathname === '/budget-setups'
          ? '/budget-setups'
          : location.pathname === '/budgets'
            ? '/budgets'
            : '/transactions';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={fintrackIcon}
              alt={t('app.title')}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {t('app.title')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SpotlightSearch />
            <LanguageSelector />
            <ThemeToggle />
          </Box>
        </Toolbar>
        <Tabs value={currentTab} textColor="inherit" indicatorColor="secondary" sx={{ px: 2 }}>
          <Tab
            component={RouterLink}
            to="/transactions"
            value="/transactions"
            label={t('nav.transactions')}
          />
          <Tab
            component={RouterLink}
            to="/transaction-category-totals"
            value="/transaction-category-totals"
            label={t('nav.transactionCategoryTotals')}
          />
          <Tab
            component={RouterLink}
            to="/categories"
            value="/categories"
            label={t('nav.categories')}
          />
          <Tab
            component={RouterLink}
            to="/budget-setups"
            value="/budget-setups"
            label={t('nav.budgetSetups')}
          />
          <Tab component={RouterLink} to="/budgets" value="/budgets" label={t('nav.budgets')} />
        </Tabs>
      </AppBar>
      <Container maxWidth={false} disableGutters component="main" sx={{ py: 4, px: 1.25, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/transaction-category-totals" element={<TransactionCategoryTotalsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budget-setups" element={<BudgetSetupListPage />} />
          <Route path="/budgets" element={<BudgetListPage />} />
          <Route path="*" element={<Navigate to="/transactions" replace />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
