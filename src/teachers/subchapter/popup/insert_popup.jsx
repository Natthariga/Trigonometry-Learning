import React, { useState, useEffect } from "react";
import axios from "axios";
import { HelpCircle } from "lucide-react"; 
import { FaPlus } from "react-icons/fa";
import { getUserId } from '../../../js/auth';
import Swal from "sweetalert2";
import { insertPopup, getPopupsBySubchapter } from "../../../api/teachers/subchapter";
import { getFileUrl } from "../../../js/getFileUrl";

export default function PopupModal({ isOpen, onClose, subchapterId, onSuccess, videoUrl, videoDuration, onChange, initialTime = 0 }) {
    const secondsToHMS = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return { h, m, s };
    };

    const hmsToSeconds = (h, m, s) => h * 3600 + m * 60 + s;

    const createOptions = (max) => {
        const arr = [];
        for (let i = 0; i <= (Number.isFinite(max) ? max : 0); i++) {
            arr.push(
                <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                </option>
            );
        }
        return arr;
    };

    // ---------- Duration & time pickers ----------
    // เก็บความยาววิดีโอที่ได้จาก metadata ของ <video>
    const [durationSec, setDurationSec] = useState(
        Number.isFinite(videoDuration) ? videoDuration : null
    );

    const onHtml5Loaded = (e) => {
        const seconds = Math.floor(e.currentTarget.duration || 0);
        setDurationSec(seconds);
    };

    const maxH = Number.isFinite(durationSec) ? Math.floor(durationSec / 3600) : 0;
    const maxM = 59;
    const maxS = 59;

    const initialHMS = secondsToHMS(initialTime);
    const [hours, setHours] = useState(initialHMS.h);
    const [minutes, setMinutes] = useState(initialHMS.m);
    const [seconds, setSeconds] = useState(initialHMS.s);

    // จำกัดนาที/วินาทีไม่ให้เกินความยาวจริงเมื่อเลือกชั่วโมงท้าย ๆ
    useEffect(() => {
        if (!Number.isFinite(durationSec)) {
            onChange && onChange(hmsToSeconds(hours, minutes, seconds));
            return;
        }

        const maxMinutesForHour =
            hours === maxH ? Math.floor((durationSec % 3600) / 60) : maxM;
        if (minutes > maxMinutesForHour) setMinutes(maxMinutesForHour);

        const maxSecondsForHourMin =
            hours === maxH && minutes === maxMinutesForHour ? durationSec % 60 : maxS;
        if (seconds > maxSecondsForHourMin) setSeconds(maxSecondsForHourMin);

        onChange && onChange(hmsToSeconds(hours, minutes, seconds));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hours, minutes, seconds, durationSec]);

    // ---------- Forms state ----------
    const createEmptyForm = () => ({
        time_video: "00:00:00",
        popup_type: "text",
        popup_content: "",
        choices: ["ใช่", "ไม่ใช่"],
        correct_answer: "",
        is_published: false,
        publish_datetime: "",
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const [forms, setForms] = useState([createEmptyForm()]);

    // helper แปลงเวลาเป็น string
    const formatHMS = (h, m, s) =>
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    // เวลาเปลี่ยน -> update form[index]
    const handleTimeChange = (index, field, value) => {
        setForms(prev => {
            const updated = [...prev];
            const form = { ...updated[index] };
            form[field] = value;

            // สร้าง time_video ใหม่
            form.time_video = formatHMS(form.hours, form.minutes, form.seconds);

            updated[index] = form;
            return updated;
        });
    };


    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [subchapters, setSubchapters] = useState([]);

    // โหลด subchapter
    useEffect(() => {
        const fetchSubchapters = async () => {
            try {
                const json = await getPopupsBySubchapter(subchapterId);
                if (json.status === "success" && json.data) {
                    const subchapterData = Array.isArray(json.data) ? json.data : [json.data];
                    setSubchapters(subchapterData.filter(item => item && Object.keys(item).length > 0));
                } else {
                    setSubchapters([]);
                }
            } catch (err) {
                console.error("โหลด subchapter error:", err);
                setSubchapters([]);
            }
        };
        if (isOpen) fetchSubchapters();
    }, [isOpen, subchapterId]);

    if (!isOpen) return null;

    // ---------- Handlers ----------
    const handleFormChange = (index, field, value) => {
        const newForms = [...forms];
        newForms[index][field] = value;
        setForms(newForms);
    };

    const handleChoiceChange = (formIndex, choiceIndex, value) => {
        const newForms = [...forms];
        newForms[formIndex].choices[choiceIndex] = value;
        setForms(newForms);
    };

    const addChoice = (formIndex) => {
        const newForms = [...forms];
        newForms[formIndex].choices.push("");
        setForms(newForms);
    };

    const removeChoice = (formIndex, choiceIndex) => {
        const newForms = [...forms];
        newForms[formIndex].choices.splice(choiceIndex, 1);
        setForms(newForms);
    };

    const addForm = () => setForms([...forms, createEmptyForm()]);

    const removeForm = (index) => {
        if (forms.length > 1) {
            const newForms = forms.filter((_, i) => i !== index);
            setForms(newForms);
        }
    };

    // บันทึก popup ทั้งหมด
    const handleSubmitAll = async (e) => {
        e.preventDefault();
        const teacherId = getUserId();

        const payloads = forms.map((f) => ({
            teacher_id: teacherId,
            subchapter_id: subchapterId,
            time_video: `${String(f.hours).padStart(2, "0")}:${String(f.minutes).padStart(2, "0")}:${String(f.seconds).padStart(2, "0")}`,
            popup_type: f.popup_type,
            popup_content: f.popup_content,
            correct_answer: f.correct_answer,
            choices: f.popup_type !== "text" ? JSON.stringify(f.choices) : undefined,
        }));

        try {
            setLoading(true);
            const res = await insertPopup(payloads);

            if (res.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "สำเร็จ",
                    text: "เพิ่มคำถามระหว่างบทเรียนสำเร็จ",
                    timer: 2000,
                    showConfirmButton: false,
                });
                onSuccess && onSuccess();
                onClose();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: res.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const setMCAnswer = (idx, choice) => {
        setForms(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], correct_answer: choice };
            return next;
        });
    }

    // ---------- UI ----------
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg max-w-2xl w-full px-6 pb-5 relative overflow-y-auto max-h-[90vh] my-6 mx-4 border border-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button> */}

                <div className="flex justify-between mt-8 mb-6 items-center">
                    <div className="text-2xl font-medium text-blue-600 text-center w-full">
                        เพิ่มคำถามระหว่างบทเรียน
                    </div>
                    <button
                        onClick={addForm}
                        className="flex justify-center items-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition duration-200 transform hover:scale-105"
                    >
                        <FaPlus className="w-3 h-3" />
                    </button>
                </div>

                {/* วิดีโอ */}
                {videoUrl && (
                    <div className="w-full flex justify-center mb-4">
                        <video
                            src={getFileUrl(videoUrl)}
                            onLoadedMetadata={onHtml5Loaded}
                            controls
                            className="w-3/4"
                        />
                    </div>
                )}

                {/* {Number.isFinite(durationSec) && (
          <p className="text-sm text-green-600">
            ความยาววิดีโอ: {formatDuration(durationSec)}
          </p>
        )} */}

                <form onSubmit={handleSubmitAll} className="space-y-6">
                    {forms.map((form, idx) => (
                        <div key={idx} className=" p-4 rounded shadow">
                            <div className="flex justify-between items-center mb-3">
                                <div className="inline-flex gap-1 border px-2 py-1 rounded-2xl border-gray-200">
                                    <HelpCircle className="text-blue-700" />
                                    <span className="text-lg font-semibold text-blue-800">คำถาม {idx + 1}</span>
                                </div>
                                {forms.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-500"
                                        onClick={() => removeForm(idx)}
                                    >
                                        ลบฟอร์ม
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* เวลา */}
                                <div className="space-y-2">
                                    <label className="text-lg font-medium text-gray-700">
                                        เวลาที่ให้คำถามแสดง (HH:MM:SS)
                                    </label>
                                    <div className="text-lg space-x-4">
                                        <label>
                                            <select
                                                value={form.hours}
                                                onChange={(e) => handleTimeChange(idx, "hours", parseInt(e.target.value, 10))}
                                            >
                                                {createOptions(maxH)}
                                            </select>
                                        </label>
                                        <label>
                                            <select
                                                value={form.minutes}
                                                onChange={(e) => handleTimeChange(idx, "minutes", parseInt(e.target.value, 10))}
                                            >
                                                {createOptions(
                                                    Number.isFinite(durationSec) && form.hours === maxH
                                                        ? Math.floor((durationSec % 3600) / 60)
                                                        : maxM
                                                )}
                                            </select>
                                        </label>
                                        <label>
                                            <select
                                                value={form.seconds}
                                                onChange={(e) => handleTimeChange(idx, "seconds", parseInt(e.target.value, 10))}
                                            >
                                                {createOptions(
                                                    Number.isFinite(durationSec) &&
                                                        form.hours === maxH &&
                                                        form.minutes === (
                                                            Number.isFinite(durationSec)
                                                                ? Math.floor((durationSec % 3600) / 60)
                                                                : maxM
                                                        )
                                                        ? durationSec % 60
                                                        : maxS
                                                )}
                                            </select>
                                        </label>
                                    </div>

                                </div>

                                {/* ประเภทป็อบอัพ */}

                                <div>
                                    <label className="text-lg font-medium text-gray-700 mb-2 block">
                                        ประเภทคำถาม
                                    </label>
                                    <div className="flex gap-4">
                                        {[
                                            { label: "ข้อความ", value: "text" },
                                            { label: "ใช่/ไม่ใช่", value: "true_false" },
                                            { label: "แบบเลือกตอบ", value: "multiple_choice" }
                                        ].map(({ label, value }) => (
                                            <label key={value} className="text-md">
                                                <input
                                                    type="radio"
                                                    value={value}
                                                    checked={form.popup_type === value}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // อัปเดตชนิด
                                                        handleFormChange(idx, 'popup_type', val);

                                                        // ตั้งค่า choices ตามชนิด (ไม่แตะ popup_content)
                                                        if (val === "true_false") {
                                                            handleFormChange(idx, 'choices', ["ใช่", "ไม่ใช่"]);
                                                        } else if (val === "text") {
                                                            handleFormChange(idx, 'choices', []);
                                                        } else if (val === "multiple_choice") {
                                                            handleFormChange(idx, 'choices', [""]);
                                                        }
                                                        // ล้างคำตอบที่ถูกต้องเมื่อสลับชนิด
                                                        handleFormChange(idx, 'correct_answer', "");
                                                    }}
                                                />{" "}
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* กล่องคำถาม (ใช้ทุกประเภท) */}
                                <div className="mt-3">
                                    <label className="text-md font-medium text-gray-700">คำถาม</label>
                                    <textarea
                                        value={form.popup_content}
                                        onChange={(e) => handleFormChange(idx, 'popup_content', e.target.value)}
                                        className="border border-gray-200 w-full p-2"
                                        placeholder="กรอกคำถามหรือข้อความที่จะให้แสดง"
                                        required
                                    />
                                </div>

                                {form.popup_type === "true_false" && (
                                    <div className="mt-4">
                                        <label className="text-md font-medium text-gray-700">เลือกคำตอบที่ถูกต้อง</label>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            {["ใช่", "ไม่ใช่"].map((opt) => {
                                                const active = form.correct_answer === opt;
                                                return (
                                                    <label
                                                        key={opt}
                                                        className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition
              ${active ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}
                                                        onClick={() => handleFormChange(idx, "correct_answer", opt)}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`tf-${idx}`}
                                                            className="hidden"
                                                            checked={active}
                                                            onChange={() => handleFormChange(idx, "correct_answer", opt)}
                                                        />
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                                                            {opt === "ใช่" ? "T" : "F"}
                                                        </div>
                                                        <span className="text-base">{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {form.popup_type === "multiple_choice" && (
                                    <>
                                        {/* ตัวเลือกคำตอบ */}
                                        <div className="mt-4">
                                            <div className="flex justify-between mb-2">
                                                <label className="text-md font-medium text-gray-700">ตัวเลือกคำตอบ</label>
                                                <button
                                                    type="button"
                                                    onClick={() => addChoice(idx)}
                                                    className="text-blue-600"
                                                >
                                                    เพิ่มตัวเลือก
                                                </button>
                                            </div>

                                            {form.choices.map((choice, cIdx) => (
                                                <div key={cIdx} className="flex gap-2 mb-1">
                                                    <input
                                                        type="text"
                                                        value={choice}
                                                        onChange={(e) => handleChoiceChange(idx, cIdx, e.target.value)}
                                                        className="border border-gray-200 p-1 flex-grow"
                                                        placeholder={`ตัวเลือกที่ ${cIdx + 1}`}
                                                    />
                                                    {form.choices.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeChoice(idx, cIdx)}
                                                            className="text-red-500"
                                                        >
                                                            ลบ
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {form.popup_type === "multiple_choice" && (
                                            <div className="mt-4">
                                                <label className="text-md font-medium text-gray-700">คำตอบที่ถูกต้อง</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {form.choices.map((choice, cIdx) => {
                                                        const active = form.correct_answer === choice;
                                                        return (
                                                            <button
                                                                key={cIdx}
                                                                type="button"
                                                                className={`px-4 py-2 rounded-full border border-gray-200
              ${active ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                                                                onClick={() => setMCAnswer(idx, choice)}
                                                                disabled={!choice?.trim()}                 // ป้องกันกดตอนยังไม่พิมพ์
                                                                title={!choice?.trim() ? "กรอกตัวเลือกก่อน" : ""}
                                                            >
                                                                {choice || `ตัวเลือกที่ ${cIdx + 1}`}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                            </div>
                        </div>
                    ))}

                    {errorMsg && <p className="text-red-600 font-semibold">{errorMsg}</p>}
                    {successMsg && <p className="text-green-600 font-semibold">{successMsg}</p>}

                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            {loading ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}