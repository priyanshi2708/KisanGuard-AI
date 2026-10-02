import ast, re

with open('kisanguard_animated.py', 'r', encoding='utf-8') as f:
    src = f.read()

keys_used = set(re.findall(r"txt\[['\"](\w+)['\"]\]", src))

tree = ast.parse(src)
en_keys = set()
for node in ast.walk(tree):
    if isinstance(node, ast.Assign):
        for t in node.targets:
            if isinstance(t, ast.Name) and t.id == 'TL':
                tl_dict = node.value
                for idx, kv in enumerate(tl_dict.keys):
                    if isinstance(kv, ast.Constant) and kv.value == 'en':
                        en_val = tl_dict.values[idx]
                        for ek in en_val.keys:
                            if isinstance(ek, ast.Constant):
                                en_keys.add(ek.value)

missing = keys_used - en_keys
if missing:
    print('MISSING KEYS:', missing)
else:
    print('ALL KEYS PRESENT - no missing keys found')
