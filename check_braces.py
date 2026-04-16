with open("src/components/DiagnoseEngine.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start = content.find("return (")
section = content[start:]
open_brace = section.count("{")
close_brace = section.count("}")
print(f"open braces: {open_brace}")
print(f"close braces: {close_brace}")
print(f"diff: {open_brace - close_brace}")
