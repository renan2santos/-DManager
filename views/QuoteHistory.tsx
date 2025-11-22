import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { QuoteStatus, Quote } from '../types';
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const QuoteHistory: React.FC = () => {
  const { quotes, updateQuoteStatus } = useStore();
  const [filter, setFilter] = useState<string>('all');

  const filteredQuotes = quotes.filter(q => {
    if (filter === 'all') return true;
    return q.status === filter;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const downloadPDF = (quote: Quote) => {
     const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Orçamento de Impressão 3D', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Orçamento #${quote.id}`, 20, 40);
    doc.text(`Data: ${new Date(quote.date).toLocaleDateString()}`, 20, 48);
    
    doc.text(`Cliente: ${quote.clientName}`, 20, 60);
    doc.text(`Projeto: ${quote.projectName}`, 20, 68);

    // Table
    const tableData = quote.items.map(m => [
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
    
    doc.text(`Mão de Obra (${quote.laborHours}h): R$ ${quote.laborCost.toFixed(2)}`, 20, finalY);
    doc.setFontSize(14);
    doc.text(`Valor Final: R$ ${quote.totalPrice.toFixed(2)}`, 20, finalY + 20);

    doc.save(`Orcamento_${quote.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Histórico de Orçamentos</h2>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-slate-100 font-medium text-slate-800' : 'text-slate-500'}`}>Todos</button>
          <button onClick={() => setFilter(QuoteStatus.PENDING)} className={`px-3 py-1 text-sm rounded-md ${filter === QuoteStatus.PENDING ? 'bg-amber-100 font-medium text-amber-800' : 'text-slate-500'}`}>Pendentes</button>
          <button onClick={() => setFilter(QuoteStatus.APPROVED)} className={`px-3 py-1 text-sm rounded-md ${filter === QuoteStatus.APPROVED ? 'bg-green-100 font-medium text-green-800' : 'text-slate-500'}`}>Aprovados</button>
          <button onClick={() => setFilter(QuoteStatus.REJECTED)} className={`px-3 py-1 text-sm rounded-md ${filter === QuoteStatus.REJECTED ? 'bg-red-100 font-medium text-red-800' : 'text-slate-500'}`}>Reprovados</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Projeto</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500">#{quote.id.toString().slice(-4)}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(quote.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{quote.clientName}</td>
                <td className="px-6 py-4 text-slate-600">{quote.projectName}</td>
                <td className="px-6 py-4 font-bold text-slate-800">R$ {quote.totalPrice.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1
                    ${quote.status === QuoteStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                      quote.status === QuoteStatus.REJECTED ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'}`}>
                    {quote.status === QuoteStatus.APPROVED && <CheckCircle size={12}/>}
                    {quote.status === QuoteStatus.REJECTED && <XCircle size={12}/>}
                    {quote.status === QuoteStatus.PENDING && <Clock size={12}/>}
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => downloadPDF(quote)} className="text-slate-400 hover:text-slate-600" title="Baixar PDF">
                    <FileText size={18} />
                  </button>
                  
                  {quote.status === QuoteStatus.PENDING && (
                    <>
                      <button 
                        onClick={() => updateQuoteStatus(quote.id, QuoteStatus.APPROVED)} 
                        className="text-green-500 hover:text-green-700" 
                        title="Aprovar"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => updateQuoteStatus(quote.id, QuoteStatus.REJECTED)} 
                        className="text-red-500 hover:text-red-700" 
                        title="Reprovar"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredQuotes.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Nenhum orçamento encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};