import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import { Link as RouterLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import TransactionList from './features/transactions/TransactionList';
import TransactionCategoryTotalsPage from './features/transactionCategoryTotals/TransactionCategoryTotalsPage';
import BudgetListPage from './features/budgets/BudgetListPage';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  const location = useLocation();
  const currentTab =
    location.pathname === '/transaction-category-totals'
      ? '/transaction-category-totals'
      : location.pathname === '/budgets'
        ? '/budgets'
        : '/transactions';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            Fintrack
          </Typography>
          <ThemeToggle />
        </Toolbar>
        <Tabs value={currentTab} textColor="inherit" indicatorColor="secondary" sx={{ px: 2 }}>
          <Tab
            component={RouterLink}
            to="/transactions"
            value="/transactions"
            label="Transaction List"
          />
          <Tab
            component={RouterLink}
            to="/transaction-category-totals"
            value="/transaction-category-totals"
            label="Transactions By Category"
          />
          <Tab component={RouterLink} to="/budgets" value="/budgets" label="Budget" />
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" component="main" sx={{ py: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/transaction-category-totals" element={<TransactionCategoryTotalsPage />} />
          <Route path="/budgets" element={<BudgetListPage />} />
          <Route path="*" element={<Navigate to="/transactions" replace />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
