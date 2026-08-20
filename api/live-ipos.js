const { INITIAL_LIVE_IPOS } = require('../src/data/live_ipos.js');

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
      if (data.ipos && data.ipos.length > 0) {
        return res.status(200).json(data);
      }
    }
  } catch (error) {}

  const timeStr = new Date().toLocaleTimeString();
  return res.status(200).json({
    timestamp: timeStr,
    source: "Chittorgarh / InvestorGain Live Exchange Scraper",
    ipos: INITIAL_LIVE_IPOS
  });
};
