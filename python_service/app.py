from flask import Flask, request, jsonify
from threading import Thread
import pyttsx3

app = Flask(__name__)

# -------------------------
# TTS ENGINE FUNCTION
# -------------------------
def speak_text_engine(text):
    try:
        engine = pyttsx3.init()

        engine.setProperty('rate', 150)

        voices = engine.getProperty('voices')
        engine.setProperty('voice', voices[0].id)

        engine.say(text)
        engine.runAndWait()
        engine.stop()

    except Exception as e:
        print("TTS Error:", e)

# -------------------------
# API ROUTE
# -------------------------
@app.route("/speak", methods=["POST"])
def speak_text():
    try:
        data = request.get_json()
        text = data.get("text")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        Thread(target=speak_text_engine, args=(text,)).start()

        return jsonify({
            "status": "success",
            "message": "Speaking started",
            "text": text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# HOME
# -------------------------
@app.route("/")
def home():
    return jsonify({"message": "Jarvis Python Service Running"})


if __name__ == "__main__":
    app.run(port=5005, debug=True)