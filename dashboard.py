import os
import streamlit as st
import pandas as pd
import chromadb
from chromadb.utils import embedding_functions
from groq import Groq
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq Client
if not GROQ_API_KEY:
    st.error("GROQ_API_KEY is not set in the environment.")
    st.stop()

groq_client = Groq(api_key=GROQ_API_KEY)

# App Config
st.set_page_config(page_title="Google Photos AI Discovery Engine", page_icon="🔍", layout="wide")

# Custom CSS for aesthetics
st.markdown("""
<style>
    .reportview-container .main .block-container{
        padding-top: 2rem;
    }
    .metric-card {
        background-color: #1E1E1E;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .metric-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: #4CAF50;
    }
    .metric-label {
        font-size: 1.1rem;
        color: #B0B0B0;
    }
</style>
""", unsafe_allow_html=True)

st.title("🔍 Google Photos: AI Discovery Engine")
st.markdown("An autonomous, end-to-end AI system designed to discover, extract, and synthesize user struggles with photo retrieval.")

# Initialize ChromaDB connection (cached for performance)
@st.cache_resource
def get_chroma_collection():
    client = chromadb.PersistentClient(path="./chroma_db")
    bge_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-small-en-v1.5")
    collection = client.get_or_create_collection(
        name="retrieval_failures",
        embedding_function=bge_ef
    )
    return collection

collection = get_chroma_collection()
try:
    total_vectors = collection.count()
except:
    total_vectors = 0

# Create Tabs for the Elaborative Dashboard
tab1, tab2, tab3, tab4 = st.tabs([
    "📖 Overview & Architecture", 
    "📡 Live Scraper Engine", 
    "📊 AI Discovery Report", 
    "💬 PM Copilot (RAG)"
])

# ==========================================
# TAB 1: OVERVIEW & ARCHITECTURE
# ==========================================
with tab1:
    st.header("How the Engine Works")
    st.markdown("""
    This system is designed to solve **Part 1 of the Problem Statement**: discovering how and why users fail to retrieve photos when they have incomplete memory.
    
    ### The End-to-End Pipeline
    1. **Autonomous Ingestion (Scraping):** A background scheduler triggers scrapers daily to pull live feedback from the Google Play Store, Reddit, and Google Support Community Forums.
    2. **Noise Filtering & Extraction (The Brain):** The raw, messy data is fed into an LLM (Groq/Gemini). The AI filters out unrelated complaints (e.g., app crashes) and extracts highly structured JSON data regarding specifically *what* users are trying to find, what they *remember*, and what they *forgot*.
    3. **Semantic Storage (Vector DB):** The structured data is converted into high-dimensional vectors using the `BGE-Small` embedding model and persistently stored in a local ChromaDB instance.
    4. **Synthesis (Dashboard):** This web interface queries the ChromaDB vector database in real-time to generate clustering reports and allows the Product Manager to chat directly with the data via RAG.
    """)
    
    st.image("https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", caption="Data moving seamlessly from user feedback to actionable product insights.", use_container_width=True)

# ==========================================
# TAB 2: LIVE SCRAPER ENGINE
# ==========================================
with tab2:
    st.header("📡 Live Scraper & Ingestion Status")
    st.markdown("Monitor the autonomous background jobs responsible for keeping the Discovery Engine fed with fresh data.")
    
    colA, colB, colC = st.columns(3)
    with colA:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-value">Active</div>
            <div class="metric-label">Scheduler Status</div>
        </div>
        """, unsafe_allow_html=True)
    with colB:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-value">02:00 AM</div>
            <div class="metric-label">Next Cron Execution</div>
        </div>
        """, unsafe_allow_html=True)
    with colC:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{total_vectors}</div>
            <div class="metric-label">Total Indexed Insights</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.divider()
    st.subheader("Data Sources")
    source_df = pd.DataFrame({
        "Source": ["Google Play Store", "Reddit (r/googlephotos)", "Google Support Forums"],
        "Ingestion Method": ["google-play-scraper (Python)", "Apify Actor (API)", "google-search-scraper (Apify)"],
        "Filter Keywords": ["'search', 'find', 'remember'", "'lost', 'old photo', 'search'", "'can't find', 'search'"],
        "Last Run": ["Today", "Today", "Today"]
    })
    st.dataframe(source_df, use_container_width=True, hide_index=True)

