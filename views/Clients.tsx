import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Client } from '../types';
import { Plus, Trash2, Edit2, Search, Mail, Phone, Share2 } from 'lucide-react';

export const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Client>>({ name: '', email: '', phone: '', socialMedia: '' });

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', socialMedia: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: editingClient ? editingClient.id : Date.now().toString(),
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone!,
      socialMedia: formData.socialMedia!
    };

    if (editingClient) {
      updateClient(client);
    } else {
      addClient(client);
    }
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={18} /> <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
         <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(client => (
              <div key={client.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-slate-50/50">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-800">{client.name}</h3>
                  <div className="flex space-x-2">
                     <button onClick={() => handleOpenModal(client)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                     <button onClick={() => deleteClient(client.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center space-x-2"><Mail size={14} /> <span>{client.email}</span></div>
                  <div className="flex items-center space-x-2"><Phone size={14} /> <span>{client.phone}</span></div>
                  <div className="flex items-center space-x-2"><Share2 size={14} /> <span>{client.socialMedia}</span></div>
                </div>
              </div>
            ))}
             {filteredClients.length === 0 && <p className="text-slate-500 text-center col-span-full py-8">Nenhum cliente encontrado.</p>}
          </div>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-slate-800">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input type="email" className="w-full border rounded-lg p-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                <input type="tel" className="w-full border rounded-lg p-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rede Social</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.socialMedia} onChange={e => setFormData({...formData, socialMedia: e.target.value})} />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};