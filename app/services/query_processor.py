import logging
from functools import lru_cache
from typing import List

from app.config import get_settings
from app.services.document_loader import DocumentLoader
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService
from app.services.text_chunker import TextChunker
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)
settings = get_settings()


@lru_cache()
def _get_embedding_service() -> EmbeddingService:
    return EmbeddingService(settings.EMBEDDING_MODEL)


@lru_cache()
def _get_llm_service() -> LLMService:
    return LLMService(settings.GROQ_API_KEY, model=settings.GROQ_MODEL)


class QueryProcessor:
    """Process document queries using Groq AI"""
    
    def __init__(self):
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.chunker = TextChunker(chunk_size=settings.CHUNK_SIZE, overlap=settings.CHUNK_OVERLAP)
        self.embedding_service = _get_embedding_service()
        self.vector_store = VectorStore(self.embedding_service.dimension)
        self.llm_service = _get_llm_service()
    
    async def process_document_and_queries(
        self, 
        document_source: str, 
        questions: List[str]
    ) -> List[str]:
        """Process a document and answer multiple questions."""
        # Extract document text
        document_text = await self._extract_text(document_source)
        
        if not document_text:
            raise ValueError("Could not extract text from document")
        
        logger.info(f"Extracted {len(document_text)} characters from document")

        chunks = self.chunker.chunk_by_sentences(document_text)
        if not chunks:
            chunks = [{"text": document_text, "chunk_id": 0, "word_count": len(document_text.split())}]

        embeddings = self.embedding_service.embed_texts([chunk["text"] for chunk in chunks])
        self.vector_store.clear()
        self.vector_store.add_chunks(embeddings, chunks)
        
        # Process each question
        answers = []
        for question in questions:
            answer = await self._process_single_query(question)
            answers.append(answer)
        
        return answers
    
    async def _extract_text(self, document_source: str) -> str:
        """Extract text from document (PDF, DOCX, or URL)"""
        # Use DocumentLoader for all extraction
        return await DocumentLoader.load_and_extract(document_source)

    async def _process_single_query(self, question: str) -> str:
        """Process a single question using Groq AI"""

        query_embedding = self.embedding_service.embed_query(question)
        relevant_chunks = self.vector_store.search(query_embedding, top_k=settings.TOP_K_CHUNKS)
        
        try:
            if not relevant_chunks:
                raise ValueError("No relevant chunks found for the query")

            answer = await self.llm_service.analyze_query(
                question=question,
                relevant_chunks=relevant_chunks,
                max_tokens=self.max_tokens,
            )

            logger.info(f"Generated answer ({len(answer)} chars)")
            
            return answer
        
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise ValueError(f"AI processing failed: {e}")
