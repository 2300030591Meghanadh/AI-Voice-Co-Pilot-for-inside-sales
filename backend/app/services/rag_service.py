import os
from typing import List, Dict, Any
from app.core.config import settings

class RAGService:
    _instance = None
    _vectorstore = None
    _documents = []

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RAGService()
            cls._instance.initialize_vector_store()
        return cls._instance

    def initialize_vector_store(self):
        """
        Loads document texts from knowledge_base directory and initializes vector index.
        Uses LangChain FAISS + HuggingFace/SentenceTransformers embeddings or local memory index.
        """
        kb_dir = settings.KNOWLEDGE_BASE_DIR
        texts = []

        # Load .txt and .pdf files in knowledge_base directory
        if os.path.exists(kb_dir):
            for fname in os.listdir(kb_dir):
                fpath = os.path.join(kb_dir, fname)
                if fname.endswith(".txt"):
                    try:
                        with open(fpath, "r", encoding="utf-8") as f:
                            content = f.read()
                            texts.append({"source": fname, "text": content})
                    except Exception as e:
                        print(f"Error reading txt file {fname}: {e}")
                elif fname.endswith(".pdf"):
                    try:
                        import pypdf
                        reader = pypdf.PdfReader(fpath)
                        pdf_text = ""
                        for page in reader.pages:
                            pdf_text += page.extract_text() or ""
                        if pdf_text.strip():
                            texts.append({"source": fname, "text": pdf_text})
                    except Exception as e:
                        print(f"Error reading pdf file {fname}: {e}")

        # If no documents exist yet, create a default product text chunk
        if not texts:
            default_text = """
            AFFORDAI PAY-IN-3 ZERO-COST EMI PRODUCT SPECIFICATIONS
            - Product Name: Pay-in-3 Zero-Cost EMI
            - Split: 3 equal monthly installments (33.33% each month).
            - Interest Rate: 0% Interest (Zero-Cost EMI).
            - Processing Fees: 0 INR processing fee.
            - Eligibility: Indian citizens aged 21-60 years with minimum salary of 25,000 INR/month or annual ITR of 3,00,000 INR.
            - Credit Score: CIBIL 670+.
            - KYC Required: PAN Card + Aadhaar Card with OTP verification + Auto-Debit e-NACH setup.
            - Grace Period: 3 days grace period for monthly installments. Late fee is 250 INR after grace period.
            - Foreclosure: 0% foreclosure penalty for early settlement.
            """
            texts.append({"source": "pay_in_3_default.txt", "text": default_text})

        self._documents = texts
        
        # Build FAISS vector store if langchain & sentence_transformers available
        try:
            try:
                from langchain_text_splitters import RecursiveCharacterTextSplitter
            except ImportError:
                from langchain.text_splitter import RecursiveCharacterTextSplitter

            from langchain_community.vectorstores import FAISS
            try:
                from langchain_huggingface import HuggingFaceEmbeddings
            except ImportError:
                from langchain_community.embeddings import HuggingFaceEmbeddings

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            all_chunks = []
            metadatas = []

            for doc in texts:
                chunks = text_splitter.split_text(doc["text"])
                for chunk in chunks:
                    all_chunks.append(chunk)
                    metadatas.append({"source": doc["source"]})

            if all_chunks:
                embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                self._vectorstore = FAISS.from_texts(all_chunks, embeddings, metadatas=metadatas)
                # Save FAISS index
                faiss_path = os.path.join(settings.VECTOR_STORE_DIR, "faiss_index")
                self._vectorstore.save_local(faiss_path)
                print("Successfully initialized FAISS Vector DB with product documents!")
        except Exception as e:
            print(f"FAISS/SentenceTransformers not fully loaded ({e}). Using lightweight memory RAG index.")
            self._vectorstore = None

    def query(self, question: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Executes RAG Query:
        1. Retrieve top-k matching document chunks.
        2. Formulate strictly context-bound answer.
        """
        retrieved_chunks = []
        sources = []

        # 1. Query FAISS if loaded
        if self._vectorstore is not None:
            try:
                results = self._vectorstore.similarity_search_with_score(question, k=top_k)
                for doc, score in results:
                    retrieved_chunks.append(doc.page_content)
                    if doc.metadata.get("source") not in sources:
                        sources.append(doc.metadata.get("source"))
            except Exception as e:
                print(f"FAISS similarity search error: {e}")

        # 2. Heuristic search fallback if FAISS didn't return chunks
        if not retrieved_chunks:
            q_lower = question.lower()
            for doc in self._documents:
                text = doc["text"]
                paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
                for para in paragraphs:
                    if any(word in para.lower() for word in q_lower.split() if len(word) > 3):
                        retrieved_chunks.append(para[:600])
                        if doc["source"] not in sources:
                            sources.append(doc["source"])
                        if len(retrieved_chunks) >= top_k:
                            break

        # If no context found
        if not retrieved_chunks:
            return {
                "question": question,
                "answer": "I could not find information regarding your query in the uploaded Pay-in-3 product documentation. Please verify the uploaded Knowledge Base documents.",
                "sources": [],
                "context_retrieved": False
            }

        context_text = "\n---\n".join(retrieved_chunks)

        # 3. Generate Answer using OpenAI LLM if available, else Context QA Formatter
        if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 5:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                prompt = f"""
You are an expert sales assistant AI. Answer the following question based ONLY on the provided context below.
Never invent facts or use outside knowledge. If the context does not contain the answer, say "Information not found in product documentation."

Context:
{context_text}

Question:
{question}

Answer:
"""
                response = client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[{"role": "user", "content": prompt}]
                )
                answer_text = response.choices[0].message.content.strip()
                return {
                    "question": question,
                    "answer": answer_text,
                    "sources": sources,
                    "context_retrieved": True
                }
            except Exception as e:
                print(f"OpenAI RAG generation failed, using rule-based formatter: {e}")

        # Rule-based context QA synthesizer
        answer_text = f"Based on the official Pay-in-3 Product Documentation:\n\n"
        for idx, chunk in enumerate(retrieved_chunks[:2], 1):
            clean_chunk = chunk.replace('\n', ' ').strip()
            answer_text += f"• {clean_chunk}\n"

        return {
            "question": question,
            "answer": answer_text,
            "sources": sources,
            "context_retrieved": True
        }

rag_service = RAGService.get_instance()
