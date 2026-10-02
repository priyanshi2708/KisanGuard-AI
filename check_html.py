import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("DOCTYPE:", html.startswith('<!DOCTYPE html>'))
print("Closing html:", html.strip().endswith('</html>'))
print("Body close:", '</body>' in html)
print("Style open/close:", html.count('<style>'), html.count('</style>'))
print("Script open/close:", html.count('<script>'), html.count('</script>'))
print("File size:", len(html), 'chars')
print()

# Count SVG states
states = re.findall(r'data-state="([^"]+)"', html)
print("States in SVG:", len(states))
for s in states:
    print(" -", s)
