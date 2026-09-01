import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  User, 
  LogOut, 
  Bot, 
  ChevronDown, 
  Briefcase, 
  LineChart, 
  SlidersHorizontal, 
  Newspaper, 
  Layers
} from 'lucide-react';
import AnimatedAmount from './AnimatedAmount';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  summaryData, 
  currentUser, 
  onOpenAuth, 
  onLogout, 
  onOpenAiChat
}) {
  const [time, setTime] = useState(new Date());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIST = (d) => {
    return d.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const navItems = [
    { id: 'portfolio', label: 'Portfolio', count: '21', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'trading', label: 'Trading Terminal', icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: 'fno', label: 'F&O Trading', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'news', label: 'News', icon: <Newspaper className="w-3.5 h-3.5" /> },
    { id: 'ipo', label: 'IPO', icon: <Layers className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b1120] border-b border-[#1e293b]">
      {/* 1. Clean Live Ticker Bar */}
      <div className="bg-[#070c18] border-b border-[#1e293b] py-1.5 px-4 sm:px-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 pr-4 border-r border-[#1e293b] shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-emerald-400 text-[11px] tracking-wider uppercase font-mono-num">
            LIVE
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative mx-4">
          <div className="flex whitespace-nowrap animate-marquee gap-8 font-mono-num text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">NIFTY 50:</span> 24,850.40 
              <span className="text-emerald-400 font-bold">(+145.20 / +0.59%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">SENSEX:</span> 81,200.15 
              <span className="text-emerald-400 font-bold">(+420.30 / +0.52%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">BANK NIFTY:</span> 51,410.80 
              <span className="text-emerald-400 font-bold">(+280.40 / +0.55%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">RELIANCE:</span> ₹2,980.50 
              <span className="text-emerald-400 font-bold">(+1.20%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">TATA MOTORS:</span> ₹1,045.20 
              <span className="text-emerald-400 font-bold">(+1.77%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">TCS:</span> ₹4,220.00 
              <span className="text-emerald-400 font-bold">(+0.58%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">HDFC BANK:</span> ₹1,680.00 
              <span className="text-rose-400 font-bold">(-0.50%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">INFOSYS:</span> ₹1,780.00 
              <span className="text-emerald-400 font-bold">(+0.72%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">ICICI BANK:</span> ₹1,245.00 
              <span className="text-emerald-400 font-bold">(+0.92%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">ZOMATO:</span> ₹254.23 
              <span className="text-emerald-400 font-bold">(+1.92%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">INDIA VIX:</span> 13.42 
              <span className="text-rose-400 font-bold">(-0.35 / -2.54%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-white">USD/INR:</span> 83.94 
              <span className="text-slate-400">(-0.02)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-[#1e293b] shrink-0 font-mono-num text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>IST {formatIST(time)}</span>
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-emerald-500/20">
            MARKET OPEN
          </span>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo: APEX */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('portfolio')} 
            title="APEX Portfolio Desk"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-wider text-white font-sans">
              APEX
            </span>
          </div>

          {/* Clean, Well-Spaced Navigation Tabs */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-4 lg:mx-8 gap-1.5 h-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`clean-btn h-9 px-3.5 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 rounded-lg transition ${
                    isActive
                      ? 'text-white font-bold bg-[#1e293b] border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#151e30]'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.count && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-num font-bold ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Profile / Auth + Apex Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="clean-btn flex items-center gap-2 bg-[#151e30] hover:bg-[#1e293b] border border-[#1e293b] px-3 py-1.5 rounded-lg text-xs transition"
                >
                  <div className="w-6 h-6 rounded-md bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.avatar || 'AP'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-white text-[11px] leading-tight">{currentUser.name}</div>
                    <div className="text-[9px] text-emerald-400 leading-tight font-mono-num">{currentUser.role || 'Chief Wealth Advisor'}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#1e293b]">
                      <div className="font-bold text-white">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="clean-btn w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="clean-btn px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenAuth}
                  className="clean-btn px-3.5 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Apex Strategy Drawer Launcher */}
            <button
              onClick={onOpenAiChat}
              className="clean-btn flex items-center gap-1.5 bg-[#151e30] hover:bg-[#1e293b] border border-[#1e293b] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              title="Open Apex Strategy Advisor"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Apex</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
