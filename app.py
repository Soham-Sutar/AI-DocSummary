from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Load your Gemini API key from environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load your document (can be faqs.json, or any text)
with open("faqs.json", "r", encoding="utf-8") as f:
    FAQS = json.load(f)

def build_context(question):
    # Naive: join all Q&A pairs (you can later replace with embeddings search)
    context = ""
    # for entry in FAQS:
    #     context += f"Q: {entry['question']}\nA: {entry['answer']}\n\n"

    with open("faqs_txt.txt", "r", encoding="utf-8") as f:
        context = f.read()
    return context

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(force=True)
    question = data.get("question", "")

    if not question:
        return jsonify({"answer": "Please type a question."})

    context = build_context(question)

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""You are a helpful assistant.
    Answer the following question in your way using the information provided below.
    If the answer cannot be found, say "I don't know based on the document.
    provide appropriate answers for questions like thanks or hi etc..
    Document:
    {context}

    Question: {question}
    """

    try:
        response = model.generate_content(prompt)
        #print("RAW RESPONSE:", response)

        # Extract safe text
        if response and response.candidates:
            answer = response.candidates[0].content.parts[0].text
        else:
            answer = "I didn’t get a valid response from the AI."

        return jsonify({"answer": answer})

    except Exception as e:
        print("Gemini API error:", e)
        return jsonify({"answer": f"Error: {str(e)}"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
