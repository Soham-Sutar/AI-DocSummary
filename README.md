# Simple Document Chatbot (Flask)

This is a minimal web project demonstrating a document-based chatbot using simple fuzzy matching.

## How it works
- The document (`faqs.json`) contains question-answer pairs.
- When the user asks a question, the server computes fuzzy similarity between the user's question and each stored Q/A.
- The best match is returned to the user (with a fallback if similarity is low).

## Run locally
1. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate   # macOS / Linux
   venv\Scripts\activate      # Windows
