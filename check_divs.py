import re

with open("src/components/DiagnoseEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 找到 return ( 的位置
start = content.find("return (")
section = content[start:]

# 使用正则找到所有 <div ...> 和 </div>
# 匹配 <div 后面不是 /> 的
open_pattern = re.compile(r'<div\b(?!.*?/>)')
close_pattern = re.compile(r'</div>')
self_close_pattern = re.compile(r'<div\b[^>]*?/>')

opens = list(open_pattern.finditer(section))
closes = list(close_pattern.finditer(section))
self_closes = list(self_close_pattern.finditer(section))

print(f"Open divs: {len(opens)}")
print(f"Close divs: {len(closes)}")
print(f"Self-closing divs: {len(self_closes)}")
print(f"Net open divs: {len(opens) - len(closes)}")
print(f"Total accounted: {len(closes) + len(self_closes)} (should equal {len(opens)})")

# 行号映射
lines_before = content[:start].count('\n')
for m in opens:
    line = section[:m.start()].count('\n') + lines_before + 1
    print(f"OPEN  at line {line}")

for m in self_closes:
    line = section[:m.start()].count('\n') + lines_before + 1
    print(f"SELF  at line {line}")
