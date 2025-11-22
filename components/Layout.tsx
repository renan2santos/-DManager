import React from 'react';
import { LayoutDashboard, Package, Users, FileText, Settings, PlusCircle, History } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-quote', label: 'Novo Orçamento', icon: PlusCircle },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl no-print">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            3DManager AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gestão Inteligente</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 text-slate-400 text-sm">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
               A
             </div>
             <div>
               <p className="text-white">Admin User</p>
               <p className="text-xs">Pro Version</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};