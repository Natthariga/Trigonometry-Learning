import os
import traceback
import json
import re
from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app, origins="*", supports_credentials=True)
# CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# เก็บคำถามและคำตอบที่ generate ล่าสุด (แบบง่ายใน memory)
latest_question_data = {}
latest_question_explanation = {}

@app.route('/generate-questions', methods=['GET'])
def generate_questions():
    global latest_question_data, latest_question_explanation
    try:
        prompt = """
        สร้างโจทย์คณิตศาสตร์หัวข้อ 'ตรีโกณมิติ' ที่เกี่ยวข้องกับสถานการณ์ในชีวิตจริงจำนวน 1 ข้อ  
        พร้อมคำตอบที่ถูกต้องและเฉลยพร้อมเหตุผลอย่างละเอียดในรูปแบบ JSON เช่น
    {
        "questions": [
            {
            "id": 1,
            "question": "โจทย์ที่ 1 ...",
            "correct_answer": "คำตอบที่ถูกต้อง",
            "explanation": "อธิบาย..."
            }
        ]
    }
    """

        model = genai.GenerativeModel("models/gemini-2.0-flash-lite-001")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        print("Raw response from AI:")
        print(raw_text)

        # ล้าง ```json และ ``` ออกก่อนแปลง
        raw_text_clean = re.sub(r"^```json\s*|\s*```$", "", raw_text, flags=re.MULTILINE)

        try:
            data = json.loads(raw_text_clean)
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', raw_text_clean, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                data = json.loads(json_str)
            else:
                return jsonify({"error": "ไม่พบ JSON ในข้อความตอบกลับจาก AI", "raw_response": raw_text}), 500

        # เก็บคำตอบและคำอธิบายไว้ในตัวแปร global
        if "questions" in data:
            latest_question_data = {}
            latest_question_explanation = {}
            for q in data["questions"]:
                qid = str(q["id"])
                ans = q.get("correct_answer", "").strip()
                exp = q.get("explanation", "").strip()
                latest_question_data[qid] = ans
                latest_question_explanation[qid] = exp

        return jsonify(data)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/check-answers', methods=['POST', 'OPTIONS'])
def check_answers():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        answers = data.get('answers', {})

        result = {}
        for qid, user_ans in answers.items():
            correct = latest_question_data.get(str(qid), None)
            explanation = latest_question_explanation.get(str(qid), "")
            if correct is None:
                result[qid] = {
                    "correct": False,
                    "answers": "",
                    "explanation": "ไม่มีคำตอบสำหรับคำถามนี้"
                }
            elif user_ans.strip() == correct:
                result[qid] = {
                    "correct": True,
                    "answers": correct,
                    "explanation": explanation
                }
            else:
                result[qid] = {
                    "correct": False,
                    "answers": correct,
                    "explanation": explanation
                }

        return jsonify({"result": result})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)
