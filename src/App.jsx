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

  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: 'Comment on Basefy Post', points: 3, completed: false, link: 'https://x.com' },
    { id: 2, title: 'Like on Basefy Post', points: 3, completed: false, link: 'https://x.com' },
  ]);

  const [generalMissions, setGeneralMissions] = useState([
    { id: 3, title: 'Follow Basefy on X', points: 10, completed: false, link: 'https://x.com' },
    { id: 4, title: 'Join Basefy Telegram', points: 15, completed: false, link: 'https://t.me' },
  ]);

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
    <div className="min-h-screen bg-[#1a222d] text-white font-sans p-4 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <span className="text-sm font-bold tracking-wider text-[#0052FF]">Basefy</span>
        <ConnectButton client={client} chain={base} theme={"dark"} connectButton={{ label: "Connect", style: { backgroundColor: "#0052FF", color: "#ffffff", fontSize: "12px", fontWeight: "bold", borderRadius: "8px", padding: "6px 12px" }}} />
      </div>

      {/* Balance & Referral */}
      <div className="w-full max-w-md mb-4">
        <h1 className="text-4xl font-black tracking-wide mb-1">{points} <span className="text-[#0052FF] text-2xl font-bold">P</span></h1>
        <div className="flex gap-4 text-xs text-[#0052FF] font-medium mb-4">
          <span className="underline">Earnings</span>
          <span className="underline">Submissions</span>
          <span className="underline">Referrals</span>
        </div>

        <div className="bg-[#242e3d] rounded-xl p-3 flex flex-col gap-2 border border-gray-700/50 mb-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 truncate max-w-[85%] font-mono">{getReferralLink()}</p>
            <button className="text-gray-400 hover:text-white" onClick={copyReferralLink}>📋</button>
          </div>
        </div>

        {/* --- NFT MINTING SECTION WITH IMAGE --- */}
        <div className="bg-[#242e3d] rounded-2xl overflow-hidden border border-[#0052FF]/30 shadow-lg mb-6">
          {/* NFT Image Preview */}
          <div className="w-full aspect-square bg-black flex items-center justify-center">
            <MediaRenderer 
              client={client}
              src={NFT_IMAGE_URL}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Basefy New User NFT</h3>
                <p className="text-xs text-gray-400">Exclusive NFT for the first 1000 users</p>
              </div>
              <div className="text-right">
                <p className="text-[#0052FF] font-bold text-sm">0.001 ETH</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">On Base</p>
              </div>
            </div>
            
            {/* Validasi Tombol Minting Aktif / Pasif */}
            {!account ? (
              <div className="w-full text-center bg-gray-800 text-gray-400 font-bold py-3 rounded-xl text-sm border border-gray-700">
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
                }}
                onError={(err) => {
                  console.error("Mint error details:", err);
                  alert("Transaction failed. Make sure you have enough ETH on Base Chain.");
                }}
                className="w-full font-bold py-3 rounded-xl transition-all text-sm"
                style={{ backgroundColor: "#0052FF", color: "#ffffff", border: "none" }}
              >
                Mint NFT Now (0.001 ETH)
              </TransactionButton>
            )}
          </div>
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
          <div className="bg-[#242e3d] rounded-2xl p-4 mb-6 border border-gray-700/50">
            <h3 className="text-base font-bold mb-4 text-center">Daily Check-in</h3>
            <div className="flex justify-between mb-5 px-2">
              {checkInDays.map((status, index) => (
                <div key={index} className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs ${status ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-gray-600 text-gray-500'}`}>✓</div>
              ))}
            </div>
            <button disabled={checkedIn} onClick={handleCheckIn} className={`w-full py-3 rounded-xl font-bold text-sm ${checkedIn ? 'bg-blue-950/40 text-blue-700/50' : 'bg-[#0052FF] text-white'}`}>
              {checkedIn ? 'Already Claimed' : 'Claim Daily +10p'}
            </button>
          </div>
          
          {/* Misi Harian (Daily) */}
          <div className="flex flex-col gap-3">
             {dailyMissions.map((m) => (
              <div key={m.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-[#0052FF]">𝕏</div>
                  <div><p className="text-xs font-semibold">{m.title}</p><p className="text-[11px] text-gray-500">+{m.points} p</p></div>
                </div>
                <button disabled={m.completed} onClick={() => completeMission(m.id, 'daily', m.link, m.points)} className={`font-bold text-xs px-4 py-2 rounded-lg ${m.completed ? 'bg-gray-700 text-gray-500' : 'bg-[#0052FF] text-white'}`}>{m.completed ? 'DONE' : 'GO'}</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          {/* Misi Umum (General) - Tampil saat tab General aktif */}
          <div className="flex flex-col gap-3">
             {generalMissions.map((m) => (
              <div key={m.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-[#0052FF]">𝕏</div>
                  <div><p className="text-xs font-semibold">{m.title}</p><p className="text-[11px] text-gray-500">+{m.points} p</p></div>
                </div>
                <button disabled={m.completed} onClick={() => completeMission(m.id, 'general', m.link, m.points)} className={`font-bold text-xs px-4 py-2 rounded-lg ${m.completed ? 'bg-gray-700 text-gray-500' : 'bg-[#0052FF] text-white'}`}>{m.completed ? 'DONE' : 'GO'}</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return ( <ThirdwebProvider> <BasefyApp /> </ThirdwebProvider> ); }
      
