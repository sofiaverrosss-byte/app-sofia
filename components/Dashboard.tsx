
import React, { useState } from 'react';
import { UserState, FoodItem } from '../types';
import FoodSearchAI from './FoodSearchAI';

interface DashboardProps {
  state: UserState;
  onAddFood: (food: Omit<FoodItem, 'id' | 'time'>) => void;
  onRemoveFood: (id: string) => void;
  onAddWater: (amount: number) => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAddFood, onRemoveFood, onAddWater, onReset }) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  const remaining = Math.max(state.target - state.consumed, 0);
  const progressPercent = Math.min((state.consumed / state.target) * 100, 100);
  const strokeDashoffset = 264 - (Math.min(state.consumed / state.target, 1) * 264);

  return (
    <div className="animate-fadeIn">
      {/* Black Header */}
      <header className="bg-black text-white px-6 pt-12 pb-12 rounded-b-[3rem] shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-1">Elite Performance</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{today}</h1>
          </div>
          <button 
            onClick={onReset}
            className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all duration-300"
          >
            <i className="fas fa-sync-alt text-xs"></i>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-white/10" stroke-width="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50"/>
              <circle 
                className="text-red-600 progress-ring__circle" 
                stroke="currentColor" 
                stroke-width="8" 
                stroke-dasharray="264" 
                stroke-dashoffset={strokeDashoffset} 
                stroke-linecap="round" 
                fill="transparent" 
                r="42" cx="50" cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tighter">{remaining}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Left</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                <span className="text-gray-400">Consumed</span>
                <span className="text-white">{state.consumed} kcal</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full transition-all duration-700" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Target</p>
                <p className="text-sm font-extrabold text-white">{state.target}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Burn</p>
                <p className="text-sm font-extrabold text-red-500">Active</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8 space-y-10">
        {/* Macros */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Nutritional Balance</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroCard label="Protein" value={state.p} target={150} />
            <MacroCard label="Carbs" value={state.c} target={250} />
            <MacroCard label="Fats" value={state.g} target={70} />
          </div>
        </section>

        {/* Hydration */}
        <section className="bg-black text-white p-6 rounded-[2.5rem] shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black tracking-tight">Hydration</h3>
              <p className="text-xs text-gray-400 italic">Daily Goal: 2500ml</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-red-500">{state.water}<span className="text-xs text-white ml-1">ml</span></p>
            </div>
          </div>
          
          <div className="h-2.5 w-full bg-white/10 rounded-full mb-6 overflow-hidden">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min((state.water / 2500) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onAddWater(250)} className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
              <i className="fas fa-plus"></i> 250ml
            </button>
            <button onClick={() => onAddWater(500)} className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
              <i className="fas fa-plus"></i> 500ml
            </button>
          </div>
        </section>

        {/* AI Food Search */}
        <FoodSearchAI onAddFood={onAddFood} />

        {/* Daily Log */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center justify-between">
            Daily Log
            <span className="text-[10px] text-gray-400 lowercase italic">{state.log.length} items logged</span>
          </h3>
          <div className="space-y-3">
            {state.log.length === 0 ? (
              <div className="text-center py-10 text-gray-300 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-gray-100 rounded-[2rem]">
                No entries yet
              </div>
            ) : (
              state.log.map(item => (
                <div key={item.id} className="relative pl-6 bg-white p-5 rounded-[1.5rem] flex justify-between items-center border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 rounded-l-full"></div>
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-extrabold text-black leading-tight">{item.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1.5">{item.time}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-black">{item.cal} <span className="text-[9px] text-red-500 uppercase">kcal</span></p>
                    </div>
                    <button 
                      onClick={() => onRemoveFood(item.id)}
                      className="text-gray-200 hover:text-red-600 transition-colors p-2"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const MacroCard: React.FC<{ label: string; value: number; target: number }> = ({ label, value, target }) => (
  <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 text-center">
    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{label}</p>
    <p className="text-base font-black text-black">{Math.round(value)}g</p>
    <div className="w-full bg-gray-200 h-1 mt-2.5 rounded-full overflow-hidden">
      <div 
        className="bg-black h-full transition-all duration-700" 
        style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
      ></div>
    </div>
  </div>
);

export default Dashboard;
