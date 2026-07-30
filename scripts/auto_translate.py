# Auto-translate README (Python helper)
# Usage: set environment variables in the GitHub Action or run locally:
# TRANSLATE_API_URL (e.g. https://libretranslate.com) -- required
# TRANSLATE_API_KEY (optional) -- if your instance requires a key
# SOURCE_FILE (default: docs/translations/README.zh-tw.md)
# TARGET_DIR (default: docs/translations)
# SOURCE_LANG (default: zh-TW -> use zh for API)
# TARGET_LANGS (comma-separated codes) -- if empty, script will generate for common codes

import os
import re
import json
import requests

# Configuration from env
TRANSLATE_API_URL = os.getenv('TRANSLATE_API_URL')
TRANSLATE_API_KEY = os.getenv('TRANSLATE_API_KEY')
SOURCE_FILE = os.getenv('SOURCE_FILE', 'docs/translations/README.zh-tw.md')
TARGET_DIR = os.getenv('TARGET_DIR', 'docs/translations')
SOURCE_LANG = os.getenv('SOURCE_LANG', 'zh')
TARGET_LANGS_ENV = os.getenv('TARGET_LANGS', '')

# Default target languages (add/remove as you need)
DEFAULT_TARGET_LANGS = ['en','id','es','fr','de','pt-BR','vi','ms','ja','ko','tr']

# Simple mapping for API language codes if needed
API_CODE_MAP = {
    'zh-TW': 'zh',
    'zh-CN': 'zh',
    'pt-BR': 'pt',
}

# simple heuristics to skip lines that should not be translated
SKIP_LINE_PATTERNS = [
    r'^\\s*```',    # code fence
    r'^\\s*```',
    r'^\\s*<',      # HTML tags
    r'^\\s*!\[',   # images
    r'^\\s*\|',    # table row
    r'^\\s*\[',    # link-only lines
    r'https?://',     # any URL
    r'^\\s*$'       # empty
]

CODE_FENCE_RE = re.compile(r'^\\s*```')

def should_skip(line):
    for p in SKIP_LINE_PATTERNS:
        if re.search(p, line):
            return True
    return False

def translate_text(text, target_lang, session):
    if not TRANSLATE_API_URL:
        raise RuntimeError('TRANSLATE_API_URL is not set')
    api_lang = API_CODE_MAP.get(target_lang, target_lang)
    payload = {
        'q': text,
        'source': SOURCE_LANG,
        'target': api_lang,
        'format': 'text'
    }
    headers = {'Content-Type': 'application/json'}
    if TRANSLATE_API_KEY:
        # LibreTranslate accepts api_key param, some instances need Authorization
        headers['Authorization'] = f'Bearer {TRANSLATE_API_KEY}'
    url = TRANSLATE_API_URL.rstrip('/') + '/translate'
    resp = session.post(url, json=payload, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # LibreTranslate response: {"translatedText": "..."}
    if isinstance(data, dict) and 'translatedText' in data:
        return data['translatedText']
    # Some APIs return different shapes
    if isinstance(data, dict) and 'data' in data and 'translations' in data['data']:
        return data['data']['translations'][0]['translatedText']
    # fallback
    return data


def load_source(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read().splitlines()


def write_target(path, lines):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')


def generate_translations():
    # determine targets
    if TARGET_LANGS_ENV.strip():
        targets = [t.strip() for t in TARGET_LANGS_ENV.split(',') if t.strip()]
    else:
        targets = DEFAULT_TARGET_LANGS

    source_lines = load_source(SOURCE_FILE)

    # detect existing translation files
    existing = set()
    for fname in os.listdir(TARGET_DIR) if os.path.isdir(TARGET_DIR) else []:
        if fname.startswith('README.') and fname.endswith('.md'):
            code = fname[len('README.'):-len('.md')]
            existing.add(code)

    session = requests.Session()

    for t in targets:
        target_code = t
        if target_code in existing:
            print(f"Skipping existing: {target_code}")
            continue
        print(f"Translating to: {target_code}")
        out_lines = []
        in_code_block = False
        for line in source_lines:
            if CODE_FENCE_RE.match(line):
                in_code_block = not in_code_block
                out_lines.append(line)
                continue
            if in_code_block or should_skip(line):
                out_lines.append(line)
                continue
            # translate keeping leading markers
            m = re.match(r'^(\s*([>*\-\+]|\d+\.|#+)\s*)(.*)$', line)
            if m:
                prefix = m.group(1)
                text = m.group(3)
            else:
                prefix = ''
                text = line
            if not text.strip():
                out_lines.append(line)
                continue
            try:
                translated = translate_text(text, target_code, session)
            except Exception as e:
                print('Translation error:', e)
                translated = text
            out_lines.append(prefix + translated)
        target_path = os.path.join(TARGET_DIR, f'README.{target_code}.md')
        write_target(target_path, out_lines)
        print('Wrote', target_path)

if __name__ == '__main__':
    generate_translations()
