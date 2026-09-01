import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  CheckCircle, 
  Zap, 
  Layers, 
  User, 
  ShieldCheck, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Percent,
  X
} from 'lucide-react';
import AnimatedAmount from './AnimatedAmount';
import { fallbackClients } from '../data/initialData';
import { updateClientTrade } from '../utils/clientCalc';

export default function FnOTrading({ summaryData, onSelectSymbolForTrade }) {
  const [underlying, setUnderlying] = useState('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('29 AUG 2026');
  const [viewMode, setViewMode] = useState('optionChain'); // 'optionChain' | 'futures' | 'strategies'

  // Load clients dynamically
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_clients_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return fallbackClients;
  });

  const [selectedClientId, setSelectedClientId] = useState('CLI-1001');
  const [orderToast, setOrderToast] = useState(null);

  // Selected Option for Order Modal
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractLots, setContractLots] = useState('2');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const activeClient = clients.find(c => c.clientId === selectedClientId) || clients[0] || fallbackClients[0];

  // Spot Prices
  const spotPrices = {
    'NIFTY': { spot: 24850.40, change: 145.20, changePercent: 0.59, lotSize: 25, pcr: 1.18, maxPain: 24800, iv: 12.8 },
    'BANKNIFTY': { spot: 51410.80, change: 280.40, changePercent: 0.55, lotSize: 15, pcr: 1.05, maxPain: 51300, iv: 14.2 },
    'FINNIFTY': { spot: 23650.00, change: 85.00, changePercent: 0.36, lotSize: 40, pcr: 0.98, maxPain: 23600, iv: 13.1 },
    'RELIANCE': { spot: 2980.50, change: 35.40, changePercent: 1.20, lotSize: 250, pcr: 1.22, maxPain: 2960, iv: 16.4 },
    'TATAMOTORS': { spot: 1045.20, change: 18.20, changePercent: 1.77, lotSize: 550, pcr: 1.34, maxPain: 1040, iv: 21.0 }
  };

  const currentSpot = spotPrices[underlying] || spotPrices['NIFTY'];

  // Dynamic Option Chain Generator around current spot
  const generateOptionChain = (spot, step = 50, count = 7) => {
    const base = Math.round(spot / step) * step;
    const strikes = [];
    for (let i = -count; i <= count; i++) {
      const strike = base + (i * step);
      const isAtm = strike === base;
      const isCallItm = strike < spot;
      const isPutItm = strike > spot;

      // Realistic Black-Scholes simulated Option Premiums
      const dist = strike - spot;
      const timeVal = 65 + Math.random() * 8;
      const callLtp = Math.max(1.5, Number((Math.max(0, -dist) + timeVal * Math.exp(-Math.abs(dist) / (spot * 0.04))).toFixed(2)));
      const putLtp = Math.max(1.5, Number((Math.max(0, dist) + timeVal * Math.exp(-Math.abs(dist) / (spot * 0.04))).toFixed(2)));

      strikes.push({
        strike,
        isAtm,
        isCallItm,
        isPutItm,
        call: {
          oi: Number((24.5 + Math.abs(i) * 3.2 + Math.random() * 4).toFixed(1)),
          oiChg: Number(((Math.random() - 0.4) * 18).toFixed(1)),
          volume: Math.round(45000 + Math.random() * 80000),
          iv: Number((currentSpot.iv + (Math.random() - 0.5) * 1.5).toFixed(1)),
          ltp: callLtp,
          change: Number(((Math.random() - 0.35) * 12).toFixed(2))
        },
        put: {
          oi: Number((28.2 + Math.abs(i) * 2.8 + Math.random() * 5).toFixed(1)),
          oiChg: Number(((Math.random() - 0.3) * 22).toFixed(1)),
          volume: Math.round(52000 + Math.random() * 95000),
          iv: Number((currentSpot.iv + (Math.random() - 0.5) * 1.5).toFixed(1)),
          ltp: putLtp,
          change: Number(((Math.random() - 0.6) * 10).toFixed(2))
        }
      });
    }
    return strikes;
  };

  const optionChain = generateOptionChain(
    currentSpot.spot, 
    underlying === 'BANKNIFTY' ? 100 : (underlying === 'TATAMOTORS' ? 10 : 50)
  );

  const futuresContracts = [
    {
      name: `${underlying} Current Month FUT`,
      expiry: '29 AUG 2026',
      ltp: +(currentSpot.spot * 1.0022).toFixed(2),
      fairValue: +(currentSpot.spot * 1.0018).toFixed(2),
      basis: +(currentSpot.spot * 0.0022).toFixed(2),
      oi: '1.42 Cr',
      volume: '4.85 Lk',
      lotSize: currentSpot.lotSize
    },
    {
      name: `${underlying} Next Month FUT`,
      expiry: '26 SEP 2026',
      ltp: +(currentSpot.spot * 1.0065).toFixed(2),
      fairValue: +(currentSpot.spot * 1.0055).toFixed(2),
      basis: +(currentSpot.spot * 0.0065).toFixed(2),
      oi: '68.5 Lk',
      volume: '1.20 Lk',
      lotSize: currentSpot.lotSize
    }
  ];

  const optionStrategies = [
    {
      name: 'Bull Call Spread',
      bias: 'Moderately Bullish',
      legs: [`Buy ATM Call (${Math.round(currentSpot.spot / 50) * 50} CE)`, `Sell OTM Call (${Math.round(currentSpot.spot / 50) * 50 + 150} CE)`],
      maxProfit: '₹7,450 / lot',
      maxLoss: '₹2,550 / lot',
      rrRatio: '1 : 2.92',
      breakeven: `${Math.round(currentSpot.spot / 50) * 50 + 51}`,
      marginReq: '₹32,500'
    },
    {
      name: 'Short Straddle (Theta Decay)',
      bias: 'Rangebound / Neutral',
      legs: [`Sell ATM Call (${Math.round(currentSpot.spot / 50) * 50} CE)`, `Sell ATM Put (${Math.round(currentSpot.spot / 50) * 50} PE)`],
      maxProfit: '₹9,800 / lot',
      maxLoss: 'Undefined (Use Stop-Loss)',
      rrRatio: 'High Probability (68%)',
      breakeven: `${Math.round(currentSpot.spot / 50) * 50 - 196} - ${Math.round(currentSpot.spot / 50) * 50 + 196}`,
      marginReq: '₹1,28,000'
    },
    {
      name: 'Iron Condor (Defined Risk)',
      bias: 'Sideways Expiry (Low IV)',
      legs: [`Buy OTM Put`, `Sell OTM Put`, `Sell OTM Call`, `Buy OTM Call`],
      maxProfit: '₹4,800 / lot',
      maxLoss: '₹3,200 / lot',
      rrRatio: '1 : 1.5',
      breakeven: '24,680 - 25,020',
      marginReq: '₹48,000'
    }
  ];

  const handleOpenOrder = (contractName, type, strike, price) => {
    setSelectedContract({
      name: `${underlying} ${strike} ${type}`,
      underlying,
      type,
      strike,
      price,
      lotSize: currentSpot.lotSize,
      side: 'BUY'
    });
    setIsOrderModalOpen(true);
  };

  const handleExecuteFnOOrder = (e) => {
    e.preventDefault();
    const lots = Number(contractLots) || 1;
    const totalQty = lots * selectedContract.lotSize;
    const totalVal = Math.round(totalQty * selectedContract.price);

    // Update Client Margin
    const updatedClient = updateClientTrade(activeClient, {
      symbol: `${selectedContract.name}`,
      companyName: `${selectedContract.name} Option`,
      exchange: 'NFO',
      sector: 'Derivatives (F&O)',
      side: selectedContract.side,
      quantity: totalQty,
      price: selectedContract.price
    });

    const cIdx = clients.findIndex(c => c.clientId === activeClient.clientId);
    if (cIdx >= 0) clients[cIdx] = updatedClient;
    const updatedList = [...clients];
    setClients(updatedList);
    localStorage.setItem('apex_clients_cache', JSON.stringify(updatedList));

    setIsOrderModalOpen(false);
    showToast(`Executed ${selectedContract.side} ${lots} Lots (${totalQty} Qty) of ${selectedContract.name} for ${activeClient.clientName} @ ₹${selectedContract.price}`);
  };

  const showToast = (msg) => {
    setOrderToast(msg);
    setTimeout(() => setOrderToast(null), 4500);
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4">
      {/* Toast Notification */}
      {orderToast && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border clean-card-subtle text-emerald-100 text-xs font-bold animate-in fade-in border-emerald-500/50">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{orderToast}</span>
        </div>
      )}

      {/* 1. Underlying Selector & Institutional Analytics Strip */}
      <div className="clean-card rounded-2xl p-4 space-y-3.5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
                F&O Derivatives Desk (Futures & Options)
              </h1>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border border-cyan-500/30">
                NSE DERIVATIVES (NFO)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Option Chain matrix, open interest clustering, multi-leg strategy deployment, and real-time futures spreads.
            </p>
          </div>

          {/* Client Selector for F&O */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <label className="text-xs text-slate-400 font-medium">Executing Client:</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-[#141d30] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner"
            >
              {clients.map(c => (
                <option key={c.clientId} value={c.clientId}>
                  {c.clientName} ({c.clientId}) - Free: ₹{Number(Math.max(0, c.cashMargin - c.utilizedMargin)).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Underlying Selector Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono-num text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'RELIANCE', 'TATAMOTORS'].map((sym) => {
              const sp = spotPrices[sym];
              const isSelected = underlying === sym;
              return (
                <button
                  key={sym}
                  onClick={() => setUnderlying(sym)}
                  className={`clean-btn flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                    isSelected
                      ? 'bg-cyan-600/30 text-white font-bold border-cyan-400/80 shadow-md shadow-cyan-900/40'
                      : 'bg-[#141d30]/80 hover:bg-[#1c2740] text-slate-300 border-white/10'
                  }`}
                >
                  <span className="font-semibold text-white font-sans">{sym}</span>
                  <span className="font-bold">
                    <AnimatedAmount value={sp.spot} />
                  </span>
                  <span className={`font-bold ${sp.change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                    {sp.change >= 0 ? '+' : ''}{sp.changePercent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expiry Selector & View Mode */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#101728]/80 rounded-xl p-1 border border-white/10 text-xs">
              {['optionChain', 'futures', 'strategies'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`clean-btn px-3 py-1.5 rounded-lg font-bold transition ${
                    viewMode === mode
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'optionChain' ? 'Option Chain' : mode === 'futures' ? 'Futures Desk' : 'Option Strategies'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-[#141d30] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="29 AUG 2026" className="bg-[#111827]">29 AUG (Weekly)</option>
                <option value="05 SEP 2026" className="bg-[#111827]">05 SEP (Weekly)</option>
                <option value="26 SEP 2026" className="bg-[#111827]">26 SEP (Monthly)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Derivatives Intelligence Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 font-mono-num text-xs">
          <div className="clean-card-subtle p-3 rounded-xl border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase font-sans">Spot CMP</div>
            <div className="text-base font-black text-white mt-0.5">
              <AnimatedAmount value={currentSpot.spot} />
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold font-sans">Lot Size: {currentSpot.lotSize} Qty</div>
          </div>

          <div className="clean-card-subtle p-3 rounded-xl border border-cyan-500/30">
            <div className="text-[10px] text-cyan-400 uppercase font-sans">Put-Call Ratio (PCR)</div>
            <div className="text-base font-black text-cyan-200 mt-0.5">{currentSpot.pcr}</div>
            <div className="text-[10px] text-cyan-400 font-sans">{currentSpot.pcr > 1 ? 'Bullish Structure' : 'Bearish / Neutral'}</div>
          </div>

          <div className="clean-card-subtle p-3 rounded-xl border border-amber-500/30">
            <div className="text-[10px] text-amber-400 uppercase font-sans">Max Pain Level</div>
            <div className="text-base font-black text-amber-300 mt-0.5">₹{currentSpot.maxPain.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-amber-400 font-sans">Highest Option Expiry Clustered</div>
          </div>

          <div className="clean-card-subtle p-3 rounded-xl border border-purple-500/30">
            <div className="text-[10px] text-purple-400 uppercase font-sans">Implied Volatility (IV)</div>
            <div className="text-base font-black text-purple-200 mt-0.5">{currentSpot.iv}%</div>
            <div className="text-[10px] text-slate-400 font-sans">India VIX: 13.42 (-2.54%)</div>
          </div>
        </div>
      </div>

      {/* 2. OPTION CHAIN VIEW */}
      {viewMode === 'optionChain' && (
        <div className="clean-card rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Live Option Chain Matrix: {underlying} ({selectedExpiry})</span>
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono-num">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40"></span>
                <span>ATM Strike</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-cyan-950/40 border border-cyan-800/40"></span>
                <span>ITM (In-The-Money)</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0c111e]/95 max-h-[500px] overflow-y-auto">
            <table className="w-full text-center text-xs">
              <thead className="sticky top-0 bg-[#162035]/95 backdrop-blur-md text-slate-300 font-semibold uppercase tracking-wider border-b border-white/10 z-20 text-[11px]">
                <tr>
                  <th colSpan="5" className="py-2 px-2 bg-emerald-950/40 text-[#10b981] border-r border-white/10">
                    CALL OPTIONS (CE)
                  </th>
                  <th className="py-2 px-4 bg-[#1e2a44] text-white">STRIKE</th>
                  <th colSpan="5" className="py-2 px-2 bg-rose-950/40 text-[#f43f5e] border-l border-white/10">
                    PUT OPTIONS (PE)
                  </th>
                </tr>
                <tr className="bg-[#121929] text-[10px] text-slate-400 border-b border-white/10 font-mono-num">
                  <th className="py-1.5 px-2">OI (Lk)</th>
                  <th className="py-1.5 px-2">Chg %</th>
                  <th className="py-1.5 px-2">Volume</th>
                  <th className="py-1.5 px-2">IV</th>
                  <th className="py-1.5 px-3 text-right">LTP (₹)</th>
                  <th className="py-1.5 px-4 bg-[#1e2a44] text-white">PRICE</th>
                  <th className="py-1.5 px-3 text-left">LTP (₹)</th>
                  <th className="py-1.5 px-2">IV</th>
                  <th className="py-1.5 px-2">Volume</th>
                  <th className="py-1.5 px-2">Chg %</th>
                  <th className="py-1.5 px-2">OI (Lk)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono-num text-[11px]">
                {optionChain.map((row) => {
                  return (
                    <tr 
                      key={row.strike}
                      className={`transition-colors ${
                        row.isAtm ? 'bg-amber-500/10 font-bold' : 'hover:bg-[#151f33]'
                      }`}
                    >
                      {/* CALL DATA */}
                      <td className={`py-2 px-2 text-slate-300 ${row.isCallItm ? 'bg-cyan-950/20' : ''}`}>{row.call.oi}</td>
                      <td className={`py-2 px-2 ${row.call.oiChg >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                        {row.call.oiChg >= 0 ? '+' : ''}{row.call.oiChg}%
                      </td>
                      <td className="py-2 px-2 text-slate-400">{row.call.volume.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 text-slate-400">{row.call.iv}</td>
                      <td className={`py-2 px-3 text-right font-bold text-emerald-300 border-r border-white/10 ${row.isCallItm ? 'bg-cyan-950/20' : ''}`}>
                        <button
                          onClick={() => handleOpenOrder(`${underlying} ${row.strike} CE`, 'CE', row.strike, row.call.ltp)}
                          className="clean-btn px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-[#10b981] text-[#10b981] hover:text-black font-bold border border-emerald-500/40 shadow-sm"
                        >
                          ₹{row.call.ltp}
                        </button>
                      </td>

                      {/* STRIKE PRICE */}
                      <td className={`py-2 px-4 font-black text-sm ${
                        row.isAtm 
                          ? 'bg-amber-500/30 text-amber-300 border-x-2 border-amber-400' 
                          : 'bg-[#182338] text-white border-x border-white/10'
                      }`}>
                        {row.strike} {row.isAtm && <span className="text-[9px] block text-amber-300 font-sans">ATM</span>}
                      </td>

                      {/* PUT DATA */}
                      <td className={`py-2 px-3 text-left font-bold text-rose-300 border-l border-white/10 ${row.isPutItm ? 'bg-cyan-950/20' : ''}`}>
                        <button
                          onClick={() => handleOpenOrder(`${underlying} ${row.strike} PE`, 'PE', row.strike, row.put.ltp)}
                          className="clean-btn px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-[#f43f5e] text-[#f43f5e] hover:text-white font-bold border border-rose-500/40 shadow-sm"
                        >
                          ₹{row.put.ltp}
                        </button>
                      </td>
                      <td className="py-2 px-2 text-slate-400">{row.put.iv}</td>
                      <td className="py-2 px-2 text-slate-400">{row.put.volume.toLocaleString('en-IN')}</td>
                      <td className={`py-2 px-2 ${row.put.oiChg >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                        {row.put.oiChg >= 0 ? '+' : ''}{row.put.oiChg}%
                      </td>
                      <td className={`py-2 px-2 text-slate-300 ${row.isPutItm ? 'bg-cyan-950/20' : ''}`}>{row.put.oi}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FUTURES VIEW */}
      {viewMode === 'futures' && (
        <div className="clean-card rounded-2xl p-4 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Futures Contracts Desk: {underlying}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futuresContracts.map((fut, idx) => (
              <div key={idx} className="clean-card-subtle rounded-2xl p-4.5 border border-white/10 space-y-3.5 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">{fut.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">Expiry: {fut.expiry} • Lot Size: {fut.lotSize} Qty</div>
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-0.5 rounded-lg font-bold font-mono-num border border-cyan-500/30">
                    NSE FUT
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#141d30] p-3 rounded-xl border border-white/5 font-mono-num text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Futures LTP</div>
                    <div className="text-base font-black text-white">₹{fut.ltp}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Fair Value</div>
                    <div className="text-sm font-bold text-[#10b981]">₹{fut.fairValue}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Basis Premium</div>
                    <div className="text-sm font-bold text-amber-300">+₹{fut.basis}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono-num text-slate-300">
                  <span>Open Interest: <strong className="text-white">{fut.oi}</strong></span>
                  <span>Volume: <strong className="text-cyan-300">{fut.volume}</strong></span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleOpenOrder(fut.name, 'FUT', 'FUT', fut.ltp)}
                    className="clean-btn py-2.5 rounded-xl bg-[#10b981] hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-950/40"
                  >
                    BUY LONG FUT
                  </button>
                  <button
                    onClick={() => handleOpenOrder(fut.name, 'FUT', 'FUT', fut.ltp)}
                    className="clean-btn py-2.5 rounded-xl bg-[#f43f5e] hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-950/40"
                  >
                    SELL SHORT FUT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. OPTION STRATEGIES VIEW */}
      {viewMode === 'strategies' && (
        <div className="clean-card rounded-2xl p-4 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Multi-Leg Option Strategies ({underlying})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {optionStrategies.map((strat, idx) => (
              <div key={idx} className="clean-card-subtle rounded-2xl p-4.5 border border-white/10 space-y-3 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-black text-white">{strat.name}</h3>
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-purple-500/30">
                      {strat.bias}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3 bg-[#141d30] p-3 rounded-xl border border-white/5 text-xs">
                    <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold mb-1">Strategy Legs</div>
                    {strat.legs.map((leg, lIdx) => (
                      <div key={lIdx} className="text-slate-200 flex items-center gap-1.5 font-mono-num">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{leg}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-num bg-[#101728] p-2.5 rounded-xl border border-white/5">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Max Profit</div>
                      <div className="font-bold text-[#10b981]">{strat.maxProfit}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Max Loss</div>
                      <div className="font-bold text-[#f43f5e]">{strat.maxLoss}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Breakeven</div>
                      <div className="font-bold text-white">{strat.breakeven}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Margin Req.</div>
                      <div className="font-bold text-amber-300">{strat.marginReq}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => showToast(`Multi-Leg Strategy "${strat.name}" deployed for ${activeClient.clientName}`)}
                  className="clean-btn w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md mt-2"
                >
                  Deploy Strategy for {activeClient.clientName.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Execution Modal for Option / Future */}
      {isOrderModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="clean-card rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <h3 className="text-base font-bold text-white">{selectedContract.name}</h3>
                <span className="text-[10px] text-cyan-300 font-mono-num">Executing for {activeClient.clientName}</span>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteFnOOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#141d30] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedContract({...selectedContract, side: 'BUY'})}
                  className={`clean-btn py-2 rounded-lg font-bold text-center transition ${
                    selectedContract.side === 'BUY' ? 'bg-[#10b981] text-black shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedContract({...selectedContract, side: 'SELL'})}
                  className={`clean-btn py-2 rounded-lg font-bold text-center transition ${
                    selectedContract.side === 'SELL' ? 'bg-[#f43f5e] text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Number of Lots (Lot Size: {selectedContract.lotSize} Qty)</label>
                <input
                  type="text"
                  required
                  value={contractLots}
                  onChange={(e) => setContractLots(e.target.value)}
                  className="w-full bg-[#141d30] border border-white/10 rounded-xl px-3 py-2 text-white font-mono-num font-bold focus:outline-none focus:border-cyan-500 shadow-inner"
                />
                <div className="text-[10px] text-slate-400 mt-1 font-mono-num">
                  Total Quantity: <strong className="text-white">{(Number(contractLots) || 0) * selectedContract.lotSize} Shares</strong>
                </div>
              </div>

              <div className="bg-[#101728] p-3 rounded-xl border border-white/10 space-y-1.5 font-mono-num text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">Premium Price:</span>
                  <span className="font-bold text-white">₹{selectedContract.price}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">Total Order Value:</span>
                  <span className="font-bold text-[#10b981]">
                    ₹{((Number(contractLots) || 0) * selectedContract.lotSize * selectedContract.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-white/10">
                  <span className="font-sans">Client Margin:</span>
                  <span className="font-bold text-amber-300">₹{Number(Math.max(0, activeClient.cashMargin - activeClient.utilizedMargin)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="clean-btn px-3.5 py-1.5 bg-[#182234] text-slate-300 rounded-xl hover:bg-[#202d44]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`clean-btn px-4 py-2 font-bold rounded-xl shadow-md ${
                    selectedContract.side === 'BUY' ? 'bg-[#10b981] text-black' : 'bg-[#f43f5e] text-white'
                  }`}
                >
                  Confirm {selectedContract.side}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
