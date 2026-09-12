from bs4 import BeautifulSoup

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

main = soup.find('main', id='maincontent')
if not main:
    main = soup.find('div', id='maincontent')

if main:
    print("Found maincontent!")
    # Find all top widgets or sections inside maincontent
    for i, child in enumerate(main.find_all(recursive=False)):
        print(f"Child {i}: {child.name}, class={child.get('class')}, id={child.get('id')}")
        for j, c2 in enumerate(child.find_all(recursive=False)):
            text = c2.get_text(separator=' ', strip=True)[:100]
            print(f"  Subchild {j}: {c2.name}, class={c2.get('class')}, text={text}")
else:
    print("No maincontent found")
