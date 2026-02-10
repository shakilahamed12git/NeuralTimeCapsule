from app import app
import sys
with open('routes_debug.txt', 'w') as f:
    for rule in app.url_map.iter_rules():
        f.write(f"{rule.endpoint}: {rule}\n")
print("Done listing routes")
