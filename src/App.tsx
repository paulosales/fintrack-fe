import React from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import TransactionList from './features/transactions/TransactionList';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            Fintrack Transaction Viewer
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" component="main" sx={{ py: 4, flex: 1 }}>
        <TransactionList />
      </Container>
    </Box>
  );
};

export default App;
