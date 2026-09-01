import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  User, 
  Activity, 
  PieChart, 
  Eye, 
  CheckCircle,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  Sliders,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { clientService, tradingService } from '../services/api';
import { fallbackClients } from '../data/initialData';
import { updateClientTrade } from '../utils/clientCalc';
import AnimatedAmount from './AnimatedAmount';

export default function MultiClientPortfolio({ summaryData, onRefreshSummary, onSelectClientForTrade }) {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('ALL');
  const [summaryMode, setSummaryMode] = useState('client');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [tradeToast, setTradeToast] = useState(null);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Oil & Gas / Energy',
    side: 'BUY',
    quantity: '10',
    price: 2980.50
  });

  const [newClientForm, setNewClientForm] = useState({
    clientName: '',
    email: '',
    phone: '',
    accountType: 'HNI',
    riskProfile: 'Moderate',
    cashMargin: 2500000,
    firmDesk: 'Apex Alpha Desk'
  });

  const loadBackendClients = async () => {
    try {
      const res = await clientService.getAllClients();
      if (res.data?.data && res.data.data.length > 0) {
        const backendClients = res.data.data;
        const localSaved = JSON.parse(localStorage.getItem('apex_clients_cache') || '[]');
        const customClients = localSaved.filter(lc => !backendClients.some(bc => bc.clientId === lc.clientId));
        const combined = [...customClients, ...backendClients];
        setClients(combined);
        localStorage.setItem('apex_clients_cache', JSON.stringify(combined));
      }
    } catch (err) {
      console.log('Using local client dataset');
    }
  };

  useEffect(() => {
    loadBackendClients();
  }, []);

  const selectedClient = clients.find(c => c.clientId === selectedClientId) || clients[0] || fallbackClients[0];

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedAccountType === 'ALL' || c.accountType.toLowerCase() === selectedAccountType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const firmSummary = clients.reduce((acc, curr) => {
    acc.totalAumInvested += (curr.totalInvested || 0);
    acc.totalCurrentAum += (curr.currentValue || 0);
    acc.totalNetPnl += (curr.totalPnl || 0);
    acc.totalDayPnl += (curr.dailyPnl || 0);
    acc.totalCashMargin += (curr.cashMargin || 0);
    acc.totalUtilizedMargin += (curr.utilizedMargin || 0);
    return acc;
  }, {
    totalAumInvested: 0,
    totalCurrentAum: 0,
    totalNetPnl: 0,
    totalDayPnl: 0,
    totalCashMargin: 0,
    totalUtilizedMargin: 0
  });

  const totalFirmFreeMargin = Math.max(0, firmSummary.totalCashMargin - firmSummary.totalUtilizedMargin);
  const firmNetPnlPercent = firmSummary.totalAumInvested > 0 
    ? Number(((firmSummary.totalNetPnl / firmSummary.totalAumInvested) * 100).toFixed(2)) 
    : 0;
  const firmDayPnlPercent = firmSummary.totalCurrentAum > 0 
    ? Number(((firmSummary.totalDayPnl / firmSummary.totalCurrentAum) * 100).toFixed(2)) 
    : 0;

  const clientFreeMargin = selectedClient ? Math.max(0, selectedClient.cashMargin - selectedClient.utilizedMargin) : 0;

  const activeMetrics = summaryMode === 'client' && selectedClient ? {
    title: `Metrics: ${selectedClient.clientName} (${selectedClient.clientId})`,
    badge: `${selectedClient.accountType} • ${selectedClient.riskProfile} Risk`,
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    invested: selectedClient.totalInvested,
    investedSub: `${selectedClient.holdings?.length || 0} Stock Positions`,
    currentVal: selectedClient.currentValue,
    currentValSub: `+₹${((selectedClient.currentValue - selectedClient.totalInvested)/100000).toFixed(2)}L Net Gain`,
    netPnl: selectedClient.totalPnl,
    netPnlPercent: selectedClient.totalPnlPercent,
    dailyPnl: selectedClient.dailyPnl,
    dailyPnlPercent: selectedClient.dailyPnlPercent,
    freeMargin: clientFreeMargin,
    utilizedMargin: selectedClient.utilizedMargin
  } : {
    title: `Consolidated Firm Portfolio (All ${clients.length} Clients)`,
    badge: `Enterprise Desk Aggregate`,
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    invested: firmSummary.totalAumInvested,
    investedSub: `Across ${clients.length} Master Accounts`,
    currentVal: firmSummary.totalCurrentAum,
    currentValSub: `+₹${((firmSummary.totalCurrentAum - firmSummary.totalAumInvested)/100000).toFixed(2)}L Firm Gain`,
    netPnl: firmSummary.totalNetPnl,
    netPnlPercent: firmNetPnlPercent,
    dailyPnl: firmSummary.totalDayPnl,
    dailyPnlPercent: firmDayPnlPercent,
    freeMargin: totalFirmFreeMargin,
    utilizedMargin: firmSummary.totalUtilizedMargin
  };

  const handleCreateNewClient = async (e) => {
    e.preventDefault();
    const newId = `CLI-${1020 + clients.length + 1}`;

    const newClient = {
      clientId: newId,
      clientName: newClientForm.clientName || 'New Client',
      email: newClientForm.email || `${newClientForm.clientName.toLowerCase().replace(/\s+/g, '')}@apexwealth.in`,
      phone: newClientForm.phone || '+91 98201 99882',
      accountType: newClientForm.accountType,
      riskProfile: newClientForm.riskProfile,
      totalInvested: 0,
      currentValue: 0,
      totalPnl: 0,
      totalPnlPercent: 0,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      cashMargin: Number(newClientForm.cashMargin) || 1000000,
      utilizedMargin: 0,
      firmDesk: newClientForm.firmDesk,
      holdings: [
        {
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries Ltd',
          exchange: 'NSE',
          sector: 'Energy',
          quantity: 100,
          avgBuyPrice: 2850.00,
          currentPrice: 2980.50,
          investedValue: 285000,
          currentValue: 298050,
          unrealizedPnl: 13050,
          unrealizedPnlPercent: 4.58,
          dayChange: 35.40,
          dayChangePercent: 1.20
        }
      ]
    };

    const initialInv = 285000;
    const initialCur = 298050;
    newClient.totalInvested = initialInv;
    newClient.currentValue = initialCur;
    newClient.totalPnl = initialCur - initialInv;
    newClient.totalPnlPercent = Number(((newClient.totalPnl / initialInv) * 100).toFixed(2));
    newClient.dailyPnl = 3540;
    newClient.dailyPnlPercent = 1.20;

    const updated = [newClient, ...clients];
    setClients(updated);
    localStorage.setItem('apex_clients_cache', JSON.stringify(updated));
    setSelectedClientId(newId);
    setIsAddClientModalOpen(false);
    showNotification(`Successfully onboarded client ${newClient.clientName} (${newId})`);
    onRefreshSummary?.();

    try {
      await clientService.createClient(newClientForm);
    } catch (err) {}
  };

  const handleOpenTradeModal = (holding, action = 'BUY') => {
    const sym = holding ? holding.symbol : 'RELIANCE';
    const cName = holding ? holding.companyName : 'Reliance Industries Ltd';
    const pr = holding ? holding.currentPrice : 2980.50;
    const initialQty = action === 'SELL' && holding ? String(holding.quantity) : '10';

    setTradeForm({
      symbol: sym,
      companyName: cName,
      exchange: holding ? holding.exchange : 'NSE',
      sector: holding ? holding.sector : 'General',
      side: action,
      quantity: initialQty,
      price: pr
    });
    setIsTradeModalOpen(true);
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    const qty = Number(tradeForm.quantity);
    const pr = Number(tradeForm.price);
    if (!qty || qty <= 0) {
      showNotification('Please enter a valid quantity', 'error');
      return;
    }

    if (tradeForm.side === 'SELL' && qty > availableSharesToSell && availableSharesToSell > 0) {
      showNotification(`Cannot sell more than available holding (${availableSharesToSell} shares)`, 'error');
      return;
    }

    const updatedClient = updateClientTrade(selectedClient, {
      symbol: tradeForm.symbol,
      companyName: tradeForm.companyName,
      exchange: tradeForm.exchange,
      sector: tradeForm.sector,
      side: tradeForm.side,
      quantity: qty,
      price: pr
    });

    const cIdx = clients.findIndex(c => c.clientId === selectedClient.clientId);
    if (cIdx >= 0) {
      clients[cIdx] = updatedClient;
    }

    const updatedList = [...clients];
    setClients(updatedList);
    localStorage.setItem('apex_clients_cache', JSON.stringify(updatedList));
    setIsTradeModalOpen(false);
    showNotification(`Executed ${tradeForm.side} ${qty} shares of ${tradeForm.symbol} for ${selectedClient.clientName}`);
    onRefreshSummary?.();

    try {
      await tradingService.placeOrder({
        clientId: selectedClient.clientId,
        clientName: selectedClient.clientName,
        symbol: tradeForm.symbol,
        exchange: tradeForm.exchange,
        side: tradeForm.side,
        orderType: 'MARKET',
        product: 'CNC',
        quantity: qty,
        price: pr
      });
    } catch (err) {}
  };

  const showNotification = (msg, type = 'success') => {
    setTradeToast({ msg, type });
    setTimeout(() => setTradeToast(null), 4000);
  };

  const activeHoldingForTrade = selectedClient?.holdings?.find(h => h.symbol === tradeForm.symbol);
  const availableSharesToSell = activeHoldingForTrade ? activeHoldingForTrade.quantity : 0;

  return (
    <div className="w-full px-4 sm:px-8 py-6 space-y-6">
      {/* Toast Notification */}
      {tradeToast && (
        <div className={`fixed top-16 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-xs font-semibold clean-card animate-in fade-in ${
          tradeToast.type === 'error' ? 'border-rose-500 text-rose-200' : 'border-emerald-500 text-emerald-200'
        }`}>
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{tradeToast.msg}</span>
          <button onClick={() => setTradeToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Spacious Metrics Section */}
      <div className="clean-card rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                {activeMetrics.title}
              </h1>
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border ${activeMetrics.badgeColor}`}>
                {activeMetrics.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Consolidated real-time wealth valuation and margin analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-[#0b1120] rounded-xl p-1 border border-[#1e293b] text-xs">
              <button
                onClick={() => setSummaryMode('client')}
                className={`clean-btn flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition ${
                  summaryMode === 'client' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Selected Client</span>
              </button>
              <button
                onClick={() => setSummaryMode('firm')}
                className={`clean-btn flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition ${
                  summaryMode === 'firm' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Firm Aggregate ({clients.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="clean-btn flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Client</span>
            </button>
          </div>
        </div>

        {/* 5 Well-Proportioned, Spacious Metrics Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 pt-1 font-mono-num text-xs">
          <div className="bg-[#0b1120] p-5 rounded-2xl border border-[#1e293b] hover:border-slate-600 transition shadow-sm space-y-1.5">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-sans font-semibold">Total Invested</div>
            <div className="text-2xl font-black text-white mt-1">
              <AnimatedAmount value={activeMetrics.invested} />
            </div>
            <div className="text-[11px] text-slate-400 font-sans pt-1">{activeMetrics.investedSub}</div>
          </div>

          <div className="bg-[#0b1120] p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition shadow-sm space-y-1.5">
            <div className="text-xs text-cyan-400 uppercase tracking-wider font-sans font-semibold">Current Valuation</div>
            <div className="text-2xl font-black text-cyan-200 mt-1">
              <AnimatedAmount value={activeMetrics.currentVal} />
            </div>
            <div className="text-[11px] text-cyan-300 font-sans font-medium pt-1">{activeMetrics.currentValSub}</div>
          </div>

          <div className="bg-[#0b1120] p-5 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 transition shadow-sm space-y-1.5">
            <div className="text-xs text-emerald-400 uppercase tracking-wider font-sans font-semibold">Total Net P&L</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">
              <AnimatedAmount value={activeMetrics.netPnl} />
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold font-sans pt-1">
              +{activeMetrics.netPnlPercent}% All-Time
            </div>
          </div>

          <div className="bg-[#0b1120] p-5 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition shadow-sm space-y-1.5">
            <div className="text-xs text-amber-400 uppercase tracking-wider font-sans font-semibold">Today's Daily P&L</div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              <AnimatedAmount value={activeMetrics.dailyPnl} />
            </div>
            <div className="text-[11px] text-amber-400 font-semibold font-sans pt-1">
              +{activeMetrics.dailyPnlPercent}% Day Shift
            </div>
          </div>

          <div className="bg-[#0b1120] p-5 rounded-2xl border border-purple-500/30 hover:border-purple-400 transition shadow-sm space-y-1.5">
            <div className="text-xs text-purple-400 uppercase tracking-wider font-sans font-semibold">Available Free Margin</div>
            <div className="text-2xl font-black text-purple-200 mt-1">
              <AnimatedAmount value={activeMetrics.freeMargin} />
            </div>
            <div className="text-[11px] text-slate-400 font-sans pt-1">Utilized: ₹{Number(activeMetrics.utilizedMargin).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* 2. Spacious Clients Master Table */}
      <div className="clean-card rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Clients Master Portfolio Directory</h2>
            <span className="text-xs text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full font-mono-num font-bold border border-amber-500/30">
              {filteredClients.length} Accounts Active
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Client or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b1120] text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-[#1e293b] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center bg-[#0b1120] rounded-xl p-1 border border-[#1e293b] text-xs">
              {['ALL', 'HNI', 'Retail', 'Corporate', 'Trust'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedAccountType(type)}
                  className={`clean-btn px-3 py-1.5 rounded-lg transition font-semibold ${
                    selectedAccountType.toUpperCase() === type.toUpperCase()
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Master Table with Generous Padding */}
        <div className="overflow-x-auto rounded-xl border border-[#1e293b] bg-[#070c18] max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0b1120] text-slate-300 font-semibold uppercase tracking-wider border-b border-[#1e293b] z-10 text-xs">
              <tr>
                <th className="py-3 px-4">Client / ID</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4 text-right">Total Invested</th>
                <th className="py-3 px-4 text-right">Current Value</th>
                <th className="py-3 px-4 text-right">Total P&L</th>
                <th className="py-3 px-4 text-right">Daily P&L</th>
                <th className="py-3 px-4 text-right">Free Margin</th>
                <th className="py-3 px-3 text-right">Utilized</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] font-mono-num text-xs">
              {filteredClients.map((client) => {
                const isSelected = client.clientId === selectedClientId;
                const freeM = Math.max(0, client.cashMargin - client.utilizedMargin);
                return (
                  <tr
                    key={client.clientId}
                    onClick={() => setSelectedClientId(client.clientId)}
                    className={`transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-950/25 border-l-4 border-cyan-400' 
                        : 'hover:bg-[#0f172a]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-sans">{client.clientName}</span>
                        {isSelected && (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">{client.clientId} • {client.firmDesk}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-sans border ${
                        client.accountType === 'HNI' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        client.accountType === 'Corporate' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                        client.accountType === 'Trust' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                        'bg-slate-700/30 text-slate-300 border-slate-600'
                      }`}>
                        {client.accountType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-200 font-bold">
                      <AnimatedAmount value={client.totalInvested} />
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-cyan-200">
                      <AnimatedAmount value={client.currentValue} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <AnimatedAmount 
                        value={client.totalPnl} 
                        className={client.totalPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}
                      />
                      <span className={`block text-[10px] ${client.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        +{client.totalPnlPercent}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-bold ${client.dailyPnl >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                        {client.dailyPnl >= 0 ? '+' : ''}₹{Number(client.dailyPnl).toLocaleString('en-IN')}
                      </span>
                      <span className={`block text-[10px] ${client.dailyPnl >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                        +{client.dailyPnlPercent}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      <AnimatedAmount value={freeM} />
                    </td>

                    <td className="py-3.5 px-3 text-right text-slate-400">
                      ₹{Number(client.utilizedMargin).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientId(client.clientId);
                        }}
                        className={`clean-btn px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-[#1e293b] hover:bg-[#334155] text-slate-300'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Spacious Stock Holdings Section */}
      {selectedClient && (
        <div className="clean-card rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1e293b]">
            <div className="flex items-center gap-3 flex-wrap">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-black text-white">
                Stock Holdings: <span className="text-amber-300">{selectedClient.clientName}</span> ({selectedClient.clientId})
              </h2>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-mono-num font-bold border border-emerald-500/20">
                Cash Margin: ₹{Number(selectedClient.cashMargin).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => handleOpenTradeModal(null, 'BUY')}
              className="clean-btn flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Position</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1e293b] bg-[#070c18]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1120] text-slate-300 font-semibold uppercase tracking-wider border-b border-[#1e293b] text-xs">
                <tr>
                  <th className="py-3 px-4">Stock / Sector</th>
                  <th className="py-3 px-3 text-right">Shares</th>
                  <th className="py-3 px-3 text-right">Avg Buy Price</th>
                  <th className="py-3 px-4 text-center">Live CMP</th>
                  <th className="py-3 px-4 text-right">Invested Value</th>
                  <th className="py-3 px-4 text-right">Current Value</th>
                  <th className="py-3 px-4 text-right">Unrealized P&L</th>
                  <th className="py-3 px-3 text-right">Day's Change</th>
                  <th className="py-3 px-3 text-center">Portfolio %</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] font-mono-num text-xs">
                {selectedClient.holdings?.map((h) => {
                  const alloc = selectedClient.currentValue > 0 
                    ? ((h.currentValue / selectedClient.currentValue) * 100).toFixed(1)
                    : '0';

                  return (
                    <tr key={h.symbol} className="hover:bg-[#0f172a] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm font-sans">{h.symbol}</span>
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.2 rounded font-bold border border-cyan-500/20">
                            {h.exchange}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">{h.companyName} • {h.sector}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-white">{h.quantity}</td>

                      <td className="py-3.5 px-3 text-right text-slate-300">₹{h.avgBuyPrice}</td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-[#141d30] px-3 py-1.5 rounded-lg font-bold text-white border border-[#1e293b] shadow-inner inline-block">
                          <AnimatedAmount value={h.currentPrice} />
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-300 font-bold">
                        <AnimatedAmount value={h.investedValue} />
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-cyan-200">
                        <AnimatedAmount value={h.currentValue} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <AnimatedAmount value={h.unrealizedPnl} className={h.unrealizedPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'} />
                        <span className={`block text-[10px] ${h.unrealizedPnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          +{h.unrealizedPnlPercent}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className={`font-bold ${h.dayChange >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                          {h.dayChange >= 0 ? '+' : ''}₹{h.dayChange}
                        </span>
                        <span className={`block text-[10px] ${h.dayChangePercent >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                          +{h.dayChangePercent}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="bg-[#141d30] px-2.5 py-1 rounded text-amber-300 font-semibold border border-[#1e293b]">
                          {alloc}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenTradeModal(h, 'BUY')}
                            className="clean-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            + Buy
                          </button>
                          <button
                            onClick={() => handleOpenTradeModal(h, 'SELL')}
                            className="clean-btn bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            - Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Onboard Client */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="clean-card rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#1e293b]">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Onboard New Client Portfolio</span>
              </h3>
              <button onClick={() => setIsAddClientModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Singhania"
                  value={newClientForm.clientName}
                  onChange={(e) => setNewClientForm({...newClientForm, clientName: e.target.value})}
                  className="w-full bg-[#0b1120] border border-[#1e293b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Account Type</label>
                  <select
                    value={newClientForm.accountType}
                    onChange={(e) => setNewClientForm({...newClientForm, accountType: e.target.value})}
                    className="w-full bg-[#0b1120] border border-[#1e293b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="HNI">HNI Client</option>
                    <option value="Retail">Retail Investor</option>
                    <option value="Corporate">Corporate Treasury</option>
                    <option value="Trust">Family Trust</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Initial Cash Margin (₹)</label>
                  <input
                    type="number"
                    required
                    value={newClientForm.cashMargin}
                    onChange={(e) => setNewClientForm({...newClientForm, cashMargin: e.target.value})}
                    className="w-full bg-[#0b1120] border border-[#1e293b] rounded-xl px-3 py-2 text-white font-mono-num focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="clean-btn px-4 py-2 bg-[#1e293b] text-slate-300 rounded-xl hover:bg-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clean-btn px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Buy / Sell Trade */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="clean-card rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#1e293b]">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>{tradeForm.side} Stock Position: {tradeForm.symbol}</span>
              </h3>
              <button onClick={() => setIsTradeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#0b1120] p-1 rounded-xl border border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setTradeForm({...tradeForm, side: 'BUY'})}
                  className={`clean-btn py-2 rounded-lg font-black text-center transition ${
                    tradeForm.side === 'BUY' ? 'bg-emerald-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setTradeForm({...tradeForm, side: 'SELL'})}
                  className={`clean-btn py-2 rounded-lg font-black text-center transition ${
                    tradeForm.side === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span className="font-semibold">Quantity (Shares)</span>
                  {tradeForm.side === 'SELL' && availableSharesToSell > 0 && (
                    <span className="text-[11px] text-amber-300 font-mono-num font-bold">
                      Available: {availableSharesToSell} Shares
                    </span>
                  )}
                </div>

                {tradeForm.side === 'SELL' && availableSharesToSell > 0 ? (
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setTradeForm({...tradeForm, quantity: String(Math.max(1, Math.round(availableSharesToSell * 0.25)))})}
                      className="clean-btn bg-[#1e293b] hover:bg-[#334155] text-slate-300 px-2.5 py-1 rounded-lg text-xs"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeForm({...tradeForm, quantity: String(Math.max(1, Math.round(availableSharesToSell * 0.5)))})}
                      className="clean-btn bg-[#1e293b] hover:bg-[#334155] text-slate-300 px-2.5 py-1 rounded-lg text-xs"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeForm({...tradeForm, quantity: String(Math.max(1, Math.round(availableSharesToSell * 0.75)))})}
                      className="clean-btn bg-[#1e293b] hover:bg-[#334155] text-slate-300 px-2.5 py-1 rounded-lg text-xs"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeForm({...tradeForm, quantity: String(availableSharesToSell)})}
                      className="clean-btn bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/40 text-xs font-bold"
                    >
                      MAX ({availableSharesToSell})
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5 text-xs mb-2 justify-end">
                    {[1, 5, 10, 50, 100].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setTradeForm({...tradeForm, quantity: String(q)})}
                        className="clean-btn bg-[#1e293b] hover:bg-[#334155] text-slate-300 px-2.5 py-1 rounded-lg"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  required
                  placeholder="Enter number of shares"
                  value={tradeForm.quantity}
                  onChange={(e) => setTradeForm({...tradeForm, quantity: e.target.value})}
                  className="w-full bg-[#0b1120] border border-[#1e293b] rounded-xl px-3 py-2 text-white font-mono-num font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-[#0b1120] p-3.5 rounded-xl border border-[#1e293b] space-y-2 font-mono-num text-xs">
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">Execution Price:</span>
                  <span className="font-bold text-white">₹{tradeForm.price}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">Total Order Value:</span>
                  <span className="font-bold text-cyan-300">
                    ₹{((Number(tradeForm.quantity) || 0) * tradeForm.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-[#1e293b]">
                  <span className="font-sans">Client Free Cash Margin:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{clientFreeMargin.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTradeModalOpen(false)}
                  className="clean-btn px-4 py-2 bg-[#1e293b] text-slate-300 rounded-xl hover:bg-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`clean-btn px-5 py-2 font-black rounded-xl shadow-md ${
                    tradeForm.side === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                  }`}
                >
                  Execute {tradeForm.side} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
