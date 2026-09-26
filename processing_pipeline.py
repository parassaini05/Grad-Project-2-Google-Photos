import os
import json
import time
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel, Field

# Load API keys
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set in the .env file")

client = Groq(api_key=GROQ_API_KEY)

# Define the expected JSON schema using Pydantic
class RetrievalIssue(BaseModel):
    is_relevant: bool = Field(description="True if the text is about struggling to retrieve an old photo due to incomplete memory.")
    struggle_type: str = Field(description="Short description of the photo they are trying to find (e.g., 'Document', 'Aesthetic photo'). Leave empty if not relevant.")
    remembered_info: str = Field(description="What clues do they have? (e.g., objects, colors, feelings). Leave empty if not relevant.")
    forgotten_info: str = Field(description="What is missing? (e.g., exact date, location). Leave empty if not relevant.")
    search_queries: str = Field(description="How did they try to search for it, or what do they wish they could type? Leave empty if not relevant.")

def process_with_groq(prompt):
    """Processes the prompt using Groq (llama-3.3-70b-versatile) with strict JSON output."""
    try:
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a data extraction assistant. You must extract structured information about Google Photos retrieval failures and return ONLY a valid JSON object matching the requested schema. Do not include markdown formatting or explanation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        # Parse the JSON string
        result_text = response.choices[0].message.content
        return json.loads(result_text)
    except Exception as e:
        print(f"    [Error] API error: {e}")
        return None

def analyze_dataset(source_name, input_file, output_file, max_records=50):
    if not os.path.exists(input_file):
        print(f"{input_file} not found. Skipping.")
        return

    with open(input_file, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"\n[{source_name}] Loaded {len(records)} records. Starting analysis with Groq (qwen3.8-27b)...", flush=True)
    processed_results = []
    
    sample_size = min(len(records), max_records)
    
    for i, record in enumerate(records[:sample_size]):
        text = record.get("text", record.get("title", ""))
        if not text:
            continue
            
        print(f"Analyzing {i+1}/{sample_size} from {source_name}...", flush=True)
        
        # We enforce the schema in the prompt since Groq's JSON mode requires it
        prompt = f"""
        Analyze the following user feedback about Google Photos.
        Extract the required structured information regarding photo retrieval failures.
        
        The JSON object must have these exact keys:
        - "is_relevant" (boolean): True if the text shows a user struggling to find, search for, or retrieve a specific photo or video. Include loss, deletion, and retrieval failures.
        - "struggle_type" (string): Short description of the photo they are trying to find.
        - "remembered_info" (string): Clues they have (objects, person, colors, format, time period).
        - "forgotten_info" (string): Missing context (exact date, location, filename, account).
        - "search_queries" (string): How they tried to search (or how they might search).
        
        User Feedback:
        "{text}"
        """
        
        structured_data = process_with_groq(prompt)
        
        if structured_data and structured_data.get("is_relevant"):
            record.update(structured_data)
            processed_results.append(record)
            print(f"    -> RELEVANT: Found retrieval struggle ({structured_data.get('struggle_type')})", flush=True)
        elif structured_data:
            print(f"    -> NOT RELEVANT", flush=True)
            
        # Groq allows 30 requests per minute. Sleep 2 seconds between requests to be safe.
        time.sleep(2)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(processed_results, f, indent=2, ensure_ascii=False)

    print(f"[{source_name}] Processing complete! Found {len(processed_results)} relevant issues.", flush=True)
    print(f"Saved to {output_file}", flush=True)

if __name__ == "__main__":
    # Process ALL available raw records from each source (no artificial cap)
    analyze_dataset("Play Store", "data/playstore_raw.json", "data/playstore_processed.json", max_records=53)
    analyze_dataset("Reddit", "data/reddit_raw.json", "data/reddit_processed.json", max_records=274)
    analyze_dataset("Community", "data/community_raw.json", "data/community_processed.json", max_records=20)
