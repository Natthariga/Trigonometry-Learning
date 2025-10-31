import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";

export default function SubchapterPopup({ popup, onAnswered, requiredAnswer = true }) {
    const [textAnswer, setTextAnswer] = useState("");
    const [selected, setSelected] = useState("");

    const choices = useMemo(() => {
        if (!popup?.choices) return [];
        if (Array.isArray(popup.choices)) return popup.choices;
        try {
            return JSON.parse(popup.choices);
        } catch {
            return popup.choices.split(",").map(s => s.trim());
        }
    }, [popup?.choices]);

    if (!popup) return null;

    const submitAnswer = () => {
        let answer = "";

        if (popup.popup_type === "text") {
            if (requiredAnswer && !textAnswer.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "ยังไม่ได้ตอบ",
                    text: "กรุณากรอกคำตอบก่อนส่ง",
                    confirmButtonText: "ตกลง"
                });
                return;
            }
            answer = textAnswer.trim();
        } else {
            if (requiredAnswer && !selected) {
                Swal.fire({
                    icon: "warning",
                    title: "ยังไม่ได้เลือก",
                    text: "กรุณาเลือกคำตอบก่อนส่ง",
                    confirmButtonText: "ตกลง"
                });
                return;
            }
            answer = selected;
        }

        // ตรวจคำตอบ
        const isCorrect = popup.correct_answer 
            ? answer === popup.correct_answer 
            : null;

        if (isCorrect === true) {
            Swal.fire({
                icon: "success",
                title: "ถูกต้อง!",
                text: "เยี่ยมมาก 🎉",
                confirmButtonText: "ดำเนินการต่อ"
            }).then(() => {
                onAnswered && onAnswered(popup.popup_id, answer, true);
            });
        } else if (isCorrect === false) {
            Swal.fire({
                icon: "error",
                title: "ยังไม่ถูก",
                text: `คำตอบที่ถูกต้องคือ: ${popup.correct_answer}`,
                confirmButtonText: "เข้าใจแล้ว"
            }).then(() => {
                onAnswered && onAnswered(popup.popup_id, answer, false);
            });
        } else {
            // สำหรับ text หรือไม่มีการตรวจคำตอบ
            onAnswered && onAnswered(popup.popup_id, answer, null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white space-y-6 rounded-xl shadow-2xl w-[min(96%,700px)] max-h-[90vh] overflow-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-3xl font-semibold mb-2 text-center">คำถามระหว่างเรียน</h3>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap text-center text-2xl">
                    {popup.popup_content}
                </p>

                {popup.popup_type === "text" && (
                    <textarea
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        className="w-full border rounded p-2 min-h-[110px]"
                        placeholder="ข้อความ..."
                    />
                )}

                {(popup.popup_type === "true_false" || popup.popup_type === "multiple_choice") && (
                    <div className="mb-4 grid gap-2">
                        {choices.length > 0 ? (
                            choices.map((c, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelected(c)}
                                    className={`text-left px-4 py-2 rounded border transition ${
                                        selected === c
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">ไม่มีตัวเลือก</p>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={submitAnswer}
                    >
                        ส่ง
                    </button>
                </div>
            </div>
        </div>
    );
}
