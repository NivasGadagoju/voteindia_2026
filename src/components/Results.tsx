import React, { useEffect, useState } from 'react';
import { getElectionResults } from '../services/api';
import { BarChart3, ShieldCheck, RefreshCw, Radio, CheckCircle2, TrendingUp, Users, Award, ExternalLink } from 'lucide-react';

export const Results: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const data = await getElectionResults();
      setResults(data);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(() => {
      fetchResults();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !results) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h3 className="text-xl font-black text-slate-900">Connecting to ECI National Counting Center...</h3>
        <p className="text-slate-500 text-sm font-medium">Aggregating live returning officer feeds from 543 Parliamentary Constituencies</p>
      </div>
    );
  }

  const majorityMark = results.majorityMark || 272;
  const totalSeats = results.totalSeats || 543;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-red-600">
              Live National Tally • Lok Sabha 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            General Elections 2026 Results
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            543 Constituencies • Majority Mark: <strong className="text-slate-800">272 Seats</strong>
          </p>
        </div>

        <button
          onClick={() => fetchResults(true)}
          disabled={refreshing}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-orange-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Majority Gauge Progress Bar (Lok Sabha 543) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider">
          <span className="text-slate-500">Parliamentary Seat Distribution (543 Total)</span>
          <span className="text-orange-600 font-bold">272 Majority Mark Threshold</span>
        </div>

        {/* Stacked Seat Bar */}
        <div className="relative h-9 rounded-2xl bg-slate-100 overflow-hidden flex border border-slate-300">
          {results.parties?.map((p: any) => {
            const widthPct = (p.seatsWon / totalSeats) * 100;
            return (
              <div
                key={p.partyAbbr}
                style={{ width: `${widthPct}%`, backgroundColor: p.color }}
                className="h-full relative group transition-all"
                title={`${p.party}: ${p.seatsWon} seats`}
              >
                {widthPct > 5 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow-sm select-none">
                    {p.partyAbbr} ({p.seatsWon})
                  </span>
                )}
              </div>
            );
          })}

          {/* Majority Marker Needle */}
          <div
            style={{ left: `${(majorityMark / totalSeats) * 100}%` }}
            className="absolute top-0 bottom-0 w-1 bg-slate-900 shadow-[0_0_8px_#000000] z-10 flex flex-col items-center justify-between"
          >
            <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1"></div>
            <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mb-1"></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>0 Seats</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px]">
            Majority: 272
          </span>
          <span>543 Seats</span>
        </div>
      </div>

      {/* Party Seat Breakdown Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.parties?.map((p: any) => (
          <div
            key={p.partyAbbr}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: p.color }}
            ></div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl select-none">{p.symbol}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{p.partyAbbr}</h3>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{p.party}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">{p.seatsWon}</div>
                <div className="text-[10px] font-bold text-emerald-600">+{p.leading} Lead</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold">Vote Share:</span>
              <span className="font-mono font-extrabold text-slate-800">{p.voteSharePercent}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Election Vitals & Turnout Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              National Turnout
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{results.turnoutPercent}%</div>
          <p className="text-xs text-slate-500 font-medium">
            Over {((results.votesCastLive || 0) / 10000000).toFixed(1)} Crore votes cast across 7 phases
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Cryptographic Integrity
            </span>
            <ShieldCheck className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{results.integrityIndex}</div>
          <p className="text-xs text-slate-500 font-medium">
            End-to-end SHA-256 verifiable mathematical audit trail
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              EVM System Uptime
            </span>
            <Radio className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600">{results.evmUptime}</div>
          <p className="text-xs text-slate-500 font-medium">
            Zero security breach incidents across 1.05 million polling stations
          </p>
        </div>
      </div>

      {/* Cryptographic Public Audit Log Feed */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-lg font-black tracking-tight">Public Cryptographic Audit Log</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live broadcast of anonymized VVPAT blocks committed to consensus ledger
            </p>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80 self-start sm:self-center">
            IMMUTABLE LEDGER ACTIVE
          </span>
        </div>

        <div className="divide-y divide-slate-800 font-mono text-xs">
          {results.recentAuditBlocks && results.recentAuditBlocks.length > 0 ? (
            results.recentAuditBlocks.map((block: any) => (
              <div key={block.receiptId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-bold text-[10px]">
                    BLOCK #{block.blockNumber}
                  </span>
                  <span className="text-slate-300 font-bold">{block.receiptId}</span>
                  <span className="text-slate-500 hidden md:inline">({block.constituency})</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span className="truncate max-w-[200px] text-slate-400">{block.sha256Hash}</span>
                  <span className="text-emerald-400 shrink-0 font-bold">✓ VERIFIED</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-slate-500">
              Cast a ballot from the official EVM unit to see your cryptographic block appear here in real-time!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
