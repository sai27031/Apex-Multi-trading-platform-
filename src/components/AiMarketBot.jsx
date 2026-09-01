import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowUpRight, 
  Award, 
  Zap,
  CheckCircle
} from 'lucide-react';
import { aiService } from '../services/api';
import { fallbackStockPicks, fallbackClients } from '../data/initialData';

export default function AiMarketBot({ onSelectSymbolForTrade }) {
  const [stockPicks, setStockPicks] = useState(fallbackStockPicks);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: `Welcome! I am Apex, your intelligent market and multi-client wealth assistant.\n\nI analyze live NSE/BSE order feeds, algorithmic stock breakout triggers, and all 20+ client portfolios.\n\n• Ask about any client: "How is the portfolio of Rajesh Sharma?" or "Show Vikram Singhania's margin"\n• Ask about market pulse: "How is the market today?" or "NIFTY 50 technical setup"\n• Ask about recommendations: "What are the best stock picks to buy?"\n• Ask about IPOs: "What are the latest IPO GMP rates?"`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const chatEndRef = useRef(null);

  const fetchStockPicks = async () => {
    try {
      const res = await aiService.getStockPicks();
      if (res.data?.data && res.data.data.length > 0) {
        setStockPicks(res.data.data);
      }
    } catch (err) {
      console.log('Using local stock picks');
    }
  };

  useEffect(() => {
    fetchStockPicks();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await aiService.sendChatMessage(text);
      if (res.data?.reply) {
        const cleanReply = res.data.reply.replace(/###/g, '').replace(/\*\*/g, '');
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: cleanReply,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      // Local Intelligent Query Fallback
      const q = text.toLowerCase();
      let replyText = '';

      const localClients = JSON.parse(localStorage.getItem('apex_clients_cache') || '[]').concat(fallbackClients);
      const matched = localClients.find(c => q.includes(c.clientName.toLowerCase()) || q.includes(c.clientName.split(' ')[0].toLowerCase()));

      if (matched) {
        replyText = `Portfolio Summary for ${matched.clientName} (${matched.clientId}):\n• Total Invested: ₹${matched.totalInvested.toLocaleString('en-IN')}\n• Current Value: ₹${matched.currentValue.toLocaleString('en-IN')}\n• Total P&L: +₹${matched.totalPnl.toLocaleString('en-IN')} (+${matched.totalPnlPercent}%)\n• Free Margin: ₹${Math.max(0, matched.cashMargin - matched.utilizedMargin).toLocaleString('en-IN')}\n• Holdings: ${matched.holdings.map(h => `${h.symbol} (${h.quantity} shares)`).join(', ')}`;
      } else if (q.includes('market') || q.includes('today') || q.includes('nifty')) {
        replyText = `Indian Market Pulse:\n• NIFTY 50: 24,850.40 (+0.59% / +145.20 pts)\n• SENSEX: 81,200.15 (+0.52% / +420.30 pts)\n• BANK NIFTY: 51,410.80 (+0.55%)\n• INDIA VIX: 13.42 (-2.54%)\nBullish momentum led by automobile and private banking leaders.`;
      } else if (q.includes('recommend') || q.includes('pick') || q.includes('buy')) {
        replyText = `Top High-Conviction Stock Picks:\n1. Tata Motors (TATAMOTORS): Target ₹1,280 | SL ₹975 (+22.5%)\n2. Bharat Forge (BHARATFORG): Target ₹1,950 | SL ₹1,490 (+21.1%)\n3. Trent Ltd (TRENT): Target ₹8,500 | SL ₹6,600 (+19.4%)\n4. ICICI Bank (ICICIBANK): Target ₹1,450 | SL ₹1,170 (+16.5%)`;
      } else if (q.includes('ipo') || q.includes('gmp')) {
        replyText = `Latest IPO GMP Matrix:\n• Swiggy IPO: GMP +₹42 (+10.8%)\n• NTPC Green Energy: GMP +₹18 (+16.7%)\n• Waaree Energies: +69.7% listing day surge`;
      } else {
        replyText = `Apex AI Assistant active. Ask me about any specific client portfolio, stock targets, or market movements.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "How is the portfolio of Rajesh Sharma?",
    "How is the market today?",
    "Recommend top breakout stock picks",
    "Show latest IPO GMP rates"
  ];

  const filteredPicks = stockPicks.filter(p => {
    if (filterCategory === 'ALL') return true;
    return p.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Apex AI Market Intelligence & Stock Recommendations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Algorithmic stock breakout scans, risk-reward ratios, and individual client portfolio intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono-num text-xs">
          <div className="bg-[#182234] text-[#10b981] px-3 py-1 rounded-lg border border-emerald-500/30 font-bold">
            94.2% AI Conviction Rate
          </div>
        </div>
      </div>

      {/* 2. AI Top Stock Picks Cards */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">High-Conviction Stock Recommendations</h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'Breakout', 'Defense', 'Value', 'Momentum'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  filterCategory === cat
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'bg-[#182234] text-slate-400 hover:text-white border border-[#283347]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredPicks.map((pick, i) => (
            <div 
              key={i}
              className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-cyan-500/50 transition shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-white font-mono-num">{pick.symbol}</span>
                      <span className="bg-cyan-500/15 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded font-bold border border-cyan-500/20">
                        {pick.exchange}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{pick.companyName}</div>
                  </div>

                  <span className="bg-emerald-500/15 text-[#10b981] text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-emerald-500/30">
                    {pick.recommendation}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#182234] p-2.5 rounded-lg border border-[#283347] font-mono-num text-[11px] mt-3">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-sans">CMP</div>
                    <div className="font-bold text-white">₹{pick.currentPrice}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-sans">Target</div>
                    <div className="font-bold text-[#10b981]">₹{pick.targetPrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase font-sans">Stop Loss</div>
                    <div className="font-bold text-[#f43f5e]">₹{pick.stopLoss}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono-num mt-2.5 text-slate-400">
                  <span>Potential: <strong className="text-[#10b981]">+{pick.potentialUpside}%</strong></span>
                  <span>AI Score: <strong className="text-amber-300 font-bold">{pick.convictionScore}%</strong></span>
                </div>

                <div className="text-[11px] text-slate-300 mt-2 bg-[#182234]/80 p-2.5 rounded-lg border border-[#283347] line-clamp-2">
                  {pick.aiRationale}
                </div>
              </div>

              <button
                onClick={() => onSelectSymbolForTrade && onSelectSymbolForTrade(pick.symbol)}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 mt-2 shadow-sm"
              >
                <span>Trade {pick.symbol}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI Assistant Chat */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm space-y-3">
        <div className="bg-[#172033] border-b border-[#1e293b] px-4 py-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white">Apex AI Assistant</h3>
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-2 max-h-[320px] overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl rounded-xl p-3 text-xs leading-relaxed space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white shadow-sm font-medium'
                    : 'bg-[#182234] border border-[#283347] text-slate-200 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div className={`text-[9px] text-right font-mono-num ${
                  m.sender === 'user' ? 'text-cyan-200' : 'text-slate-400'
                }`}>{m.timestamp}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 items-center text-xs text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Apex is analyzing market data...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="bg-[#182234] hover:bg-[#202d44] text-slate-300 text-[11px] px-3 py-1 rounded-md border border-[#283347] transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-[#172033] border-t border-[#1e293b]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Apex about Rajesh Sharma's portfolio, NIFTY outlook, or stock recommendations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-[#111827] border border-[#283347] rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
