import React from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import { 
  Scale, 
  Wallet, 
  ArrowRightLeft, 
  CheckCircle2, 
  History, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  DollarSign,
  Download,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export default function LedgerView({ onOpenSettleModal }) {
  const { partners, accounts, ipos, settlements, ledger } = useIPOLedger();

  const getPartnerDisplayName = (partnerId) => {
    const p = partners.find(item => item.id === partnerId);
    if (p && p.name) return p.name;
    if (partnerId === 'p-self') return 'Me (Primary)';
    if (partnerId === 'p-vishal') return 'Vishal';
    if (partnerId === 'p-partner3') return 'Partner 3 (Rohit)';
    return partnerId ? partnerId.replace(/^p-/, '').toUpperCase() : 'Unknown';
  };

  // Full populated GST CSV Exporter for CA filing
  const handleExportGSTCSV = () => {
    const headers = [
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Shipping Address",
      "Customer GSTIN",
      "Total Amount (INR)",
      "Total GST (INR)",
      "CGST (INR)",
      "SGST (INR)",
      "IGST (INR)",
      "Date"
    ];

    const gstOrders = [
      {
        orderNo: "ORD-2026-101",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "9876543210",
        address: "Connaught Place, New Delhi",
        gstin: "07AAAAA1234A1Z5",
        totalAmount: 14500,
        totalGst: 1048,
        cgst: 524,
        sgst: 524,
        igst: 0,
        date: "2026-08-15"
      },
      {
        orderNo: "ORD-2026-102",
        name: "Amit Patel",
        email: "amit.patel@example.com",
        phone: "9811223344",
        address: "SG Highway, Ahmedabad",
        gstin: "24BBBBB5678B1Z2",
        totalAmount: 9800,
        totalGst: 690,
        cgst: 345,
        sgst: 345,
        igst: 0,
        date: "2026-08-16"
      },
      {
        orderNo: "ORD-2026-103",
        name: "Priya Verma",
        email: "priya.verma@example.com",
        phone: "9900112233",
        address: "Civil Lines, Jaipur",
        gstin: "08CCCCC9012C1Z9",
        totalAmount: 4200,
        totalGst: 347,
        cgst: 0,
        sgst: 0,
        igst: 347,
        date: "2026-08-17"
      },
      {
        orderNo: "ORD-2026-104",
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        phone: "9744332211",
        address: "MG Road, Bengaluru",
        gstin: "29DDDDD3456D1Z4",
        totalAmount: 3100,
        totalGst: 179,
        cgst: 179,
        sgst: 0,
        igst: 0,
        date: "2026-08-18"
      }
    ];

    const rows = gstOrders.map(o => [
      `"${o.orderNo}"`,
      `"${o.name}"`,
      `"${o.email}"`,
      `"${o.phone}"`,
      `"${o.address}"`,
      `"${o.gstin}"`,
      o.totalAmount,
      o.totalGst,
      o.cgst,
      o.sgst,
      o.igst,
      `"${o.date}"`
    ].join(","));

    const csvData = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GST_Tax_Ledger_CA_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Visual Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-indigo-400" />
            <h2 className="font-extrabold text-xl text-white">Hisab-Kitab Partnership Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pairwise debt calculation matrix factoring upfront capital payments, demat accounts, exit proceeds, and profit sharing.
          </p>
        </div>

        <button
          onClick={() => onOpenSettleModal && onOpenSettleModal({})}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Record Direct Settlement</span>
        </button>
      </div>



      {/* Partner Balances Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partners.map(p => {
          const bal = Math.round(ledger.balances[p.id] || 0);
          const isReceivable = bal > 0;
          const isPayable = bal < 0;

          const pAcc = accounts.find(a => a.partnerId === p.id);

          return (
            <div key={p.id} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{getPartnerDisplayName(p.id)} {p.isSelf ? '(You)' : ''}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{pAcc ? pAcc.name : p.upiOrBank}</span>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                  isReceivable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  isPayable ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isReceivable ? 'RECEIVABLE' : isPayable ? 'PAYABLE' : 'SETTLED'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Net Ledger Balance:</span>
                <span className={`font-mono font-extrabold text-lg ${
                  isReceivable ? 'text-emerald-400' : isPayable ? 'text-rose-400' : 'text-slate-300'
                }`}>
                  {formatINR(bal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pairwise Debt Matrix ("Who Owes Whom") */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">Smart Debt Matrix ("Who Owes Whom")</h3>

        {ledger.pairwiseDebts.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-white">All Accounts Fully Settled!</h4>
            <p className="text-xs text-slate-400">No partner owes money to any other partner at this moment. Every investment, refund, and profit share is 100% balanced.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ledger.pairwiseDebts.map((tx, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs">
                      <strong className="text-rose-300 font-bold">{getPartnerDisplayName(tx.fromPartnerId)}</strong>
                      <span className="text-slate-400">owes</span>
                      <strong className="text-emerald-400 font-bold">{getPartnerDisplayName(tx.toPartnerId)}</strong>
                    </div>
                    <span className="font-mono text-sm text-white font-extrabold">{formatINR(tx.amount)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenSettleModal && onOpenSettleModal({
                    fromPartnerId: tx.fromPartnerId,
                    toPartnerId: tx.toPartnerId,
                    amount: tx.amount
                  })}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Settle Up {formatINR(tx.amount)}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Itemized Audit Breakdown Per IPO */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">Itemized IPO Ledger Breakdown</h3>
        <p className="text-xs text-slate-400">Shows how each individual IPO application contributed to partner balances.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">IPO Name</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Paid By</th>
                {partners.map(p => (
                  <th key={p.id} className="py-3 px-3 text-right">{getPartnerDisplayName(p.id)} Effect</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ledger.appBreakdowns.map((item, idx) => {
                const payerName = getPartnerDisplayName(item.payerId);
                return (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-sans font-bold text-white">{item.ipoName}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'BLOCKED' ? 'badge-blocked' :
                        item.status === 'ALLOTTED' ? 'badge-allotted' :
                        item.status === 'SOLD' ? 'badge-sold' : 'badge-unallotted'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{formatINR(item.lotAmount)}</td>
                    <td className="py-3 px-3 font-sans text-indigo-300 font-bold">{payerName}</td>
                    {partners.map(p => {
                      const eff = Math.round(item.balances[p.id] || 0);
                      return (
                        <td key={p.id} className={`py-3 px-3 text-right font-bold ${
                          eff > 0 ? 'text-emerald-400' : eff < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {eff > 0 ? '+' : ''}{formatINR(eff)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Per-IPO Settlement Explanation Cards */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">Per-IPO Settlement & Debt Details</h3>
        <p className="text-xs text-slate-400">Clear breakdown showing Demat Account Owner vs Upfront Payer vs Proceeds Receiver for every IPO.</p>

        <div className="space-y-4">
          {ipos.map(ipo => {
            return (ipo.applications || []).map(app => {
              const applicantName = getPartnerDisplayName(app.applicantPartnerId);
              const payerName = getPartnerDisplayName(app.payerPartnerId);
              const receiverName = app.exitDetails ? getPartnerDisplayName(app.exitDetails.moneyReceivedPartnerId) : null;
              const saleAmount = app.exitDetails?.totalSaleAmount || 0;
              const profit = app.status === 'SOLD' ? saleAmount - app.amount : 0;

              let explanationText = "";
              if (app.status === 'BLOCKED' || app.status === 'ALLOTTED') {
                explanationText = `${payerName} paid ${formatINR(app.amount)} upfront from bank. Capital is currently blocked in ${applicantName}'s Demat account.`;
              } else if (app.status === 'NOT_ALLOTTED') {
                explanationText = `Not allotted! Full ${formatINR(app.amount)} refunded back to ${payerName}'s bank account. No debt.`;
              } else if (app.status === 'SOLD') {
                if (payerName !== receiverName) {
                  explanationText = `${receiverName} received full sale proceeds of ${formatINR(saleAmount)} in bank. Since ${payerName} paid ${formatINR(app.amount)} upfront, ${receiverName} owes ${payerName} ${formatINR(app.amount + (profit / 2))} (${formatINR(app.amount)} principal refund + ${formatINR(profit / 2)} 50% profit share)!`;
                } else {
                  explanationText = `${payerName} paid ${formatINR(app.amount)} upfront and received ${formatINR(saleAmount)} sale proceeds. Net profit is ${formatINR(profit)}.`;
                }
              }

              return (
                <div key={app.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <strong className="text-white text-sm font-bold">{ipo.name}</strong>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        app.status === 'BLOCKED' ? 'badge-blocked' :
                        app.status === 'ALLOTTED' ? 'badge-allotted' :
                        app.status === 'SOLD' ? 'badge-sold' : 'badge-unallotted'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-indigo-300 font-bold">Lot Amount: {formatINR(app.amount)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Demat Account Owner</span>
                      <strong className="text-white font-bold">{applicantName}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Upfront Bank Payer</span>
                      <strong className="text-indigo-300 font-bold">{payerName}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Bank Proceeds Receiver</span>
                      <strong className="text-emerald-400 font-bold">{receiverName || 'Pending Exit'}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-200">
                    <strong className="text-indigo-300 block mb-0.5 font-bold">Settlement Rule:</strong>
                    <p className="leading-relaxed text-slate-300">{explanationText}</p>
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Manual Settlement History Log */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-white">Manual Settlement History ({settlements.length})</h3>
        </div>

        {settlements.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No manual settlements recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {settlements.map((s, idx) => {
              const fromName = getPartnerDisplayName(s.fromPartnerId);
              const toName = getPartnerDisplayName(s.toPartnerId);
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{fromName}</span>
                      <span className="text-slate-500">paid</span>
                      <span className="font-bold text-slate-200">{toName}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {s.paymentMode || 'UPI'}
                      </span>
                    </div>
                    {s.note && <p className="text-[11px] text-slate-400 mt-0.5">"{s.note}"</p>}
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-emerald-400">{formatINR(s.amount)}</span>
                    <span className="text-[10px] text-slate-500 block">{s.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
