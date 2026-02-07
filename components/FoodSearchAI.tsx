
import React, { useState, useCallback } from 'react';
import { analyzeMealDescription } from '../services/geminiService';
import { FoodItem, AIAnalysisResult } from '../types';
import { INITIAL_FOOD_DB } from '../constants';

interface FoodSearchAIProps {
  onAddFood: (food: Omit<FoodItem, 'id' | 'time'>) => void;
}

const FoodSearchAI: React.FC<FoodSearchAIProps> = ({ onAddFood }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [localResults, setLocalResults] = useState<any[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    
    if (q.length > 0) {
      const matches = INITIAL_FOOD_DB.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));
      setLocalResults(matches);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleAISubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(false);
    
    const result = await analyzeMealDescription(query);
    if (result) {
      onAddFood(result);
      setQuery('');
    } else {
      alert("Could not analyze meal. Try being more specific!");
    }
    setIsSearching(false);
  };

  const handleSelectLocal = (food: any) => {
    onAddFood(food);
    setQuery('');
    setShowResults(false);
  };

  return (
    <section className="space-y-4 relative">
      <form onSubmit={handleAISubmit} className="relative">
        <input 
          value={query}
          onChange={handleSearch}
          type="text" 
          placeholder="What did you eat today? (e.g. 2 eggs and toast)" 
          className="w-full bg-gray-50 p-5 pl-14 rounded-[2rem] border border-gray-100 focus:ring-2 focus:ring-red-600 transition-all outline-none text-sm font-medium pr-24"
        />
        <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
        
        <button 
          type="submit"
          disabled={isSearching}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isSearching ? <i className="fas fa-circle-notch fa-spin"></i> : 'ASK AI'}
        </button>
      </form>

      {showResults && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl p-3 max-h-60 overflow-y-auto no-scrollbar border border-gray-100 animate-fadeIn">
          <p className="text-[10px] font-black text-gray-400 uppercase p-2 border-b border-gray-50 mb-1">Local Results</p>
          {localResults.length > 0 ? localResults.map((food, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelectLocal(food)}
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-2xl transition-all"
            >
              <div className="flex-1 mr-3">
                <p className="font-bold text-sm text-black">{food.name}</p>
                <p className="text-[9px] text-gray-400 uppercase">P: {food.p}g | C: {food.c}g | G: {food.g}g</p>
              </div>
              <p className="text-xs font-black text-red-600 whitespace-nowrap">{food.cal} kcal</p>
            </div>
          )) : (
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400 italic">No matches in DB. Press 'ASK AI' for analysis.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FoodSearchAI;
