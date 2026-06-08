import React, { useState, useEffect } from 'react';
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton, useActiveAccount } from "thirdweb/react";
import { base } from "thirdweb/chains";

// Locked Smart Contract Address
const SMART_CONTRACT_ADDRESS = "0x263043098927A76cA8370363F6B815f34E716851"; 

const client = createThirdwebClient({
  clientId: "YOUR_THIRDWEB_CLIENT_ID_OR_TEMPORARY_KEY" 
});

function BasefyApp() {
  const account = useActiveAccount(); // Detects if a wallet is connected
  
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('basefy_points');
    return savedPoints ? parseInt(savedPoints, 0) : 0;
  });

  const [activeTab, setActiveTab] = useState('daily');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInDays, setCheckInDays] = useState([true, false, false, true, false, false, false]);

  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: 'Comment on Basefy Post', points: 3, completed: false, link: 'https://x.com/i/status/2064024561658847610' },
    { id: 2, title: 'Like on Basefy Post', points: 3, completed: false, link: 'https://x.com/i/status/2064024561658847610' },
  ]);

  const [generalMissions, setGeneralMissions] = useState([
    { id: 3, title: 'Follow Basefy on X', points: 10, completed: false, link: 'https://x.com/Ai_tesnet' },
    { id: 4, title: 'Join Basefy Telegram', points: 15, completed: false, link: 'https://t.me/+_Iia7HvRuQQwMjRl' },
  ]);

  // LOGIKA REFERRAL 1: Deteksi & beri bonus jika user datang dari link referral orang lain
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref');
    
    if (referrer && referrer !== 'connect_your_wallet') {
      localStorage.setItem('basefy_referrer', referrer);
      
      const hasReceivedBonus = localStorage.getItem('basefy_ref_bonus_received');
      if (!hasReceivedBonus) {
        setPoints(prev => prev + 20); // Bonus +20 poin untuk user baru yang diajak
        localStorage.setItem('basefy_ref_bonus_received', 'true');
        alert(`Welcome to Basefy! You received +20P bonus from referrer: ${referrer.slice(0, 6)}...`);
      }
    }
  }, []);

  // Trigger signature request automatically when wallet connects
  useEffect(() => {
    const requestSignature = async () => {
      if (account) {
        const hasSigned = sessionStorage.getItem(`signed_${account.address}`);
        if (!hasSigned) {
          try {
            await account.signMessage({
              message: `Welcome to Basefy!\n\nSign this message to verify your wallet ownership.\n\nWallet: ${account.address}\nContract: ${SMART_CONTRACT_ADDRESS}`
            });
            sessionStorage.setItem(`signed_${account.address}`, "true");
            alert("Wallet successfully verified!");
          } catch (error) {
            console.error("Signature rejected", error);
            alert("Signature required to authenticate with Basefy.");
          }
        }
      }
    };

    requestSignature();
  }, [account]);

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

  // LOGIKA REFERRAL 2: Membuat link referral dinamis berdasarkan domain web & address user
  const getReferralLink = () => {
    const baseUrl = window.location.origin; 
    if (account) {
      return `${baseUrl}?ref=${account.address}`;
    }
    return `${baseUrl}?ref=connect_your_wallet`;
  };

  // Fungsi menyalin link referral ke keyboard HP
  const copyReferralLink = () => {
    if (!account) {
      alert("Please connect your wallet first to generate your unique referral link!");
      return;
    }
    navigator.clipboard.writeText(getReferralLink());
    alert("Referral link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#1a222d] text-white font-sans p-4 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <span className="text-sm font-bold tracking-wider text-[#0052FF]">Basefy</span>
        
        <ConnectButton
          client={client}
          chain={base}
          theme={"dark"}
          connectButton={{
            label: "Connect",
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
          <span className="underline cursor-pointer hover:text-blue-400">Earnings</span>
          <span className="underline cursor-pointer hover:text-blue-400">Submissions</span>
          <span className="underline cursor-pointer hover:text-blue-400">Referrals</span>
        </div>

        {/* Dynamic Referral Box */}
        <div className="bg-[#242e3d] rounded-xl p-3 flex flex-col gap-2 border border-gray-700/50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 truncate max-w-[85%] font-mono">
              {getReferralLink()}
            </p>
            <button className="text-gray-400 hover:text-white p-1 text-sm" onClick={copyReferralLink}>📋</button>
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
          Daily <span className="bg-[#0052FF]/20 text-[#0052FF] px-1.5 py-0.5 rounded text-xs ml-1">2</span>
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`w-1/2 pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'general' ? 'border-[#0052FF] text-white' : 'border-transparent text-gray-400'}`}
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
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${checkedIn ? 'bg-blue-950/40 text-blue-700/50 cursor-not-allowed border border-blue-900/20' : 'bg-[#0052FF] text-white hover:bg-blue-600'}`}
            >
              {checkedIn ? 'Checked in for today (+10p)' : 'Claim Daily Check-in'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Daily Mission</h3>
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
          <h3 className="text-lg font-bold mb-1">General Missions</h3>
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
                {mission.completed ? 'DONE' : 'GO'}
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
              
