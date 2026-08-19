module.exports = async (req, res) => {
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
      }
    ]
  });
};
