import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { MathJaxContext } from "better-react-mathjax";
import Sidebar from "../../../components/sidebarAdmin";
import Swal from "sweetalert2";
import { getUserId } from "../../../js/auth";
import { addExamQuestions } from "../../../api/teachers/exam";

// 🔹 MathField Component เหมือน edit_exam.jsx
const MathField = ({ value, onChange, placeholder, className }) => {
    const ref = React.useRef(null);

    React.useEffect(() => {
        if (ref.current && value !== undefined) {
            ref.current.value = value;
        }
    }, [value]);

    React.useEffect(() => {
        if (ref.current) {
            const el = ref.current;
            const handler = (e) => onChange && onChange(e.target.value);
            el.addEventListener("input", handler);
            return () => el.removeEventListener("input", handler);
        }
    }, [onChange]);

    return <math-field ref={ref} class={className} placeholder={placeholder}></math-field>;
};

const AddExam = () => {
    const { subchapterID } = useParams();
    const navigate = useNavigate();

    const [previews, setPreviews] = useState([]);
    const [timeLimit, setTimeLimit] = useState(20);
    const [formCount, setFormCount] = useState(1);
    const [questions, setQuestions] = useState([
        { question_text: "", question_picture: null, choice_1: "", choice_2: "", choice_3: "", choice_4: "", answer: "" },
    ]);

    const createEmptyQuestion = () => ({
        question_text: "",
        question_picture: null,
        choice_1: "",
        choice_2: "",
        choice_3: "",
        choice_4: "",
        answer: "",
    });

    const handleAddForm = () => {
        const newForms = Array.from({ length: formCount }, () => createEmptyQuestion());
        setQuestions((prev) => [...prev, ...newForms]);
        setPreviews((prev) => [...prev, ...Array(formCount).fill(null)]);
        setFormCount(1);
    };

    const handleRemoveForm = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
            setPreviews(previews.filter((_, i) => i !== index));
        }
    };

    const handleChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);

        if (field === "question_picture" && value) {
            const newPreviews = [...previews];
            newPreviews[index] = URL.createObjectURL(value);
            setPreviews(newPreviews);
        }
    };

    const handleSave = async () => {
        const teacherId = getUserId();
        if (!subchapterID || !teacherId) {
            Swal.fire("เกิดข้อผิดพลาด", "ขาด subchapter_id หรือ teacher_id", "warning");
            return;
        }

        // 🔹 Validation ก่อนส่ง
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question_text || q.question_text.trim() === "") {
                Swal.fire("กรอกไม่ครบ", `ข้อที่ ${i + 1}: กรุณากรอกคำถาม`, "warning");
                return;
            }
            if (!q.choice_1 || !q.choice_2 || !q.choice_3 || !q.choice_4) {
                Swal.fire("กรอกไม่ครบ", `ข้อที่ ${i + 1}: กรุณากรอกตัวเลือกให้ครบ`, "warning");
                return;
            }
            if (!q.answer) {
                Swal.fire("กรอกไม่ครบ", `ข้อที่ ${i + 1}: กรุณาเลือกคำตอบที่ถูกต้อง`, "warning");
                return;
            }
        }

        // 🔹 สร้าง FormData
        const formData = new FormData();
        formData.append("teacher_id", teacherId);
        formData.append("subchapter_id", subchapterID);
        formData.append("time_limit_minutes", timeLimit);

        formData.append("question_text", JSON.stringify(questions.map((q) => q.question_text)));
        formData.append("correct_choice", questions.map((q) => q.answer).join(","));
        formData.append(
            "choices",
            JSON.stringify(
                questions.map((q) => [
                    { label: "1", text: q.choice_1 },
                    { label: "2", text: q.choice_2 },
                    { label: "3", text: q.choice_3 },
                    { label: "4", text: q.choice_4 },
                ])
            )
        );

        questions.forEach((q, index) => {
            formData.append(`question_picture[${index}]`, q.question_picture || "");
        });

        try {
            const result = await addExamQuestions(formData);
            if (result.status === "done") {
                Swal.fire("สำเร็จ!", "เพิ่มข้อสอบเรียบร้อย", "success");
                navigate("/teacher/exams");
            } else {
                Swal.fire("ผิดพลาด", result.message || "ไม่สามารถเพิ่มคำถามได้", "error");
            }
        } catch (err) {
            Swal.fire("ผิดพลาด", "เชื่อมต่อไม่สำเร็จ", "error");
        }
    };

    // const handleSave = async () => {
    //     const teacherId = getUserId();
    //     if (!subchapterID || !teacherId) {
    //         Swal.fire("เกิดข้อผิดพลาด", "ขาด subchapter_id หรือ teacher_id", "warning");
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append("teacher_id", teacherId);
    //     formData.append("subchapter_id", subchapterID);
    //     formData.append("time_limit_minutes", timeLimit);

    //     formData.append("question_text", JSON.stringify(questions.map((q) => q.question_text)));
    //     formData.append("correct_choice", questions.map((q) => q.answer).join(","));
    //     formData.append(
    //         "choices",
    //         JSON.stringify(
    //             questions.map((q) => [
    //                 { label: "1", text: q.choice_1 },
    //                 { label: "2", text: q.choice_2 },
    //                 { label: "3", text: q.choice_3 },
    //                 { label: "4", text: q.choice_4 },
    //             ])
    //         )
    //     );

    //     questions.forEach((q, index) => {
    //         formData.append(`question_picture[${index}]`, q.question_picture || "");
    //     });

    //     try {
    //         const result = await addExamQuestions(formData);
    //         if (result.status === "done") {
    //             Swal.fire("สำเร็จ!", "เพิ่มข้อสอบเรียบร้อย", "success");
    //             navigate("/teacher/exams");
    //         } else {
    //             Swal.fire("ผิดพลาด", result.message || "ไม่สามารถเพิ่มคำถามได้", "error");
    //         }
    //     } catch (err) {
    //         Swal.fire("ผิดพลาด", "เชื่อมต่อไม่สำเร็จ", "error");
    //     }
    // };

    const minutesToHHmm = (min) => {
        const h = Math.floor(min / 60).toString().padStart(2, "0");
        const m = (min % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    };

    const hhmmToMinutes = (hhmm) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };

    return (
        <MathJaxContext>
            <section className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 mt-5 md:mt-0">
                    {/* Settings Bar */}
                    <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-6">
                        {/* เวลาในการทำข้อสอบ */}
                        <div>
                            <h3 className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                                🕒 เวลาในการทำข้อสอบ
                            </h3>
                            <div className="flex items-center gap-3">
                                <label htmlFor="timeLimit" className="text-sm text-gray-600">
                                    กำหนดเวลา (ชั่วโมง/นาที)
                                </label>
                                <input
                                    id="timeLimit"
                                    type="time"
                                    value={minutesToHHmm(timeLimit)}
                                    onChange={(e) => setTimeLimit(hhmmToMinutes(e.target.value))}
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        <div>
                            <h3 className="flex items-center gap-2 text-gray-700 font-semibold mb-3">➕ การเพิ่มข้อสอบ</h3>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => formCount > 1 && setFormCount((p) => p - 1)} className="w-10 h-10 border rounded-lg">-</button>
                                    <span className="px-4 py-2 rounded-lg shadow-sm">{formCount}</span>
                                    <button onClick={() => setFormCount((p) => p + 1)} className="w-10 h-10 border rounded-lg">+</button>
                                </div>
                                <button onClick={handleAddForm} className="bg-green-600 text-white px-6 py-2.5 rounded-lg shadow">เพิ่ม</button>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {questions.map((q, index) => (
                            <div key={index} className="bg-white shadow-md rounded-xl p-6 relative">
                                {questions.length > 1 && (
                                    <button onClick={() => handleRemoveForm(index)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                                        <X size={22} />
                                    </button>
                                )}

                                <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อที่ {index + 1}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Upload */}
                                    <div className="md:col-span-1">
                                        <p className="text-sm text-gray-600 mb-2">แนบรูปภาพ (ถ้ามี)</p>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center relative">
                                            {previews[index] ? (
                                                <div className="w-full h-full relative">
                                                    <img src={previews[index]} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                                    <button
                                                        onClick={() => {
                                                            const newPreviews = [...previews];
                                                            newPreviews[index] = null;
                                                            setPreviews(newPreviews);
                                                            handleChange(index, "question_picture", null);
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <label htmlFor={`file-upload-${index}`} className="cursor-pointer flex flex-col items-center text-gray-500">
                                                    <Upload className="w-8 h-8 mb-1" />
                                                    <span className="text-sm">เลือกไฟล์</span>
                                                    <input
                                                        id={`file-upload-${index}`}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files[0] && handleChange(index, "question_picture", e.target.files[0])}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Question */}
                                    <div className="md:col-span-2">
                                        <p className="font-medium mb-2">คำถาม</p>
                                        <MathField
                                            className="w-full border border-gray-300 rounded-lg p-3 text-base"
                                            placeholder="พิมพ์คำถาม..."
                                            value={q.question_text}
                                            onChange={(val) => handleChange(index, "question_text", val)}
                                        />

                                        <div className="mt-4">
                                            <p className="font-medium mb-2">ตัวเลือก</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {["choice_1", "choice_2", "choice_3", "choice_4"].map((field, i) => {
                                                    const val = (i + 1).toString();
                                                    return (
                                                        <div key={i} className={`flex items-center gap-3 border rounded-lg p-2 ${q.answer === val ? "border-green-500" : "border-gray-200"}`}>
                                                            <span className="w-8 h-8 flex items-center justify-center rounded-full border">{["ก", "ข", "ค", "ง"][i]}</span>
                                                            <MathField
                                                                className="flex-1 px-3 py-2 text-sm"
                                                                placeholder={`ตัวเลือก ${i + 1}`}
                                                                value={q[field]}
                                                                onChange={(val) => handleChange(index, field, val)}
                                                            />
                                                            <label className="flex items-center gap-1 text-sm text-gray-600">
                                                                <input type="radio" name={`answer-${index}`} value={val} checked={q.answer === val} onChange={(e) => handleChange(index, "answer", e.target.value)} />
                                                                <span>เฉลย</span>
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save */}
                    <div className="mt-4 text-center">
                        <button onClick={handleSave} className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-blue-700">
                            บันทึก
                        </button>
                    </div>
                </div>
            </section>
        </MathJaxContext>
    );
};

export default AddExam;
