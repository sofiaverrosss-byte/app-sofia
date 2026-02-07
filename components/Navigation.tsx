
import React from 'react';
import { ViewType } from '../types';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black rounded-[2.5rem] px-10 py-6 flex justify-between items-center shadow-2xl z-50 border border-white/5">
      <NavButton 
        isActive={currentView === 'home'} 
        onClick={() => onViewChange('home')} 
        icon="fas fa-bolt" 
      />
      <NavButton 
        isActive={currentView === 'stats'} 
        onClick={() => onViewChange('stats')} 
        icon="fas fa-chart-pie" 
      />
      <NavButton 
        isActive={currentView === 'profile'} 
        onClick={() => onViewChange('profile')} 
        icon="fas fa-user" 
      />
    </nav>
  );
};

const NavButton: React.FC<{ isActive: boolean; onClick: () => void; icon: string }> = ({ isActive, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`${isActive ? 'text-red-600 scale-125' : 'text-gray-500'} transition-all duration-300 p-2`}
  >
    <i className={`${icon} text-xl`}></i>
  </button>
);

export default Navigation;
