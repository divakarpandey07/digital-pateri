import os
import re
import json
import sys
from pypdf import PdfReader
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

sys.stdout.reconfigure(encoding='utf-8')

data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
pdf_files = ["33 Kaimur_A213_A2130091.pdf", "33 Kaimur_A213_A2130092.pdf", "33 Kaimur_A213_A2130093.pdf"]

all_voters = []

RELATION_TYPES = {'F', 'H', 'M', 'W', 'O'}
GENDERS = {'M', 'F', 'O'}

def is_epic(token):
    return '/' in token or re.match(r'^[A-Z]{3}\d{7}$', token)

def is_float_link(token):
    return re.match(r'^\d+\.0$', token)

def clean_text(text):
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('"', '').replace("'", "")
    return text

def pre_process_hindi(text):
    # Normalize common abbreviations
    text = text.replace('अ0दुल', 'अब्दुल').replace('अ०दुल', 'अब्दुल')
    text = text.replace('अ0', 'अब्दुल ').replace('अ०', 'अब्दुल ')
    text = text.replace('मो0', 'मोहम्मद ').replace('मो०', 'मोहम्मद ')
    text = text.replace('श0', 'शेख ').replace('श०', 'शेख ')
    text = text.replace('डा0', 'डॉक्टर ').replace('डा०', 'डॉक्टर ')
    
    # 1. Map known glyph errors to logical Devanagari characters
    text = text.replace('¬ कराम', 'इकराम')
    text = text.replace('¬ कलाख', 'इखलाक')
    text = text.replace('¬ कलाक', 'इखलाक')
    text = text.replace('¬ खलाख', 'इखलाक')
    text = text.replace('¬ खलाक', 'इखलाक')
    text = text.replace('¬ नुल', 'जैनुल')
    text = text.replace('¬ नल', 'जैनुल')
    text = text.replace('¬ जाज', 'ऐजाज')
    text = text.replace('¬ नामूल', 'इनामुल')
    text = text.replace('¬ नामतु', 'इनामतु')
    text = text.replace('¬ नायतु', 'इनायतु')
    text = text.replace('¬ नायु', 'इनायतु')
    text = text.replace('¬ ब खा', 'तैयब खा')
    text = text.replace('¬ बा खा', 'तैयबा खा')
    text = text.replace('¬ हसान', 'एहसान')
    text = text.replace('¬ आवर', 'यावर')
    text = text.replace('¬ मादुल', 'इमादुल')
    
    # Generic ¬ replace (if any remaining)
    text = text.replace('¬', 'इ')
    
    # Map other special glyph symbols
    text = text.replace('±', 'औ')
    text = text.replace('¡', 'ं')
    text = text.replace('©', '')  # Remove श्री / स्व glyph to avoid cluttering english names
    text = text.replace('"', 'ी')  # " is long i (ी)
    text = text.replace('\x17', '\u093f') # \x17 is visual short i (ि)
    text = text.replace('/', '\u093f') # / is visual short i (ि)
    text = text.replace('\x14', 'रु') # \x14 is ru
    text = text.replace('\x15', 'ल्ल') # \x15 is double l (ल्ल)
    text = text.replace('%', 'ब्र') # % is bra
    
    # Clean up parentheses or braces in names
    text = text.replace('(', '').replace(')', '')
    text = text.replace('&', '') # wait, & was ref! Let's handle & before removing it
    
    # 2. Swap visual short i (ि / \u093f) with the following consonant
    text = re.sub('\u093f([\u0915-\u0939\u0958-\u095f])', r'\1' + '\u093f', text)
    
    return text

def clean_ref_character(text):
    # In some names, '&' represents the superscript ref (र्) and is placed after the consonant.
    # We want to move 'र्' (र + halant) to before that consonant.
    pattern = r'([\u0915-\u0939\u0958-\u095f][\u093e-\u094c]*)&'
    return re.sub(pattern, '\u0930\u094d' + r'\1', text)

