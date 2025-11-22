import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { QuoteStatus, QuoteItem, InventoryItem, UnitType } from '../types';
import { Plus, Trash, Calculator, Bot, Loader2, FileText } from 'lucide-react';
import { estimatePrintDetails } from '../services/geminiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const CreateQuote: React.FC = () => {
  const { clients, inventory, settings, addQuote } = useStore();
  
  // Form State
  const [selectedClient, setSelectedClient] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<QuoteItem[]>([]);
  const [laborHours, setLaborHours] = useState(0);
  const [profitMargin, setProfitMargin] = useState(settings.defaultProfitMargin);
  const [isEstimating, setIsEstimating] = useState(false);

  // Temporary material selection state
  const [currentMaterialId, setCurrentMaterialId] = useState('');
  const [currentAmount, setCurrentAmount] = useState(0);

  // Calculations
  const totalMaterialCost = selectedMaterials.reduce((acc, item) => acc + item.costCalculated, 0);
  const laborCost = laborHours * settings.hourlyRate;
  const subtotal = totalMaterialCost + laborCost;
  const profitValue = subtotal * (profitMargin / 100);
  const finalPrice = subtotal + profitValue;

  const handleAddMaterial = () => {
    if (!currentMaterialId || currentAmount <= 0) return;
    
    const invItem = inventory.find(i => i.id === currentMaterialId);
    if (!invItem) return;

    // Calculate Cost: (Price Paid / Unit Size) * Amount Used
    // Assumes Amount Used is in same unit base (e.g., grams)
    const costPerUnit = invItem.costPrice / invItem.unitSize;
    const cost = costPerUnit * currentAmount;

    const newItem: QuoteItem = {
      itemId: invItem.id,
      itemName: invItem.name,
      amountUsed: currentAmount,
      costCalculated: cost
    };

    setSelectedMaterials([...selectedMaterials, newItem]);
    setCurrentMaterialId('');
    setCurrentAmount(0);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = [...selectedMaterials];
    newMaterials.splice(index, 1);
    setSelectedMaterials(newMaterials);
  };

  const handleAIEstimate = async () => {
    if (!projectName) return alert("Por favor, digite o nome/descrição do projeto primeiro.");
    setIsEstimating(true);
    const result = await estimatePrintDetails(projectName);
    setIsEstimating(false);

    if (result) {
      setLaborHours(result.estimatedTimeHours);
      // Suggest adding material if list is empty
      if (selectedMaterials.length === 0 && inventory.length > 0) {
         // Try to find a PLA
         const pla = inventory.find(i => i.name.toLowerCase().includes('pla'));
         if (pla) {
           setCurrentMaterialId(pla.id);
           setCurrentAmount(result.estimatedWeightGrams);
           alert(`IA Estimou:\n${result.estimatedWeightGrams}g de material\n${result.estimatedTimeHours} horas de impressão.\n\nMotivo: ${result.reasoning}`);
         } else {
           alert(`IA Estimou: ${result.estimatedWeightGrams}g e ${result.estimatedTimeHours}h.\nSelecione um material manualmente.`);
         }
      } else {
        alert(`IA Sugere: ${result.estimatedWeightGrams}g e ${result.estimatedTimeHours}h.\nMotivo: ${result.reasoning}`);
      }
    } else {
      alert("Não foi possível gerar estimativa. Verifique sua chave de API.");
    }
  };

  const generatePDF = (quoteId: number) => {
    const doc = new jsPDF();
    const client = clients.find(c => c.id === selectedClient);
    
    doc.setFontSize(20);
    doc.text('Orçamento de Impressão 3D', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Orçamento #${quoteId}`, 20, 40);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 48);
    
    doc.text(`Cliente: ${client?.name}`, 20, 60);
    doc.text(`Projeto: ${projectName}`, 20, 68);

    // Table
    const tableData = selectedMaterials.map(m => [
      m.itemName, 
      `${m.amountUsed}g`, 
      `R$ ${m.costCalculated.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 80,
      head: [['Material', 'Qtd', 'Custo']],
      body: tableData,
    });

    // @ts-ignore
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text(`Mão de Obra (${laborHours}h): R$ ${laborCost.toFixed(2)}`, 20, finalY);
    doc.text(`Lucro Estimado: R$ ${profitValue.toFixed(2)}`, 20, finalY + 8);
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text(`Valor Final: R$ ${finalPrice.toFixed(2)}`, 20, finalY + 20);

    doc.save(`Orcamento_${quoteId}_${projectName}.pdf`);
  };

  const handleSaveQuote = () => {
    if (!selectedClient || !projectName || selectedMaterials.length === 0) {
      alert("Preencha todos os campos e adicione materiais.");
      return;
    }

    const clientObj = clients.find(c => c.id === selectedClient);
    if(!clientObj) return;

    const newQuote = {
      id: Date.now(),
      clientId: selectedClient,
      clientName: clientObj.name,
      projectName,
      items: selectedMaterials,
      laborHours,
      laborCost,
      totalMaterialCost,
      profitMargin,
      totalPrice: finalPrice,
      date: new Date().toISOString(),
      status: QuoteStatus.PENDING
    };

    addQuote(newQuote);
    
    if (confirm("Orçamento gerado com sucesso! Deseja baixar o PDF agora?")) {
      generatePDF(newQuote.id);
    }

    // Reset form
    setProjectName('');
    setSelectedMaterials([]);
    setLaborHours(0);
    setSelectedClient('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerar Novo Orçamento</h2>
        <div className="text-sm text-slate-500">
           Preencha os dados abaixo para calcular o preço final.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Client & Project */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select 
                  className="w-full border rounded-lg p-2" 
                  value={selectedClient} 
                  onChange={e => setSelectedClient(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="w-full border rounded-lg p-2" 
                    placeholder="Ex: Boneco Articulado"
                    value={projectName} 
                    onChange={e => setProjectName(e.target.value)}
                  />
                  <button 
                    onClick={handleAIEstimate}
                    disabled={isEstimating}
                    className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                    title="Estimar com IA"
                  >
                    {isEstimating ? <Loader2 className="animate-spin" size={20}/> : <Bot size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-medium text-slate-800 mb-4">Materiais Utilizados</h3>
             
             <div className="flex gap-2 mb-4 items-end">
               <div className="flex-1">
                 <label className="text-xs text-slate-500">Material</label>
                 <select 
                    className="w-full border rounded-lg p-2 text-sm"
                    value={currentMaterialId}
                    onChange={e => setCurrentMaterialId(e.target.value)}
                 >
                   <option value="">Selecione...</option>
                   {inventory.map(item => (
                     <option key={item.id} value={item.id}>
                       {item.name} ({item.brand}) - R${(item.costPrice/item.unitSize).toFixed(3)}/{item.unit === UnitType.KG ? 'g' : item.unit}
                     </option>
                   ))}
                 </select>
               </div>
               <div className="w-32">
                 <label className="text-xs text-slate-500">Qtd (g/ml)</label>
                 <input 
                    type="number" 
                    className="w-full border rounded-lg p-2 text-sm" 
                    placeholder="0"
                    value={currentAmount > 0 ? currentAmount : ''}
                    onChange={e => setCurrentAmount(parseFloat(e.target.value))}
                 />
               </div>
               <button 
                 onClick={handleAddMaterial}
                 className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700"
               >
                 <Plus size={20} />
               </button>
             </div>

             {selectedMaterials.length > 0 ? (
               <div className="space-y-2">
                 {selectedMaterials.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100 text-sm">
                     <div>
                       <span className="font-medium">{item.itemName}</span>
                       <span className="text-slate-500 ml-2">{item.amountUsed} unidades/g</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="text-slate-700">R$ {item.costCalculated.toFixed(2)}</span>
                       <button onClick={() => handleRemoveMaterial(idx)} className="text-red-400 hover:text-red-600">
                         <Trash size={16} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-4 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                 Nenhum material adicionado.
               </div>
             )}
          </div>

          {/* Labor & Profit */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horas de Impressão/Trabalho</label>
              <input 
                type="number" 
                className="w-full border rounded-lg p-2" 
                value={laborHours} 
                onChange={e => setLaborHours(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Margem de Lucro (%)</label>
              <input 
                type="number" 
                className="w-full border rounded-lg p-2" 
                value={profitMargin} 
                onChange={e => setProfitMargin(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-blue-600"/> Resumo
            </h3>
            
            <div className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Custo Material:</span>
                <span>R$ {totalMaterialCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Mão de Obra ({laborHours}h):</span>
                <span>R$ {laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-800 pt-2">
                <span>Subtotal (Custos):</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="py-4 space-y-3">
               <div className="flex justify-between text-green-600">
                <span>Lucro Estimado ({profitMargin}%):</span>
                <span>R$ {profitValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-blue-600">R$ {finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleSaveQuote}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <FileText size={18}/> Gerar Orçamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};