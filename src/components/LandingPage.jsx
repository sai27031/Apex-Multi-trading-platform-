import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Zap, 
  Activity, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  BarChart3, 
  Lock, 
  Layers, 
  Globe, 
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react';
import AnimatedAmount from './AnimatedAmount';

export default function LandingPage({ onEnterTerminal, onOpenAuth }) {
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  const marketPulse = [
    { name: 'NIFTY 50', price: 24850.40, change: '+145.20 (+0.59%)', up: true },
    { name: 'SENSEX', price: 81200.15, change: '+420.30 (+0.52%)', up: true },
    { name: 'BANK NIFTY', price: 51410.80, change: '+280.40 (+0.55%)', up: true },
    { name: 'INDIA VIX', price: 13.42, change: '-0.35 (-2.54%)', up: false },
    { name: 'RELIANCE', price: 2980.50, change: '+1.20%', up: true },
    { name: 'TATA MOTORS', price: 1045.20, change: '+1.77%', up: true }
  ];

  const features = [
    {
      icon: <Users className="w-5 h-5 text-amber-400" />,
      title: '20+ Multi-Client Single-Pane Management',
      desc: 'Eliminate the friction of opening multiple browser tabs. Monitor total consolidated AUM, individual cash margins, and live stock positions across all clients in one unified master dashboard.'
    },
    {
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      title: 'F&O Derivatives & Option Chain Desk',
      desc: 'Real-time Option Chain matrix for NIFTY, BANK NIFTY, FINNIFTY, and equities. Visual ATM/ITM strike clusters, Greeks, and 1-click multi-leg spread execution.'
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      title: 'Real-Time TradingView Studio',
      desc: 'Edge-to-edge fluid candlestick charts with 100+ technical indicators, live market depth ladders, and instant CNC/MIS order execution.'
    },
    {
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      title: 'Apex Quantitative Strategy Advisor',
      desc: 'Algorithmic market intelligence delivering high-conviction alpha stock picks, portfolio risk audit, and tactical allocation suggestions.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col selection:bg-cyan-600 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* 1. Sleek Landing Navbar - STRICTLY APEX */}
      <header className="sticky top-0 z-40 clean-card-subtle border-b border-white/10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/50 border border-white/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-wider text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-200">
              APEX
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth && onOpenAuth('signin')}
              className="clean-btn px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth && onOpenAuth('signup')}
              className="clean-btn px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-950/60 border border-cyan-400/30 transition flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-12 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clean-card-subtle border border-cyan-500/30 text-cyan-300 text-xs font-medium animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Unified Multi-Client Trading Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] font-sans">
          Manage 20+ Client Portfolios <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
            In A Single Liquid Terminal
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
          The unified wealth management platform for Fund Managers, Wealth Desks, and Quantitative Traders. 
          Real-time NSE/BSE streaming, Derivatives Option Chains, TradingView charts, and Algorithmic Alpha insights.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onOpenAuth && onOpenAuth('signup')}
            className="clean-btn w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm rounded-2xl shadow-2xl shadow-cyan-900/60 border border-white/25 flex items-center justify-center gap-2"
          >
            <span>Create Account & Enter Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onEnterTerminal}
            className="clean-btn w-full sm:w-auto px-6 py-3.5 bg-[#141d30]/90 hover:bg-[#1c2740] text-slate-200 font-bold text-sm rounded-2xl border border-white/15 backdrop-blur-xl flex items-center justify-center gap-2 shadow-md"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Launch Guest Terminal</span>
          </button>
        </div>

        {/* Live Market Ticker Pill */}
        <div className="clean-card-subtle rounded-2xl p-3 border border-white/10 max-w-4xl mx-auto shadow-xl">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar font-mono-num text-xs">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              Live NSE/BSE Feeds:
            </span>
            {marketPulse.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 bg-[#141d30]/80 px-3 py-1.5 rounded-xl border border-white/5">
                <span className="font-semibold text-white font-sans">{m.name}</span>
                <span className="font-bold text-slate-200">
                  <AnimatedAmount value={m.price} />
                </span>
                <span className={`font-semibold ${m.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Interactive Liquid Glass Terminal Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 relative z-10">
        <div className="clean-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono-num">
                LIVE INTERACTIVE PLATFORM SNAPSHOT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
                Consolidated Multi-Client Wealth Intelligence
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/15 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                ● 21 Portfolios Connected
              </span>
              <button
                onClick={onEnterTerminal}
                className="clean-btn bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <span>Open Terminal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metric Cards Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 font-mono-num text-xs">
            <div className="clean-card-subtle p-4 rounded-2xl border border-white/10">
              <div className="text-[11px] text-slate-400 font-sans uppercase">Total Firm AUM</div>
              <div className="text-xl font-black text-white mt-1">₹7,85,26,050</div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-sans">+₹1.59 Cr Net Gain</div>
            </div>

            <div className="clean-card-subtle p-4 rounded-2xl border border-cyan-500/30">
              <div className="text-[11px] text-cyan-300 font-sans uppercase">Today's Shift</div>
              <div className="text-xl font-black text-cyan-200 mt-1">+₹9,02,600</div>
              <div className="text-[10px] text-cyan-400 font-sans">+0.84% Day Gain</div>
            </div>

            <div className="clean-card-subtle p-4 rounded-2xl border border-amber-500/30">
              <div className="text-[11px] text-amber-300 font-sans uppercase">Free Cash Margin</div>
              <div className="text-xl font-black text-amber-300 mt-1">₹81,95,000</div>
              <div className="text-[10px] text-slate-400 font-sans">Ready for Deployment</div>
            </div>

            <div className="clean-card-subtle p-4 rounded-2xl border border-purple-500/30">
              <div className="text-[11px] text-purple-300 font-sans uppercase">Derivatives Volume</div>
              <div className="text-xl font-black text-purple-200 mt-1">1.42 Cr OI</div>
              <div className="text-[10px] text-slate-400 font-sans">NIFTY 24,850 PCR: 1.18</div>
            </div>
          </div>

          {/* Feature Grid inside Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {features.map((f, i) => (
              <div 
                key={i}
                className="clean-card-subtle p-4 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all space-y-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Security & Compliance Footer Strip */}
      <section className="border-t border-white/10 bg-[#070a13] py-8 px-4 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Bank-Grade 256-Bit Encrypted Security</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>NSE & BSE Real-Time Feed</span>
            <span>•</span>
            <span>TradingView Real-Time Engine</span>
            <span>•</span>
            <span>Apex Quantitative Analytics</span>
          </div>
        </div>
      </section>
    </div>
  );
}
