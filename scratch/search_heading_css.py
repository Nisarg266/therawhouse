import re

with open('scratch/thot_home.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all occurrences of the-arrival-heading in <style> tags
for match in re.finditer(r'([^{}]*the-arrival-heading[^{}]*\{[^}]*\})', html):
    print("MATCH:", match.group(1).strip().replace('\n', ' '))
