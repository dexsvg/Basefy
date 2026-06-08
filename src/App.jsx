import React, { useState } from 'react';

export default function App() {
  const [points, setPoints] = useState(68);
  const [checkedIn, setCheckedIn] = useState(true);

  const dailyMissions = [
    { id: 1, title: 'Comment on Basefy Post (3p)', points: 3 },
    { id: 2, title: 'Like on Basefy Post (3p)', points: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#1a222d] text-white font-sans p-4 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-bold tracking-wider">Basefy</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm text-black">
          B
        </div>
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

        {/* Referral Link Input */}
        <div className="bg-[#242e3d] rounded-xl p-3 flex justify-between items-center border border-gray-700/50">
          <p className="text-xs text-gray-400 truncate max-w-[80%]">
            https://basefy.app/start=ref_7022104...
          </p>
          <button 
            className="text-gray-400 hover:text-white p-1 transition-colors"
            onClick={() => alert('Link copied!')}
          >
            📋
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-md border-b border-gray-700/50 flex mb-4">
        <button className="w-1/2 pb-3 text-sm font-semibold border-b-2 border-orange-500 text-white">
          Daily <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-xs ml-1">5</span>
        </button>
        <button className="w-1/2 pb-3 text-sm font-semibold text-gray-400 border-b-2 border-transparent">
          General <span className="bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded text-xs ml-1">6</span>
        </button>
      </div>

      <p className="w-full max-w-md text-[11px] text-gray-500 mb-4">
        Daily missions reset by timezone: Asia/Seoul
      </p>

      {/* Daily Check-in Card */}
      <div className="w-full max-w-md bg-[#242e3d] rounded-2xl p-4 mb-6 border border-gray-700/50">
        <h3 className="text-base font-bold mb-4">Daily Check-in</h3>
        
        {/* Status Lingkaran */}
        <div className="flex justify-between mb-5">
          {[true, false, false, true, false, false, true].map((status, index) => (
            <div 
              key={index} 
              className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs
                ${status ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-gray-600 text-gray-500'}`}
            >
              ✓
            </div>
          ))}
        </div>

        <button 
          disabled={checkedIn}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all
            ${checkedIn ? 'bg-orange-950/40 text-orange-700/60 cursor-not-allowed border border-orange-900/30' : 'bg-orange-500 text-black hover:bg-orange-400'}`}
        >
          {checkedIn ? 'Checked in for today' : 'Check-in'}
        </button>
      </div>

      {/* Mission List */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <h3 className="text-lg font-bold">Daily Mission <span className="text-orange-500 text-sm">4</span></h3>
        
        {dailyMissions.map((mission) => (
          <div key={mission.id} className="bg-[#242e3d] rounded-xl p-4 flex justify-between items-center border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-orange-500">
                𝕏
              </div>
              <div>
                <p className="text-xs font-semibold">{mission.title}</p>
                <p className="text-[11px] text-gray-500">Complete task to earn {mission.points}p</p>
              </div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors">
              GO
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

