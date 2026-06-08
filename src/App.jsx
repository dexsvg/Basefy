import React, { useState } from 'react';
// Impor modul Thirdweb untuk integrasi Base Chain
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";
import { base } from "thirdweb/chains";

// Inisialisasi Client Thirdweb (Kamu bisa ganti clientID ini nanti jika punya sendiri)
const client = createThirdwebClient({
  clientId: "YOUR_THIRDWEB_CLIENT_ID_OR_TEMPORARY_KEY" 
});

function BasefyApp() {
  const [points, setPoints] = useState(68);
  const [activeTab, setActiveTab] = useState('daily');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInDays, setCheckInDays] = useState([true, false, false, true, false, false, false]);

  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: 'Comment on Basefy Post', points: 3, completed: false, link: 'https://x.com' },
    { id: 2, title: 'Like on Basefy Post', points: 3, completed: false, link: 'https://x.com' },
  ]);

  const [generalMissions, setGeneralMissions] = useState([
    { id: 3, title: 'Follow Basefy on X', points: 10, completed: false, link: 'https://x.com' },
    { id: 4, title: 'Join Basefy Telegram', points: 15, completed: false, link: 'https://t.me' },
  ]);

  const handleCheckIn = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      setPoints(prev => prev + 10);
      const updatedDays = [...checkInDays];
      updatedDays[4] = true; 
      setCheckInDays(updatedDays);
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
        <span className="text-gray-400 text-sm font-bold tracking-wider">Basefy</span>
        
        {/* Tombol Connect Wallet Otomatis dari Thirdweb */}
        <ConnectButton
          client={client}
          chain={base}
          theme={"dark"}
          connectButton={{
            label: "Connect",
            style: {
              backgroundColor: "#f97316",
              color: "#000000",
              fontSize: "12px",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "6px 12px"
            }
          }}
        />
      </div>

      {/* Balance Card */}
      <div className="w-full max-w-md mb-6">
        <h1 className="text-4xl font-black tracking-wide mb-1">
          {points} <span className="text-orange-500 text-2xl font-bold">P</span>
        </h1>
        <div className="flex gap-4 text-xs text-orange-400 font-medium mb-4">
          <span className="underline cursor-pointer hover:text-orange-300">Earnings</span>
          <span className="underline cursor-pointer hover:text-orange-300">Submissions</span>
          <span className="underline cursor-pointer hover:text-orange-300">Referrals</span>
        </div>

        <div className="bg-[#242e3d] rounded-xl p-3 flex justify-between items-center border border-gray-700/50">
          <p className="text-xs text-gray-400 truncate max-w-[80%]">https://basefy.app/start=ref_7022104...</p>
          <button className="text-gray-400 hover:text-white p-1" onClick={() => alert('Link copied!')}>📋</button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="w-full max-w-md border-b border-gray-700/50 flex mb-4">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`w-1/2 pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'daily' ? 'border-orange-500 text-white' : 'border-transparent text-gray-400'}`}
        >
          Daily <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-xs ml-1">2</span>
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`w-1/2 pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'general' ? 'border-orange-500 text-white' : 'border-transparent text-gray-400'}`}
        >
          General <span className="bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded text-xs ml-1">2</span>
        </button>
      </div>

      {/* TAB: DAILY */}
      {activeTab === 'daily' && (
        <div className="w-full max-w-md">
          <p className="text-[11px] text-gray-500 mb-4">Daily missions reset by timezone: Asia/Seoul</p>
          
          <div className="bg-[#242e3d] rounded-2xl p-4 mb-6 border border-gray-700/50">
            <h3 className="text-base font-bold mb-4">Daily Check-in</h3>
            <div className="flex justify-between mb-5">
              {checkInDays.map((status, index) => (
                <div key={index} className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs ${status ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-gray-600 text-gray-500'}`}>✓</div>
              ))}
            </div>
            <button 
              disabled={checkedIn}
              onClick={handleCheckIn}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${checkedIn ? 'bg-orange-950/40 text-orange-700/60 cursor-not-allowed border border-orange-900/30' : 'bg-orange-500 text-black hover:bg-orange-400'}`}
            >
              {checkedIn ? 'Checked in for today (+10p)' : 'Claim Daily Check-in'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Daily Mission</h3>
            {dailyMissions.map((mission) => (
              <div key={mission.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-orange-500">𝕏</div>
                  <div>
                    <p className="text-xs font-semibold">{mission.title}</p>
                    <p className="text-[11px] text-gray-500">+{mission.points}p</p>
                  </div>
                </div>
                <button 
                  disabled={mission.completed}
                  onClick={() => completeMission(mission.id, 'daily', mission.link, mission.points)}
                  className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors ${mission.completed ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-black hover:bg-orange-400'}`}
                >
                  {mission.completed ? 'DONE' : 'GO'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: GENERAL */}
      {activeTab === 'general' && (
        <div className="w-full max-w-md flex flex-col gap-3">
          <h3 className="text-lg font-bold mb-1">General Tasks</h3>
          {generalMissions.map((mission) => (
            <div key={mission.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-blue-400">🌐</div>
                <div>
                  <p className="text-xs font-semibold">{mission.title}</p>
                  <p className="text-[11px] text-gray-500">+{mission.points}p</p>
                </div>
              </div>
              <button 
                disabled={mission.completed}
                onClick={() => completeMission(mission.id, 'general', mission.link, mission.points)}
                className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors ${mission.completed ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-black hover:bg-orange-400'}`}
              >
                {mission.completed ? 'DONE' : 'GO'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Membungkus aplikasi dengan ThirdwebProvider
export default function App() {
  return (
    <ThirdwebProvider>
      <BasefyApp />
    </ThirdwebProvider>
  );
      }
                  
