import time
import schedule
import subprocess
import datetime
import sys

def run_script(script_name):
    """Utility to run a Python script and stream its output."""
    print(f"\n[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 Running {script_name}...")
    try:
        # Use sys.executable to ensure we use the same virtual environment Python
        process = subprocess.run(
            [sys.executable, script_name], 
            check=True, 
            capture_output=False # Let output stream directly to stdout/stderr
        )
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ {script_name} completed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ ERROR: {script_name} failed with return code {e.returncode}.")
        return False

def run_daily_pipeline():
    """The main automated workflow."""
    print("\n" + "="*50)
    print(f"🔥 STARTING AUTOMATED PIPELINE: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*50)
    
    # Step 1: Ingestion
    print("\n--- PHASE 1: DATA INGESTION ---")
    scripts_to_run = [
        "ingest_reddit.py",
        "ingest_playstore.py",
        "ingest_community.py"
    ]
    
    ingestion_success = True
    for script in scripts_to_run:
        success = run_script(script)
        if not success:
            print(f"⚠️ Warning: {script} failed. Continuing with available data...")
            ingestion_success = False
            
    # Step 2: Processing (The Brain)
    print("\n--- PHASE 2: PROCESSING (LLM EXTRACTION) ---")
    processing_success = run_script("processing_pipeline.py")
    
    # Step 3: Storage (ChromaDB)
    if processing_success:
        print("\n--- PHASE 3: STORAGE & EMBEDDING ---")
        run_script("phase3_storage.py")
    else:
        print("\n❌ Skipping Phase 3 Storage due to Processing Pipeline failure.")

    print("\n" + "="*50)
    print(f"🏁 AUTOMATED PIPELINE FINISHED: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*50 + "\n")

# Schedule the pipeline to run every day at 2:00 AM
schedule.every().day.at("02:00").do(run_daily_pipeline)

if __name__ == "__main__":
    print(f"Scheduler started. Pipeline will run daily at 02:00 AM.")
    print("Press Ctrl+C to exit.")
    
    # Optional: Run immediately on startup for testing
    run_daily_pipeline()
    
    while True:
        schedule.run_pending()
        time.sleep(60) # Check schedule every minute
