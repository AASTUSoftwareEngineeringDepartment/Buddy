import os
import sys

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from app.services.vector_store import VectorStore

def show_chunks():
    vector_store = VectorStore()
    results = vector_store.collection.get()
    print(f"Total chunks in Chroma DB: {len(results['ids'])}")
    for idx, (chunk_id, doc, meta) in enumerate(zip(results['ids'], results['documents'], results['metadatas'])):
        print(f"\nChunk {idx+1}:")
        print(f"  ID: {chunk_id}")
        print(f"  Book Title: {meta.get('book_title')}")
        print(f"  Page Number: {meta.get('page_number')}")
        print(f"  Chunk Index: {meta.get('chunk_index')}")
        print(f"  Created At: {meta.get('created_at')}")
        print(f"  Content: {doc[:200]}...")  # Print first 200 chars

if __name__ == "__main__":
    show_chunks() 