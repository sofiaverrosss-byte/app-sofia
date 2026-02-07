
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// --- TYPES ---
export interface FoodItem {
  id: string;
  name: string;
  cal: number;
  p: number;
  c: number;
  g: number;
  time: string;
}

export interface UserState {
  target: number;
  consumed: number;
  p: number;
  c: number;
  g: number;
  log: FoodItem[];
  userName: string;
  profileImg: string;
  water: number;
  history: number[];
}

export type ViewType = 'home' | 'stats' | 'profile';

export interface AIAnalysisResult {
  name: string;
  cal: number;
  p: number;
  c: number;
  g: number;
}

// --- CONSTANTS ---
const INITIAL_FOOD_DB = [
  { name: "Pechuga de Pollo (100g)", cal: 165, p: 31, c: 0, g: 3.6 },
  { name: "Salmón a la plancha (100g)", cal: 208, p: 20, c: 0, g: 13 },
  { name: "Huevos (2 unidades)", cal: 155, p: 13, c: 1, g: 11 },
  { name: "Arroz Blanco (100g)", cal: 130, p: 2.7, c: 28, g: 0.3 },
  { name: "Aguacate (1/2 unidad)", cal: 160, p: 2, c: 8.5, g: 14.7 },
  { name: "Manzana (1 mediano)", cal: 52, p: 0.3, c: 14, g: 0.2 },
  { name: "Batata/Camote (100g)", cal: 86, p: 1.6, c: 20, g: 0.1 }
];

const DEFAULT_STATE: UserState = {
  target: 2000,
  consumed: 0,
  p: 0,
  c: 0,
  g: 0,
  log: [],
  userName: "Elite Athlete",
  profileImg: "https://picsum.photos/200",
  water: 0,
  history: [1850, 2100, 1600, 1950, 2200, 1750, 0]
};

const STORAGE_KEY = 'nutriflow_red_v2_single';

// --- AI SERVICE ---
const analyzeMealDescription = async (description: string): Promise<AIAnalysisResult | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Estimate the nutritional values for the following meal description: "${description}". Provide the most accurate single item representation or a summary.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the food or meal" },
            cal: { type: Type.NUMBER, description: "Calories in kcal" },
            p: { type: Type.NUMBER, description: "Protein in grams" },
            c: { type: Type.NUMBER, description: "Carbohydrates in grams" },
            g: { type: Type.NUMBER, description: "Fats in grams" },
          },
          required: ["name", "cal", "p", "c", "g"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AIAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
};

// --- COMPONENTS ---

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

const NavButton: React.FC<{ isActive: boolean; onClick: () => void; icon: string }> = ({ isActive, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`${isActive ? 'text-red-600 scale-125' : 'text-gray-500'} transition-all duration-300 p-2`}
  >
    <i className={`${icon} text-xl`}></i>
  </button>
);

const Navigation: React.FC<{ currentView: ViewType; onViewChange: (view: ViewType) => void }> = ({ currentView, onViewChange }) => (
  <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black rounded-[2.5rem] px-10 py-6 flex justify-between items-center shadow-2xl z-50 border border-white/5">
    <NavButton isActive={currentView === 'home'} onClick={() => onViewChange('home')} icon="fas fa-bolt" />
    <NavButton isActive={currentView === 'stats'} onClick={() => onViewChange('stats')} icon="fas fa-chart-pie" />
    <NavButton isActive={currentView === 'profile'} onClick={() => onViewChange('profile')} icon="fas fa-user" />
  </nav>
);

