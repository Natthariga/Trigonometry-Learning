import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/navBar";
import Footer from "../../components/footer";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { MathJaxContext, MathJax } from "better-react-mathjax";
import { InlineMath } from "react-katex";
import { getUserId } from "../../js/auth";
import { getFileUrl } from "../../js/getFileUrl";
import "katex/dist/katex.min.css";
import { getExamQuestions, submitPretest, submitPosttest } from "../../api/students/exam";

const QuizPage = ({ mode }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [initialTime, setInitialTime] = useState(900);
    const [error, setError] = useState(null);

    const studentId = getUserId();
    const navigate = useNavigate();
    const location = useLocation();
    const subchapterId = location.state?.subchapterId;

    const scrollRef = useRef(null);
    const buttonRefs = useRef([]);
    const [currentQuestion, setCurrentQuestion] = useState(1);

    const labelLetters = ["ก", "ข", "ค", "ง"];
    const config = {
        loader: { load: ["[tex]/html"] },
        tex: {
            packages: ["base", "html"],
            inlineMath: [["$", "$"]],
            displayMath: [["$$", "$$"]],
        }
    };

    // โหลดคำถาม
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await getExamQuestions(subchapterId);

                if (response.status === "success") {
                    let qs = response.questions;

                    // posttest → สลับลำดับข้อสอบ
                    if (mode === "posttest") {
                        qs = [...qs].sort(() => Math.random() - 0.5);
                    }

                    setQuestions(qs);
                    setAnswers(Array(qs.length).fill(null));

                    if (response.time_limit_minutes) {
                        setInitialTime(response.time_limit_minutes * 60);
                        setTimeLeft(response.time_limit_minutes * 60);
                    }
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError("โหลดข้อมูลล้มเหลว");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [subchapterId, mode]);

    // นับเวลา
    useEffect(() => {
        if (initialTime > 0) setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const allAnswered =
        answers.length === questions.length && answers.every((a) => a !== null);

    // ส่งคำตอบ
    const handleConfirm = async () => {
        const result = await Swal.fire({
            title: "ยืนยันการส่งคำตอบ?",
            text: "คุณแน่ใจหรือไม่ว่าต้องการส่งคำตอบ ข้อสอบจะถูกบันทึกทันที",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่ ส่งเลย",
            cancelButtonText: "ยกเลิก",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            const payload = {
                student_id: studentId,
                subchapter_id: subchapterId,
                answers: answers.map((ans, i) => ({
                    question_id: questions[i]?.question_id ?? null,
                    selected_choice_index: ans,
                })),
            };

            const response =
                mode === "pretest"
                    ? await submitPretest(payload)
                    : await submitPosttest(payload);

            if (response.status === "success") {
                const score = response.score ?? 0;
                const fullScore = response.full_score ?? questions.length;
                const examTime = response.create_at ? new Date(response.create_at).toLocaleString("th-TH") : "-";

                if (mode === "pretest") {
                    Swal.fire({
                        title: "ทำแบบทดสอบหลังเรียนเสร็จสิ้น",
                        html: `คะแนนของคุณคือ <b>${score} / ${fullScore} </b><br/>วันที่ทำแบบทดสอบ: <b>${examTime}</b>`,
                        icon: "success",
                        confirmButtonText: "เข้าสู่บทเรียน",
                    }).then(() =>
                        navigate("/lessons", { state: { subchapterId } })
                    );
                } else {
                    Swal.fire({
                        title: "ทำแบบทดสอบหลังเรียนเสร็จสิ้น",
                        html: `คะแนนของคุณคือ <b>${score} / ${fullScore} </b><br/>วันที่ทำแบบทดสอบ: <b>${examTime}</b>`,
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonText: "ดูพัฒนาการ",
                        cancelButtonText: "กลับหน้าหลัก",
                        reverseButtons: true,
                    }).then((r) => {
                        if (r.isConfirmed) navigate(`/evolution/`);
                        else navigate("/subchapter");
                    });
                }
            } else {
                Swal.fire("ผิดพลาด", response.message, "error");
            }
        } catch (err) {
            Swal.fire("เชื่อมต่อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
        }
    };
    if (loading) return <div className="p-6">กำลังโหลด...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    return (
        <MathJaxContext config={config}>
            <section className="flex flex-col min-h-screen">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />
                <div className="p-6 bg-gray-100 flex-1 pt-32 w-full overflow-y-auto">
                    {/* หัวข้อ */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                        <div className="bg-white flex items-center gap-1 flex-1 shadow p-2 overflow-hidden w-full md:auto">
                            <button onClick={() => scrollRef.current.scrollBy({ left: -100, behavior: "smooth" })} className="px-2">
                                <ChevronLeft size={24} />
                            </button>
                            <div ref={scrollRef} className="flex gap-2 overflow-x-auto hide-scrollbar flex-1">
                                {questions.map((_, i) => {
                                    const isCurrent = currentQuestion === i + 1;
                                    const isAnswered = answers[i] !== null;
                                    return (
                                        <button
                                            key={i}
                                            ref={(el) => (buttonRefs.current[i] = el)}
                                            className="min-w-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border"
                                            style={{
                                                backgroundColor: isCurrent ? "#1f6feb" : isAnswered ? "#b3d8ff" : "#fff",
                                                color: isCurrent ? "white" : "#2b6cb0",
                                            }}
                                            onClick={() => setCurrentQuestion(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => scrollRef.current.scrollBy({ left: 100, behavior: "smooth" })} className="px-2">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                        <div className="flex flex-col w-full text-center text-white md:w-32 p-2 bg-blue-600 rounded shadow-lg mt-2 md:mt-0 md:ml-4">
                            <span>เหลือเวลา</span>
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* คำถาม */}
                    <div className="bg-white p-8 mt-3 shadow space-y-6">
                        <div className="inline-flex gap-1 border px-2 py-1 rounded border-gray-200">
                            <HelpCircle className="text-blue-700" />
                            <span className="text-lg font-semibold text-blue-800">คำถาม {currentQuestion}</span>
                        </div>
                        <div className="text-xl font-medium py-2 overflow-x-auto">
                            <InlineMath math={questions[currentQuestion - 1]?.question_text} />
                        </div>
                        {questions[currentQuestion - 1]?.question_picture && (
                            <img
                                src={getFileUrl(questions[currentQuestion - 1].question_picture)}
                                alt="Question"
                                className="max-w-[50%] max-h-[50%] object-contain mx-auto"
                            />
                        )}

                        {/* ช้อยส์ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {questions[currentQuestion - 1]?.choices?.map((choice, idx) => {
                                const isSel = answers[currentQuestion - 1] === idx;
                                return (
                                    <label
                                        key={idx}
                                        onClick={() => {
                                            const tmp = [...answers];
                                            tmp[currentQuestion - 1] = idx;
                                            setAnswers(tmp);
                                        }}
                                        className={`flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer transition ${isSel ? "bg-blue-100 border-blue-500" : "bg-white hover:bg-blue-50"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${isSel ? "bg-blue-600 text-white" : "bg-blue-200 text-blue-700"}`}>
                                            {labelLetters[idx]}
                                        </div>
                                        <span className={`ml-3 text-lg ${isSel ? "text-blue-700 font-semibold" : "text-gray-800"}`}>
                                            {/* <MathJax>{`$${choice.text}$`}</MathJax> */}
                                            <MathJax key={currentQuestion + "-" + idx}>
                                                {`$${choice.text}$`}
                                            </MathJax>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* ปุ่ม */}
                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <button
                                className="relative flex-1 p-4 border border-[#1f6feb] text-[#1f6feb] rounded hover:bg-gray-100"
                                onClick={() => setCurrentQuestion((p) => Math.max(p - 1, 1))}
                            >
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <ChevronLeft size={20} />
                                </span>
                                <span className="block text-center">ข้อก่อนหน้า</span>
                            </button>

                            {currentQuestion === questions.length && allAnswered ? (
                                <button
                                    className="flex-1 bg-blue-500 text-white rounded hover:bg-blue-600 py-2"
                                    onClick={handleConfirm}
                                >
                                    บันทึก
                                </button>
                            ) : (
                                <button
                                    className="relative flex-1 px-4 py-2 bg-[#1f6feb] text-white rounded hover:bg-blue-600"
                                    onClick={() => setCurrentQuestion((p) => Math.min(p + 1, questions.length))}
                                >
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <ChevronRight size={20} />
                                    </span>
                                    <span className="block text-center">ข้อต่อไป</span>
                                </button>
                            )}
                        </div>

                    </div>
                </div>
                <Footer />
            </section>
        </MathJaxContext>
    );
};

export default QuizPage;