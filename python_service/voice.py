import pyttsx3

def speak(text):
    engine = pyttsx3.init()   # 👈 NEW engine every time
    engine.say(text)
    engine.runAndWait()
    engine.stop()