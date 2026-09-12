from bs4 import BeautifulSoup

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

col_main = soup.find('div', class_='column main')
if col_main:
    print("Found column main!")
    for i, child in enumerate(col_main.find_all(recursive=False)):
        # print child info
        c_class = child.get('class', [])
        c_id = child.get('id', '')
        # print text sample
        t = child.get_text(separator=' ', strip=True)[:150]
        print(f"\n--- Item {i} ({child.name}, class={c_class}, id={c_id}) ---")
        print("Text:", t)
        # also print images inside this item
        imgs = [img.get('src') or img.get('data-src') for img in child.find_all('img')]
        if imgs:
            print("Images:", imgs[:5])
