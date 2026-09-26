# Edge Cases & Corner Scenarios

This document outlines potential edge cases and corner scenarios that may disrupt the AI-Powered Discovery Engine, mapped against the architecture and implementation plan. It also provides mitigation strategies for each.

---

## 1. Data Ingestion & Setup (Phase 1)
*   **Rate Limiting & IP Bans:** Scraping Reddit or the Play Store aggressively can lead to IP bans.
    *   *Mitigation:* Introduce randomized sleep delays in the scripts. Use Apify's proxy rotation if scraping scales up.
*   **Multi-language & Slang:** Users may post reviews in Spanish, Hindi, or use internet slang that keyword filters miss.
    *   *Mitigation:* Keep the initial keyword filter broad, or remove it entirely and let the LLM filter out non-English or irrelevant text.
*   **Context-less or Spam Reviews:** Reviews like "I hate this" or "5 stars" will be ingested if they accidentally trigger a keyword.
    *   *Mitigation:* Ensure the `is_relevant` boolean check in the LLM Processing step strictly requires evidence of a *retrieval struggle*.

---

## 2. Processing Pipeline / The "Brain" (Phase 2)
*   **LLM API Outages & Rate Limits (503 / 429 Errors):** As seen with free-tier keys, Gemini/Groq can throw "High Demand" or "Rate Limit Exceeded" errors during batch processing.
    *   *Mitigation:* Implement exponential backoff, retry logic, and batch size controls.
*   **Malformed JSON Output:** Even with `response_format={"type": "json_object"}`, the LLM might hallucinate properties or fail to close brackets.
    *   *Mitigation:* Use Pydantic schemas (e.g., `google-genai` schema enforcement) or `instructor` to guarantee output structure, wrapping the call in a `try-except` block to discard invalid responses.
*   **Ambiguous Retrieval Struggles:** A user says: *"I can't find my old stuff."* It is a retrieval issue, but `remembered_info` and `forgotten_info` are completely blank.
    *   *Mitigation:* The LLM should be instructed to output "Unknown" or `null` for these fields rather than hallucinating answers. The pipeline should drop entries where both fields are empty.

---

## 3. Data Storage & Semantic Search (Phase 3)
*   **BGE Token Limit Exceeded:** A user pastes a massive 2000-word essay on Reddit about their lost photo. This could exceed the context window for the local BGE embedding model.
    *   *Mitigation:* Truncate the `remembered_info` and `forgotten_info` strings to 512 tokens before passing them to the BGE model.
*   **Duplicate Embeddings:** Running the scraping and embedding pipeline multiple times could result in ChromaDB filling up with exact duplicates, skewing the Dashboard metrics.
    *   *Mitigation:* Use the unique review/post ID (from Reddit/Play Store) as the primary key/ID in SQLite and ChromaDB to `upsert` rather than just `insert`.
*   **Empty Fields Crashing Embedder:** If `remembered_info` is an empty string, generating an embedding for it might throw an error.
    *   *Mitigation:* Add a check: if the string is empty, do not embed it, or embed a placeholder token like `[NO_DATA]`.

---

## 4. Synthesis & Interactive Dashboard (Phase 4)
*   **RAG Hallucinations:** When the PM asks the Dashboard, *"What is the main problem?"*, the Synthesis Agent might hallucinate a problem that doesn't exist in the database.
    *   *Mitigation:* Force the Synthesis Agent to strictly cite the source IDs from ChromaDB. If ChromaDB returns no results, the agent must reply: "I do not have data on this."
*   **Database Lock (SQLite):** If the Streamlit app is reading SQLite while the processing pipeline is actively writing to it, a `database is locked` error may occur.
    *   *Mitigation:* Enable WAL (Write-Ahead Logging) mode in SQLite to allow concurrent reads and writes.

---


