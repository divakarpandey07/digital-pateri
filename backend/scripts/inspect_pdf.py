import os
from pypdf import PdfReader

script_dir = os.path.dirname(__file__)
pdf_path = os.path.join(script_dir, "../../data", "33 Kaimur_A213_A2130091.pdf")

if os.path.exists(pdf_path):
    reader = PdfReader(pdf_path)
    # Print the first page's text (usually cover page) and the third page (usually contains voter records)
    print("--- PAGE 3 ---")
    print(reader.pages[2].extract_text()[:2000])
else:
    print("PDF not found at", pdf_path)
