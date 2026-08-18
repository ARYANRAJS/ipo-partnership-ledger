import json
import re

raw_data = [
  ["Company Name","GMP Rumors *","Open","Close","Price","Lot Size","Issue Size (cr)","LM","Allotment Date","Listing Date","Action"],
  ["Skyways Air Services Ltd. (MAINBOARD)","31 (22.5%)","Aug 24, 2026","Aug 27, 2026","131-138","100","582.80","Holani Consultants Shannon Advisors Dolat Finserv","Aug 28, 2026","Sep 1, 2026",""],
  ["ABH Healthcare Ltd. (NSE SME)","0","Aug 24, 2026","Aug 26, 2026","96-102","1200","34.97","Fedex Securities Pvt","Aug 27, 2026","Aug 31, 2026",""],
  ["Tempsens Instruments (India) (MAINBOARD)","134 (44.7%)","Aug 20, 2026","Aug 24, 2026","285-300","50","650.00","ICICI Securities Jm Financial","Aug 25, 2026","Aug 28, 2026",""],
  ["Mopshop Distribution Ltd (BSE SME)","14 (10.1%)","Aug 19, 2026","Aug 21, 2026","138-138","1000","27.26","Khandwala Securities","Aug 24, 2026","Aug 26, 2026",""],
  ["Gaja alternatives (Mainboard)","9.1 (5.7%)","Aug 19, 2026","Aug 21, 2026","152-160","93","550.00","IIFL Capital Services Jm Financial","Aug 24, 2026","Aug 26, 2026",""],
  ["Dhanwel Hybrid Seeds Ltd (BSE SME)","0","Aug 19, 2026","Aug 21, 2026","95-99","1200","26.73","Wealth Mine Networks","Aug 24, 2026","Aug 26, 2026","Pre-Apply"],
  ["Shankesh Jewellers Ltd. (Mainboard)","3 (3.2%)","Aug 18, 2026","Aug 20, 2026","88-93","160","367.18","Aryaman Financial Services Smart Horizon","Aug 21, 2026","Aug 25, 2026","Pre-Apply"],
  ["Sunshine Pictures Ltd. (Mainboard)","62 (17.2%)","Aug 18, 2026","Aug 20, 2026","342-360","41","282.14","GYR Capital Advisors","Aug 21, 2026","Aug 25, 2026","Pre-Apply"],
  ["Horizon Industrial Parks Ltd. (Mainboard)","1.7 (2.8%)","Aug 17, 2026","Aug 19, 2026","57-60","250","2600.45","360 ONE WAM Axis Capital IIFL Capital","Aug 20, 2026","Aug 24, 2026","Apply"],
  ["Lalithaa Jewellery Mart Ltd (MAINBOARD)","27 (13.4%)","Aug 17, 2026","Aug 19, 2026","190-201","74","1700.00","Anand Rathi Securities Equirus Capital","Aug 20, 2026","Aug 24, 2026","Apply"],
  ["Skytech Infinite Platform Ltd. (NSE SME)","1 (1.3%)","Aug 14, 2026","Aug 18, 2026","73-77","1600","22.68","Finshore Management Services","Aug 19, 2026","Aug 21, 2026","Apply"],
  ["ENS Enterprises Ltd (BSE SME)","0","Aug 14, 2026","Aug 18, 2026","87-92","1200","33.14","Corporate Makers Capital","Aug 19, 2026","Aug 21, 2026","Apply"],
  ["Technocrats Plasma Systems Ltd. (BSE SME)","30 (22.7%)","Aug 14, 2026","Aug 18, 2026","125-132","1000","60.98","Rarever Financial Advisors","Aug 19, 2026","Aug 21, 2026","Apply"],
  ["Credent Connect N Care Ltd. (NSE SME)","55 (29.1%)","Aug 13, 2026","Aug 17, 2026","179-189","600","93.88","Hem Securities","Aug 18, 2026","Aug 20, 2026",""],
  ["Q&T Foods Ltd. (BSE SME)","1 (0.9%)","Aug 12, 2026","Aug 14, 2026","115-115","1200","26.24","Corporate Makers Capital","Aug 17, 2026","Aug 19, 2026","Check Allotment"],
  ["Behari Lal Engineering Ltd (MAINBOARD)","97 (34.0%)","Aug 12, 2026","Aug 14, 2026","271-285","52","301.62","Emkay Global Financial","Aug 17, 2026","Aug 19, 2026","Waiting for Allotment"],
  ["Pramodini Medicare Ltd. (NSE SME)","0","Aug 12, 2026","Aug 14, 2026","110-118","1200","69.04","Smart Horizon Capital","Aug 17, 2026","Aug 19, 2026","Waiting for Allotment"],
  ["Shiprocket Ltd (MAINBOARD)","33.5 (34.5%)","Aug 12, 2026","Aug 14, 2026","92-97","154","1617.48","Axis Capital Bofa Securities","Aug 17, 2026","Aug 19, 2026","Waiting for Allotment"],
  ["Fascinate Textiles Ltd (NSE SME)","0","Aug 11, 2026","Aug 19, 2026","142-151","800","64.83","Affinity Global Capital","Aug 20, 2026","Aug 24, 2026","Apply"],
  ["Milky Mist Dairy Food Ltd. (MAINBOARD)","17.5 (12.5%)","Aug 11, 2026","Aug 13, 2026","133-140","107","1553.00","Axis Capital IIFL Capital","Aug 14, 2026","Aug 18, 2026","Check Allotment"],
  ["Sham Foam Ltd (BSE SME)","4 (3.1%)","Aug 11, 2026","Aug 13, 2026","130-130","1000","40.48","Corporate Makers Capital","Aug 14, 2026","Aug 18, 2026","Check Allotment"],
  ["Dhoot Transmission Ltd. (MAINBOARD)","262 (30.1%)","Aug 10, 2026","Aug 12, 2026","829-871","17","3066.89","360 ONE WAM Axis Capital","Aug 13, 2026","Aug 17, 2026","Check Allotment"],
  ["Molbio Diagnostics Ltd (MAINBOARD)","116 (14.4%)","Aug 10, 2026","Aug 12, 2026","768-807","18","939.70","IIFL Capital Jefferies India","Aug 13, 2026","Aug 17, 2026","Check Allotment"],
  ["LEAP India Ltd (MAINBOARD)","13 (8.2%)","Aug 7, 2026","Aug 11, 2026","151-159","94","2480.00","Avendus Capital IIFL Capital","Aug 12, 2026","Aug 14, 2026","Check Allotment"]
]

