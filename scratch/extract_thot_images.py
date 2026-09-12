import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    ("hero_slide_1.webp", "https://thehouseofthings.com/pub/media/wysiwyg/Homepage-Jul-2026-desktop.webp-1.webp"),
    ("hero_slide_2.webp", "https://thehouseofthings.com/pub/media/wysiwyg/Homepage_Rodolphe_1.webp"),
    ("hero_slide_3.webp", "https://thehouseofthings.com/pub/media/HomepageJUN2026.webp"),
    ("rec_1.webp", "https://thehouseofthings.com/pub/media/wysiwyg/SummerEditMay2026.webp"),
    ("rec_2.webp", "https://thehouseofthings.com/pub/media/wysiwyg/PriyankaKhannaJournal.webp"),
    ("rec_3.webp", "https://thehouseofthings.com/pub/media/wysiwyg/ArtOfFineLiving.webp"),
    ("rec_4.webp", "https://thehouseofthings.com/pub/media/wysiwyg/EinaAhluwaliaJournal.webp"),
]

# Look in HTML for exact image URLs in recommendation-row
from bs4 import BeautifulSoup
with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

rec_imgs = []
rec_row = soup.find(class_='recommendation-row')
if rec_row:
    for img in rec_row.find_all('img'):
        src = img.get('src') or img.get('data-src')
        if src:
            rec_imgs.append(src)
print("Recommendation images found in HTML:", rec_imgs)

# Also find fine-prints images
fp_row = soup.find(class_='fine-prints-slider')
if fp_row:
    for img in fp_row.find_all('img'):
        src = img.get('src') or img.get('data-src')
        if src:
            print("Fine prints img:", src)

# Also find makers images
makers_row = soup.find(class_='makers-row')
if makers_row:
    for img in makers_row.find_all('img'):
        src = img.get('src') or img.get('data-src')
        if src:
            print("Makers img:", src)
