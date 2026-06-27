from groq import AsyncGroq
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, api_key: str, model: str = "llama-3.1-70b-versatile"):
        """
        Initialize Groq client.
        Available models:
        - llama-3.1-70b-versatile (best accuracy)
        - llama-3.1-8b-instant (fastest)
        - mixtral-8x7b-32768 (long context)
        """
        self.client = AsyncGroq(api_key=api_key)
        self.model = model
        logger.info(f"LLM Service initialized with model: {model}")
    
    async def analyze_query(
        self,
        question: str,
        relevant_chunks: List[Tuple[Dict, float]],
        max_tokens: int = None  # Will use from config if None
    ) -> str:
        from ..config import get_settings
        settings = get_settings()
        
        if max_tokens is None:
            max_tokens = settings.LLM_MAX_TOKENS
        # Build context from relevant chunks
        context_parts = []
        for idx, (chunk, score) in enumerate(relevant_chunks, 1):
            chunk_text = chunk['text']
            metadata = f"[Chunk {idx}, Relevance: {score:.2f}]"
            context_parts.append(f"{metadata}\n{chunk_text}")
        
        context = "\n\n".join(context_parts)
        
        # Optimized prompt template
        prompt = f"""You are an expert insurance policy analyst. Your task is to analyze policy documents and answer questions with precision.

POLICY DOCUMENT EXCERPTS:
{context}

QUESTION: {question}

INSTRUCTIONS:
1. Carefully read the relevant policy clauses above
2. Provide a clear decision: APPROVED, REJECTED, or PARTIAL COVERAGE
3. Quote specific clause numbers or sections that support your decision
4. Explain your reasoning in 2-3 sentences
5. If information is insufficient, state "INSUFFICIENT INFORMATION" and explain what's missing

ANSWER FORMAT:
Decision: [APPROVED/REJECTED/PARTIAL/INSUFFICIENT]
Relevant Clauses: [Quote specific sections]
Explanation: [Your reasoning with specific details]

ANSWER:"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise insurance policy analyst. Always cite specific clauses and provide explainable decisions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=settings.LLM_TEMPERATURE,
                top_p=0.9
            )
            
            answer = response.choices[0].message.content.strip()
            logger.info(f"LLM response generated. Tokens used: {response.usage.total_tokens}")
            
            return answer
        
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            raise ValueError(f"Failed to generate answer: {str(e)}")