from bs4 import BeautifulSoup
import json

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

main = soup.find(id='maincontent') or soup.find('main')

sections = []
for div in soup.find_all('div', class_=True):
    classes = " ".join(div.get('class', []))
    # Check for major sections
    if any(k in classes for k in ['new-arrivals', 'recommendation', 'fine-print', 'maker', 'press', 'quote', 'manifesto', 'editorial', 'slider', 'banner', 'collaborat']):
        # Find headings or text
        h = [x.get_text(strip=True) for x in div.find_all(['h1', 'h2', 'h3', 'h4'])]
        if h:
            sections.append({
                'class': classes,
                'headings': h[:5]
            })

with open('scratch/sections_found.json', 'w', encoding='utf-8') as out:
    json.dump(sections, out, indent=2, ensure_ascii=False)

print(f"Recorded {len(sections)} matching elements to scratch/sections_found.json")
