
import React, { useState, useEffect, useCallback } from 'react';
import { UserState, ViewType, FoodItem } from './types';
import { DEFAULT_STATE } from './constants';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import Profile from './components/Profile';
import Navigation from './components/Navigation';

const STORAGE_KEY = 'nutriflow_red_v2';

const App: React.FC = () => {
  const [state, setState] = useState<UserState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });
  
  const [currentView, setCurrentView] = useState<ViewType>('home');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addFood = useCallback((food: Omit<FoodItem, 'id' | 'time'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: FoodItem = {
      ...food,
      id: Date.now().toString(),
      time: timeStr
    };

    setState(prev => {
      const newLog = [newEntry, ...prev.log];
      return {
        ...prev,
        log: newLog,
        consumed: prev.consumed + food.cal,
        p: prev.p + food.p,
        c: prev.c + food.c,
        g: prev.g + food.g
      };
    });
  }, []);

  const removeFood = useCallback((id: string) => {
    setState(prev => {
      const itemToRemove = prev.log.find(item => item.id === id);
      if (!itemToRemove) return prev;
      
      const newLog = prev.log.filter(item => item.id !== id);
      return {
        ...prev,
        log: newLog,
        consumed: prev.consumed - itemToRemove.cal,
        p: prev.p - itemToRemove.p,
        c: prev.c - itemToRemove.c,
        g: prev.g - itemToRemove.g
      };
    });
  }, []);

  const addWater = useCallback((amount: number) => {
    setState(prev => ({ ...prev, water: prev.water + amount }));
  }, []);

  const resetDay = useCallback(() => {
    if (confirm('Reset all daily progress?')) {
      setState(prev => ({
        ...prev,
        consumed: 0,
        p: 0,
        c: 0,
        g: 0,
        log: [],
        water: 0
      }));
    }
  }, []);

  const updateProfile = (updates: Partial<UserState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col">
        <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
          {currentView === 'home' && (
            <Dashboard 
              state={state} 
              onAddFood={addFood} 
              onRemoveFood={removeFood} 
              onAddWater={addWater}
              onReset={resetDay}
            />
          )}
          {currentView === 'stats' && <Stats state={state} />}
          {currentView === 'profile' && (
            <Profile 
              state={state} 
              onUpdate={updateProfile} 
            />
          )}
        </main>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

export default App;
