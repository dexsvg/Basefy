import React, { useState, useEffect } from 'react';
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import { base } from "thirdweb/chains";

// 1. MASUKKAN ALAMAT KONTRAK KAMU DI SINI
const SMART_CONTRACT_ADDRESS = "0x263043098927A76cA8370363F6B815f34E716851"; 

const client = createThirdwebClient({
  clientId: "YOUR_THIRDWEB_CLIENT_ID_OR_TEMPORARY_KEY" 
});

function BasefyApp() {
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('basefy_points');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  const [activeTab, setActiveTab] = useState('daily');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInDays, setCheckInDays] = useState([true, false, false, true, false, false, false]);

  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: 'Komentari Postingan Basefy', points: 3, completed: false, link: 'https://x.com' },
    { id: 2, title: 'Sukai postingan Basefy', points: 3, completed: false, link: 'https://x.com' },
  ]);

  const [generalMissions, setGeneralMissions] = useState([
    { id: 3, title: 'Ikuti Basefy di X', points: 10, completed: false, link: 'https://x.com' },
    { id: 4, title: 'Gabung Telegram Basefy', points: 15, completed: false, link: 'https://t.me' },
  ]);

  useEffect(() => {
    const lastCheckIn = localStorage.getItem('basefy_last_checkin');
    const todayStr = new Date().toDateString();

    if (lastCheckIn === todayStr) {
      setCheckedIn(true);
      setCheckInDays(prev => {
        const updated = [...prev];
        updated[4] = true;
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('basefy_points', points);
  }, [points]);

  const handleCheckIn = () => {
    if (!checkedIn) {
      const todayStr = new Date().toDateString();
      localStorage.setItem('basefy_last_checkin', todayStr);
      
      setCheckedIn(true);
      setPoints(prev => prev + 10);
      
      setCheckInDays(prev => {
        const updated = [...prev];
        updated[4] = true;
        return updated;
      });
    }
  };

  const completeMission = (id, type, link, reward) => {
    window.open(link, '_blank');
    if (type === 'daily') {
      setDailyMissions(dailyMissions.map(m => m.id === id ? { ...m, completed: true } : m));
    } else {
      setGeneralMissions(generalMissions.map(m => m.id === id ? { ...m, completed: true } : m));
    }
    setPoints(prev => prev + reward);
  };

  return (
    <div className="min-h-screen bg-[#1a222d] text-white font-sans p-4 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <span className="text-gray-400 text-sm font-bold tracking-wider text-[#0052FF]">Basefy</span>
        
        <ConnectButton
          client={client}
          chain={base}
          theme={"dark"}
          connectButton={{
            label: "Hubungkan",
            style: {
              backgroundColor: "#0052FF",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "6px 12px",
              border: "none"
            }
          }}
        />
      </div>

      {/* Balance Card */}
      <div className="w-full max-w-md mb-6">
        <h1 className="text-4xl font-black tracking-wide mb-1">
          {points} <span className="text-[#0052FF] text-2xl font-bold">P</span>
        </h1>
        <div className="flex gap-4 text-xs text-[#0052FF] font-medium mb-4">
          <span className="underline cursor-pointer hover:text-blue-400">Pendapatan</span>
          <span className="underline cursor-pointer hover:text-blue-400">Pengajuan</span>
          <span className="underline cursor-pointer hover:text-blue-400">Rujukan</span>
        </div>

        {/* Tampilan Alamat Kontrak di bawah link rujukan (Opsional/Bisa buat info user) */}
        <div className="bg-[#242e3d] rounded-xl p-3 flex flex-col gap-2 border border-gray-700/50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 truncate max-w-[80%]">https://basefy.app/start=ref_7022104...</p>
            <button className="text-gray-400 hover:text-white p-1" onClick={() => alert('Tautan rujukan disalin!')}>📋</button>
          </div>
          <div className="border-t border-gray-700/30 pt-2 flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-mono">CA: {SMART_CONTRACT_ADDRESS.slice(0,6)}...{SMART_CONTRACT_ADDRESS.slice(-4)}</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded font-bold">BASE</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="w-full max-w-md border-b border-gray-700/50 flex mb-4">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`w-1/2 pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'daily' ? 'border-[#0052FF] text-white' : 'border-transparent text-gray-400'}`}
        >
          Harian <span className="bg-[#0052FF]/20 text-[#0052FF] px-1.5 py-0.5 rounded text-xs ml-1">2</span>
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`w-1/2 pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'general' ? 'border-[#0052FF] text-white' : 'border-transparent text-gray-400'}`}
        >
          Umum <span className="bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded text-xs ml-1">2</span>
        </button>
      </div>

      {/* TAB: HARIAN */}
      {activeTab === 'daily' && (
        <div className="w-full max-w-md">
          <p className="text-[11px] text-gray-500 mb-4">Misi harian direset berdasarkan zona waktu: Asia/Seoul</p>
          
          <div className="bg-[#242e3d] rounded-2xl p-4 mb-6 border border-gray-700/50">
            <h3 className="text-base font-bold mb-4">Check-in Harian</h3>
            <div className="flex justify-between mb-5">
              {checkInDays.map((status, index) => (
                <div key={index} className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs ${status ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-gray-600 text-gray-500'}`}>✓</div>
              ))}
            </div>
            <button 
              disabled={checkedIn}
              onClick={handleCheckIn}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${checkedIn ? 'bg-blue-950/40 text-blue-700/50 cursor-not-allowed border border-blue-900/20' : 'bg-[#0052FF] text-white hover:bg-blue-600'}`}
            >
              {checkedIn ? 'Sudah Check-in Hari Ini (+10p)' : 'Klaim Check-in Harian'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Misi Harian</h3>
            {dailyMissions.map((mission) => (
              <div key={mission.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-[#0052FF]">𝕏</div>
                  <div>
                    <p className="text-xs font-semibold">{mission.title}</p>
                    <p className="text-[11px] text-gray-500">+{mission.points} p</p>
                  </div>
                </div>
                <button 
                  disabled={mission.completed}
                  onClick={() => completeMission(mission.id, 'daily', mission.link, mission.points)}
                  className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors ${mission.completed ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#0052FF] text-white hover:bg-blue-600'}`}
                >
                  {mission.completed ? 'SELESAI' : 'PERGI'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: UMUM */}
      {activeTab === 'general' && (
        <div className="w-full max-w-md flex flex-col gap-3">
          <h3 className="text-lg font-bold mb-1">Misi Umum</h3>
          {generalMissions.map((mission) => (
            <div key={mission.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-blue-400">🌐</div>
                <div>
                  <p className="text-xs font-semibold">{mission.title}</p>
                  <p className="text-[11px] text-gray-500">+{mission.points} p</p>
                </div>
              </div>
              <button 
                disabled={mission.completed}
                onClick={() => completeMission(mission.id, 'general', mission.link, mission.points)}
                className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors ${mission.completed ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#0052FF] text-white hover:bg-blue-600'}`}
              >
                {mission.completed ? 'SELESAI' : 'PERGI'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThirdwebProvider>
      <BasefyApp />
    </ThirdwebProvider>
  );
}