def post_process_english_name(name):
    # Standardize spacing
    name = re.sub(r'\s+', ' ', name).strip()
    
    replacements = {
        'Mu Panande': 'Munna Pandey',
        'Ii Asan Pande': 'Indrashan Pandey',
        'In Asan Pande': 'Indrashan Pandey',
        'Ii Asan': 'Indrashan',
        'In Asan': 'Indrashan',
        'Pande': 'Pandey',
        'Panande': 'Pandey',
        'Am Ah': 'Ahmad',
        'Na Jala': 'Najla',
        'Ma Jada': 'Majda',
        'Bu Na': 'Bunan',
        'Naj Na': 'Najma',
        'Vak La': 'Vakil',
        'Sak La': 'Shakila',
        'Sah La': 'Shahla',
        'Tam A': 'Tamanna',
        'Nu La': 'Noorul',
        'Aphaja La': 'Afzal',
        'A Jam': 'Ajam',
        'A Jum': 'Anjum',
        'A Baya': 'Abaya',
        'Subah Na': 'Subhan',
        'Subaha Na': 'Subhan',
        'Kesh V': 'Keshwar',
        'Moh Mad': 'Mohammad',
        'Kam Na': 'Kamna',
        'Na Sabudin': 'Nasiruddin',
        'A Ma': 'Asma',
        'A Sa A': 'Asiya',
        'A Bari': 'Akbari',
        'A Gari': 'Asgari',
        'A Sha': 'Aisha',
        'Na Sar': 'Nasar',
        'Samiu A': 'Samiullah',
        'U Phat': 'Ulfat',
        'Ka Sam Na': 'Kasam',
        'Saradar Na': 'Sardar',
        'Isamudin Na': 'Isamuddin',
        'Subedar Na': 'Subedar',
        'Kayamuidan Na': 'Qayamuddin',
        'Rahamu A': 'Rahmu',
        'Na Ja Idan': 'Najidan',
        'Ma Rayam': 'Maryam',
        'Mu A': 'Musa',
        'Ikaram': 'Ikram',
        'Ikhalak': 'Ikhlak',
        'Kamarudin': 'Kamruddin',
        'Kamaruddin': 'Kamruddin',
        'Samasudin': 'Samsuddin',
        'Samasuddin': 'Samsuddin',
        'Samashad': 'Shamshad',
        'Shahariyar': 'Shahriyar',
        'Sarapharaj': 'Sarfaraz',
        'Aishayana': 'Aisha',
        'Tajuddin': 'Tajuddin',
        'Jainul': 'Zainul',
        'Jainuludin': 'Zainuluddin',
        'Jainuluidan': 'Zainuluddin',
        'Kayamudin': 'Qayamuddin',
        'Kayamuidan': 'Qayamuddin',
        'Samiudin': 'Samiuddin',
        'Samiuidan': 'Samiuddin',
        'Najimudin': 'Najimuddin',
        'Najimuidan': 'Najimuddin',
        'Nayamudin': 'Nayamuddin',
        'Nayamuidan': 'Nayamuddin',
        'Ajamudin': 'Ajamuddin',
        'Ajamuidan': 'Ajamuddin',
        'Alimudin': 'Alimuddin',
        'Alimuidan': 'Alimuddin',
        'Jamiludin': 'Jamiluddin',
        'Jamiluidan': 'Jamiluddin',
        'Murtaja': 'Murtaza',
        'Murtuja': 'Murtuza',
        'Riyajul': 'Riyazul',
        'Riyaj': 'Riyaz',
        'Fajil': 'Fazil',
        'Ajij': 'Aziz',
        'Ajijul': 'Azizul',
        'Majid': 'Majid',
        'Sajad': 'Sajad',
        'Raph': 'Rauf',
        'Raphik': 'Rafiq',
        'Raphikun': 'Rafiqun',
        'Saphi': 'Safi',
        'Saphik': 'Safiq',
        'Saphikun': 'Safiqun',
        'Pharukh': 'Farooq',
        'Pheroj': 'Feroz',
        'Pharana': 'Farhana',
        'Pharid': 'Farid',
        'Pharida': 'Farida',
        'Phurakan': 'Furqan',
        'Aphasar': 'Afsar',
        'Aphajara': 'Afzal',
        'Aphajal': 'Afzal',
        'Aphasa': 'Afsa',
        'Apharoja': 'Afroze',
        'Aphroj': 'Afroz',
        'Aphroja': 'Afroze',
        'GuIdiya': 'Gudiya',
        'Inasha': 'Nisha',
        'Inisha': 'Nisha',
        'Idalabahara': 'Dilbahar',
        'Idalbahar': 'Dilbahar',
        'Narigash': 'Nargis',
        'Narigish': 'Nargis',
        'Narigis': 'Nargis',
        'Sirataj': 'Sirtaj',
        'Iahim': 'Ibrahim'
    }
    
    for key, val in replacements.items():
        name = re.sub(r'\b' + re.escape(key) + r'\b', val, name, flags=re.IGNORECASE)
        
    return name

