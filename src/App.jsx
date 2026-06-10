import React, { useState, useEffect } from 'react';
import { createThirdwebClient, getContract, prepareContractCall, toWei } from "thirdweb";
import { ThirdwebProvider, ConnectButton, TransactionButton, useActiveAccount, MediaRenderer } from "thirdweb/react";
import { base } from "thirdweb/chains";
import nftImage from './IMG_20260608_232101.png'; // Gambar dari repositori GitHub kamu


// 1. Locked Smart Contract Address
const SMART_CONTRACT_ADDRESS = "0x5693B08eD075012E42caCeAB11AA53b07f227e35"; 

// 2. Variabel gambar mengarah ke berkas lokal
const NFT_IMAGE_URL = nftImage;

// Menggunakan Client ID asli milikmu
const client = createThirdwebClient({
  clientId: "ed3a5c20a7f83fbec44b6820f7e3f264" 
});

const contract = getContract({
  client,
  chain: base,
  address: SMART_CONTRACT_ADDRESS,
});

function BasefyApp() {
  const account = useActiveAccount(); 
  
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('basefy_points');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  const [activeTab, setActiveTab] = useState('daily');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInDays, setCheckInDays] = useState([true, false, false, true, false, false, false]);
  const [showDetails, setShowDetails] = useState(false); // State untuk accordion info NFT

  // State untuk Countdown Timer Misi
  const [countdownStr, setCountdownStr] = useState("12h 45m 00s");

  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: 'Comment on Basefy Post', points: 3, completed: false, link: 'https://x.com' },
    { id: 2, title: 'Like on Basefy Post', points: 3, completed: false, link: 'https://x.com' },
  ]);

  const [generalMissions, setGeneralMissions] = useState([
    { id: 3, title: 'Follow Basefy on X', points: 10, completed: false, link: 'https://x.com' },
    { id: 4, title: 'Join Basefy Telegram', points: 15, completed: false, link: 'https://t.me' },
  ]);

  // Data Simulasi Live Minter (5 Pembeli Terakhir)
  const [recentMints, setRecentMints] = useState([
    { address: "0x71C...a293", quantity: 1, time: "2m ago" },
    { address: "0x3Ac...9E11", quantity: 1, time: "5m ago" },
    { address: "0x892...F43b", quantity: 2, time: "12m ago" },
    { address: "0x5b1...44Cc", quantity: 1, time: "18m ago" },
    { address: "0xDe9...8A12", quantity: 1, time: "25m ago" },
  ]);

  // Efek Perhitungan Countdown Timer Misi Otomatis
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // Target tengah malam harian
      const diff = tomorrow - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownStr(
        `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref');
    
    if (referrer && referrer !== 'connect_your_wallet') {
      localStorage.setItem('basefy_referrer', referrer);
      const hasReceivedBonus = localStorage.getItem('basefy_ref_bonus_received');
      if (!hasReceivedBonus) {
        setPoints(prev => prev + 20); 
        localStorage.setItem('basefy_ref_bonus_received', 'true');
        alert(`Welcome to Basefy! You received +20P bonus from referrer.`);
      }
    }
  }, []);

  useEffect(() => {
    const requestSignature = async () => {
      if (account) {
        const hasSigned = sessionStorage.getItem(`signed_${account.address}`);
        if (!hasSigned) {
          try {
            await account.signMessage({
              message: `Welcome to Basefy!\n\nVerify wallet: ${account.address}`
            });
            sessionStorage.setItem(`signed_${account.address}`, "true");
          } catch (error) {
            console.error("Signature rejected", error);
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

  const getReferralLink = () => {
    const baseUrl = window.location.origin; 
    return account ? `${baseUrl}?ref=${account.address}` : `${baseUrl}?ref=connect_your_wallet`;
  };

  const copyReferralLink = () => {
    if (!account) return alert("Connect wallet first!");
    navigator.clipboard.writeText(getReferralLink());
    alert("Copied!");
  };

  return (
    <div className="min-h-screen bg-[#1a222d] text-white font-sans p-4 flex flex-col items-center selection:bg-[#0052FF]/30">
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <span className="text-sm font-extrabold tracking-wider text-[#0052FF] bg-[#0052FF]/10 px-3 py-1 rounded-md border border-[#0052FF]/20">Basefy</span>
        <ConnectButton client={client} chain={base} theme={"dark"} connectButton={{ label: "Connect", style: { backgroundColor: "#0052FF", color: "#ffffff", fontSize: "12px", fontWeight: "bold", borderRadius: "8px", padding: "6px 12px" }}} />
      </div>

      {/* Balance & Referral */}
      <div className="w-full max-w-md mb-4">
        <h1 className="text-4xl font-black tracking-wide mb-1">{points} <span className="text-[#0052FF] text-2xl font-bold">P</span></h1>
        <div className="flex gap-4 text-xs text-[#0052FF] font-medium mb-4">
          <span className="underline cursor-pointer opacity-80 hover:opacity-100">Earnings</span>
          <span className="underline cursor-pointer opacity-80 hover:opacity-100">Submissions</span>
          <span className="underline cursor-pointer opacity-80 hover:opacity-100">Referrals</span>
        </div>

        <div className="bg-[#242e3d] rounded-xl p-3 flex flex-col gap-2 border border-gray-700/50 mb-4 shadow-sm">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 truncate max-w-[85%] font-mono">{getReferralLink()}</p>
            <button className="text-gray-400 hover:text-white transition-colors" onClick={copyReferralLink}>📋</button>
          </div>
        </div>

        {/* --- PENINGKATAN: NFT MINTING SECTION DENGAN CYBERPUNK GLOW --- */}
        <div className="bg-[#242e3d] rounded-2xl overflow-hidden border border-[#0052FF]/40 shadow-[0_0_15px_rgba(0,82,255,0.15)] hover:shadow-[0_0_25px_rgba(0,82,255,0.25)] transition-all duration-300 transform hover:scale-[1.01] mb-6">
          {/* NFT Image Preview */}
          <div className="w-full aspect-square bg-black flex items-center justify-center relative group overflow-hidden">
            <MediaRenderer 
              client={client}
              src={NFT_IMAGE_URL}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              className="transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-[10px] text-green-400 font-extrabold px-2 py-1 rounded-md border border-green-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> MINT IS ACTIVE
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Basefy New User NFT</h3>
                <p className="text-xs text-gray-400">Exclusive NFT for 1000 Basefy members</p>
              </div>
              <div className="text-right">
                <p className="text-[#0052FF] font-black text-sm tracking-wide">0.001 ETH</p>
                <p className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">On Base</p>
              </div>
            </div>

            {/* PENINGKATAN 1: MINTING PROGRESS BAR */}
            <div className="mb-4 bg-[#1a222d] p-3 rounded-xl border border-gray-800">
              <div className="flex justify-between text-[11px] font-bold mb-1.5">
                <span className="text-gray-400">Minting Progress</span>
                <span className="text-[#0052FF]">34.2% <span className="text-gray-500 font-normal">(342 / 1,000)</span></span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0052FF] to-cyan-500 rounded-full shadow-[0_0_8px_rgba(0,82,255,0.6)]" style={{ width: '34.2%' }}></div>
              </div>
            </div>
            
            {/* Validasi Tombol Minting Aktif / Pasif */}
            {!account ? (
              <div className="w-full text-center bg-gray-800 text-gray-400 font-bold py-3 rounded-xl text-sm border border-gray-700/60 shadow-inner">
                Connect Wallet First to Mint
              </div>
            ) : (
              <TransactionButton
                transaction={() => prepareContractCall({
                  contract: contract,
                  method: "function claim(address receiver, uint256 quantity)",
                  params: [account.address, 1n], 
                  value: toWei("0.001"), 
                })}
                onTransactionConfirmed={() => {
                  alert("Success! NFT Minted.");
                  setPoints(prev => prev + 100);
                  
                  const userAddressShort = `${account.address.substring(0, 5)}...${account.address.substring(account.address.length - 4)}`;
                  const newMintLog = { address: userAddressShort, quantity: 1, time: "Just now" };
                  setRecentMints(prev => [newMintLog, ...prev.slice(0, 4)]);
                }}
                onError={(err) => {
                  console.error("Mint error details:", err);
                  alert("Transaction failed. Make sure you have enough ETH on Base Chain.");
                }}
                className="w-full font-bold py-3 rounded-xl transition-all text-sm active:scale-95 shadow-md shadow-[#0052FF]/20"
                style={{ backgroundColor: "#0052FF", color: "#ffffff", border: "none" }}
              >
                Mint NFT Now (0.001 ETH)
              </TransactionButton>
            )}

            {/* PENINGKATAN 2: NFT UTILITY & TECHNICAL ACCORDION */}
            <div className="mt-3 bg-[#1a222d] rounded-xl overflow-hidden border border-gray-800">
              <button 
                onClick={() => setShowDetails(!showDetails)} 
                className="w-full px-3 py-2.5 flex justify-between items-center text-xs text-gray-400 font-bold hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>💎</span> NFT Benefits & Tech Specs
                </div>
                <span>{showDetails ? "▲" : "▼"}</span>
              </button>
              
              {showDetails && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-800/60 text-[11px] text-gray-400 flex flex-col gap-2 bg-[#171e29]">
                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span>🔥 Perk Booster</span>
                    <span className="text-green-400 font-bold">+10% Multiplier Bonus Points</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span>📜 Smart Contract</span>
                    <a 
                      href={`https://basescan.org/address/${SMART_CONTRACT_ADDRESS}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#0052FF] font-mono hover:underline"
                    >
                      {SMART_CONTRACT_ADDRESS.substring(0,6)}...{SMART_CONTRACT_ADDRESS.substring(SMART_CONTRACT_ADDRESS.length-4)} ↗
                    </a>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>🛡️ Standard</span>
                    <span className="font-mono">ERC-721 Optimized Drop</span>
                  </div>
                </div>
              )}
            </div>

            {/* --- LIVE MINTER COMPONENT (5 RECENT MINTS) --- */}
            <div className="mt-4 pt-4 border-t border-gray-700/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Recent Mints</h4>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Auto-updating</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                {recentMints.map((mint, index) => (
                  <div key={index} className="flex justify-between items-center bg-[#1d2633] px-3 py-2 rounded-lg text-xs border border-gray-800/60 transition-all hover:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono">#</span>
                      <span className="font-mono text-gray-300 font-medium">{mint.address}</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="bg-[#0052FF]/10 text-[#0052FF] px-2 py-0.5 rounded text-[10px] font-bold">
                        {mint.quantity} NFT
                      </span>
                      <span className="text-gray-500 text-[11px]">{mint.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* --- END OF LIVE MINTER --- */}

          </div>
        </div>
      </div>

      {/* PENINGKATAN 3: MISSION TIMEOUT BAR WITH LIVE COUNTDOWN */}
      <div className="w-full max-w-md bg-[#242e3d]/60 border border-gray-800 rounded-xl px-3 py-2 flex justify-between items-center mb-4 text-xs">
        <div className="flex items-center gap-2 text-gray-400 font-semibold">
          <span>🕒</span> Mission Status
        </div>
        <div className="text-right font-mono text-[11px]">
          <span className="text-gray-400 mr-1">Resets in:</span>
          <span className="text-orange-400 font-bold">{countdownStr}</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="w-full max-w-md border-b border-gray-700/50 flex mb-4 text-center">
        <button onClick={() => setActiveTab('daily')} className={`w-1/2 pb-3 text-sm font-semibold border-b-2 ${activeTab === 'daily' ? 'border-[#0052FF] text-white' : 'border-transparent text-gray-400'}`}>Daily</button>
        <button onClick={() => setActiveTab('general')} className={`w-1/2 pb-3 text-sm font-semibold border-b-2 ${activeTab === 'general' ? 'border-[#0052FF] text-white' : 'border-transparent text-gray-400'}`}>General</button>
      </div>

      {/* Kondisi Konten Berdasarkan Tab yang Aktif */}
      {activeTab === 'daily' ? (
        <div className="w-full max-w-md">
          {/* Konten Daily Check-in */}
          <div className="bg-[#242e3d] rounded-2xl p-4 mb-6 border border-gray-700/50 shadow-sm">
            <h3 className="text-base font-bold mb-4 text-center">Daily Check-in</h3>
            <div className="flex justify-between mb-5 px-2">
              {checkInDays.map((status, index) => (
                <div key={index} className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs transition-colors ${status ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-gray-600 text-gray-500'}`}>✓</div>
              ))}
            </div>
            <button disabled={checkedIn} onClick={handleCheckIn} className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${checkedIn ? 'bg-blue-950/40 text-blue-700/50' : 'bg-[#0052FF] text-white active:scale-98'}`}>
              {checkedIn ? 'Already Claimed' : 'Claim Daily +10p'}
            </button>
          </div>
          
          {/* Misi Harian (Daily) */}
          <div className="flex flex-col gap-3">
             {dailyMissions.map((m) => (
              <div key={m.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50 hover:border-[#0052FF]/20 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-[#0052FF] shadow-inner">𝕏</div>
                  <div><p className="text-xs font-semibold">{m.title}</p><p className="text-[11px] text-gray-500">+{m.points} p</p></div>
                </div>
                <button disabled={m.completed} onClick={() => completeMission(m.id, 'daily', m.link, m.points)} className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors ${m.completed ? 'bg-gray-700 text-gray-500' : 'bg-[#0052FF] text-white'}`}>{m.completed ? 'DONE' : 'GO'}</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          {/* Misi Umum (General) */}
          <div className="flex flex-col gap-3">
             {generalMissions.map((m) => (
              <div key={m.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50 hover:border-[#0052FF]/20 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-[#0052FF] shadow-inner">𝕏</div>
                  <div><p className="text-xs font-semibold">{m.title}</p><p className="text-[11px] text-gray-500">+{m.points} p</p></div>
                </div>
                <button disabled={m.completed} onClick={() => completeMission(m.id, 'general', m.link, m.points)} className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors ${m.completed ? 'bg-gray-700 text-gray-500' : 'bg-[#0052FF] text-white'}`}>{m.completed ? 'DONE' : 'GO'}</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return ( <ThirdwebProvider> <BasefyApp /> </ThirdwebProvider> ); }
            
