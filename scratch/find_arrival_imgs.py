from bs4 import BeautifulSoup

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

items = soup.find_all(class_='product-item-info')
for i, item in enumerate(items[:8]):
    name = item.find(class_='product-item-name')
    n = name.get_text(strip=True) if name else f"Item {i}"
    imgs = item.find_all('img')
    print(f"\nProduct: {n}")
    for img in imgs:
        print("  src:", img.get('src'))
        print("  data-src:", img.get('data-src'))
        print("  class:", img.get('class'))
