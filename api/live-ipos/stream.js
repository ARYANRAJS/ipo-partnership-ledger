const { INITIAL_LIVE_IPOS } = require('../../src/data/live_ipos.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://ipo-backend-nugn.onrender.com/api/live-ipos');
    if (response.ok) {
      const data = await response.json();
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      return res.end();
    }
  } catch (err) {}

  const timeStr = new Date().toLocaleTimeString();
  const fallbackPayload = {
    timestamp: timeStr,
    source: "Chittorgarh / InvestorGain Live Exchange Scraper",
    ipos: INITIAL_LIVE_IPOS
  };

  res.write(`data: ${JSON.stringify(fallbackPayload)}\n\n`);
  return res.end();
};
