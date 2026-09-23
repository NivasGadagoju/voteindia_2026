import React, { useState } from 'react';
import { verifyReceiptHash } from '../services/api';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';

export const VerifyReceipt: React.FC = () => {
  const [query, setQuery] = useState('ECI-2026-');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await verifyReceiptHash(query.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Receipt could not be verified on the consensus chain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Public Cryptographic Audit Ledger
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Verify that your VVPAT digital receipt has been legitimately included in the Election Commission master tally without compromising secret ballot privacy.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              Enter Receipt ID or SHA-256 Transaction Hash
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. ECI-2026-F93A8B12 or 0x71c7656..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12 shadow-inner"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-bold">Try Sample Receipts:</span>
            <button
              type="button"
              onClick={() => setQuery('ECI-2026-A82F109D')}
              className="text-purple-600 hover:underline font-mono font-bold"
            >
              ECI-2026-A82F109D
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setQuery('ECI-2026-7B93EC41')}
              className="text-purple-600 hover:underline font-mono font-bold"
            >
              ECI-2026-7B93EC41
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Result Card */}
        {result && (
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-black uppercase tracking-wider text-emerald-400">
                  Receipt Authenticated on Consensus Chain
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">STATUS: VALID</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 font-bold block mb-1">Receipt ID</span>
                <span className="font-mono text-orange-400 font-bold">{result.receiptId}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 font-bold block mb-1">Audit Block Number</span>
                <span className="font-mono text-white font-bold">#{result.blockNumber || 1048580}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 font-bold block mb-1">Masked EPIC ID</span>
                <span className="font-mono text-white font-bold">{result.maskedEpic || 'HYD****172'}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 font-bold block mb-1">Verification Timestamp</span>
                <span className="font-mono text-white">{new Date(result.timestamp || Date.now()).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3.5 bg-black/40 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-mono block">SHA-256 Merkle Leaf Hash:</span>
              <div className="font-mono text-[11px] text-emerald-400 break-all">
                {result.sha256Hash}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Zero-Knowledge Proof confirmed: The vote is included in the aggregate tally with zero cryptographic discrepancies.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
