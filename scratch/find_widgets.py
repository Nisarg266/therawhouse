from bs4 import BeautifulSoup

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

col_main = soup.find('div', class_='column main')
if col_main:
    # Look for major widget containers
    widgets = col_main.find_all('div', recursive=True)
    seen = set()
    for w in widgets:
        w_class = " ".join(w.get('class', []))
        if any(keyword in w_class for keyword in ['slider', 'arrival', 'recommend', 'print', 'maker', 'manifesto', 'press', 'quote', 'brand', 'content-box', 'custom-widget']):
            # Print unique widget class
            if w_class not in seen:
                seen.add(w_class)
                t = w.get_text(separator=' ', strip=True)[:80]
                print(f"Widget: {w_class} --> {t}")
