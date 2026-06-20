import os
import re
import json
import sys
import time
import requests
from bs4 import BeautifulSoup
import urllib3
from urllib.parse import urljoin, urlparse, parse_qs

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Import transliteration from parse_and_export_voters.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from parse_and_export_voters import to_english_name
except ImportError:
    # Fallback copy of the basic transliteration logic if needed
    print("WARNING: Could not import to_english_name directly, will define fallback.")
    def to_english_name(name):
        return name

def normalize_script(text):
    if not text:
        return ""
    out = []
    for c in text:
        val = ord(c)
        if 0x0A80 <= val <= 0x0AFF:
            out.append(chr(val - 0x0180))
        elif 0x0A00 <= val <= 0x0A7F:
            out.append(chr(val - 0x0100))
        else:
            out.append(c)
    return "".join(out)

# Base URL and URL params
base_url = "https://epds.bihar.gov.in/RCList_Village_Wise.aspx?Village_Code_PMO=1023301451249626&&Village_Name_PMO=Pateri&&Panchayat_Code_PMO=011413&&Panchayat_Name_PMO=SHIWRAMPUR%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&&District_Code_PMO=233&&District_Name_PMO=Kaimur%20(Bhabua)&&Tahsil_Code_PMO=01451&&Tahsil_Name_PMO=Chand"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://epds.bihar.gov.in"
}

session = requests.Session()

def get_hidden_fields(soup):
    fields = {}
    for inp in soup.find_all('input', type='hidden'):
        name = inp.get('name')
        val = inp.get('value', '')
        if name:
            fields[name] = val
    return fields

def parse_index_rows(soup):
    cards = []
    table = soup.find('table', id='gridmain')
    if not table:
        return cards
        
    rows = table.find_all('tr')
    # First row is header, last row might be pagination.
    # We iterate and check if rows contain card links.
    for r in rows:
        a_tag = r.find('a', href=re.compile(r'LinkButton1'))
        if a_tag:
            cells = [cell.text.strip() for cell in r.find_all('td')]
            if len(cells) >= 7:
                # Structure: S.NO. (0), Ration Card (1), Card Type (2), Holder Name (3), Father Name (4), Members (5), FPS Dealer (6)
                card_num = a_tag.text.strip()
                cards.append({
                    "rationCardNumber": card_num,
                    "cardType": cells[2],
                    "holderNameHindi": normalize_script(cells[3]),
                    "fatherNameHindi": normalize_script(cells[4]),
                    "membersCount": int(cells[5]) if cells[5].isdigit() else 0,
                    "fpsDealer": cells[6]
                })
    return cards

def determine_gender_by_relation(name_en, relation_hi):
    relation_hi = relation_hi.strip()
    
    # Direct mappings based on relation with Head
    if 'पति' in relation_hi or 'सौहर' in relation_hi:
        return 'Male'
    if 'पत्नी' in relation_hi or 'स्त्री' in relation_hi:
        return 'Female'
    if 'पुत्र' in relation_hi or 'बेटा' in relation_hi:
        return 'Male'
    if 'पुत्री' in relation_hi or 'बेटी' in relation_hi:
        return 'Female'
    if 'माता' in relation_hi or 'माँ' in relation_hi:
        return 'Female'
    if 'पिता' in relation_hi:
        return 'Male'
        
    # Suffix indicators as fallback
    name_lower = name_en.lower()
    female_indicators = ['bibi', 'devi', 'begum', 'begam', 'khatun', 'nisha', 'nisa', 'ara', 'bano', 'kumari']
    male_indicators = ['sah', 'shah', 'khan', 'singh', 'ram', 'prasad', 'kumar', 'ali', 'alam', 'ahmad', 'mohammad', 'mohd', 'md']
    
    for ind in female_indicators:
        if re.search(r'\b' + ind + r'\b', name_lower):
            return "Female"
    for ind in male_indicators:
        if re.search(r'\b' + ind + r'\b', name_lower):
            return "Male"
            
    return 'Male'

