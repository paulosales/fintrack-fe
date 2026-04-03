import React from 'react';
import TransactionList from './features/transactions/TransactionList';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <header>
        <h1>Fintrack Transaction Viewer</h1>
      </header>
      <main>
        <TransactionList />
      </main>
    </div>
  );
};

export default App;
