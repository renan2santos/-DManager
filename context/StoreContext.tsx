import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, Client, Quote, AppSettings, QuoteStatus, UnitType } from '../types';

interface StoreContextType {
  inventory: InventoryItem[];
  clients: Client[];
  quotes: Quote[];
  settings: AppSettings;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addQuote: (quote: Quote) => void;
  updateQuoteStatus: (id: number, status: QuoteStatus) => void;
  updateSettings: (settings: AppSettings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  hourlyRate: 15.00, // R$ 15,00 per hour
  defaultProfitMargin: 100 // 100% profit
};

// Mock Data for initial load
const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'PLA Preto', category: 'Filamento', brand: 'Voolt3D', quantity: 1000, unit: UnitType.G, costPrice: 120, unitSize: 1000 },
  { id: '2', name: 'PLA Branco', category: 'Filamento', brand: '3DLab', quantity: 850, unit: UnitType.G, costPrice: 110, unitSize: 1000 },
  { id: '3', name: 'Resina Grey', category: 'Resina', brand: 'Anycubic', quantity: 500, unit: UnitType.ML, costPrice: 180, unitSize: 1000 },
];

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'João da Silva', email: 'joao@email.com', phone: '(11) 99999-9999', socialMedia: '@joao3d' },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : MOCK_INVENTORY;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('quotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettingsState] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => { localStorage.setItem('inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('quotes', JSON.stringify(quotes)); }, [quotes]);
  useEffect(() => { localStorage.setItem('settings', JSON.stringify(settings)); }, [settings]);

  const addInventoryItem = (item: InventoryItem) => setInventory([...inventory, item]);
  
  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(inventory.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const addClient = (client: Client) => setClients([...clients, client]);
  
  const updateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const addQuote = (quote: Quote) => setQuotes([...quotes, quote]);

  const updateQuoteStatus = (id: number, status: QuoteStatus) => {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    // Logic to deduct stock if approved
    if (status === QuoteStatus.APPROVED && quote.status !== QuoteStatus.APPROVED) {
      const newInventory = [...inventory];
      let possible = true;

      quote.items.forEach(qItem => {
        const invItemIndex = newInventory.findIndex(i => i.id === qItem.itemId);
        if (invItemIndex > -1) {
          if (newInventory[invItemIndex].quantity >= qItem.amountUsed) {
             newInventory[invItemIndex].quantity -= qItem.amountUsed;
          } else {
            possible = false;
            alert(`Erro: Estoque insuficiente para ${qItem.itemName}.`);
          }
        }
      });

      if (possible) {
        setInventory(newInventory);
        setQuotes(quotes.map(q => q.id === id ? { ...q, status } : q));
      }
    } else {
      // Just update status if not approving (or if already approved logic handling is complex, we assume one-way approval for simplicity)
      setQuotes(quotes.map(q => q.id === id ? { ...q, status } : q));
    }
  };

  const updateSettings = (newSettings: AppSettings) => setSettingsState(newSettings);

  return (
    <StoreContext.Provider value={{
      inventory, clients, quotes, settings,
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
      addClient, updateClient, deleteClient,
      addQuote, updateQuoteStatus, updateSettings
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};