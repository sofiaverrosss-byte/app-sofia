
import React from 'react';
import { UserState } from '../types';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface StatsProps {
  state: UserState;
}

const Stats: React.FC<StatsProps> = ({ state }) => {
  const chartData = state.history.map((val, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    kcal: i === 6 ? state.consumed : val
  }));

  const avgKcal = Math.round(chartData.reduce((acc, curr) => acc + curr.kcal, 0) / 7);

  return (
    <div className="px-6 py-12 animate-fadeIn">
      <h2 className="text-3xl font-black text-black mb-10 tracking-tighter uppercase">Performance</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-100 p-5 rounded-[2rem] hover:-translate-y-1 transition-transform">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Avg Calories</p>
          <p className="text-2xl font-black text-black">{avgKcal}</p>
          <p className="text-[9px] text-red-500 font-bold mt-1">L7D Metric</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 p-5 rounded-[2rem] hover:-translate-y-1 transition-transform">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Water</p>
          <p className="text-2xl font-black text-black">{(state.water / 1000).toFixed(1)}L</p>
          <p className="text-[9px] text-green-500 font-bold mt-1">Hydrated</p>
        </div>
      </div>

      <div className="bg-black p-8 rounded-[3rem] text-white shadow-2xl mb-10">
        <div className="flex justify-between items-center mb-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Weekly Consumption</p>
          <span className="text-[9px] bg-red-600 px-2 py-1 rounded-lg font-black uppercase">kcal</span>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar dataKey="kcal" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 6 ? '#ef4444' : 'rgba(255,255,255,0.1)'} />
                ))}
              </Bar>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 rounded-lg text-black text-[10px] font-black">
                        {payload[0].value} kcal
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 mb-8">
        <h4 className="text-xs font-black text-black mb-8 uppercase tracking-widest">Macro Distribution</h4>
        <div className="space-y-6">
          <StatMacroBar label="Protein" val={state.p} target={150} color="bg-red-600" />
          <StatMacroBar label="Carbohydrates" val={state.c} target={250} color="bg-black" />
          <StatMacroBar label="Fats" val={state.g} target={70} color="bg-gray-400" />
        </div>
      </div>
    </div>
  );
};

const StatMacroBar: React.FC<{ label: string; val: number; target: number; color: string }> = ({ label, val, target, color }) => (
  <div>
    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
      <span>{label}</span>
      <span>{Math.round(val)}g / {target}g</span>
    </div>
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`${color} h-full transition-all duration-1000`} 
        style={{ width: `${Math.min((val / target) * 100, 100)}%` }}
      ></div>
    </div>
  </div>
);

export default Stats;
