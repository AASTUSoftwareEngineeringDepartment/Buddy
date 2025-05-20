import os
import sys
import asyncio

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from app.services.pdf_processor import PDFProcessor
from app.services.vector_store import VectorStore
from app.models.science_qa import PDFProcessingRequest, PDFProcessingResponse

async def process_all_pdfs():
    print("Initializing services...")
    # Initialize services
    pdf_processor = PDFProcessor()
    vector_store = VectorStore()
    
    # Get the absolute path to the books directory
    books_dir = os.path.abspath("books")
    print(f"Books directory: {books_dir}")
    
    if not os.path.exists(books_dir):
        print(f"Creating books directory at {books_dir}")
        os.makedirs(books_dir)
        print("Please add your PDF files to the books directory and run this script again.")
        return
    
    # Process each PDF in the books directory
    pdf_files = [f for f in os.listdir(books_dir) if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found in the books directory.")
        print(f"Please add your PDF files to: {books_dir}")
        return
    
    print(f"Found {len(pdf_files)} PDF files to process.")
    
    total_chunks = 0
    for filename in pdf_files:
        pdf_path = os.path.join(books_dir, filename)
        book_title = os.path.splitext(filename)[0]
        
        print(f"\nProcessing {book_title}...")
        print(f"PDF path: {pdf_path}")
        
        try:
            # Process PDF and get chunks
            print("Extracting text and creating chunks...")
            chunks = pdf_processor.process_pdf(pdf_path, book_title)
            print(f"Created {len(chunks)} chunks")
            
            # Store chunks in vector database
            print("Storing chunks in Chroma DB...")
            vector_store.add_chunks(chunks)
            total_chunks += len(chunks)
            
            print(f"✓ Successfully processed {book_title}")
            print(f"  - Created {len(chunks)} chunks")
            print(f"  - Stored in Chroma DB")
            
        except Exception as e:
            print(f"✗ Error processing {book_title}: {str(e)}")
            import traceback
            print(traceback.format_exc())
    
    print(f"\nProcessing complete! Total chunks created: {total_chunks}")
    
    # Verify chunks in database
    try:
        results = vector_store.collection.get()
        print(f"\nVerification: Found {len(results['ids'])} chunks in Chroma DB")
    except Exception as e:
        print(f"Error verifying chunks in database: {str(e)}")

if __name__ == "__main__":
    asyncio.run(process_all_pdfs()) 