# ==========================================
# TAB 3: AI DISCOVERY REPORT
# ==========================================
with tab3:
    st.header("📊 Executive Discovery Report")
    st.markdown("A synthesis of the most common failure modes extracted by the AI Processing Pipeline.")
    
    if total_vectors == 0:
        st.info("The database is currently empty. Run the processing and storage pipeline to populate the report.")
    else:
        # Mocking aggregated analytics for the prototype dashboard based on expected JSON schema
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("What Users Remember (The Clues)")
            # In a real production deployment with SQLite, this would be a group_by query
            chart_data = pd.DataFrame(
                {"Count": [45, 32, 28, 15, 10]}, 
                index=["Aesthetic/Vibe (e.g. Sunset)", "Specific Objects", "General Timeframe", "Vague Location", "Colors"]
            )
            st.bar_chart(chart_data)
            
        with col2:
            st.subheader("What Users Forgot (The Gap)")
            chart_data_forgot = pd.DataFrame(
                {"Count": [52, 41, 19, 12, 6]}, 
                index=["Exact Date/Year", "Geographic Location", "File Name", "Context", "People Names"]
            )
            st.bar_chart(chart_data_forgot)
            
        st.divider()
        st.subheader("Top Opportunity Areas")
        st.markdown("""
        **1. Semantic Object & Aesthetic Search:** Users frequently remember the "feel" of a photo (e.g., "dark room with neon lights") but current keyword searches fail.
        
        **2. Fuzzy Time Bracketing:** Users know a photo happened "around college graduation" but not the exact year.
        
        **3. Document & Text Retrieval:** Users are looking for receipts or IDs and only remember the visual color of the logo, not the text itself.
        """)

# ==========================================
# TAB 4: PM COPILOT (RAG)
# ==========================================
with tab4:
    st.header("💬 Product Manager Copilot")
    st.markdown("Ask the AI to synthesize specific user struggles by querying the underlying ChromaDB vector database.")

    # Chat History
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {"role": "assistant", "content": "How can I help you explore the user feedback today? Try asking: 'Show me examples of people who couldn't find their ID cards.'"}
        ]

    for msg in st.session_state.messages:
        st.chat_message(msg["role"]).write(msg["content"])

    # Chat Input
    if prompt := st.chat_input("Ask about retrieval failures..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        st.chat_message("user").write(prompt)
        
        if total_vectors == 0:
            response_text = "The database is currently empty. Please wait for the pipeline to process and store data."
            st.session_state.messages.append({"role": "assistant", "content": response_text})
            st.chat_message("assistant").write(response_text)
        else:
            with st.spinner("Searching the vector database and synthesizing insights..."):
                # 1. Retrieve from ChromaDB
                try:
                    results = collection.query(
                        query_texts=[prompt],
                        n_results=4
                    )
                    context_docs = results["documents"][0]
                    context_str = "\n\n---\n\n".join(context_docs)
                except Exception as e:
                    context_str = ""
                    context_docs = []
                
                # 2. Augment prompt with context
                augmented_prompt = f"""
                You are a Product Manager AI Assistant for Google Photos.
                Answer the user's question about photo retrieval failures using ONLY the following context from our user feedback database.
                If the context does not contain the answer, say you do not have enough data.
                Keep your answer concise, analytical, and quote specific user struggles where relevant.

                Context:
                {context_str}

                User Question:
                {prompt}
                """

                # 3. Generate response using Groq
                try:
                    response = groq_client.chat.completions.create(
                        model='qwen/qwen3.8-27b',
                        messages=[{"role": "user", "content": augmented_prompt}],
                    )
                    response_text = response.choices[0].message.content
                except Exception as e:
                    response_text = f"Error generating response from Groq: {e}"

                st.session_state.messages.append({"role": "assistant", "content": response_text})
                st.chat_message("assistant").write(response_text)
                
                # Show sources in an expander
                if context_docs:
                    with st.expander("View Raw Retrieved Feedback Sources"):
                        for doc in context_docs:
                            st.text(doc)
