import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from '../components/navBar';
import Footer from '../components/footer';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const TrigQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const [resultMessage, setResultMessage] = useState(null);
    const [showNextButton, setShowNextButton] = useState(false);

    const loadQuestions = () => {
        setLoading(true);
        fetch("https://trigo-flask-ai.onrender.com/generate-questions")
            .then((res) => res.json())
            .then((data) => {
                if (data.questions) {
                    setQuestions(data.questions);
                    setAnswers({});
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "โหลดโจทย์ไม่สำเร็จ",
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาดในการโหลดโจทย์",
                    text: err.message,
                });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadQuestions();
    }, []);

    const handleSubmit = () => {
        if (saving) return;
        if (!answers[questions[0].id]) {
            Swal.fire({
                icon: "warning",
                title: "กรุณากรอกคำตอบก่อนส่ง",
            });
            return;
        }
        setSaving(true);

        fetch("https://trigo-flask-ai.onrender.com/check-answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers }),
        })
            .then((res) => res.json())
            .then((result) => {
                const qid = Object.keys(result.result)[0];
                const resData = result.result[qid];

                setResultMessage({
                    correct: resData.correct,
                    answers: resData.answers,
                    explanation: resData.explanation,
                });
                setShowNextButton(true);
            })
            .catch((err) => {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาดในการตรวจคำตอบ",
                    text: err.message,
                });
            })
            .finally(() => setSaving(false));
    };

    const handleNextQuestion = () => {
        setResultMessage(null);
        setShowNextButton(false);
        setAnswers({});  // เคลียร์คำตอบเก่า
        loadQuestions(); // โหลดคำถามใหม่
    };

    const handleChange = (id, value) => {
        setAnswers((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleExit = () => {
        navigate("/");
    };

    return (
        <section className="flex flex-col min-h-screen">
            <Sidebar />
            <div className="rounded-md flex-1 p-6 pt-32 w-full overflow-y-auto">
                <div className="bg-[url('/images/bg-ai.png')] bg-cover bg-center rounded-tl-md rounded-tr-md p-7 text-white">
                    <h2 className="text-3xl font-bold mb-2">
                        โจทย์เหล่านี้สร้างขึ้นด้วย AI เพื่อฝึกทักษะการคิดวิเคราะห์
                    </h2>
                    <p className="text-xl font-bold text-white">
                        ไม่ใช่แค่เลือกตอบแต่ต้องเข้าใจสถานการณ์จริง!
                    </p>
                </div>

                <div className="text-xl p-7 mb-8">
                    {loading && <p className="text-center">กำลังโหลดโจทย์...</p>}

                    {!loading && questions.length === 1 && (
                        <div className="space-y-8">
                            <p>{questions[0].question}</p>
                            <div className="space-y-2">
                                <label htmlFor="answer-input" className="font-medium">
                                    กรอกคำตอบที่นี่ <span className="text-red-600">*</span>
                                </label>
                                <input
                                    id="answer-input"
                                    type="text"
                                    required
                                    value={answers[questions[0].id] || ""}
                                    onChange={(e) => handleChange(questions[0].id, e.target.value)}
                                    className="w-full p-4 bg-gray-50 text-md border border-gray-300 rounded"
                                />
                            </div>

                            {/* แสดงผลลัพธ์คำตอบจากการตรวจ */}
                            {resultMessage && (
                                <div className="">
                                    <div className={`p-4 rounded ${resultMessage.correct
                                        ? "bg-green-200 text-green-800"
                                        : "bg-red-200 text-red-800"
                                        }`}>
                                        <p className="font-">
                                            {resultMessage.correct
                                                ? "คำตอบถูกต้อง 🎉"
                                                : "คำตอบผิด ❌"}
                                        </p>
                                    </div>
                                    <div className="pt-4 space-y-3">
                                        {/* แสดงคำตอบ */}
                                        <p className="font-bold text-lg text-blue-600">
                                            {resultMessage.correct
                                                ? "✅ คำตอบของคุณถูกต้อง"
                                                : (
                                                    <>
                                                        <span className="font-bold text-gray-700">คำตอบที่ถูกต้องคือ:</span>{" "}
                                                        {/* <span className="text-red-600 font-semibold">{resultMessage.answers.replace("คำตอบที่ถูกต้องคือ ", "")}</span> */}
                                                        <span className="text-red-600 font-semibold">
                                                            {resultMessage.answers?.replace("คำตอบที่ถูกต้องคือ ", "") || ""}
                                                        </span>

                                                    </>
                                                )
                                            }
                                        </p>

                                        {/* แสดงคำอธิบาย */}
                                        <div className="bg-gray-100 p-3 rounded-lg border-l-4 border-blue-500 max-h-52 overflow-y-auto">
                                            <p className="font-bold text-gray-800 mb-1">📌 คำอธิบาย</p>
                                            <p
                                                className="text-gray-700 break-words whitespace-normal"
                                                style={{
                                                    whiteSpace: "normal",
                                                    wordWrap: "break-word",
                                                    overflowWrap: "break-word",
                                                }}
                                            >
                                                <InlineMath math={resultMessage.explanation}></InlineMath>
                                            </p>
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleExit}
                        className="bg-white text-blue-800 md:text-xl font-medium border border-blue-800 p-2 px-4 rounded-md"
                    >
                        ออกจากแบบทดสอบ
                    </button>

                    {/* ปุ่มบันทึกคำตอบ */}
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !answers[questions[0]?.id] || showNextButton}
                        className={`md:text-xl font-medium p-2 px-4 rounded-md ${saving || !answers[questions[0]?.id] || showNextButton
                            ? "bg-gray-400 cursor-not-allowed text-gray-700"
                            : "bg-blue-600 text-white"
                            }`}
                    >
                        {saving ? "กำลังบันทึก..." : "บันทึกคำตอบ"}
                    </button>

                    {/* ปุ่มถามใหม่ */}
                    {showNextButton && (
                        <button
                            onClick={handleNextQuestion}
                            className="bg-green-600 text-white md:text-xl font-medium p-2 px-4 rounded-md"
                        >
                            คำถามใหม่
                        </button>
                    )}

                </div>
            </div>
            <Footer />
        </section>
    );
};

export default TrigQuestions;
