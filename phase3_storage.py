import os
import json
import chromadb
from chromadb.utils import embedding_functions

# Use the BAAI/bge-small-en-v1.5 model for local, high-quality embeddings
# as specified in the updated architecture.
BGE_MODEL_NAME = "BAAI/bge-small-en-v1.5"

def setup_vector_db():
    print(f"Initializing ChromaDB with embedding model: {BGE_MODEL_NAME}")
    
    # Setup persistent ChromaDB storage in the local directory
    client = chromadb.PersistentClient(path="./chroma_db")
    
    # Initialize the BGE embedding function
    bge_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=BGE_MODEL_NAME)
    
    # Create or get the collection
    collection = client.get_or_create_collection(
        name="retrieval_failures",
        embedding_function=bge_ef
    )
    
    return collection

def load_and_embed_data(collection):
    processed_files = [
        "data/playstore_processed.json",
        "data/reddit_processed.json",
        "data/community_processed.json"
    ]
    
    documents = []
    metadatas = []
    ids = []
    
    global_id = 0
    
    for file_path in processed_files:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                continue
                
        for item in data:
            if not item.get("is_relevant"):
                continue
                
            # --- RAG CHUNKING STRATEGY ---
            # Since user reviews/posts are short, we do NOT use token-splitting (like RecursiveCharacterTextSplitter).
            # Instead, we use Document-Level Metadata Chunking.
            # We combine the most semantically dense extracted fields + raw text into a single cohesive chunk.
            
            combined_text = (
                f"Struggle Type: {item.get('struggle_type', '')}\n"
                f"User Remembers: {item.get('remembered_info', '')}\n"
                f"User Forgot: {item.get('forgotten_info', '')}\n"
                f"Raw Feedback: {item.get('text', '')}"
            )
            
            # Store everything else as strict metadata for precise filtering
            metadata = {
                "source": item.get("source", "Unknown"),
                "url": item.get("url", ""),
                "search_queries": item.get("search_queries", ""),
                "score": item.get("score", -1)
            }
            
            documents.append(combined_text)
            metadatas.append(metadata)
            ids.append(f"doc_{global_id}")
            global_id += 1

    if documents:
        print(f"Embedding and inserting {len(documents)} highly-relevant chunks into ChromaDB...")
        # ChromaDB handles batching automatically
        collection.upsert(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print("Successfully loaded into Vector Database!")
    else:
        print("No processed documents found to embed.")

if __name__ == "__main__":
    collection = setup_vector_db()
    load_and_embed_data(collection)
