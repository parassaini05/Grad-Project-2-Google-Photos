# AI-Powered Discovery Engine: Phase-Wise Implementation Plan

This document breaks down the system architecture into an actionable, phase-wise implementation plan to build the AI Discovery Engine.

---

## Phase 1: Data Ingestion & Environment Setup 
**Status:** In Progress / Mostly Complete ✅

*   **Goal:** Establish the codebase, install dependencies, and automatically scrape raw user feedback.
*   **Tasks:**
    *   [x] Set up Python virtual environment and `.env` file.
    *   [x] Install required libraries (`google-genai`, `apify-client`, `google-play-scraper`, `streamlit`, `pandas`).
    *   [x] Create `ingest_reddit.py` using Apify Actor to pull relevant Reddit posts.
    *   [x] Create `ingest_playstore.py` to scrape and filter recent Play Store reviews.
*   **Output:** Raw JSON files (`reddit_raw.json`, `playstore_raw.json`) in the `data/` directory.

---

## Phase 2: Processing Pipeline (The "Brain")
**Status:** In Progress ⏳

*   **Goal:** Use LLMs to clean the raw data and extract highly structured insights into user retrieval failures.
*   **Tasks:**
    *   [x] Create `processing_pipeline.py`.
    *   [x] Implement Gemini prompt to filter out noise (e.g., unrelated app crashes).
    *   [x] Enforce strict JSON output schema (`struggle_type`, `remembered_info`, `forgotten_info`).
    *   [x] Optimize pipeline for rate limits (Upgraded to Groq llama-3.3-70b-versatile for higher RPM).
*   **Output:** Cleaned, structured JSON file (`playstore_processed.json`, `reddit_processed.json`).

---

## Phase 3: Data Storage & Semantic Search
**Status:** Complete ✅

*   **Goal:** Store the structured data efficiently to allow for deep synthesis, clustering, and querying.
*   **Tasks:**
    *   [x] Set up **SQLite / ChromaDB** to persistently store the metadata and raw quotes.
    *   [x] Set up **ChromaDB** for local vector database management.
    *   [x] Generate text embeddings (using the local BGE embedding model) for the failure modes.
    *   [x] Load embeddings into ChromaDB.
*   **Output:** A fully populated Local Vector + Metadata Database (`./chroma_db`).

---

## Phase 4: Synthesis & Interactive Dashboard
**Status:** Prototype Built 🚀

*   **Goal:** Provide an interface for the Product Manager to explore the data, compare failure modes, and discover the highest-leverage opportunities (Part 2 of the problem statement).
*   **Tasks:**
    *   [x] Build initial `dashboard.py` in Streamlit to visualize simple metrics (What users remember vs. forget).
    *   [x] **(New)** Add a RAG (Retrieval-Augmented Generation) chat interface to the dashboard.
    *   [x] **(New)** Allow the PM to type: *"Show me examples of people who couldn't find their ID cards"* and have the AI query ChromaDB and summarize the evidence.
*   **Output:** A functional, interactive Insights Dashboard.

---

## Phase 5: Automated Scheduler Component
**Status:** Complete ✅

*   **Goal:** Automate the ingestion and processing pipelines so the Discovery Engine always has the latest user feedback without manual intervention.
*   **Tasks:**
    *   [x] Set up a scheduling script (e.g., using `schedule` Python library or system cron jobs).
    *   [x] Configure the scheduler to trigger `ingest_reddit.py`, `ingest_playstore.py`, and `ingest_community.py` on a daily interval.
    *   [x] Chain the execution to automatically trigger `processing_pipeline.py` and `phase3_storage.py` immediately after successful ingestion.
*   **Output:** A hands-free, continually updating AI Discovery Engine.

