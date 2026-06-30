import speech_recognition as sr
import requests
import time
import os
import asyncio
import edge_tts
import pygame

# =========================
# CONFIG
# =========================
API_URL = "http://localhost:3000/api/chat"
VOICE = "en-US-GuyNeural"   # Change if needed

# =========================
# INIT AUDIO
# =========================
pygame.mixer.init()

# =========================
# TTS (VOICE)
# =========================
async def _generate_voice(text):
    file = "voice.mp3"
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(file)
    return file

def speak(text):
    try:
        print("Jarvis:", text)

        # Improve speaking style
        text = text.replace(".", "... ")
        text = text.replace("?", "? ")

        file = asyncio.run(_generate_voice(text))

        # 🔊 Play audio
        pygame.mixer.music.load(file)
        pygame.mixer.music.play()

        # Wait until speaking finished
        while pygame.mixer.music.get_busy():
            time.sleep(0.2)

        pygame.mixer.music.unload()
        os.remove(file)

    except Exception as e:
        print("TTS Error:", e)

# =========================
# BACKEND COMMUNICATION
# =========================
def send_message(message):
    try:
        response = requests.post(
            API_URL,
            json={"message": message},
            timeout=10
        )

        data = response.json()

        if "reply" in data:
            return data["reply"]
        else:
            return "No reply received"

    except requests.exceptions.ConnectionError:
        return "Backend not running"

    except Exception as e:
        return f"Error: {str(e)}"

# =========================
# SPEECH RECOGNITION
# =========================
recognizer = sr.Recognizer()
recognizer.energy_threshold = 300
recognizer.pause_threshold = 0.8

def listen():
    with sr.Microphone() as source:
        try:
            print("\nListening...")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)

            audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)

            print("Recognizing...")
            text = recognizer.recognize_google(audio)

            print("You:", text)
            return text.lower()

        except sr.WaitTimeoutError:
            print("No speech detected")
            return None

        except sr.UnknownValueError:
            print("Could not understand")
            return None

        except Exception as e:
            print("Mic error:", e)
            return None

# =========================
# MAIN LOOP
# =========================
def run_jarvis():
    print("Jarvis started 🚀")

    while True:
        user_input = listen()

        if not user_input:
            continue

        if user_input in ["exit", "quit", "stop"]:
            speak("Goodbye")
            break

        reply = send_message(user_input)
        speak(reply)

# =========================
# START
# =========================
if __name__ == "__main__":
    run_jarvis()
