with open("src/components/DiagnoseEngine.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = None
for i, line in enumerate(lines):
    if "return (" in line:
        start_idx = i
        break

if start_idx is None:
    print("No return found")
    exit()

jsx_depth = 0
brace_depth = 0
paren_depth = 0
for i in range(start_idx, len(lines)):
    line = lines[i]
    for j, ch in enumerate(line):
        if ch == "{" and line[j:j+2] != "{}":
            brace_depth += 1
        elif ch == "}":
            brace_depth -= 1
        elif ch == "(":
            paren_depth += 1
        elif ch == ")":
            paren_depth -= 1
        elif ch == "<" and line[j:j+2] == "</":
            jsx_depth -= 1
        elif ch == "<" and j+1 < len(line) and line[j+1].isalpha():
            # 检查是否自闭合
            rest = line[j:]
            if "/>" in rest.split(">")[0]:
                pass  # self-closing, no depth change
            else:
                jsx_depth += 1
    
    if i < start_idx + 10 or i > len(lines) - 10 or (i - start_idx) % 50 == 0:
        print(f"line {i+1}: jsx={jsx_depth}, braces={brace_depth}, parens={paren_depth}")

print(f"Final: jsx={jsx_depth}, braces={brace_depth}, parens={paren_depth}")
