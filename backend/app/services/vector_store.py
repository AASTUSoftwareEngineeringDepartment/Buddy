import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
from app.models.science_qa import TextChunk
import os
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, persist_directory: str = "chroma_db"):
        self.persist_directory = persist_directory
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(allow_reset=True)
        )
        self.collection = self.client.get_or_create_collection(
            name="science_books",
            metadata={"hnsw:space": "cosine"}
        )
        
        # Initialize the embedding model with error handling
        try:
            # Try to load the model from cache first
            cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "torch", "sentence_transformers")
            os.makedirs(cache_dir, exist_ok=True)
            
            self.embedding_model = SentenceTransformer(
                'all-MiniLM-L6-v2',
                cache_folder=cache_dir
            )
            logger.info("Successfully initialized SentenceTransformer model")
        except Exception as e:
            logger.error(f"Failed to initialize SentenceTransformer model: {str(e)}")
            # Fallback to a simpler model if the main one fails
            try:
                self.embedding_model = SentenceTransformer(
                    'paraphrase-MiniLM-L3-v2',
                    cache_folder=cache_dir
                )
                logger.info("Successfully initialized fallback SentenceTransformer model")
            except Exception as e:
                logger.error(f"Failed to initialize fallback model: {str(e)}")
                raise ValueError("Failed to initialize any embedding model")

    def add_chunks(self, chunks: List[TextChunk]):
        """Add text chunks to the vector store."""
        documents = []
        metadatas = []
        ids = []

        for chunk in chunks:
            documents.append(chunk.content)
            metadatas.append({
                "book_title": chunk.book_title,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
                "created_at": chunk.created_at.isoformat()
            })
            ids.append(chunk.chunk_id)

        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def search_chunks(self, query: str, n_results: int = 5) -> List[Dict]:
        """Search for relevant chunks using semantic similarity."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        return [
            {
                "chunk_id": id,
                "content": doc,
                "metadata": meta,
                "distance": dist
            }
            for id, doc, meta, dist in zip(
                results["ids"][0],
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            )
        ]

    def get_random_chunk(self, topic: Optional[str] = None) -> Dict:
        """Get a random chunk from the collection, optionally filtered by topic."""
        # Get all chunks
        results = self.collection.get()
        
        if not results["ids"]:
            raise ValueError("No chunks found in the collection")

        # If topic is provided, filter chunks by topic
        if topic:
            filtered_chunks = [
                (id, doc, meta)
                for id, doc, meta in zip(
                    results["ids"],
                    results["documents"],
                    results["metadatas"]
                )
                if topic.lower() in doc.lower()
            ]
            
            if not filtered_chunks:
                raise ValueError(f"No chunks found for topic: {topic}")
            
            # Randomly select one chunk
            import random
            id, doc, meta = random.choice(filtered_chunks)
        else:
            # Randomly select one chunk from all chunks
            import random
            idx = random.randint(0, len(results["ids"]) - 1)
            id = results["ids"][idx]
            doc = results["documents"][idx]
            meta = results["metadatas"][idx]

        return {
            "chunk_id": id,
            "content": doc,
            "metadata": meta
        } 