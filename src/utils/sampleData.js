// Initial realistic sample data demonstrating user's exact scenarios:
// 1. Me (Self), Vishal (Friend), Partner 3
// 2. Applications with 50-50 splits and 33-33-34 splits
// 3. Un-allotted IPO with funds recycled / re-invested into a new IPO
// 4. Allotted IPO listing with Profit (50-50 split)
// 5. Allotted IPO listing with Loss (50-50 split)

export const INITIAL_PARTNERS = [
  {
    id: "p-self",
    name: "Me (Self)",
    upiOrBank: "HDFC Bank - 9012",
    notes: "Main Capital Provider",
    isSelf: true
  },
  {
    id: "p-vishal",
    name: "Vishal",
    upiOrBank: "SBI Bank - 4180",
    notes: "Friend & 50% Partner",
    isSelf: false
  },
  {
    id: "p-partner3",
    name: "Partner 3 (Rohit)",
    upiOrBank: "ICICI Bank - 3319",
    notes: "3-Way Partnership Friend",
    isSelf: false
  }
];

export const INITIAL_ACCOUNTS = [
  {
    id: "acc-self-hdfc",
    partnerId: "p-self",
    name: "HDFC Primary Bank",
    accountNumber: "XXXX9012",
    pan: "ABCDE1234F"
  },
  {
    id: "acc-vishal-sbi",
    partnerId: "p-vishal",
    name: "Vishal SBI Bank",
    accountNumber: "XXXX4180",
    pan: "VWXYZ5678G"
  },
  {
    id: "acc-p3-icici",
    partnerId: "p-partner3",
    name: "Rohit ICICI Bank",
    accountNumber: "XXXX3319",
    pan: "LMNOP9101H"
  }
];

export const INITIAL_IPOS = [
  {
    id: "ipo-1",
    name: "Tata Technologies IPO",
    lotPrice: 15000,
    sharesPerLot: 30,
    applyDate: "2026-08-01",
    status: "NOT_ALLOTTED", // Blocked -> Released back
    notes: "Applied 50-50 with Vishal. Money blocked from My HDFC account.",
    applications: [
      {
        id: "app-101",
        applicantPartnerId: "p-vishal", // Applied in Vishal's Demat
        payerPartnerId: "p-self",       // Paid by Me (100% upfront)
        accountId: "acc-self-hdfc",
        lots: 1,
        amount: 15000,
        status: "NOT_ALLOTTED",          // Unblocked
        unblockedDate: "2026-08-05",
        reinvestedToAppId: "app-103",   // Re-invested into Hyundai IPO!
        partners: [
          { partnerId: "p-self", percentage: 50 },
          { partnerId: "p-vishal", percentage: 50 }
        ]
      }
    ]
  },
  {
    id: "ipo-2",
    name: "Hyundai Motor India IPO",
    lotPrice: 15000,
    sharesPerLot: 7,
    applyDate: "2026-08-06",
    status: "SOLD",
    notes: "Re-invested funds from Tata Tech unblocked IPO! 50-50 split with Vishal.",
    applications: [
      {
        id: "app-103",
        applicantPartnerId: "p-vishal",
        payerPartnerId: "p-self", // Original capital source was Me
        accountId: "acc-vishal-sbi",
        lots: 1,
        amount: 15000,
        status: "SOLD",
        reinvestedFromAppId: "app-101",
        partners: [
          { partnerId: "p-self", percentage: 50 },
          { partnerId: "p-vishal", percentage: 50 }
        ],
        exitDetails: {
          soldDate: "2026-08-12",
          totalSaleAmount: 25000, // Cost 15,000 -> Profit = 10,000!
          moneyReceivedPartnerId: "p-vishal", // ₹25,000 received into Vishal's SBI bank!
          notes: "Listed at 66% premium! Sold full lot."
        }
      }
    ]
  },
  {
    id: "ipo-3",
    name: "Swiggy Limited IPO",
    lotPrice: 14800,
    sharesPerLot: 38,
    applyDate: "2026-08-08",
    status: "SOLD",
    notes: "3-Person 50-50 / 3-way partnership test. Loss scenario.",
    applications: [
      {
        id: "app-104",
        applicantPartnerId: "p-partner3", // Applied in Partner 3 (Rohit's) account
        payerPartnerId: "p-self",         // Paid by Me
        accountId: "acc-p3-icici",
        lots: 1,
        amount: 14800,
        status: "SOLD",
        partners: [
          { partnerId: "p-self", percentage: 34 },
          { partnerId: "p-vishal", percentage: 33 },
          { partnerId: "p-partner3", percentage: 33 }
        ],
        exitDetails: {
          soldDate: "2026-08-14",
          totalSaleAmount: 11800, // Cost 14,800 -> Loss = -3,000 (-20.2%)
          moneyReceivedPartnerId: "p-partner3", // Money received into Rohit's account
          notes: "Weak listing, exited at loss. Loss split 3-ways."
        }
      }
    ]
  },
  {
    id: "ipo-4",
    name: "Bhaven Telecom IPO (Active)",
    lotPrice: 14500,
    sharesPerLot: 100,
    applyDate: "2026-08-14",
    status: "BLOCKED",
    notes: "Currently active. Allotment awaited on 18th August.",
    applications: [
      {
        id: "app-105",
        applicantPartnerId: "p-self",
        payerPartnerId: "p-self",
        accountId: "acc-self-hdfc",
        lots: 1,
        amount: 14500,
        status: "BLOCKED",
        partners: [
          { partnerId: "p-self", percentage: 50 },
          { partnerId: "p-vishal", percentage: 50 }
        ]
      }
    ]
  }
];

export const INITIAL_SETTLEMENTS = [
  {
    id: "settle-1",
    fromPartnerId: "p-vishal",
    toPartnerId: "p-self",
    amount: 5000,
    date: "2026-08-13",
    note: "Vishal paid ₹5,000 UPI advance settlement for Hyundai IPO profit",
    paymentMode: "UPI / GPay"
  }
];
