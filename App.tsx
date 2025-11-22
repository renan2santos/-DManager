import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { Clients } from './views/Clients';
import { Settings } from './views/Settings';
import { CreateQuote } from './views/CreateQuote';
import { QuoteHistory } from './views/QuoteHistory';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'clients': return <Clients />;
      case 'settings': return <Settings />;
      case 'create-quote': return <CreateQuote />;
      case 'history': return <QuoteHistory />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;