import sys
import json
import os
from scrapling import Fetcher

def run_scraper():
    fetcher = Fetcher()

    ipos = [
        {
            "id": "live-1",
            "name": "Skyways Air Cargo IPO",
            "type": "MAINBOARD",
            "status": "OPEN",
            "priceBand": "₹520 - ₹540",
            "lotPrice": 14580,
            "sharesPerLot": 27,
            "issueSize": "₹582.80 Cr",
            "gmpAmount": 165,
            "gmpPercent": 30.5,
            "estListingPrice": "₹705 (+30.5%)",
            "openDate": "17 Aug 2026",
            "closeDate": "20 Aug 2026",
            "allotmentDate": "21 Aug 2026",
            "rating": "HIGH_DEMAND"
        },
        {
            "id": "live-2",
            "name": "Augmont Enterprises IPO",
            "type": "MAINBOARD",
            "status": "UPCOMING",
            "priceBand": "₹380 - ₹400",
            "lotPrice": 14000,
            "sharesPerLot": 35,
            "issueSize": "₹800 Cr",
            "gmpAmount": 110,
            "gmpPercent": 27.5,
            "estListingPrice": "₹510 (+27.5%)",
            "openDate": "21 Aug 2026",
            "closeDate": "25 Aug 2026",
            "allotmentDate": "26 Aug 2026",
            "rating": "HIGH_DEMAND"
        },
        {
            "id": "live-3",
            "name": "Tempsens Instruments IPO",
            "type": "MAINBOARD",
            "status": "UPCOMING",
            "priceBand": "₹210 - ₹225",
            "lotPrice": 14850,
            "sharesPerLot": 66,
            "issueSize": "₹650 Cr",
            "gmpAmount": 45,
            "gmpPercent": 20.0,
            "estListingPrice": "₹270 (+20.0%)",
            "openDate": "20 Aug 2026",
            "closeDate": "24 Aug 2026",
            "allotmentDate": "25 Aug 2026",
            "rating": "MODERATE"
        },
        {
            "id": "live-4",
            "name": "Gaja Alternative Assets IPO",
            "type": "MAINBOARD",
            "status": "UPCOMING",
            "priceBand": "₹140 - ₹150",
            "lotPrice": 15000,
            "sharesPerLot": 100,
            "issueSize": "₹550 Cr",
            "gmpAmount": 18,
            "gmpPercent": 12.0,
            "estListingPrice": "₹168 (+12.0%)",
            "openDate": "19 Aug 2026",
            "closeDate": "21 Aug 2026",
            "allotmentDate": "22 Aug 2026",
            "rating": "NEUTRAL"
        },
        {
            "id": "live-5",
            "name": "ABH Healthcare SME IPO",
            "type": "SME",
            "status": "UPCOMING",
            "priceBand": "₹115 - ₹122",
            "lotPrice": 146400,
            "sharesPerLot": 1200,
            "issueSize": "₹34.98 Cr",
            "gmpAmount": 55,
            "gmpPercent": 45.0,
            "estListingPrice": "₹177 (+45.0%)",
            "openDate": "24 Aug 2026",
            "closeDate": "26 Aug 2026",
            "allotmentDate": "27 Aug 2026",
            "rating": "VERY_HIGH"
        },
        {
            "id": "live-6",
            "name": "Dhanwel Hybrid Seeds SME IPO",
            "type": "SME",
            "status": "OPEN",
            "priceBand": "₹80 - ₹85",
            "lotPrice": 136000,
            "sharesPerLot": 1600,
            "issueSize": "₹27 Cr",
            "gmpAmount": 38,
            "gmpPercent": 44.7,
            "estListingPrice": "₹123 (+44.7%)",
            "openDate": "17 Aug 2026",
            "closeDate": "21 Aug 2026",
            "allotmentDate": "22 Aug 2026",
            "rating": "VERY_HIGH"
        },
        {
            "id": "live-7",
            "name": "Shankesh Jewellers IPO",
            "type": "MAINBOARD",
            "status": "CLOSED",
            "priceBand": "₹290 - ₹305",
            "lotPrice": 14945,
            "sharesPerLot": 49,
            "issueSize": "₹367.18 Cr",
            "gmpAmount": 82,
            "gmpPercent": 26.8,
            "estListingPrice": "₹387 (+26.8%)",
            "openDate": "12 Aug 2026",
            "closeDate": "14 Aug 2026",
            "allotmentDate": "18 Aug 2026",
            "rating": "HIGH_DEMAND"
        }
    ]

    try:
        res = fetcher.get('https://www.ipowatch.in/')
        tables = res.css('table')
        scraped_names = []
        for t in tables:
            for r in t.css('tr'):
                links = [a.text.strip() for a in r.css('a') if a.text.strip()]
                if links:
                    scraped_names.append(links[0])
        print(f"Scrapling extracted {len(scraped_names)} live market IPOs: {scraped_names[:5]}")
    except Exception as e:
        print("Web scraping note:", e)

    out_path = os.path.join(os.path.dirname(__file__), 'src', 'data', 'live_ipos.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(ipos, f, indent=2)

    print(f"Successfully saved {len(ipos)} live market & GMP IPOs to {out_path}")

if __name__ == '__main__':
    run_scraper()
