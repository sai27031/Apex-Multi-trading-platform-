import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import MultiClientPortfolio from './components/MultiClientPortfolio';
import TradingTerminal from './components/TradingTerminal';
import FnOTrading from './components/FnOTrading';
import MarketNews from './components/MarketNews';
import IpoCentral from './components/IpoCentral';
import FloatingAiDrawer from './components/FloatingAiDrawer';
import AuthModal from './components/AuthModal';
import { clientService } from './services/api';
import { Bot } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [summaryData, setSummaryData] = useState(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [preselectedTradeSymbol, setPreselectedTradeSymbol] = useState(null);
  
  // Show Landing Page by default
  const [inTerminalMode, setInTerminalMode] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  const fetchSummary = async () => {
    try {
      const res = await clientService.getSummary();
      if (res.data) {
        setSummaryData(res.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 4000);

    const socket = io('http://localhost:5001', {
      transports: ['websocket', 'polling']
    });

    socket.on('tickerUpdate', () => {
      fetchSummary();
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const handleSelectSymbolForTrade = (sym) => {
    setPreselectedTradeSymbol(sym);
    setActiveTab('trading');
  };

  const handleEnterTerminal = () => {
    setInTerminalMode(true);
  };

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setInTerminalMode(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('apex_user');
    setCurrentUser(null);
    setInTerminalMode(false);
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col selection:bg-cyan-600 selection:text-white relative">
      {/* If not in terminal mode, render the Animated Landing Page */}
      {!inTerminalMode ? (
        <LandingPage
          onEnterTerminal={handleEnterTerminal}
          onOpenAuth={handleOpenAuth}
        />
      ) : (
        /* Active Trading Terminal App */
        <>
          {/* Top Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            summaryData={summaryData}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('signin')}
            onLogout={handleLogout}
            onOpenAiChat={() => setIsAiDrawerOpen(true)}
            onGoToLanding={() => setInTerminalMode(false)}
          />

          {/* Main Content Area - Fluid Full Width */}
          <main className="flex-1 pb-16 w-full">
            {activeTab === 'portfolio' && (
              <MultiClientPortfolio
                summaryData={summaryData}
                onRefreshSummary={fetchSummary}
                onSelectClientForTrade={(sym) => handleSelectSymbolForTrade(sym)}
              />
            )}

            {activeTab === 'trading' && (
              <TradingTerminal
                summaryData={summaryData}
                preselectedSymbol={preselectedTradeSymbol}
              />
            )}

            {activeTab === 'fno' && (
              <FnOTrading
                summaryData={summaryData}
                onSelectSymbolForTrade={handleSelectSymbolForTrade}
              />
            )}

            {activeTab === 'news' && (
              <MarketNews
                onSelectSymbolForTrade={handleSelectSymbolForTrade}
              />
            )}

            {activeTab === 'ipo' && (
              <IpoCentral />
            )}
          </main>

          {/* Flawlessly Anchored Bottom-Right Floating AI Assistant Pill */}
          <div 
            style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, left: 'auto' }}
            className="animate-in fade-in"
          >
            <button
              onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
              className="clean-btn flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-2xl shadow-cyan-950/80 border border-white/25 backdrop-blur-xl transition-all duration-200 hover:scale-105"
              title="Open Apex Strategy Advisor"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <span className="tracking-wide font-sans">Apex</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
            </button>
          </div>

          {/* Floating Strategy Advisor Drawer */}
          <FloatingAiDrawer
            isOpen={isAiDrawerOpen}
            onClose={() => setIsAiDrawerOpen(false)}
          />
        </>
      )}

      {/* Global Auth Modal for Sign In and Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
