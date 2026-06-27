import faiss
import numpy as np
from typing import List, Tuple, Dict
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, dimension: int):
        """
        Initialize FAISS index.
        Using IndexFlatIP (Inner Product) for cosine similarity with normalized vectors.
        """
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)  # Cosine similarity
        self.chunks: List[Dict] = []
        logger.info(f"FAISS index initialized with dimension: {dimension}")
    
    def add_chunks(self, embeddings: np.ndarray, chunks: List[Dict]):
        """Add document chunks to the index"""
        if embeddings.shape[1] != self.dimension:
            raise ValueError(f"Embedding dimension mismatch: expected {self.dimension}, got {embeddings.shape[1]}")
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        
        self.index.add(embeddings)
        self.chunks.extend(chunks)
        logger.info(f"Added {len(chunks)} chunks to index. Total: {self.index.ntotal}")
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Tuple[Dict, float]]:
        """
        Search for similar chunks.
        Returns list of (chunk, similarity_score) tuples.
        """
        # Normalize query embedding
        query_embedding = query_embedding.reshape(1, -1).astype('float32')
        faiss.normalize_L2(query_embedding)
        
        # Search
        scores, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.chunks):  # Valid index
                results.append((self.chunks[idx], float(score)))
        
        return results
    
    def clear(self):
        """Clear the index"""
        self.index.reset()
        self.chunks = []
        logger.info("Vector store cleared")