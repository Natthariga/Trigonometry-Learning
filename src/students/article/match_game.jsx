import React, { useState, useEffect, Children } from "react";
import RenderContent from '../../components/katex';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Swal from "sweetalert2";
import { saveScore } from "../../api/students/article";
import { getUserId } from "../../js/auth";

const Answer = ({ id, math }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "ANSWER", item: { id }, collect: (monitor) => ({ isDragging: !!monitor.isDragging(), }),
    }));
    return (
        <div ref={drag} className={`p-2  border-2 border-dashed border-green-600 rounded cursor-move inline-flex items-center justify-center mt-2 ml-2 bg-green-50 hover:bg-green-200  ${isDragging ? 'opacity-50' : ''}`}><RenderContent html={math} /></div>
    );
};

const DropZone = ({ questionId, answers, setAnswers, options }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "ANSWER", drop: (item) => setAnswers((prev) => ({ ...prev, [questionId]: item.id })), collect: (monitor) => ({ isOver: !!monitor.isOver() }),
    }));

    const answerId = answers[questionId];
    const answerMath = answerId ? options.find((opt) => opt.id === answerId)?.math : null;

    return (
        <div ref={drop} className={`w-32 h-12 border-2 border-dashed rounded-sm border-gray-400 flex items-center justify-center ${isOver ? "bg-yellow-200" : ""}`}>{answerMath && <RenderContent html={answerMath} />}</div>
    );
};


export default function MatchingGame({ questions = [], content_id }) {
    const [fieldAnswer, setFieldAnswer] = useState([]);
    const [answers, setAnswer] = useState({});

    // random คำตอบครั้งเดียวเมื่อ questions เปลี่ยน
    useEffect(() => {
        if (!questions || questions.length === 0) return;
        const ans = questions.map(q => ({ id: q.id, math: q.answer }));
        setFieldAnswer(shuffleArray(ans));
    }, [questions]);

    const resetGame = () => {
        setAnswer({});
        if (!questions || questions.length === 0) return;
        const ans = questions.map(q => ({ id: q.id, math: q.answer }));
        setFieldAnswer(shuffleArray(ans));
    };

    // ฟังก์ชัน shuffle
    const shuffleArray = (array) => {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const handleCheck = async () => {
        const complete = questions.some(q => !answers[q.id]);
        if (complete) {
            Swal.fire({
                text: `กรุณาเลือกคำตอบให้ครบทุกช่อง!`,
                icon: 'warning',
                confirmButtonText: 'ปิด',
            });
            return;
        }

        const now = new Date();
        const create_at = now.toLocaleString("th-TH", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        let score = 0;
        questions.forEach(q => {
            const selectAnswer = answers[q.id];
            //  console.log(`Question ID: ${q.id}, Selected Answer ID: ${selectAnswer}, Correct Answer ID: ${q.answerId}`);
            if (selectAnswer === q.id) {
                score += q.points;
            }
        });
        Swal.fire({
            html: `นักเรียนได้คะแนน ${score} / ${questions.length * 2} <br/>วันที่ทำแบบทดสอบ: ${create_at}` ,
            icon: 'success',
            confirmButtonText: 'ปิด',
        });

        console.log("Content ID for this game:", content_id);

        if (!content_id) {
            console.error("ไม่พบ content_id ของเกมนี้ (ไม่ได้ส่งมาจาก parent component)");
            return;
        }

        try {
            const result = await saveScore({ content_id, user_id: getUserId(), score });
            console.log('Result from saveScore:', result);
            if (result && result.success) {
                console.log("บันทึกคะแนนเรียบร้อย:", result);
            } else {
                console.log("บันทึกคะแนนล้มเหลว:", result?.message || 'No response from server');
            }
        } catch (error) {
            console.error("Error saving score:", error);
        }
        resetGame();
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <div className="font-semibold text-blue-700 text-center text-[25px]">จับคู่คำถาม</div>
                <div className="text-sm mb-4 text-center text-gray-700">ให้นักเรียนจับคู่คำถาม และคำตอบให้ถูกต้อง (ข้อละ 2 คะแนน)</div>
                <div className="text-sm mb-2">ให้นักเรียนลากคำตอบด้านล่าง ลงในกล่องคำตอบให้ถูกต้อง ( <span className="text-blue-500 font-bold">คำถาม</span>ซ้ายมือ <span className="text-green-600 font-bold">คำตอบ</span>ขวามือ )</div>
                <div>
                    {questions.map((q, inx) => (
                        <div key={q.id} className="flex justify-between mb-2">
                            <div><RenderContent html={q.question} /></div>
                            <DropZone questionId={q.id} answers={answers} setAnswers={setAnswer} options={fieldAnswer}></DropZone>
                        </div>
                    ))}
                    <div className="p-2 border-t-4 border-blue-500 bg-gray-50">
                        <div className="text-center font-semibold text-blue-600 text-[22px]">คำตอบ</div>
                        {fieldAnswer.map((ans) => (
                            <Answer key={ans.id} id={ans.id} math={ans.math} />
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                        <button onClick={resetGame} className=" py-1 p-3 rounded hover:bg-gray-200 font-semibold text-gray-700 border">เริ่มใหม่</button>
                        <button onClick={handleCheck} className="py-1 p-3 font-semibold rounded bg-blue-500 text-white hover:bg-blue-600 transition-tranform duration-200 ease-in-out hover:translate-y-1">เช็คคำตอบ</button>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

