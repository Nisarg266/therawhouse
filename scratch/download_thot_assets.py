import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

downloads = [
    # Recommendations
    ('assets/recommendation-1.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/inedit/SEASON_OF_THE_SUN_Feature_1.jpg'),
    ('assets/recommendation-2.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/01_Feature_1.jpg'),
    ('assets/recommendation-3.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/inedit/BANNER_2.jpg'),
    ('assets/recommendation-4.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/01_Feature_14_2.jpg'),

    # Fine Prints
    ('assets/fine-print-1.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/Pages/Print_1.webp'),
    ('assets/fine-print-2.jpg', 'https://thot-media.thehouseofthings.com/media/catalog/product/cache/23805d0b5733a0fa8b043eb92f9a261d/7/0/700x700_0026_1200x1200_0007_pink_flower_deep_plate.webp'),
    ('assets/fine-print-3.jpg', 'https://thot-media.thehouseofthings.com/media/catalog/product/cache/23805d0b5733a0fa8b043eb92f9a261d/t/h/the_blue_room_700_x_700.webp'),

    # Makers
    ('assets/maker-1.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/first_3.jpg'),
    ('assets/maker-1-hover.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/first_4.jpg'),
    ('assets/maker-2.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/second_2.jpg'),
    ('assets/maker-2-hover.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/second_3.jpg'),
    ('assets/maker-3.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/third_1.jpg'),
    ('assets/maker-3-hover.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/third_2.jpg'),
    ('assets/maker-4.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/fourtgh_1.jpg'),
    ('assets/maker-4-hover.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/fourtgh_2.jpg'),

    # Press Logos
    ('assets/logo-idealhome.png', 'https://thot-media.thehouseofthings.com/media/wysiwyg/logo-idealhome.png'),
    ('assets/logo-goodhomes.png', 'https://thot-media.thehouseofthings.com/media/wysiwyg/logo-goodhomes.png'),
    ('assets/logo-ad.png', 'https://thot-media.thehouseofthings.com/media/wysiwyg/logo-ad-new.png'),
    ('assets/logo-vogue.png', 'https://thot-media.thehouseofthings.com/media/wysiwyg/logo-vogue-new.png'),
    ('assets/logo-elle.png', 'https://thot-media.thehouseofthings.com/media/wysiwyg/logo-elle.png'),
    ('assets/logo-femina.png', 'https://thot-media.thehouseofthings.com/media/wysiwyg/logo-femina.png'),

    # New Arrivals original images if available
    ('assets/new-arrival-1.jpg', 'https://thot-media.thehouseofthings.com/media/catalog/product/cache/23805d0b5733a0fa8b043eb92f9a261d/v/a/vase_calyx-krater_1.webp'),
    ('assets/new-arrival-2.jpg', 'https://thot-media.thehouseofthings.com/media/catalog/product/cache/23805d0b5733a0fa8b043eb92f9a261d/c/a/candy_jar_2.webp'),
    ('assets/new-arrival-3.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/inedit/Nico_Console_Banner.webp'),
    ('assets/new-arrival-4.jpg', 'https://thot-media.thehouseofthings.com/media/catalog/product/cache/23805d0b5733a0fa8b043eb92f9a261d/g/r/grain_of_time_bar_cabinet_1.webp'),
    ('assets/new-arrival-5.jpg', 'https://thot-media.thehouseofthings.com/media/catalog/product/cache/23805d0b5733a0fa8b043eb92f9a261d/o/l/old_soul_teapot_xiii_1.webp'),
    ('assets/new-arrival-6.jpg', 'https://thot-media.thehouseofthings.com/media/catalog/product/cache/23805d0b5733a0fa8b043eb92f9a261d/l/a/lagori_round_table_lamp_1.webp'),

    # Hero Slider
    ('assets/hero-slide-1.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/Homepage-Jul-2026-desktop.webp-1.webp'),
    ('assets/hero-slide-2.jpg', 'https://thot-media.thehouseofthings.com/media/wysiwyg/Homepage_Rodolphe_1.webp'),
    ('assets/hero-slide-3.jpg', 'https://thot-media.thehouseofthings.com/media/HomepageJUN2026.webp'),
]

success = 0
for dest, url in downloads:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            if len(data) > 500:
                with open(dest, 'wb') as f:
                    f.write(data)
                print(f"DOWNLOADED: {dest} ({len(data)} bytes) from {url}")
                success += 1
            else:
                print(f"FAILED (too small): {dest} from {url}")
    except Exception as e:
        print(f"ERROR downloading {dest}: {e}")

print(f"\nCompleted {success}/{len(downloads)} downloads.")
