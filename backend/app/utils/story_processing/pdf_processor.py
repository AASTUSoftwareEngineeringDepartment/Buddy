import PyPDF2
from typing import List, Dict
import os

class PDFProcessor:
    def __init__(self, stories_dir: str):
        self.stories_dir = stories_dir

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file."""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                # Create a PDF reader object
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Extract text from each page
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error processing PDF {pdf_path}: {str(e)}")
            return ""

    def process_stories(self) -> List[Dict[str, str]]:
        """Process all PDF files in the stories directory."""
        stories = []
        try:
            for filename in os.listdir(self.stories_dir):
                if filename.endswith('.pdf'):
                    pdf_path = os.path.join(self.stories_dir, filename)
                    text = self.extract_text_from_pdf(pdf_path)
                    if text:  # Only add stories that were successfully processed
                        stories.append({
                            'filename': filename,
                            'content': text,
                            'title': os.path.splitext(filename)[0]
                        })
        except Exception as e:
            print(f"Error processing stories directory: {str(e)}")
        
        return stories 