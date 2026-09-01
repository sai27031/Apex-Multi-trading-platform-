import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Calendar, 
  CheckCircle, 
  Flame,
  X
} from 'lucide-react';
import { ipoService } from '../services/api';
import { fallbackIpos } from '../data/initialData';

export default function IpoCentral() {
  const [activeTab, setActiveTab] = useState('open');
  const [ipos, setIpos] = useState(fallbackIpos);
  const [selectedIpoToApply, setSelectedIpoToApply] = useState(null);
  const [bidForm, setBidForm] = useState({
    clientName: 'Rajesh Sharma (CLI-1001)',
    upiId: 'rajesh@okhdfcbank',
    lots: 1,
    bidPrice: 390
  });
  const [applicationResult, setApplicationResult] = useState(null);

  const fetchIpos = async () => {
    try {
      const res = await ipoService.getIpos(activeTab);
      if (res.data?.data && res.data.data.length > 0) {
        setIpos(res.data.data);
      }
    } catch (err) {
      console.log('Using local IPO list');
    }
  };

  useEffect(() => {
    fetchIpos();
  }, [activeTab]);

  const filteredIpos = ipos.filter(i => {
    if (activeTab === 'open') return i.status === 'open';
    if (activeTab === 'upcoming') return i.status === 'upcoming';
    if (activeTab === 'closed') return i.status === 'closed';
    return true;
  });

  const handleOpenApplyModal = (ipo) => {
    setSelectedIpoToApply(ipo);
    setBidForm({
      clientName: 'Rajesh Sharma (CLI-1001)',
      upiId: 'rajesh@okhdfcbank',
      lots: 1,
      bidPrice: 390
    });
    setApplicationResult(null);
  };

  const handleSubmitBid = (e) => {
    e.preventDefault();
    if (!selectedIpoToApply) return;
    setApplicationResult({
      applicationNo: `APP-IPO-${Date.now().toString().slice(-4)}`,
      company: selectedIpoToApply.companyName,
      clientName: bidForm.clientName,
      lots: bidForm.lots,
      shares: bidForm.lots * selectedIpoToApply.lotSize,
      blockedAmount: bidForm.lots * selectedIpoToApply.lotSize * bidForm.bidPrice
    });
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            IPO Central & Grey Market Premiums (GMP)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track Open IPO bidding, upcoming issues, and listing performance.
          </p>
        </div>

        <div className="bg-[#182234] px-3.5 py-1.5 rounded-lg border border-[#283347] flex items-center gap-2 text-xs font-mono-num shadow-sm">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Top GMP: <strong className="text-[#10b981]">Waaree Energies (+96.5%)</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2.5">
        {[
          { id: 'open', label: 'Open IPOs' },
          { id: 'upcoming', label: 'Upcoming IPOs' },
          { id: 'closed', label: 'Closed & Listed' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#182234] text-slate-400 hover:text-white border border-[#283347]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIpos.map((ipo) => (
          <div
            key={ipo.ipoId}
            className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-blue-500/40 transition shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{ipo.companyName}</h3>
                  <span className="bg-blue-500/15 text-blue-400 text-[10px] px-1.5 py-0.2 rounded font-bold font-mono-num border border-blue-500/20">
                    {ipo.symbol}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{ipo.issueType} • Issue Size: <strong className="text-white font-mono-num">{ipo.issueSize}</strong></div>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                ipo.status === 'open' ? 'badge-green' : ipo.status === 'upcoming' ? 'badge-amber' : 'badge-blue'
              }`}>
                {ipo.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#182234] p-3 rounded-lg border border-[#283347] font-mono-num text-xs">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">Price Band</div>
                <div className="font-bold text-white text-[11px]">{ipo.priceBand}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">Lot Size</div>
                <div className="font-bold text-white text-[11px]">{ipo.lotSize} Shares</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">GMP Gain</div>
                <div className="font-bold text-[#10b981] text-[11px]">
                  +₹{ipo.gmp} ({ipo.gmpPercent}%)
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-[#182234]/60 p-3 rounded-lg border border-[#283347] line-clamp-2">
              {ipo.description}
            </div>

            {ipo.status === 'open' && (
              <button
                onClick={() => handleOpenApplyModal(ipo)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Apply for Client</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedIpoToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#283347] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <h3 className="text-sm font-bold text-white">Apply: {selectedIpoToApply.companyName}</h3>
              <button onClick={() => setSelectedIpoToApply(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {applicationResult ? (
              <div className="bg-[#182234] p-3.5 rounded-lg border border-emerald-500/40 space-y-2 font-mono-num text-xs">
                <div className="text-[#10b981] font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Application Registered</span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div>Ref: <strong>{applicationResult.applicationNo}</strong></div>
                  <div>Shares: <strong>{applicationResult.shares} Shares</strong></div>
                  <div>Blocked Amount: <strong className="text-white">₹{applicationResult.blockedAmount.toLocaleString('en-IN')}</strong></div>
                </div>
                <button
                  onClick={() => setSelectedIpoToApply(null)}
                  className="w-full py-2 bg-[#202d44] hover:bg-[#283854] text-white rounded-lg text-xs font-bold mt-2 border border-[#283347]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Select Client</label>
                  <input
                    type="text"
                    required
                    value={bidForm.clientName}
                    onChange={(e) => setBidForm({...bidForm, clientName: e.target.value})}
                    className="w-full bg-[#182234] border border-[#283347] rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Lots (1 Lot = {selectedIpoToApply.lotSize} Shares)</label>
                  <input
                    type="number"
                    min="1"
                    value={bidForm.lots}
                    onChange={(e) => setBidForm({...bidForm, lots: Number(e.target.value)})}
                    className="w-full bg-[#182234] border border-[#283347] rounded-lg px-3 py-1.5 text-white font-mono-num"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIpoToApply(null)}
                    className="px-3.5 py-1.5 bg-[#182234] text-slate-300 rounded-lg hover:bg-[#202d44]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Submit Bid
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
