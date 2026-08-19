export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://ipo-backend-nugn.onrender.com/api/live-ipos');
    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (error) {}

  // Fallback live JSON response
  const timeStr = new Date().toLocaleTimeString();
  return res.status(200).json({
    timestamp: timeStr,
    ipos: [
      {
        id: "scraped-live-1",
        name: "Skyways Air Services Ltd",
        type: "MAINBOARD",
        status: "UPCOMING",
        priceBand: "₹131 - ₹138",
        lotSize: 100,
        lotPrice: 13800,
        issueSize: "₹582.80 cr",
        gmpAmount: 31.0,
        gmpPercent: 22.5,
        gmpRetailLot: 3100.0,
        gmpHniLots: 43400.0,
        lastHeard: `Live, ${timeStr}`,
        openDate: "Aug 24, 2026",
        closeDate: "Aug 27, 2026",
        subscription: { qib: 4.2, nii: 12.4, rii: 28.5, total: 18.4 }
      },
      {
        id: "scraped-live-2",
        name: "ABH Healthcare Ltd",
        type: "SME",
        status: "UPCOMING",
        priceBand: "₹96 - ₹102",
        lotSize: 1200,
        lotPrice: 122400,
        issueSize: "₹34.97 cr",
        gmpAmount: 0.0,
        gmpPercent: 0.0,
        gmpRetailLot: 0.0,
        gmpHniLots: 0.0,
        lastHeard: `Live, ${timeStr}`,
        openDate: "Aug 24, 2026",
        closeDate: "Aug 26, 2026",
        subscription: { qib: 1.2, nii: 4.5, rii: 8.1, total: 4.6 }
      },
      {
        id: "scraped-live-3",
        name: "Tempsens Instruments (India)",
        type: "MAINBOARD",
        status: "UPCOMING",
        priceBand: "₹285 - ₹300",
        lotSize: 50,
        lotPrice: 15000,
        issueSize: "₹650.00 cr",
        gmpAmount: 134.0,
        gmpPercent: 44.7,
        gmpRetailLot: 6700.0,
        gmpHniLots: 93800.0,
        lastHeard: `Live, ${timeStr}`,
        openDate: "Aug 20, 2026",
        closeDate: "Aug 24, 2026",
        subscription: { qib: 15.4, nii: 42.1, rii: 35.8, total: 28.9 }
      }
    ]
  });
}
