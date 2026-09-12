import urllib.request

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

arrivals = [
    ('assets/new-arrival-1.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/import/NA_1_new.jpg'),
    ('assets/new-arrival-2.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/import/NA_2_3.jpg'),
    ('assets/new-arrival-3.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/import/NA_4_4.jpg'),
    ('assets/new-arrival-4.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/import/NA_3_4.jpg'),
    ('assets/new-arrival-5.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/import/NA_5_Updated.jpg'),
    ('assets/new-arrival-6.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/import/NA_6_4.jpg'),
]

for dest, url in arrivals:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read()
        with open(dest, 'wb') as f:
            f.write(data)
        print(f"DOWNLOADED {dest}: {len(data)} bytes")

print("All new arrivals downloaded!")
