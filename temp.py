import easyocr
import os
import re
import glob

FOLDER = os.path.expanduser("~/Downloads/Screenshot_2026-03-28-10-30-20-69_6012fa4d4ddec268")
OUTPUT = "numbers.txt"

reader = easyocr.Reader(["en"], gpu=False)

all_numbers = []
images = sorted(glob.glob(os.path.join(FOLDER, "*.jpg")))
total = len(images)

for i, img_path in enumerate(images, 1):
    print(f"[{i}/{total}] {os.path.basename(img_path)}")
    try:
        results = reader.readtext(img_path, detail=0)
        text = " ".join(results)
        # Extract 10-digit Indian mobile numbers (starting with 6-9)
        numbers = re.findall(r'\b[6-9]\d{9}\b', text.replace(" ", ""))
        # Also try with spaces/dashes in between digits
        cleaned = re.sub(r'[^0-9\n]', '', text)
        numbers += re.findall(r'[6-9]\d{9}', cleaned)
        for n in numbers:
            print(f"  Found: {n}")
        all_numbers.extend(numbers)
    except Exception as e:
        print(f"  Error: {e}")

# Deduplicate while preserving order
seen = set()
unique = []
for n in all_numbers:
    if n not in seen:
        seen.add(n)
        unique.append(n)

with open(OUTPUT, "w") as f:
    for n in unique:
        f.write(n + "\n")

print(f"\nDone! {len(unique)} unique numbers saved to {OUTPUT}")
