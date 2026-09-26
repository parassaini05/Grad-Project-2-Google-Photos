import os
import json
from dotenv import load_dotenv
from apify_client import ApifyClient

# Load environment variables
load_dotenv()
APIFY_API_KEY = os.getenv("APIFY_API_KEY")

if not APIFY_API_KEY:
    raise ValueError("APIFY_API_KEY is not set in the .env file")

client = ApifyClient(APIFY_API_KEY)

def scrape_google_photos_community():
    print("Starting Apify Actor to scrape Google Photos Community via Google Search...")
    
    # We use Google Search to find relevant community threads about finding/remembering photos
    run_input = {
        "queries": "site:support.google.com/photos/thread \"find\" OR \"remember\" OR \"search\" OR \"lost\" photo",
        "resultsPerPage": 20,
        "maxPagesPerQuery": 2,
        "languageCode": "en",
        "countryCode": "us"
    }

    # Run the Apify Google Search Results Scraper (apify/google-search-scraper)
    try:
        run = client.actor("apify/google-search-scraper").call(run_input=run_input)
        print(f"Scraping completed! Dataset ID: {run.default_dataset_id}")
        
        print("Downloading results...")
        dataset = client.dataset(run.default_dataset_id)
        
        community_data = []
        for item in dataset.iterate_items():
            for result in item.get("organicResults", []):
                community_data.append({
                    "url": result.get("url"),
                    "title": result.get("title"),
                    "text": result.get("description"),  # The snippet from the search result
                    "source": "Google Photos Community",
                })
        
        output_file = "data/community_raw.json"
        os.makedirs("data", exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(community_data, f, indent=2, ensure_ascii=False)
            
        print(f"Saved {len(community_data)} community threads to {output_file}")
        
    except Exception as e:
        print(f"Error scraping Google Community: {e}")

if __name__ == "__main__":
    scrape_google_photos_community()
