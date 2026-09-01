import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Search, 
  Clock, 
  ArrowUpRight, 
  Radio
} from 'lucide-react';
import { newsService } from '../services/api';
import { fallbackNews } from '../data/initialData';

export default function MarketNews({ onSelectSymbolForTrade }) {
  const [newsList, setNewsList] = useState(fallbackNews);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNews = async () => {
    try {
      const res = await newsService.getNews(activeCategory, searchTerm);
      if (res.data?.data && res.data.data.length > 0) {
        setNewsList(res.data.data);
      }
    } catch (err) {
      console.log('Using local news');
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeCategory, searchTerm]);

  const categories = [
    'All',
    'Market Pulse',
    'Earnings & Results',
    'Regulatory & Policy',
    'Sectoral Analysis'
  ];

  const filteredNews = newsList.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.impactedStocks?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            NSE & BSE Live Market Disclosures
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official exchange filings, quarterly earnings, and SEBI/RBI policy updates.
          </p>
        </div>

        <div className="bg-[#182234] px-3 py-1 rounded-lg border border-[#283347] flex items-center gap-2 text-xs">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="text-slate-300 font-mono-num text-[11px]">Direct NSE / BSE Feed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-[#182234] text-slate-400 hover:text-white border border-[#283347]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search news or ticker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#182234] text-xs text-white pl-9 pr-3 py-1.5 rounded-lg border border-[#283347] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((item) => {
          const isBullish = item.sentiment === 'Bullish';
          const isBearish = item.sentiment === 'Bearish';

          return (
            <div
              key={item.newsId}
              className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-blue-500/40 transition shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#182234] text-slate-300 font-bold px-2 py-0.5 rounded border border-[#283347] text-[10px]">
                      {item.source}
                    </span>
                    <span className="text-slate-400 font-mono-num text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.publishedTime}
                    </span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    isBullish ? 'badge-green' : isBearish ? 'badge-rose' : 'badge-blue'
                  }`}>
                    {item.sentiment}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#182234] p-3 rounded-lg border border-[#283347]">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Impacted Tickers:</span>
                  {item.impactedStocks?.map((st) => (
                    <button
                      key={st}
                      onClick={() => onSelectSymbolForTrade && onSelectSymbolForTrade(st)}
                      className="bg-[#182234] hover:bg-blue-600/20 text-slate-200 hover:text-blue-300 px-2 py-0.5 rounded font-mono-num font-bold text-[10px] border border-[#283347] flex items-center gap-1 transition"
                    >
                      <span>{st}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
