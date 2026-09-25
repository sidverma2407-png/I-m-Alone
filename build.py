import os
import re
import urllib.request
from html.parser import HTMLParser

# Simple build script to concatenate JS files and optimize the project
# This avoids needing Node.js/Webpack while still providing a single bundle for production

print("Starting build process...")

HTML_FILE = "index.html"
BUILD_DIR = "dist"
BUNDLE_FILE = "bundle.js"

if not os.path.exists(BUILD_DIR):
    os.makedirs(BUILD_DIR)
    
if not os.path.exists(os.path.join(BUILD_DIR, "js")):
    os.makedirs(os.path.join(BUILD_DIR, "js"))

# Read index.html
with open(HTML_FILE, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all script src tags that match our js/ folder
script_pattern = re.compile(r'<script src="(js/[^"]+)"></script>')
scripts = script_pattern.findall(html_content)

print(f"Found {len(scripts)} scripts to bundle.")

# Concatenate scripts
bundle_content = "/* I'M ALONE - BUNDLED JS */\n"
for script_path in scripts:
    # Remove query params like ?v=12
    clean_path = script_path.split('?')[0]
    print(f"Adding {clean_path}...")
    with open(clean_path, 'r', encoding='utf-8') as f:
        bundle_content += f"\n/* --- {clean_path} --- */\n"
        bundle_content += f.read()
        bundle_content += "\n"

# Write bundle
bundle_path = os.path.join(BUILD_DIR, "js", BUNDLE_FILE)
with open(bundle_path, 'w', encoding='utf-8') as f:
    f.write(bundle_content)
    
print(f"Successfully created {bundle_path}")

# Create optimized index.html
# Replace all individual script tags with the bundle
optimized_html = re.sub(r'<script src="js/[^"]+"></script>\n?', '', html_content)

# Add the bundle script before the closing body tag
bundle_tag = f'<script src="js/{BUNDLE_FILE}"></script>\n</body>'
optimized_html = optimized_html.replace('</body>', bundle_tag)

# Write optimized index.html
dist_html_path = os.path.join(BUILD_DIR, "index.html")
with open(dist_html_path, 'w', encoding='utf-8') as f:
    f.write(optimized_html)

print(f"Successfully created {dist_html_path}")

# Copy CSS
import shutil
print("Copying CSS...")
with open("style.css", 'r', encoding='utf-8') as f:
    css_content = f.read()
with open(os.path.join(BUILD_DIR, "style.css"), 'w', encoding='utf-8') as f:
    f.write(css_content)

# Copy Assets
print("Copying assets folder...")
dist_assets_dir = os.path.join(BUILD_DIR, "assets")
if os.path.exists(dist_assets_dir):
    shutil.rmtree(dist_assets_dir)
shutil.copytree("assets", dist_assets_dir)

print("\nBuild complete! The 'dist' folder contains your optimized game.")
print("To serve it, run: python -m http.server --directory dist")
