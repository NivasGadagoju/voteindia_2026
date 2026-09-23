import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { VVPATReceipt, AppState, Voter } from '../types';
import { ShieldCheck, CheckCircle2, Printer, Copy, Check, BarChart3, Search, Share2, Award, ArrowRight } from 'lucide-react';

interface ConfirmationScreenProps {
  receipt: VVPATReceipt;
  voter: Voter;
  setState: (state: AppState) => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  receipt,
  voter,
  setState,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9933', '#FFFFFF', '#138808', '#0284c7'],
      });
    } catch (e) {
      console.debug('Confetti error:', e);
    }
  }, []);

  const handleCopyHash = () => {
    if (receipt.sha256Hash) {
      navigator.clipboard.writeText(receipt.sha256Hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border-4 border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          Democracy Strengthened • General Elections 2026
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight italic">
          VOTE CASTED SUCCESSFULLY!
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Thank you, <span className="font-bold text-slate-900">{voter.name}</span>, for participating in the world's largest democratic exercise. Your ballot has been cryptographically sealed and recorded on the ECI Audit Ledger.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Indelible Ink Badge */}
        <div className="md:col-span-5 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
              National Voter Recognition
            </span>
            <h3 className="text-2xl font-black">I Have Voted!</h3>
            <p className="text-xs text-orange-100">
              मैंने मतदान किया! • Proud Indian Elector 2026
            </p>
          </div>

          {/* Indelible Ink Finger Graphic Replica */}
          <div className="w-32 h-44 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 mx-auto p-4 flex flex-col items-center justify-center relative shadow-inner">
            <div className="w-12 h-28 bg-amber-100 rounded-t-full border border-amber-200 relative overflow-hidden flex flex-col items-center pt-2">
              {/* Fingernail */}
              <div className="w-8 h-8 bg-white/80 rounded-t-xl border border-amber-200 shadow-sm relative">
                {/* Indelible Purple Ink Line Mark */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-14 bg-purple-900 rounded-full shadow-[0_0_8px_#581c87]"></div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100 mt-2">
              Indelible Ink
            </span>
          </div>

          <div className="text-xs text-orange-100 font-medium">
            Constituency: <strong className="text-white">{voter.constituency}</strong>
            <br />
            State: <strong className="text-white">{voter.state}</strong>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'I Voted in General Elections 2026!',
                  text: `I just cast my digital ballot in ${voter.constituency} on VoteIndia 2026! Every vote matters! 🇮🇳`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(`I just cast my digital ballot in ${voter.constituency} on VoteIndia 2026! Every vote matters! 🇮🇳`);
                alert('Share text copied to clipboard!');
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-white text-orange-700 font-extrabold text-xs uppercase tracking-wider hover:bg-orange-50 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share My Voting Badge</span>
          </button>
        </div>

        {/* Right Column: Digital VVPAT Voter Receipt Slip */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-orange-600 uppercase tracking-wider">
                Official Receipt
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Digital VVPAT Receipt Slip
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {receipt.receiptId}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Elector EPIC (Masked)</span>
                <span className="font-mono font-bold text-slate-800">{receipt.voterEpicMasked}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Block Number</span>
                <span className="font-mono font-bold text-slate-800">#{receipt.blockNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Constituency</span>
                <span className="font-bold text-slate-800">{receipt.constituency}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Timestamp (IST)</span>
                <span className="font-mono text-slate-800">{new Date(receipt.timestamp).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Cryptographic Hash Box */}
            <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
                  SHA-256 Cryptographic Hash
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-[10px] font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 break-all bg-black/40 p-2.5 rounded-xl border border-slate-800">
                {receipt.sha256Hash}
              </div>
              <p className="text-[10px] text-slate-400">
                Use this hash to verify on the public audit ledger that your ballot was counted in the final tally without revealing your secret candidate selection.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Official Receipt</span>
            </button>

            <button
              onClick={() => setState(AppState.VERIFY_RECEIPT)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-purple-400" />
              <span>Verify in Ledger</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={() => setState(AppState.RESULTS)}
              className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View National Live Seat Tally (543 Seats)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
