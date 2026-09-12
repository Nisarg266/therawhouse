import urllib.request
import re

url = 'https://thehouseofthings.com/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    with open('scratch/thot_home.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Downloaded HTML, length:", len(html))

    # Look for slider/banner content
    matches = re.findall(r'<div[^>]*class="[^"]*(?:slider|banner|hero|slide|swiper|slick)[^"]*"[^>]*>', html, re.I)
    print("Found potential slider tags:", len(matches))

except Exception as e:
    print("Error:", e)
