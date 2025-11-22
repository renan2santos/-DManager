import React from 'react';
import { useStore } from '../context/StoreContext';
import { QuoteStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { quotes } = useStore();

  const totalRevenue = quotes
    .filter(q => q.status === QuoteStatus.APPROVED)
    .reduce((sum, q) => sum + q.totalPrice, 0);

  const totalProfit = quotes
    .filter(q => q.status === QuoteStatus.APPROVED)
    .reduce((sum, q) => sum + (q.totalPrice - q.totalMaterialCost - q.laborCost), 0);

  const pendingCount = quotes.filter(q => q.status === QuoteStatus.PENDING).length;
  const approvedCount = quotes.filter(q => q.status === QuoteStatus.APPROVED).length;
  const rejectedCount = quotes.filter(q => q.status === QuoteStatus.REJECTED).length;

  const chartData = [
    { name: 'Pendente', value: pendingCount, color: '#fbbf24' },
    { name: 'Aprovado', value: approvedCount, color: '#22c55e' },
    { name: 'Reprovado', value: rejectedCount, color: '#ef4444' },
  ];

  // Calculate revenue by month (simplified for demo)
  const revenueData = quotes
    .filter(q => q.status === QuoteStatus.APPROVED)
    .reduce((acc: any[], curr) => {
      const month = new Date(curr.date).toLocaleString('pt-BR', { month: 'short' });
      const existing = acc.find(i => i.name === month);
      if (existing) {
        existing.revenue += curr.totalPrice;
      } else {
        acc.push({ name: month, revenue: curr.totalPrice });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
           <p className="text-slate-500">Visão geral do seu negócio de impressão 3D</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total" 
          value={`R$ ${totalRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Lucro Líquido" 
          value={`R$ ${totalProfit.toFixed(2)}`} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Orçamentos Pendentes" 
          value={pendingCount.toString()} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Taxa de Aprovação" 
          value={quotes.length > 0 ? `${Math.round((approvedCount / quotes.length) * 100)}%` : '0%'} 
          icon={CheckCircle} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Receita por Mês</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.length > 0 ? revenueData : [{name: 'Sem dados', revenue: 0}]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Status dos Orçamentos</h3>
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};