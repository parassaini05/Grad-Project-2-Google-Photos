import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

data_dir = 'data'
files = os.listdir(data_dir)
print(f"Files in data/: {files}\n")

summary = {}

for fname in files:
    fpath = os.path.join(data_dir, fname)
    try:
        with open(fpath, encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, list):
            count = len(data)
        elif isinstance(data, dict):
            count = len(data)
        else:
            count = "unknown"
        summary[fname] = count
        print(f"[{fname}] → {count} records")
        
        # Show structure of first record
        if isinstance(data, list) and len(data) > 0:
            keys = list(data[0].keys()) if isinstance(data[0], dict) else []
            print(f"  Keys: {keys}")
    except Exception as e:
        print(f"[{fname}] ERROR: {e}")
        summary[fname] = f"ERROR: {e}"

print("\n=== SUMMARY ===")
total_raw = 0
total_processed = 0
for fname, count in summary.items():
    if isinstance(count, int):
        print(f"  {fname}: {count}")
        if 'raw' in fname:
            total_raw += count
        elif 'processed' in fname:
            total_processed += count

print(f"\nTotal RAW records: {total_raw}")
print(f"Total PROCESSED (AI-filtered) records: {total_processed}")