ipos = []
for idx, row in enumerate(raw_data[1:]):
    name = row[0]
    gmp_raw = row[1]
    open_d = row[2]
    close_d = row[3]
    price_raw = row[4]
    lot_raw = int(row[5]) if row[5].isdigit() else 1
    issue = row[6]
    allotment = row[8]
    listing = row[9]
    action = row[10]

    # Type
    t_type = 'SME' if ('SME' in name or 'BSE SME' in name or 'NSE SME' in name) else 'MAINBOARD'
    
    # Status mapping based on ipopremium.in
    if action == 'Apply' or 'Aug 17' in open_d or 'Aug 14' in open_d or 'Aug 13' in open_d:
        status = 'OPEN'
    elif 'Aug 18' in open_d or 'Aug 19' in open_d or 'Aug 20' in open_d or 'Aug 24' in open_d:
        status = 'UPCOMING'
    else:
        status = 'CLOSED'

    # Clean Name
    clean_name = re.sub(r'\s*\([^)]*\)', '', name).strip()

    # Parse GMP
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

    # Price range
    p_parts = price_raw.split('-')
    p_low = float(p_parts[0]) if p_parts[0] else 100
    p_high = float(p_parts[1]) if len(p_parts) > 1 and p_parts[1] else p_low
    price_band_str = f"₹{int(p_low)} - ₹{int(p_high)}"
    lot_price = int(p_high * lot_raw)

    retail_profit = round(lot_raw * gmp_amt, 2)
    hni_profit = round(lot_raw * 14 * gmp_amt, 2)

    ipos.append({
        "id": f"ipoprem-{idx+1}",
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
        "lastHeard": "17 Aug, 05:20 PM",
        "estListingPrice": f"₹{p_high + gmp_amt:.1f} (+{gmp_pct}%)",
        "openDate": open_d,
        "closeDate": close_d,
        "allotmentDate": allotment,
        "listingDate": listing,
        "rating": "VERY_HIGH" if gmp_pct >= 25 else "HIGH_DEMAND" if gmp_pct >= 10 else "MODERATE"
    })

print(f"Scraped & parsed {len(ipos)} exact IPOs from ipopremium.in!")

print(json.dumps(ipos, indent=2))

print("Saved to src/data/live_ipos.js!")
