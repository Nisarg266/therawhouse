from bs4 import BeautifulSoup
import re

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("--- BANNER / SLIDER ITEMS ---")
# Find main slider elements
banners = soup.find_all(attrs={"class": re.compile(r"banner|slide|hero|carousel", re.I)})
for b in banners[:15]:
    imgs = b.find_all('img')
    texts = b.get_text(separator=' | ', strip=True)
    if imgs or 'Icons of Contemporary Luxury' in texts or 'Discover' in texts:
        print("BANNER BLOCK:", b.get('class'))
        print("TEXT:", texts[:200])
        for img in imgs:
            print("  IMG:", img.get('src') or img.get('data-src'))

print("\n--- ALL HEADINGS IN MAIN CONTENT ---")
headings = soup.find_all(['h1', 'h2', 'h3', 'h4'])
for h in headings:
    print(f"<{h.name}> {h.get_text(strip=True)}")

print("\n--- SECTIONS IN ORDER ---")
main = soup.find('main') or soup.find('div', id='maincontent') or soup.find('body')
if main:
    for s in main.find_all(['section', 'div'], recursive=False):
        t = s.get_text(strip=True)[:80]
        if t:
            print("SECTION/DIV:", s.get('class'), "-->", t)
