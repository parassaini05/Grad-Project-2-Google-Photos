import os
import json
from google_play_scraper import Sort, reviews

app_id = "com.google.android.apps.photos"
print(f"Scraping recent reviews for {app_id}...")

# Fetch 2000 recent reviews (you can increase count, but let's start small)
result, continuation_token = reviews(
    app_id,
    lang='en', 
    country='us', 
    sort=Sort.NEWEST, 
    count=2000
)

# Filter keywords indicating retrieval problems
keywords = ["search", "find", "can't find", "missing", "remember", "lost", "old photo"]

filtered_reviews = []
for r in result:
    content_lower = r['content'].lower()
    if any(keyword in content_lower for keyword in keywords):
        filtered_reviews.append({
            "url": f"playstore_{r['reviewId']}",
            "title": "Play Store Review",
            "text": r['content'],
            "source": "Google Play Store",
            "score": r['score'],
            "thumbsUpCount": r['thumbsUpCount'],
            "at": str(r['at'])
        })

print(f"Filtered down to {len(filtered_reviews)} relevant reviews out of {len(result)}.")

os.makedirs("data", exist_ok=True)
output_file = "data/playstore_raw.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(filtered_reviews, f, indent=2, ensure_ascii=False)

print(f"Saved to {output_file}")
