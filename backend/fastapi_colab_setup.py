document-processing-dashboard/
├── backend/
│   └── fastapi_colab_setup.py
└── README.md
backend/fastapi_colab_setup.py
# Install the required libraries
!pip install PyPDF2
!pip install pytesseract
!pip install pdf2image
!apt-get install poppler-utils
!apt-get install tesseract-ocr
!apt-get install libtesseract-dev
!pip install spacy
!python -m spacy download en_core_web_sm
!pip install fastapi
!pip install uvicorn
!pip install pyngrok
!pip install aiofiles

# Configure ngrok with your authtoken
!ngrok authtoken YOUR_NGROK_AUTH_TOKEN

import PyPDF2
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os
from google.colab import files
import spacy
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
from pyngrok import ngrok
import nest_asyncio
import uvicorn

# Apply the nest_asyncio patch
nest_asyncio.apply()

# Load the spaCy model for NLP processing
nlp = spacy.load("en_core_web_sm")

# In-memory storage for documents
documents = []

def extract_text_from_pdf(pdf_path):
    # Extract text from regular text-based PDFs
    pdf_reader = PyPDF2.PdfReader(pdf_path)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()

    # Handle images within PDFs using OCR
    images = convert_from_path(pdf_path)
    for i, image in enumerate(images):
        image_text = pytesseract.image_to_string(image)
        text += image_text

    return text

def save_text_to_file(text, file_path):
    with open(file_path, "w") as file:
        file.write(text)

def parse_extracted_text(text):
    doc = nlp(text)
    parsed_data = {"entities": []}

    # Extract named entities (e.g., dates, names, financial terms)
    for ent in doc.ents:
        parsed_data["entities"].append({
            "text": ent.text,
            "label": ent.label_
        })

    return parsed_data

# FastAPI app
app = FastAPI()

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    # Save the uploaded PDF
    pdf_path = f"./uploaded_files/{file.filename}"
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Add document to in-memory storage
    document = {
        "id": len(documents) + 1,
        "name": file.filename,
        "status": "Uploaded",
        "path": pdf_path
    }
    documents.append(document)
    return {"message": "File uploaded successfully", "document": document}

@app.get("/api/documents")
async def get_documents():
    processed = sum(1 for doc in documents if doc["status"] == "Processed")
    failed = sum(1 for doc in documents if doc["status"] == "Failed")
    return {"documents": documents, "stats": {"processed": processed, "failed": failed}}

@app.post("/api/process/{doc_id}")
async def process_document(doc_id: int):
    document = next((doc for doc in documents if doc["id"] == doc_id), None)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        # Extract text and parse data
        extracted_text = extract_text_from_pdf(document["path"])
        parsed_data = parse_extracted_text(extracted_text)

        # Update document status
        document["status"] = "Processed"
        document["parsed_data"] = parsed_data
    except Exception as e:
        document["status"] = "Failed"
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Document processed successfully"}

# Expose the app with ngrok
public_url = ngrok.connect(8000)
print(f"Public URL: {public_url}")

# Run the server
uvicorn.run(app, host="0.0.0.0", port=8000)
