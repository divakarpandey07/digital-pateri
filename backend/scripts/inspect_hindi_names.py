import os
import re
import sys
from pypdf import PdfReader
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

sys.stdout.reconfigure(encoding='utf-8')

data_dir = r"C:\Users\hp\Documents\antigravity\intelligent-rutherford\data"
pdf_files = ["33 Kaimur_A213_A2130091.pdf"]

RELATION_TYPES = {'F', 'H', 'M', 'W', 'O'}
GENDERS = {'M', 'F', 'O'}

def to_english_name(hindi_name):
    try:
        itrans = transliterate(hindi_name, sanscript.DEVANAGARI, sanscript.ITRANS)
        return itrans
    except:
        return hindi_name

pdf_path = os.path.join(data_dir, pdf_files[0])
reader = PdfReader(pdf_path)

tokens = []
for page in reader.pages[:5]:  # Just first 5 pages
    text = page.extract_text()
    page_tokens = [t.strip() for t in text.split() if t.strip()]
    tokens.extend(page_tokens)

i = 0
n = len(tokens)
print("--- Parsing Sample Names ---")
count = 0
while i < n and count < 100:
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
            name_tokens.append(tokens[curr])
            curr += 1
            
        if name_tokens:
            hindi_name = " ".join(name_tokens)
            english_trans = to_english_name(hindi_name)
            print(f"Tokens: {name_tokens} | Joined Hindi: {hindi_name} | Raw Translit: {english_trans}")
            count += 1
        i = curr
    else:
        i += 1
