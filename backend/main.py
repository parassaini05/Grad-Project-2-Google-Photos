from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
from google import genai
import os
from dotenv import load_dotenv

# Load Env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment.")

gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Initialize FastAPI
app = FastAPI(
    title="AI Discovery Engine Backend",
    description="Backend API for querying ChromaDB and synthesizing insights using Groq RAG.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
def get_collection():
    client = chromadb.PersistentClient(path="./chroma_db") # same directory as running from /app
    bge_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-small-en-v1.5")
    return client.get_or_create_collection("retrieval_failures", embedding_function=bge_ef)

# Models
class QueryRequest(BaseModel):
    prompt: str

class QueryResponse(BaseModel):
    synthesis: str
    sources: list[str]

@app.get("/")
def read_root():
    return {"message": "AI Discovery Engine Backend is running!"}

@app.get("/api/stats")
def get_db_stats():
    """Returns the total number of processed feedback vectors."""
    try:
        collection = get_collection()
        return {"total_vectors": collection.count()}
    except Exception as e:
        return {"total_vectors": 0, "error": str(e)}

@app.post("/api/rag", response_model=QueryResponse)
def run_rag_query(request: QueryRequest):
    """Retrieves context from ChromaDB and synthesizes an answer using Gemini."""
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured.")
        
    prompt = request.prompt
    
    try:
        collection = get_collection()
        results = collection.query(
            query_texts=[prompt],
            n_results=4
        )
        context_docs = results["documents"][0] if results["documents"] else []
        context_str = "\n\n---\n\n".join(context_docs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

    if not context_docs:
        return QueryResponse(synthesis="No relevant insights found in the database yet.", sources=[])

    augmented_prompt = f"""
    You are a Product Manager AI Assistant for Google Photos. You analyze user feedback and provide concise, analytical answers. Always quote specific user struggles from the provided context. Be direct and insightful — do not add disclaimers or excessive caveats.

    The following are real user feedback entries from our Google Photos research database. Each one documents a real user's struggle to find or retrieve a specific photo.

    Context from database:
    {context_str}

    Based ONLY on the context above, answer this question analytically:
    {prompt}

    Structure your answer with: key patterns observed, specific user quotes as evidence, and a brief PM recommendation.
    """

    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=augmented_prompt
        )
        synthesis = response.text
        return QueryResponse(synthesis=synthesis, sources=context_docs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API synthesis failed: {e}")
