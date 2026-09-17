"""Build Redhood UI from the OFL Nanum Gothic source, without changing upstream assets.

Usage: python unity/tools/subset-font.py /path/to/NanumGothic-Regular.ttf
Requires fontTools. Regenerate after adding game/UI strings. The original full font
is available at https://github.com/google/fonts/tree/main/ofl/nanumgothic .
"""
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[2]
font = TTFont(sys.argv[1])
characters = set(range(32, 127))
for folder, pattern in [("data", "*.json"), ("js", "*.js"), ("unity/Assets", "*.cs")]:
    for source in (root / folder).rglob(pattern):
        characters.update(map(ord, source.read_text(encoding="utf-8")))
characters.intersection_update(font.getBestCmap())
options = subset.Options()
options.hinting = False
builder = subset.Subsetter(options=options)
builder.populate(unicodes=characters)
builder.subset(font)
# The OFL reserves Nanum/NanumGothic. Modified font names must be different.
names = {1: "Redhood UI", 2: "Regular", 3: "Redhood UI Regular 1.0",
         4: "Redhood UI Regular", 6: "RedhoodUI-Regular",
         16: "Redhood UI", 17: "Regular"}
for record in font["name"].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding())
font.recalcTimestamp = False
destination = root / "unity/Assets/Resources/Fonts/RedhoodUI.ttf"
font.save(destination)
print(f"{len(characters)} characters; {destination.stat().st_size} bytes: {destination}")