def determine_gender(name, rel_type, doc_gender):
    if rel_type == "H":
        return "Female"
    if rel_type == "W":
        return "Male"
        
    name_lower = name.lower()
    female_indicators = ['bibi', 'devi', 'begum', 'begam', 'khatun', 'katoone', 'khatoon', 'nisha', 'nisa', 'ara', 'bano', 'kumari', 'khaton']
    male_indicators = ['sah', 'shah', 'khan', 'singh', 'ram', 'prasad', 'kumar', 'ali', 'alam', 'ahmad', 'mohammad', 'mohd', 'md']
    
    for ind in female_indicators:
        if re.search(r'\b' + ind + r'\b', name_lower):
            return "Female"
            
    for ind in male_indicators:
        if re.search(r'\b' + ind + r'\b', name_lower):
            return "Male"
            
    if doc_gender == "F":
        return "Female"
    elif doc_gender == "M":
        return "Male"
    return "Male"

def to_english_name(hindi_name):
    if not hindi_name.strip():
        return ""
    try:
        # Pre-process ref character
        hindi_name = clean_ref_character(hindi_name)
        # Pre-process abbreviations and font glitches
        hindi_name = pre_process_hindi(hindi_name)
        
        # Transliterate to ITRANS
        itrans = transliterate(hindi_name, sanscript.DEVANAGARI, sanscript.ITRANS)
        
        # Strip any characters that are not letters or spaces
        itrans_clean = re.sub(r'[^a-zA-Z\s]', ' ', itrans)
        
        # Replace common font glitches
        itrans_clean = re.sub(r'\bsanh\b', 'Singh', itrans_clean, flags=re.IGNORECASE)
        itrans_clean = re.sub(r'\bsinh\b', 'Singh', itrans_clean, flags=re.IGNORECASE)
        itrans_clean = re.sub(r'\bi\s+(?=[a-z])', 'Sri ', itrans_clean, flags=re.IGNORECASE)
        
        words = itrans_clean.split()
        clean_words = []
        
        for word in words:
            # Strip trailing lowercase 'a' (silent schwa)
            if word.endswith('a') and len(word) > 2:
                word = word[:-1]
                
            # Replace common diacritics
            word = word.replace('I', 'i').replace('U', 'u').replace('A', 'a')
            word = word.replace('x', 'sh').replace('M', 'n')
            
            # Capitalize first letter, keep rest lowercase
            word_cap = word.capitalize()
            # Clean up double letters that are phonetically simplified in names
            word_cap = word_cap.replace('aa', 'a').replace('ii', 'i').replace('uu', 'u')
            
            # Common spelling overrides
            w_lower = word_cap.lower()
            if w_lower == 'sanh':
                word_cap = 'Singh'
            elif w_lower in ('devi', 'dvi'):
                word_cap = 'Devi'
            elif w_lower in ('inasha', 'inisha'):
                word_cap = 'Nisha'
            elif w_lower == 'begama':
                word_cap = 'Begum'
            elif w_lower == 'begam':
                word_cap = 'Begum'
            elif w_lower == 'bibi':
                word_cap = 'Bibi'
            elif w_lower == 'khAM':
                word_cap = 'Khan'
            elif w_lower == 'kha':
                word_cap = 'Khan'
            elif w_lower == 'sAha':
                word_cap = 'Sah'
                
            clean_words.append(word_cap)
            
        final_name = " ".join(clean_words)
        return post_process_english_name(final_name)
    except Exception as e:
        return post_process_english_name(clean_text(hindi_name))