const FoodSearchAI: React.FC<{ onAddFood: (food: Omit<FoodItem, 'id' | 'time'>) => void }> = ({ onAddFood }) => {
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

  return (
    <section className="space-y-4 relative">
      <form onSubmit={handleAISubmit} className="relative">
        <input 
          value={query} onChange={handleSearch} type="text" 
          placeholder="What did you eat today? (e.g. 2 eggs and toast)" 
          className="w-full bg-gray-50 p-5 pl-14 rounded-[2rem] border border-gray-100 focus:ring-2 focus:ring-red-600 transition-all outline-none text-sm font-medium pr-24"
        />
        <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
        <button type="submit" disabled={isSearching} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50">
          {isSearching ? <i className="fas fa-circle-notch fa-spin"></i> : 'ASK AI'}
        </button>
      </form>
      {showResults && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl p-3 max-h-60 overflow-y-auto no-scrollbar border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase p-2 border-b border-gray-50 mb-1">Local Results</p>
          {localResults.map((food, idx) => (
            <div key={idx} onClick={() => { onAddFood(food); setQuery(''); setShowResults(false); }} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-2xl transition-all">
              <div className="flex-1 mr-3"><p className="font-bold text-sm text-black">{food.name}</p></div>
              <p className="text-xs font-black text-red-600 whitespace-nowrap">{food.cal} kcal</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const Dashboard: React.FC<{ state: UserState; onAddFood: any; onRemoveFood: any; onAddWater: any; onReset: any }> = ({ state, onAddFood, onRemoveFood, onAddWater, onReset }) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  const remaining = Math.max(state.target - state.consumed, 0);
  const progressPercent = Math.min((state.consumed / state.target) * 100, 100);
  const strokeDashoffset = 264 - (Math.min(state.consumed / state.target, 1) * 264);

  return (
    <div className="animate-fadeIn">
      <header className="bg-black text-white px-6 pt-12 pb-12 rounded-b-[3rem] shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div><p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-1">Elite Performance</p><h1 className="text-2xl font-extrabold tracking-tight">{today}</h1></div>
          <button onClick={onReset} className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all"><i className="fas fa-sync-alt text-xs"></i></button>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50"/>
              <circle className="text-red-600 progress-ring__circle" stroke="currentColor" strokeWidth="8" strokeDasharray="264" strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" r="42" cx="50" cy="50"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black tracking-tighter">{remaining}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Left</span></div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5"><span className="text-gray-400">Consumed</span><span className="text-white">{state.consumed} kcal</span></div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden"><div className="bg-red-600 h-full transition-all duration-700" style={{ width: `${progressPercent}%` }}></div></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Target</p><p className="text-sm font-extrabold text-white">{state.target}</p></div>
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Status</p><p className="text-sm font-extrabold text-red-500">Active</p></div>
            </div>
          </div>
        </div>
      </header>
      <div className="px-6 py-8 space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 bg-red-600 rounded-full"></span><h3 className="text-[11px] font-black text-black uppercase tracking-widest">Macros</h3></div>
          <div className="grid grid-cols-3 gap-3">
            <MacroCard label="Protein" value={state.p} target={150} />
            <MacroCard label="Carbs" value={state.c} target={250} />
            <MacroCard label="Fats" value={state.g} target={70} />
          </div>
        </section>
        <section className="bg-black text-white p-6 rounded-[2.5rem] shadow-xl">
          <div className="flex justify-between items-start mb-6"><div><h3 className="text-lg font-black tracking-tight">Hydration</h3><p className="text-xs text-gray-400 italic">Goal: 2.5L</p></div><div className="text-right"><p className="text-2xl font-black text-red-500">{state.water}<span className="text-xs text-white ml-1">ml</span></p></div></div>
          <div className="h-2.5 w-full bg-white/10 rounded-full mb-6 overflow-hidden"><div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${Math.min((state.water / 2500) * 100, 100)}%` }}></div></div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onAddWater(250)} className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-2xl font-bold text-xs transition-all">250ml</button>
            <button onClick={() => onAddWater(500)} className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-2xl font-bold text-xs transition-all">500ml</button>
          </div>
        </section>
        <FoodSearchAI onAddFood={onAddFood} />
        <section className="space-y-4">
          <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center justify-between">Daily Log <span className="text-[10px] text-gray-400 lowercase italic">{state.log.length} items</span></h3>
          <div className="space-y-3">
            {state.log.length === 0 ? (
              <div className="text-center py-10 text-gray-300 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-gray-100 rounded-[2rem]">No entries</div>
            ) : (
              state.log.map(item => (
                <div key={item.id} className="relative pl-6 bg-white p-5 rounded-[1.5rem] flex justify-between items-center border border-gray-100 shadow-sm transition-all group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 rounded-l-full"></div>
                  <div className="flex-1 mr-4"><p className="text-sm font-extrabold text-black leading-tight">{item.name}</p><p className="text-[9px] text-gray-400 font-bold uppercase mt-1.5">{item.time}</p></div>
                  <div className="flex items-center gap-4"><div className="text-right"><p className="text-sm font-black text-black">{item.cal} <span className="text-[9px] text-red-500 uppercase">kcal</span></p></div><button onClick={() => onRemoveFood(item.id)} className="text-gray-200 hover:text-red-600 transition-colors p-2"><i className="fas fa-trash-alt text-xs"></i></button></div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const Stats: React.FC<{ state: UserState }> = ({ state }) => {
  const chartData = state.history.map((val, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    kcal: i === 6 ? state.consumed : val
  }));
  const avgKcal = Math.round(chartData.reduce((acc, curr) => acc + curr.kcal, 0) / 7);
  return (
    <div className="px-6 py-12 animate-fadeIn">
      <h2 className="text-3xl font-black text-black mb-10 tracking-tighter uppercase">Performance</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-100 p-5 rounded-[2rem]"><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Avg Calories</p><p className="text-2xl font-black text-black">{avgKcal}</p></div>
        <div className="bg-gray-50 border border-gray-100 p-5 rounded-[2rem]"><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Water Total</p><p className="text-2xl font-black text-black">{(state.water/1000).toFixed(1)}L</p></div>
      </div>
      <div className="bg-black p-8 rounded-[3rem] text-white shadow-2xl mb-10">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}><Bar dataKey="kcal" radius={[6, 6, 0, 0]}>{chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={index === 6 ? '#ef4444' : 'rgba(255,255,255,0.1)'} />))}</Bar><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }} /><Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, payload }) => active && payload ? <div className="bg-white p-2 rounded-lg text-black text-[10px] font-black">{payload[0].value} kcal</div> : null} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC<{ state: UserState; onUpdate: any }> = ({ state, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && onUpdate({ profileImg: ev.target.result as string });
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="px-6 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <div className="relative w-36 h-36 mx-auto mb-6">
          <img src={state.profileImg} className="w-full h-full rounded-[3rem] object-cover shadow-2xl border-4 border-white" alt="Profile" />
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-red-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white transition shadow-lg"><i className="fas fa-camera text-sm"></i></button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
        <input type="text" value={state.userName} onChange={(e) => onUpdate({ userName: e.target.value })} className="text-3xl font-black text-center bg-transparent border-none outline-none focus:text-red-600 transition tracking-tighter uppercase" />
      </div>
      <div className="bg-black text-white p-8 rounded-[3rem] shadow-xl space-y-8">
        <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Daily Goal</p><input type="number" value={state.target} onChange={(e) => onUpdate({ target: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 p-5 rounded-2xl font-black outline-none border border-white/10 focus:border-red-600 text-center text-xl" /></div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [state, setState] = useState<UserState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });
  const [currentView, setCurrentView] = useState<ViewType>('home');
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const addFood = useCallback((food: Omit<FoodItem, 'id' | 'time'>) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: FoodItem = { ...food, id: Date.now().toString(), time: timeStr };
    setState(prev => ({ ...prev, log: [newEntry, ...prev.log], consumed: prev.consumed + food.cal, p: prev.p + food.p, c: prev.c + food.c, g: prev.g + food.g }));
  }, []);

  const removeFood = useCallback((id: string) => {
    setState(prev => {
      const item = prev.log.find(i => i.id === id);
      if (!item) return prev;
      return { ...prev, log: prev.log.filter(i => i.id !== id), consumed: prev.consumed - item.cal, p: prev.p - item.p, c: prev.c - item.c, g: prev.g - item.g };
    });
  }, []);

  const addWater = (amount: number) => setState(prev => ({ ...prev, water: prev.water + amount }));
  const resetDay = () => { if (confirm('Reset?')) setState(prev => ({ ...prev, consumed: 0, p: 0, c: 0, g: 0, log: [], water: 0 })); };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl flex flex-col">
        <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
          {currentView === 'home' && <Dashboard state={state} onAddFood={addFood} onRemoveFood={removeFood} onAddWater={addWater} onReset={resetDay} />}
          {currentView === 'stats' && <Stats state={state} />}
          {currentView === 'profile' && <Profile state={state} onUpdate={(u: any) => setState(p => ({ ...p, ...u }))} />}
        </main>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
