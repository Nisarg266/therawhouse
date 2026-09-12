from bs4 import BeautifulSoup
import re

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

# Inspect new arrivals HTML structure
arr = soup.find(class_='the-arrival-heading')
if arr:
    print("THE ARRIVAL HEADING PARENT:")
    parent = arr.parent
    print(parent.get('class'))
    print("HEADING HTML:\n", arr.prettify()[:300])

# Inspect product item in new arrivals
p_items = soup.find_all(class_=re.compile(r'product-item-info'))
print(f"\nFound {len(p_items)} product items:")
for p in p_items[:6]:
    name = p.find(class_=re.compile(r'product-item-name|name'))
    price = p.find(class_=re.compile(r'price'))
    brand = p.find(class_=re.compile(r'brandName|brand'))
    img = p.find('img')
    print("  ITEM:", name.get_text(strip=True) if name else "No name", 
          "| Brand:", brand.get_text(strip=True) if brand else "No brand",
          "| Price:", price.get_text(strip=True) if price else "No price",
          "| Img:", (img.get('src') or img.get('data-src')) if img else "No img")

# Inspect recommendations HTML structure
rec = soup.find(class_='recommendation-row')
if rec:
    print("\nRECOMMENDATIONS HTML:")
    print(rec.prettify()[:500])
