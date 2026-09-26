import json, sys
sys.stdout.reconfigure(encoding='utf-8')

playstore = json.load(open('data/playstore_processed.json', encoding='utf-8'))
reddit = json.load(open('data/reddit_processed.json', encoding='utf-8'))
community = json.load(open('data/community_processed.json', encoding='utf-8'))

all_data = playstore + reddit + community
print('TOTAL:', len(all_data))

print('\n=== ALL REAL STRUGGLE TYPES ===')
for i, d in enumerate(all_data):
    src = d.get('source', 'Unknown')
    url = d.get('url', 'No URL provided')
    struggle = d.get('struggle_type', 'N/A')
    remembered = d.get('remembered_info', '')
    forgotten = d.get('forgotten_info', '')
    text = d.get('text', '')[:100]
    print(f"[{src}] STRUGGLE: {struggle}")
    print(f"  URL: {url}")
    print(f"  REMEMBERED: {remembered}")
    print(f"  FORGOTTEN: {forgotten}")
    print(f"  RAW: {text}")
    print()
