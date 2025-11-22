import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Configurações de Precificação</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Valor da Hora de Mão de Obra (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <input 
                type="number" 
                step="0.10" 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={localSettings.hourlyRate}
                onChange={e => setLocalSettings({...localSettings, hourlyRate: parseFloat(e.target.value)})}
              />
            </div>
            <p className="text-sm text-slate-400 mt-1">Este valor será multiplicado pelas horas de impressão para calcular o custo de serviço.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Margem de Lucro Padrão (%)
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="1" 
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={localSettings.defaultProfitMargin}
                onChange={e => setLocalSettings({...localSettings, defaultProfitMargin: parseFloat(e.target.value)})}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
            </div>
             <p className="text-sm text-slate-400 mt-1">Porcentagem adicionada sobre o custo total (Material + Mão de Obra).</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className={`text-green-600 text-sm font-medium transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
              Configurações salvas com sucesso!
            </p>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium shadow-md shadow-blue-200 transition-all"
            >
              <Save size={18} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};