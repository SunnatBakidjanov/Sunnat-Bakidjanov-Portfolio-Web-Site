from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("PORT", 3000))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
SMTP_HOST = "smtp.elasticemail.com"
SMTP_PORT = 465

@app.route("/", methods=["GET"])
def home():
    return "Сервер работает! Добро пожаловать Суннат"

@app.route("/api/send-email", methods=["POST"])
def send_email():
    data = request.json
    name = sanitize_input(data.get("name"))
    email = sanitize_input(data.get("email"))
    message = sanitize_input(data.get("message"))

    if not name or not email or not message:
        return jsonify({"error": "Все поля обязательны для заполнения."}), 400

    if not validate_email(email):
        return jsonify({"error": "Некорректный формат email."}), 400

    try:
        send_email_via_smtp(EMAIL_USER, EMAIL_USER, f"Новое сообщение от {name}", f"Имя: {name}\nEmail: {email}\nСообщение:\n{message}")
        send_autoresponse(name, email, message)
        return jsonify({"success": True}), 200
    except Exception as e:
        print("Ошибка при отправке:", e)
        return jsonify({"error": "Ошибка при отправке письма."}), 500

def sanitize_input(value):
    return value.strip() if value else ""

def validate_email(email):
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(email_regex, email)

def detect_russian_language(message):
    russian_pattern = re.compile(r'[а-яА-ЯёЁ]')
    return "ru" if russian_pattern.search(message) else "not-ru"

def send_email_via_smtp(sender, recipient, subject, body):
    msg = MIMEText(body, "plain", "utf-8")
    msg["From"] = sender
    msg["To"] = recipient
    msg["Subject"] = subject

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
        server.login(EMAIL_USER, EMAIL_PASS)
        server.sendmail(sender, recipient, msg.as_string())

def send_autoresponse(name, recipient_email, original_message):
    language = detect_russian_language(original_message)
    subject = "Ваше сообщение принято" if language == "ru" else "Your message has been received."
    body = (
        f"Здравствуйте, {name}!\nВаше сообщение получено. Я свяжусь с вами в ближайшее время.\nСпасибо!\n"
        if language == "ru" 
        else f"Hello, {name}!\nYour message has been received. I will contact you shortly.\nThank you!\n"
    )
    send_email_via_smtp(EMAIL_USER, recipient_email, subject, body)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
