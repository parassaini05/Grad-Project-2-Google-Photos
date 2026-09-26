import os
import json
from dotenv import load_dotenv
from apify_client import ApifyClient

# Load API keys from .env
load_dotenv()
APIFY_TOKEN = os.getenv("APIFY_API_KEY")

if not APIFY_TOKEN:
    raise ValueError("APIFY_API_KEY is not set in the .env file")

# Initialize the ApifyClient
client = ApifyClient(APIFY_TOKEN)

# Prepare the Actor input to scrape Reddit for Google Photos search/retrieval issues
run_input = {
    "searchComments": True,
    "searchSort": "new",
    "searchTime": "all",
    "startUrls": [
        # Searching r/googlephotos for "search" and "find" issues
        { "url": "https://www.reddit.com/r/googlephotos/search/?q=search&restrict_sr=1" },
        { "url": "https://www.reddit.com/r/googlephotos/search/?q=find&restrict_sr=1" }
    ],
    "crawlCommentsPerPost": True,
    "maxPostsCount": 20,
    "maxCommentsCount": 100,
    "maxCommentsPerPost": 10,
    "maxCommunitiesCount": 2,
    "mcpMode": "perPost",
    "mcpComments": "ignore",
    "mcpCommentsPerPost": 5,
    "mcpMessage": "**{{title}}**\n{{postUrl}}",
    "mcpMaxItems": 50,
}

print("Starting Apify Actor to scrape Reddit...")
# Run the Actor and wait for it to finish
run = client.actor("harshmaur/reddit-scraper").call(run_input=run_input)

dataset_id = run.default_dataset_id
print(f"Scraping completed! Dataset ID: {dataset_id}")
print(f"Check your data here: https://console.apify.com/storage/datasets/{dataset_id}")

# Fetch the results
print("Downloading results...")
results = []
for item in client.dataset(dataset_id).iterate_items():
    results.append({
        "url": item.get("url"),
        "title": item.get("title", ""),
        "text": item.get("text", "") or item.get("body", ""),
        "source": "Reddit",
        "upvotes": item.get("upvotes", 0)
    })

# Save to a local JSON file for the next pipeline step
os.makedirs("data", exist_ok=True)
output_file = "data/reddit_raw.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Saved {len(results)} items to {output_file}")