for filename in pdf_files:
    pdf_path = os.path.join(data_dir, filename)
    if not os.path.exists(pdf_path):
        print(f"Not found: {pdf_path}")
        continue
        
    print(f"Reading {filename}...")
    reader = PdfReader(pdf_path)
    
    tokens = []
    for page in reader.pages:
        text = page.extract_text()
        page_tokens = [t.strip() for t in text.split() if t.strip()]
        tokens.extend(page_tokens)
        
    i = 0
    n = len(tokens)
    file_count = 0
    
    while i < n:
        if (i + 5 < n and 
            tokens[i].isdigit() and len(tokens[i]) == 3 and
            tokens[i+1].isdigit() and
            tokens[i+2].isdigit() and
            tokens[i+4].isdigit()):
            
            ac_no = tokens[i]
            part_no = tokens[i+1]
            serial_no = tokens[i+2]
            house_raw = tokens[i+3]
            ward_raw = tokens[i+4]
            
            curr = i + 5
            
            name_tokens = []
            while curr < n and tokens[curr] not in RELATION_TYPES:
                if (curr + 2 < n and tokens[curr] == ac_no and tokens[curr+1] == part_no and tokens[curr+2].isdigit()):
                    break
                name_tokens.append(tokens[curr])
                curr += 1
                
            if curr >= n or tokens[curr] not in RELATION_TYPES:
                i += 1
                continue
                
            rel_type = tokens[curr]
            curr += 1
            
            rel_tokens = []
            while curr < n:
                token = tokens[curr]
                if is_epic(token) or is_float_link(token) or token in GENDERS:
                    break
                if (curr + 2 < n and tokens[curr] == ac_no and tokens[curr+1] == part_no and tokens[curr+2].isdigit()):
                    break
                rel_tokens.append(token)
                curr += 1
                
            epic_no = ""
            if curr < n and is_epic(tokens[curr]):
                epic_no = tokens[curr]
                curr += 1
                
            link_no = ""
            if curr < n and is_float_link(tokens[curr]):
                link_no = tokens[curr]
                curr += 1
                
            gender = ""
            if curr < n and tokens[curr] in GENDERS:
                gender = tokens[curr]
                curr += 1
                
            age = ""
            if curr < n and tokens[curr].isdigit():
                age = tokens[curr]
                curr += 1
                
            if name_tokens and rel_tokens and gender and age:
                name_hindi = " ".join(name_tokens)
                rel_name_hindi = " ".join(rel_tokens)
                
                name_str = to_english_name(name_hindi)
                rel_name_str = to_english_name(rel_name_hindi)
                
                house_clean = re.sub(r'[^\d]', '', house_raw)
                if not house_clean:
                    house_clean = "1"
                    
                rel_mapped = "Father"
                if rel_type == "H":
                    rel_mapped = "Spouse"
                elif rel_type == "M":
                    rel_mapped = "Mother"
                elif rel_type == "W":
                    rel_mapped = "Spouse"
                    
                gender_mapped = determine_gender(name_str, rel_type, gender)
                    
                all_voters.append({
                    "ac": ac_no,
                    "part": part_no,
                    "serial": int(serial_no),
                    "house": house_clean,
                    "ward": ward_raw.zfill(2),
                    "name": name_str,
                    "relationType": rel_mapped,
                    "relativeName": rel_name_str,
                    "epic": epic_no,
                    "gender": gender_mapped,
                    "age": int(age)
                })
                file_count += 1
                i = curr
            else:
                i += 1
        else:
            i += 1
            
    print(f"Extracted {file_count} records from {filename}")

output_json_path = os.path.join(os.path.dirname(__file__), "voters.json")
with open(output_json_path, 'w', encoding='utf-8') as out_f:
    json.dump(all_voters, out_f, ensure_ascii=False, indent=2)

print(f"Exported {len(all_voters)} voters to {output_json_path}")
