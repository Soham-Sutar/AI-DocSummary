# Document ChatBot

A Flask-based web app that lets users upload a document and then either summarize it or ask questions about its content.

## Features

- Upload `.txt`, `.pdf`, or `.docx` documents
- Extract document text automatically
- Summarize the uploaded document with Gemini AI
- Answer questions using only the uploaded document content
- Secure API key handling via environment variables
- Simple browser-based chat interface

## Requirements

- Python 3.10 or later
- A valid Google Generative AI API key (Gemini)
- `venv` for local environment isolation (recommended)

## Installation

1. Clone the repository or copy the project files.
2. Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS / Linux
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root with your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

> Do not commit `.env` to source control.

## Running the App

Start the Flask server:

```bash
python app.py
```

Open your browser at:

```text
http://127.0.0.1:5000/
```

## Usage

1. Upload a document using the file input.
2. Choose one of the modes:
   - **Ask Questions**: type a question and click `Send`
   - **Summarize Document**: click `Summarize Document`
3. The AI will use the uploaded file content to answer or summarize.

## Supported File Types

- `.txt` — plain text files
- `.pdf` — PDF documents
- `.docx` — Microsoft Word documents

## Project Structure

- `app.py` — Flask backend and AI integration
- `templates/index.html` — web UI structure
- `static/style.css` — frontend styling
- `static/script.js` — upload and chat behavior
- `requirements.txt` — Python dependencies
- `uploads/` — saved uploaded files
- `.env` — local API key configuration (not committed)

## Notes

- The app stores uploaded text in memory for the current session.
- If you restart the server, you must re-upload the document.
- Keep your API key private and never push it to GitHub.

## Troubleshooting

### API key or model errors

- If you get model errors like `404 models/... is not found`, your API key may not support that model.
- Use the available Gemini model from your account, or update `app.py` to a supported model.

### Upload errors

- Ensure the file is `.txt`, `.pdf`, or `.docx`.
- Make sure the file is not empty.
- If a PDF or DOCX fails, check the file content and try another document.

## Future Improvements

- Add support for multiple document uploads
- Use embeddings for better question answering
- Add user authentication
- Save upload history per session