def parse_card_details(card_num):
    # Construct direct GET URL
    plc_code = card_num[:16]
    unique_id = card_num[-8:] # last 8 digits
    detail_url = f"https://epds.bihar.gov.in/RationCardDetails_INDV_BH.aspx?PLC_code={plc_code}&&Unique_RC_ID={unique_id}&&Village_Code_PMO=1023301451249626&&Village_Name_PMO=Pateri&&Panchayat_Code_PMO=011413&&Panchayat_Name_PMO=SHIWRAMPUR%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&&District_Code_PMO=233&&District_Name_PMO=Kaimur%20(Bhabua)&&Tahsil_Code_PMO=01451&&Tahsil_Name_PMO=Chand"
    
    try:
        r = session.get(detail_url, headers=headers, verify=False, timeout=15)
        if r.status_code != 200:
            print(f"Error fetching card details {card_num}: Status code {r.status_code}")
            return None
            
        soup = BeautifulSoup(r.text, 'html.parser')
        tables = soup.find_all('table')
        if len(tables) < 2:
            print(f"Error parsing card details {card_num}: Found only {len(tables)} tables")
            return None
            
        # Parse basic card details from Table 0
        card_type = ""
        fps_dealer = ""
        for row in tables[0].find_all('tr'):
            cells = [c.text.strip() for c in row.find_all(['td', 'th'])]
            if len(cells) >= 2:
                if 'कार्ड का प्रकार' in cells[0]:
                    card_type = cells[1].strip()
                if 'उचित मूल्य दुकानदार का नाम' in cells[0]:
                    fps_dealer = cells[1].strip()
                    
        # Parse family members from Table 1 (or Table 0 if Table 1 doesn't have details, but usually Table 1)
        members_table = tables[1]
        members = []
        rows = members_table.find_all('tr')
        if len(rows) > 1:
            for r_row in rows[1:]: # skip header row
                cells = [c.text.strip() for c in r_row.find_all('td')]
                if len(cells) >= 5:
                    # Structure: S.NO. (0), Member Name (1), Father Name (2), Age (3), Relation (4)
                    name_hi = normalize_script(cells[1])
                    father_hi = normalize_script(cells[2])
                    age_val = int(cells[3]) if cells[3].isdigit() else 0
                    relation_hi = normalize_script(cells[4])
                    
                    # Transliterate
                    name_en = to_english_name(name_hi)
                    father_en = to_english_name(father_hi)
                    gender = determine_gender_by_relation(name_en, relation_hi)
                    
                    members.append({
                        "nameHindi": name_hi,
                        "nameEnglish": name_en,
                        "fatherNameHindi": father_hi,
                        "fatherNameEnglish": father_en,
                        "age": age_val,
                        "relationHindi": relation_hi,
                        "gender": gender
                    })
        return {
            "rationCardNumber": card_num,
            "cardType": card_type,
            "fpsDealer": fps_dealer,
            "members": members
        }
    except Exception as e:
        print(f"Exception fetching card details {card_num}: {e}")
        return None

def main():
    print("Step 1: Fetching Index Page 1...")
    r_get = session.get(base_url, headers=headers, verify=False)
    soup = BeautifulSoup(r_get.text, 'html.parser')
    
    # Get form action and post URL
    form = soup.find('form')
    form_action = form.get('action')
    post_url = urljoin(base_url, form_action)
    
    print("Page 1 loaded. Parsing card numbers...")
    cards = parse_index_rows(soup)
    print(f"Found {len(cards)} card numbers on Page 1.")
    
    # Check for paginated pages in Table 2
    page_numbers = []
    paging_table = soup.find('table', id='gridmain')
    if paging_table:
        # Paging row is usually the last row
        rows = paging_table.find_all('tr')
        if rows:
            last_row = rows[-1]
            page_links = last_row.find_all('a', href=re.compile(r'Page\$'))
            for a in page_links:
                page_text = a.text.strip()
                if page_text.isdigit():
                    page_numbers.append(int(page_text))
                    
    # Ensure page numbers are sorted and unique
    page_numbers = sorted(list(set(page_numbers)))
    print("Found total pages to load:", page_numbers)
    
    # We will load subsequent pages
    current_soup = soup
    for p_num in page_numbers:
        print(f"\nFetching Index Page {p_num}...")
        payload = get_hidden_fields(current_soup)
        payload["__EVENTTARGET"] = "gridmain"
        payload["__EVENTARGUMENT"] = f"Page${p_num}"
        headers["Referer"] = base_url
        
        try:
            r_post = session.post(post_url, data=payload, headers=headers, verify=False)
            if r_post.status_code == 200:
                current_soup = BeautifulSoup(r_post.text, 'html.parser')
                p_cards = parse_index_rows(current_soup)
                print(f"Found {len(p_cards)} cards on Page {p_num}.")
                cards.extend(p_cards)
            else:
                print(f"Error loading page {p_num}: status code {r_post.status_code}")
        except Exception as e:
            print(f"Exception loading page {p_num}: {e}")
            
    # De-duplicate cards
    seen = set()
    unique_cards = []
    for c in cards:
        if c["rationCardNumber"] not in seen:
            seen.add(c["rationCardNumber"])
            unique_cards.append(c)
            
    print(f"\nTotal unique card numbers collected: {len(unique_cards)}")
    
    # Step 2: Fetch details for each card
    detailed_cards = []
    for idx, card in enumerate(unique_cards):
        print(f"[{idx+1}/{len(unique_cards)}] Fetching card {card['rationCardNumber']}...")
        details = parse_card_details(card["rationCardNumber"])
        if details:
            detailed_cards.append(details)
        else:
            # Fallback with index data if details fetch failed
            detailed_cards.append({
                "rationCardNumber": card["rationCardNumber"],
                "cardType": card["cardType"],
                "fpsDealer": card["fpsDealer"],
                "members": []
            })
        time.sleep(0.2) # small delay to prevent rate limits
        
    # Output to JSON
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ration_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(detailed_cards, f, ensure_ascii=False, indent=2)
        
    print(f"\nSuccessfully scraped {len(detailed_cards)} cards and saved to {output_path}")

if __name__ == "__main__":
    main()
