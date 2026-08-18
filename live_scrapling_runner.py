import json
import time
import re
import os
import sys

def run_scrape():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        page.goto("https://www.ipopremium.in/", timeout=45000, wait_until="domcontentloaded")
        page.wait_for_selector("table tbody tr", timeout=15000)
        
        rows_data = page.evaluate("""
            () => {
                const trs = Array.from(document.querySelectorAll('table tbody tr'));
                return trs.map(tr => {
                    return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
                }).filter(r => r.length >= 7);
            }
        """)
        
        browser.close()
        
        ipos = []
        for idx, row in enumerate(rows_data):
            name = row[0]
            gmp_raw = row[1]
            open_d = row[2]
            close_d = row[3]
            price_raw = row[4]
            lot_raw = int(row[5]) if row[5].isdigit() else 1
            issue = row[6]
            allotment = row[8] if len(row) > 8 else ''
            listing = row[9] if len(row) > 9 else ''
            action = row[10] if len(row) > 10 else ''

            t_type = 'SME' if ('SME' in name or 'BSE SME' in name or 'NSE SME' in name) else 'MAINBOARD'
            clean_name = re.sub(r'\s*\([^)]*\)', '', name).strip()

            gmp_amt = 0.0
            gmp_pct = 0.0
            if gmp_raw and gmp_raw != '0':
                m = re.search(r'([0-9.]+)\s*\(([0-9.]+)%\)', gmp_raw)
                if m:
                    gmp_amt = float(m.group(1))
                    gmp_pct = float(m.group(2))
                else:
                    try:
                        gmp_amt = float(gmp_raw)
                    except:
                        pass

            p_parts = price_raw.split('-')
            p_low = float(p_parts[0]) if p_parts[0] else 100
            p_high = float(p_parts[1]) if len(p_parts) > 1 and p_parts[1] else p_low
            price_band_str = f"₹{int(p_low)} - ₹{int(p_high)}"
            lot_price = int(p_high * lot_raw)

            retail_profit = round(lot_raw * gmp_amt, 2)
            hni_profit = round(lot_raw * 14 * gmp_amt, 2)

            status = 'CLOSED'
            if action in ['Apply', 'Pre-Apply'] or 'Aug 17' in open_d or 'Aug 14' in open_d or 'Aug 13' in open_d:
                status = 'OPEN'
            elif any(d in open_d for d in ['Aug 18', 'Aug 19', 'Aug 20', 'Aug 24', 'Aug 25', 'Aug 26']):
                status = 'UPCOMING'

            ipos.append({
                "id": f"scraped-live-{idx+1}",
                "name": clean_name,
                "type": t_type,
                "status": status,
                "priceBand": price_band_str,
                "lotSize": lot_raw,
                "lotPrice": lot_price,
                "issueSize": f"₹{issue} cr",
                "gmpAmount": gmp_amt,
                "gmpPercent": gmp_pct,
                "gmpRetailLot": retail_profit,
                "gmpHniLots": hni_profit,
                "lastHeard": time.strftime("%I:%M %p"),
                "estListingPrice": f"₹{p_high + gmp_amt:.1f} (+{gmp_pct}%)",
                "openDate": open_d,
                "closeDate": close_d,
                "allotmentDate": allotment,
                "listingDate": listing,
                "rating": "VERY_HIGH" if gmp_pct >= 25 else "HIGH_DEMAND" if gmp_pct >= 10 else "MODERATE"
            })

        result = {
            "lastScrapedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
            "totalCount": len(ipos),
            "source": "ipopremium.in",
            "ipos": ipos
        }

        print(json.dumps(result))

if __name__ == "__main__":
    run_scrape()
