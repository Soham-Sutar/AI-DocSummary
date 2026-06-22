from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document

load_dotenv()

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Load your Gemini API key from environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Store uploaded document content in session/memory
uploaded_content = {
    'text': None,
    'filename': None
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_txt(file_path):
    """Extract text from .txt file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_text_from_pdf(file_path):
    """Extract text from .pdf file"""
    text = ""
    try:
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"
    return text

def extract_text_from_docx(file_path):
    """Extract text from .docx file"""
    text = ""
    try:
        doc = Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"
    return text

def extract_text(file_path, file_type):
    """Extract text based on file type"""
    file_type = file_type.lower()
    
    if file_type == 'txt':
        return extract_text_from_txt(file_path)
    elif file_type == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    """Handle document upload"""
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file provided"})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"})
    
    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "File type not allowed. Use .txt, .pdf, or .docx"})
    
    try:
        # Save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Extract text
        file_ext = filename.rsplit('.', 1)[1].lower()
        text_content = extract_text(file_path, file_ext)
        
        if len(text_content) == 0:
            return jsonify({"success": False, "error": "Document is empty"})
        
        # Store content in memory
        uploaded_content['text'] = text_content
        uploaded_content['filename'] = filename
        
        return jsonify({
            "success": True,
            "filename": filename,
            "message": f"Document uploaded successfully! ({len(text_content)} characters)"
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": f"Error uploading file: {str(e)}"})

@app.route("/summarize", methods=["POST"])
def summarize():
    """Summarize the uploaded document"""
    if not uploaded_content['text']:
        return jsonify({"answer": "Please upload a document first."})
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""Please provide a concise summary of the following document:

Document:
{uploaded_content['text']}

Provide a clear, organized summary highlighting the key points."""
    
    try:
        response = model.generate_content(prompt)
        
        if response and response.candidates:
            answer = response.candidates[0].content.parts[0].text
        else:
            answer = "I didn't get a valid response from the AI."
        
        return jsonify({"answer": answer})
    
    except Exception as e:
        print("Gemini API error:", e)
        return jsonify({"answer": f"Error: {str(e)}"})

@app.route("/ask", methods=["POST"])
def ask():
    """Answer questions about the uploaded document"""
    if not uploaded_content['text']:
        return jsonify({"answer": "Please upload a document first."})
    
    data = request.get_json(force=True)
    question = data.get("question", "")

    if not question:
        return jsonify({"answer": "Please type a question."})

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""You are a helpful assistant. Answer the following question based ONLY on the document provided.
If the answer is not found in the document, say "I don't know based on the document."

Document:
{uploaded_content['text']}

Question: {question}
"""

    try:
        response = model.generate_content(prompt)

        # Extract safe text
        if response and response.candidates:
            answer = response.candidates[0].content.parts[0].text
        else:
            answer = "I didn't get a valid response from the AI."

        return jsonify({"answer": answer})

    except Exception as e:
        print("Gemini API error:", e)
        return jsonify({"answer": f"Error: {str(e)}"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
