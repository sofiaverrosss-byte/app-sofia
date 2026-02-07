
import React, { useRef } from 'react';
import { UserState } from '../types';

interface ProfileProps {
  state: UserState;
  onUpdate: (updates: Partial<UserState>) => void;
}

const Profile: React.FC<ProfileProps> = ({ state, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdate({ profileImg: ev.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-6 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <div className="relative w-36 h-36 mx-auto mb-6">
          <img 
            src={state.profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(state.userName)}&background=000&color=fff&bold=true`} 
            className="w-full h-full rounded-[3rem] object-cover shadow-2xl border-4 border-white"
            alt="Profile"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 bg-red-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white cursor-pointer hover:scale-110 transition shadow-lg"
          >
            <i className="fas fa-camera text-sm"></i>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        <input 
          type="text" 
          value={state.userName}
          onChange={(e) => onUpdate({ userName: e.target.value })}
          className="text-3xl font-black text-center bg-transparent border-none outline-none focus:text-red-600 transition tracking-tighter uppercase"
        />
        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Premium Athlete Edition</p>
      </div>

      <div className="bg-black text-white p-8 rounded-[3rem] shadow-xl space-y-8">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Daily Target Calibration</p>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input 
                type="number" 
                value={state.target}
                onChange={(e) => onUpdate({ target: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 p-5 rounded-2xl font-black outline-none border border-white/10 focus:border-red-600 focus:bg-white/10 transition text-center text-xl"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-bold uppercase text-[10px]">kcal</span>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
              Update Strategy
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <i className="fas fa-bell text-red-500"></i>
              <span className="text-[9px] font-black uppercase">Alerts</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <i className="fas fa-shield-alt text-red-500"></i>
              <span className="text-[9px] font-black uppercase">Privacy</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-gray-400 font-medium">NutriFlow Pro Version 2.0.4 - Red Series</p>
      </div>
    </div>
  );
};

export default Profile;
