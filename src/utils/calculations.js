/**
 * IPO Financial Engine & Debt Ledger Matrix Calculator
 */

/**
 * Formats numbers into Indian Currency format (e.g. ₹1,50,000)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const val = Number(amount);
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const formatted = absVal.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Calculates net financial balances across all IPO applications and manual settlements.
 * Returns pairwise matrix of "who owes whom how much" and individual summary metrics.
 */
export function calculateLedger(ipos, partners, settlements = []) {
  // Map of partner balances: positive = RECEIVABLE (is owed money), negative = PAYABLE (owes money)
  const balances = {};
  partners.forEach(p => {
    balances[p.id] = 0;
  });

  // Track detailed breakdown per IPO for audit trail
  const appBreakdowns = [];

  ipos.forEach(ipo => {
    (ipo.applications || []).forEach(app => {
      const lotAmount = app.amount || (ipo.lotPrice * (app.lots || 1));
      const payerId = app.payerPartnerId;
      const status = app.status || "BLOCKED";
      const partnersList = app.partners || [];

      // Calculate cash flows for this application
      const appBalance = {};
      partners.forEach(p => (appBalance[p.id] = 0));

      if (status === "BLOCKED" || status === "ALLOTTED") {
        // Capital is locked in bank / application
        partnersList.forEach(pt => {
          const sharePct = pt.percentage / 100;
          const targetCap = lotAmount * sharePct;

          if (pt.partnerId === payerId) {
            // Payer paid 100% upfront, but is only responsible for their share
            // Net receivable = lotAmount (paid) - targetCap (responsibility)
            appBalance[pt.partnerId] += (lotAmount - targetCap);
          } else {
            // Non-payer owes their capital share to the payer
            appBalance[pt.partnerId] -= targetCap;
          }
        });
      } else if (status === "NOT_ALLOTTED") {
        // Money unblocked and returned to payer bank account
        // Net balance effect is 0
      } else if (status === "SOLD" && app.exitDetails) {
        const totalSaleAmount = Number(app.exitDetails.totalSaleAmount || 0);
        const netProfit = totalSaleAmount - lotAmount;
        const receiverId = app.exitDetails.moneyReceivedPartnerId;

        partnersList.forEach(pt => {
          const sharePct = pt.percentage / 100;
          const partnerProfitShare = netProfit * sharePct;
          const partnerCapShare = lotAmount * sharePct;

          if (payerId === receiverId) {
            // Same person paid and received. Receiver holds net profit belonging to partners
            if (pt.partnerId === receiverId) {
              // Receiver owes other partners their profit share
              const dueToOthers = netProfit - partnerProfitShare;
              appBalance[pt.partnerId] = -dueToOthers;
            } else {
              // Non-receiver is owed their profit share
              appBalance[pt.partnerId] = partnerProfitShare;
            }
          } else {
            // Different payer and receiver: calculate exact net due
            let cashIn = pt.partnerId === receiverId ? totalSaleAmount : 0;
            let cashOut = pt.partnerId === payerId ? lotAmount : 0;
            let netEntitlement = partnerCapShare + partnerProfitShare;
            let netDue = netEntitlement - (cashIn - cashOut);
            appBalance[pt.partnerId] = netDue;
          }
        });
      }

      // Add to global partner balances
      Object.keys(appBalance).forEach(pId => {
        if (balances[pId] !== undefined) {
          balances[pId] += appBalance[pId];
        }
      });

      appBreakdowns.push({
        ipoId: ipo.id,
        ipoName: ipo.name,
        appId: app.id,
        status: status,
        lotAmount,
        payerId,
        balances: appBalance
      });
    });
  });

  // Factor in manual direct settlements between partners
  settlements.forEach(s => {
    const amount = Number(s.amount || 0);
    if (balances[s.fromPartnerId] !== undefined) {
      balances[s.fromPartnerId] += amount;
    }
    if (balances[s.toPartnerId] !== undefined) {
      balances[s.toPartnerId] -= amount;
    }
  });

  // Calculate Pairwise Debts ("Who Owes Whom") using greedy debt simplification graph
  const pairwiseDebts = simplifyDebts(balances, partners);

  return {
    balances,
    pairwiseDebts,
    appBreakdowns
  };
}

/**
 * Greedy graph algorithm to simplify net balances into minimum transactions between partners.
 */
function simplifyDebts(balances, partners) {
  const debtors = []; // People who owe money (negative balance)
  const creditors = []; // People who are owed money (positive balance)

  Object.keys(balances).forEach(pId => {
    const bal = Math.round(balances[pId]);
    if (bal < -1) {
      debtors.push({ id: pId, amount: Math.abs(bal) });
    } else if (bal > 1) {
      creditors.push({ id: pId, amount: bal });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    if (settledAmount > 0) {
      const fromName = partners.find(p => p.id === debtor.id)?.name || debtor.id;
      const toName = partners.find(p => p.id === creditor.id)?.name || creditor.id;

      transactions.push({
        fromPartnerId: debtor.id,
        fromPartnerName: fromName,
        toPartnerId: creditor.id,
        toPartnerName: toName,
        amount: settledAmount
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount <= 1) dIdx++;
    if (creditor.amount <= 1) cIdx++;
  }

  return transactions;
}

/**
 * Calculate high-level summary metrics across all applications
 */
export function calculateDashboardMetrics(ipos = [], partners = []) {
  let totalAppliedCapital = 0;
  let totalBlockedCapital = 0;
  let totalRealizedProfit = 0;
  let totalApplicationsCount = 0;
  let totalAllottedCount = 0;

  ipos.forEach(ipo => {
    (ipo.applications || []).forEach(app => {
      totalApplicationsCount++;
      const lotAmount = app.amount || ((ipo.lotPrice || 14850) * (app.lots || 1));
      totalAppliedCapital += lotAmount;

      if (app.status === 'BLOCKED' || app.status === 'ALLOTTED') {
        totalBlockedCapital += lotAmount;
      }
      if (app.status === 'ALLOTTED' || app.status === 'SOLD') {
        totalAllottedCount++;
      }
      if (app.status === 'SOLD' && app.exitDetails) {
        const totalSale = Number(app.exitDetails.totalSaleAmount || 0);
        totalRealizedProfit += (totalSale - lotAmount);
      }
    });
  });

  const allotmentRate = totalApplicationsCount > 0 
    ? ((totalAllottedCount / totalApplicationsCount) * 100).toFixed(1) 
    : '0.0';

  return {
    totalAppliedCapital,
    totalBlockedCapital,
    totalRealizedProfit,
    totalApplicationsCount,
    totalAllottedCount,
    allotmentRate
  };
}
