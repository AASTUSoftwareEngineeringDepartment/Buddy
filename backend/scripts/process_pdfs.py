import os
from app.services.pdf_processor import PDFProcessor
from app.services.vector_store import VectorStore

def process_pdfs():
    # Initialize services
    pdf_processor = PDFProcessor()
    vector_store = VectorStore()
    
    # Process each PDF in the books directory
    books_dir = "books"
    for filename in os.listdir(books_dir):
        if filename.endswith(".pdf"):
            pdf_path = os.path.join(books_dir, filename)
            book_title = os.path.splitext(filename)[0]
            
            print(f"Processing {book_title}...")
            
            try:
                # Process PDF and get chunks
                chunks = pdf_processor.process_pdf(pdf_path, book_title)
                
                # Store chunks in vector database
                vector_store.add_chunks(chunks)
                
                print(f"Successfully processed {book_title} - {len(chunks)} chunks created")
            except Exception as e:
                print(f"Error processing {book_title}: {str(e)}")

if __name__ == "__main__":
    process_pdfs() 