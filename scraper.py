from scrapling import StealthyFetcher
import json
import re

def scrape_live_ipos():
    fetcher = StealthyFetcher()
    res = fetcher.fetch('https://www.investorgain.com/report/ipo-gmp-live/331/')
    
    table = res.css('table')
    if not table:
        return []
        
    rows = table[0].css('tr')
    ipos = []

    for r in rows:
        cells = [c.text.strip() for c in r.css('td, th') if c.text.strip()]
        if len(cells) >= 4:
            ipos.append(cells)
            
    return ipos

if __name__ == '__main__':
    data = scrape_live_ipos()
    print(f"Scraped {len(data)} rows.")
    for d in data[:10]:
        print(d)
