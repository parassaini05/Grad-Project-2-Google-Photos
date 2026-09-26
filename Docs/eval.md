# Phase-Wise Evaluation Criteria (Eval Framework)

To ensure the AI Discovery Engine meets the goals defined in the project scope, we will use the following evaluation metrics and criteria for each phase outlined in the `implementation_plan.md`.

---

## Phase 1: Data Ingestion & Setup
**Goal:** Automate the collection of user feedback.

*   **Metric 1: Yield & Volume:** The scrapers should successfully pull at least 100+ raw records per run without hitting IP blocks or rate limits.
*   **Metric 2: Initial Relevance (Precision):** The keyword filters ("can't find", "search", "old photo") should yield a dataset where at least 30% of the raw scraped items are actual retrieval struggles (prior to LLM filtering).
*   **Eval Method:** Manual inspection of a random sample of 50 raw JSON outputs.

---

## Phase 2: Processing Pipeline / The "Brain"
**Goal:** Extract structured JSON (`struggle_type`, `remembered_info`, etc.) accurately using Groq/Gemini.

*   **Metric 1: Schema Adherence:** 100% of the output JSON strings must successfully parse into the defined Pydantic schema without throwing validation errors.
*   **Metric 2: Extraction Accuracy (Recall/Precision):**
    *   *False Positives:* The LLM should not flag a general app crash as `is_relevant: true`.
    *   *Accuracy:* The `remembered_info` and `forgotten_info` fields must accurately reflect the user's raw text without hallucinating extra details.
*   **Eval Method:** Run a golden dataset (20 manually labeled reviews) through the pipeline and compare the LLM's output against the manual labels.

---

## Phase 3: Data Storage & Semantic Search (Vector DB)
**Goal:** Group semantically similar retrieval problems using BGE Embeddings and ChromaDB.

*   **Metric 1: Semantic Clustering:** Queries with similar intent but different vocabulary should cluster together.
    *   *Example Eval Query:* If we query the Vector DB for "receipt", it should return results mentioning "invoice", "document", and "tax form" with a high cosine similarity score.
*   **Metric 2: System Latency:** Creating embeddings via the local BGE model and inserting them into ChromaDB should take less than 1 second per record.
*   **Eval Method:** Query the Vector DB with 5 test concepts (e.g., "Pets", "Documents", "Sunsets") and verify that the top 5 nearest neighbors are semantically relevant.

---

## Phase 4: Synthesis & Interactive Dashboard
**Goal:** Provide the PM with a hallucination-free visualization of failure modes.

*   **Metric 1: Grounded Synthesis:** The Synthesis RAG agent must *only* summarize data present in the database. 
*   **Metric 2: UI Responsiveness:** The Streamlit dashboard must load the data and charts in under 3 seconds.
*   **Eval Method:** Adversarial prompting on the Dashboard. Ask the RAG agent about a completely fake issue (e.g., "Show me issues about the neon green filter"). The agent must gracefully state that no data exists, rather than making it up.

---


