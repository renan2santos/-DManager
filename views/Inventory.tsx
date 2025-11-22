import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { InventoryItem, UnitType } from '../types';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '', category: 'Filamento', brand: '', quantity: 0, unit: UnitType.KG, costPrice: 0, unitSize: 1000
  });

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: 'Filamento', brand: '', quantity: 0, unit: UnitType.KG, costPrice: 0, unitSize: 1000 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: formData.name!,
      category: formData.category!,
      brand: formData.brand!,
      quantity: Number(formData.quantity),
      unit: formData.unit as UnitType,
      costPrice: Number(formData.costPrice),
      unitSize: Number(formData.unitSize)
    };

    if (editingItem) {
      updateInventoryItem(item);
    } else {
      addInventoryItem(item);
    }
    setIsModalOpen(false);
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Estoque de Materiais</h2>
           <p className="text-slate-500">Gerencie filamentos, resinas e insumos.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} /> <span>Adicionar Item</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4">Estoque Atual</th>
                <th className="px-6 py-4">Custo Unit.</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.brand}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${item.quantity < (item.unitSize * 0.2) ? 'text-red-500' : 'text-slate-700'}`}>
                      {item.quantity} {item.unit === UnitType.KG || item.unit === UnitType.L ? (item.unit === UnitType.KG ? 'g' : 'ml') : item.unit}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                       (Base: {item.unitSize}{item.unit === UnitType.KG ? 'g' : item.unit === UnitType.L ? 'ml' : item.unit})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">R$ {item.costPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700"><Edit2 size={18} /></button>
                    <button onClick={() => deleteInventoryItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Nenhum item encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-slate-800">{editingItem ? 'Editar Item' : 'Novo Item'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Material</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select className="w-full border rounded-lg p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Filamento">Filamento</option>
                    <option value="Resina">Resina</option>
                    <option value="Tinta">Tinta</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Unidade Compra</label>
                   <select className="w-full border rounded-lg p-2" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as UnitType})}>
                     <option value={UnitType.KG}>KG (Quilo)</option>
                     <option value={UnitType.G}>Gramas</option>
                     <option value={UnitType.L}>Litro</option>
                     <option value={UnitType.ML}>Mililitro</option>
                     <option value={UnitType.UNIT}>Unidade</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho da Unidade</label>
                   <input type="number" className="w-full border rounded-lg p-2" 
                          placeholder={formData.unit === UnitType.KG ? '1000' : '1'}
                          value={formData.unitSize} onChange={e => setFormData({...formData, unitSize: Number(e.target.value)})} />
                   <span className="text-xs text-slate-400">Ex: 1000 para 1kg</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Preço Pago (R$)</label>
                   <input required type="number" step="0.01" className="w-full border rounded-lg p-2" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Qtd em Estoque</label>
                   <input required type="number" className="w-full border rounded-lg p-2" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                   <span className="text-xs text-slate-400">Na unidade base (ex: gramas)</span>
                </div>
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