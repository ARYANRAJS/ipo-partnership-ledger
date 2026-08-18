/**
 * IPO Financial Engine & Debt Ledger Matrix Calculator
 */

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
          const targetGain = netProfit * sharePct; // target profit or loss share

          let actualNetCash = 0;
          if (pt.partnerId === payerId) actualNetCash -= lotAmount; // Paid upfront
          if (pt.partnerId === receiverId) actualNetCash += totalSaleAmount; // Received proceeds

          const netDue = targetGain - actualNetCash;
          appBalance[pt.partnerId] += netDue;
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
    // fromPartnerId paid toPartnerId
    // fromPartnerId's debt REDUCES (becomes more positive)
    // toPartnerId's receivable REDUCES (becomes less positive)
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
 * Given net balances, calculates minimum direct transaction pairs (e.g. "Vishal owes Me ₹17,500")
 */
function simplifyDebts(balances, partners) {
  const debtors = [];   // negative balance (owes money)
  const creditors = []; // positive balance (receives money)

  Object.keys(balances).forEach(pId => {
    const bal = Math.round(balances[pId]);
    if (bal < -1) {
      debtors.push({ id: pId, amount: Math.abs(bal) });
    } else if (bal > 1) {
      creditors.push({ id: pId, amount: bal });
    }
  });

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    if (settlementAmount > 0) {
      const debtorPartner = partners.find(p => p.id === debtor.id) || { name: debtor.id };
      const creditorPartner = partners.find(p => p.id === creditor.id) || { name: creditor.id };

      transactions.push({
        fromId: debtor.id,
        fromName: debtorPartner.name,
        toId: creditor.id,
        toName: creditorPartner.name,
        amount: Math.round(settlementAmount)
      });
    }

    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    if (debtor.amount <= 1) dIdx++;
    if (creditor.amount <= 1) cIdx++;
  }

  return transactions;
}

/**
 * Calculate Global Top-Level Dashboard Metrics
 */
export function calculateDashboardMetrics(ipos, partners) {
  let totalBlocked = 0;
  let totalInvestedAllotted = 0;
  let totalRealizedProfit = 0;
  let totalRealizedLoss = 0;
  let totalApplicationsCount = 0;
  let allottedCount = 0;
  let unallottedCount = 0;
  let recycledFundsPool = 0; // Money from NOT_ALLOTTED that hasn't been re-invested yet

  ipos.forEach(ipo => {
    (ipo.applications || []).forEach(app => {
      totalApplicationsCount++;
      const amt = app.amount || (ipo.lotPrice * (app.lots || 1));

      if (app.status === "BLOCKED") {
        totalBlocked += amt;
      } else if (app.status === "ALLOTTED") {
        totalInvestedAllotted += amt;
        allottedCount++;
      } else if (app.status === "NOT_ALLOTTED") {
        unallottedCount++;
        // If not re-invested to another app yet, count in recycled pool
        if (!app.reinvestedToAppId) {
          recycledFundsPool += amt;
        }
      } else if (app.status === "SOLD") {
        allottedCount++;
        if (app.exitDetails) {
          const saleAmt = Number(app.exitDetails.totalSaleAmount || 0);
          const pnl = saleAmt - amt;
          if (pnl >= 0) {
            totalRealizedProfit += pnl;
          } else {
            totalRealizedLoss += Math.abs(pnl);
          }
        }
      }
    });
  });

  const netRealizedPnL = totalRealizedProfit - totalRealizedLoss;
  const allotmentRate = totalApplicationsCount > 0 
    ? Math.round((allottedCount / totalApplicationsCount) * 100) 
    : 0;

  return {
    totalBlocked,
    totalInvestedAllotted,
    totalRealizedProfit,
    totalRealizedLoss,
    netRealizedPnL,
    totalApplicationsCount,
    allottedCount,
    unallottedCount,
    allotmentRate,
    recycledFundsPool
  };
}

/**
 * Format Indian Currency Format (₹ 1,50,000)
 */
export function formatINR(val) {
  const num = Math.round(Number(val) || 0);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formatted = new Intl.NumberFormat('en-IN').format(absNum);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
