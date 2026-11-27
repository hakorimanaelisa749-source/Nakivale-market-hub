from flask import Flask, request, jsonify
from flask_cors import CORS
import random, smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
# ALLOW Netlify to talk to Render
CORS(app, origins=["https://vela-shop-online.netlify.app"])

# Temp store codes - later use database
codes = {}

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    # 1. Create 6-digit code
    code = str(random.randint(100000, 999999))
    codes[email] = code

    # 2. Send code to email (Gmail)
    try:
        msg = MIMEText(f"Your VELA code is: {code}")
        msg["Subject"] = "VELA Verification Code"
        msg["From"] = "your-email@gmail.com"
        msg["To"] = email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login("your-email@gmail.com", "your-app-password")
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(e)
        return jsonify({"error": "Email failed"}), 500

    return jsonify({"message": "Code sent to email"})

@app.route("/api/verify", methods=["POST"])
def verify():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")
    if codes.get(email) == code:
        return jsonify({"message": "Verified! Welcome to VELA"})
    return jsonify({"error": "Wrong code"}), 400

if __name__ == "__main__":
    app.run()
