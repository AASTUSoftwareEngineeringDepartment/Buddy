import pdfplumber
from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.models.science_qa import TextChunk
import os

class PDFProcessor:
    def __init__(self, chunk_size: int = 200, chunk_overlap: int = 20):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            is_separator_regex=False
        )

    def extract_text_from_pdf(self, pdf_path: str) -> List[Dict]:
        """Extract text from PDF and return list of page contents with metadata."""
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        pages = []
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    pages.append({
                        "page_number": page_num,
                        "content": text
                    })
        return pages

    def chunk_text(self, book_title: str, pages: List[Dict]) -> List[TextChunk]:
        """Split text into chunks and create TextChunk objects."""
        chunks = []
        for page in pages:
            page_chunks = self.text_splitter.split_text(page["content"])
            for idx, chunk_content in enumerate(page_chunks):
                chunk = TextChunk(
                    book_title=book_title,
                    content=chunk_content,
                    page_number=page["page_number"],
                    chunk_index=idx
                )
                chunks.append(chunk)
        return chunks

    def process_pdf(self, pdf_path: str, book_title: str) -> List[TextChunk]:
        """Process PDF file and return list of TextChunk objects."""
        pages = self.extract_text_from_pdf(pdf_path)
        return self.chunk_text(book_title, pages) 