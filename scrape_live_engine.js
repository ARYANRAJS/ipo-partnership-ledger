import { chromium } from 'playwright';

export async function scrapeIpoPremiumLive() {
  console.log('[SCRAPER] Launching headless browser for ipopremium.in...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    await page.goto('https://www.ipopremium.in/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for table rows to render
    await page.waitForSelector('table tbody tr', { timeout: 15000 }).catch(() => {});
    
    const rows = await page.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('table tbody tr'));
      return trs.map(tr => {
        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        return tds;
      }).filter(row => row.length >= 7);
    });

    console.log(`[SCRAPER] Scraped ${rows.length} live table rows from ipopremium.in`);

    if (!rows || rows.length === 0) {
      await browser.close();
      return null;
    }

    const ipos = rows.map((row, idx) => {
      const name = row[0] || '';
      const gmp_raw = row[1] || '0';
      const open_d = row[2] || '';
      const close_d = row[3] || '';
      const price_raw = row[4] || '';
      const lot_raw = parseInt(row[5]) || 1;
      const issue = row[6] || '';
      const allotment = row[8] || '';
      const listing = row[9] || '';
      const action = row[10] || '';

      const t_type = (name.includes('SME') || name.includes('BSE SME') || name.includes('NSE SME')) ? 'SME' : 'MAINBOARD';
      const clean_name = name.replace(/\s*\([^)]*\)/g, '').trim();

      let gmp_amt = 0.0;
      let gmp_pct = 0.0;
      if (gmp_raw && gmp_raw !== '0') {
        const m = gmp_raw.match(/([0-9.]+)\s*\(([0-9.]+)%\)/);
        if (m) {
          gmp_amt = parseFloat(m[1]);
          gmp_pct = parseFloat(m[2]);
        } else {
          gmp_amt = parseFloat(gmp_raw) || 0;
        }
      }

      let p_low = 100, p_high = 100;
      if (price_raw) {
        const parts = price_raw.split('-');
        p_low = parseFloat(parts[0]) || 100;
        p_high = parts.length > 1 ? (parseFloat(parts[1]) || p_low) : p_low;
      }

      let status = 'CLOSED';
      if (action === 'Apply' || action === 'Pre-Apply' || open_d.includes('Aug 17') || open_d.includes('Aug 14') || open_d.includes('Aug 13')) {
        status = 'OPEN';
      } else if (open_d.includes('Aug 18') || open_d.includes('Aug 19') || open_d.includes('Aug 20') || open_d.includes('Aug 24') || open_d.includes('Aug 25')) {
        status = 'UPCOMING';
      }

      const lot_price = Math.round(p_high * lot_raw);
      const retail_profit = Math.round(lot_raw * gmp_amt * 100) / 100;
      const hni_profit = Math.round(lot_raw * 14 * gmp_amt * 100) / 100;

      return {
        id: `live-scraped-${idx + 1}`,
        name: clean_name,
        type: t_type,
        status: status,
        priceBand: `₹${Math.round(p_low)} - ₹${Math.round(p_high)}`,
        lotSize: lot_raw,
        lotPrice: lot_price,
        issueSize: `₹${issue} cr`,
        gmpAmount: gmp_amt,
        gmpPercent: gmp_pct,
        gmpRetailLot: retail_profit,
        gmpHniLots: hni_profit,
        lastHeard: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        estListingPrice: `₹${(p_high + gmp_amt).toFixed(1)} (+${gmp_pct}%)`,
        openDate: open_d,
        closeDate: close_d,
        allotmentDate: allotment,
        listingDate: listing,
        rating: gmp_pct >= 25 ? 'VERY_HIGH' : gmp_pct >= 10 ? 'HIGH_DEMAND' : 'MODERATE'
      };
    });

    await browser.close();
    return ipos;
  } catch (err) {
    console.error('[SCRAPER ERROR]', err);
    if (browser) await browser.close();
    return null;
  }
}
