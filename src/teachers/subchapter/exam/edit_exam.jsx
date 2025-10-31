import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { MathJaxContext } from "better-react-mathjax";
import Sidebar from "../../../components/sidebarAdmin";
import Swal from "sweetalert2";
import { getUserId } from "../../../js/auth";
import { getExamDetail, updateExam } from "../../../api/teachers/exam";
import { getFileUrl } from "../../../js/getFileUrl";


// 🔹 MathField Component (inline)
const MathField = ({ value, onChange, placeholder, className }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && value !== undefined) {
      ref.current.value = value; // set ค่าเริ่มต้นหรือเวลาที่ state เปลี่ยน
    }
  }, [value]);

  useEffect(() => {
    if (ref.current) {
      const el = ref.current;
      const handler = (e) => {
        onChange && onChange(e.target.value);
      };
      el.addEventListener("input", handler);
      return () => el.removeEventListener("input", handler);
    }
  }, [onChange]);

  return (
    <math-field
      ref={ref}
      class={className}
      placeholder={placeholder}
    ></math-field>
  );
};

const EditExam = () => {
  const config = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [["$", "$"]],
      displayMath: [["$$", "$$"]],
    },
  };

  const { subchapterID } = useParams();
  const navigate = useNavigate();

  const [previews, setPreviews] = useState([]);
  const [timeLimit, setTimeLimit] = useState(20);
  const [formCount, setFormCount] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลเก่ามาแสดง
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await getExamDetail(subchapterID);
        if (data.status === "success" && data.exam) {
          setTimeLimit(data.exam.time_limit_minutes || 20);

          const labelToNum = { ก: "1", ข: "2", ค: "3", ง: "4" };
          const mapped = data.exam.questions.map((q) => {
            const choiceMap = { 1: "", 2: "", 3: "", 4: "" };
            (q.choices || []).forEach((c) => {
              choiceMap[c.label] = c.text || "";
            });
            return {
              question_id: q.question_id,
              question_text: q.question_text,
              question_picture: null,
              old_picture: q.question_picture,
              choice_1: choiceMap[1],
              choice_2: choiceMap[2],
              choice_3: choiceMap[3],
              choice_4: choiceMap[4],
              answer: labelToNum[q.correct_choice] || "",
            };
          });

          setQuestions(mapped);
          setPreviews(
            mapped.map((q) =>
              q.old_picture ? getFileUrl(q.old_picture) : null
            )
          );
        } else {
          Swal.fire("ผิดพลาด", "ไม่พบข้อมูลข้อสอบ", "error");
          navigate("/teacher/exams");
        }
      } catch (err) {
        Swal.fire("ผิดพลาด", "โหลดข้อมูลไม่สำเร็จ", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [subchapterID, navigate]);
  
  // ฟังก์ชันเพิ่ม/ลบข้อสอบ
  const createEmptyQuestion = () => ({
    question_id: null,
    question_text: "",
    question_picture: null,
    old_picture: null,
    choice_1: "",
    choice_2: "",
    choice_3: "",
    choice_4: "",
    answer: "",
  });

  const handleAddForm = () => {
    const newForms = Array.from({ length: formCount }, () =>
      createEmptyQuestion()
    );
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
    const numToLabel = { "1": "ก", "2": "ข", "3": "ค", "4": "ง" };

    const payload = {
      teacher_id: getUserId(),
      subchapter_id: subchapterID,
      time_limit_minutes: timeLimit,
      questions: questions.map((q) => ({
        question_id: q.question_id,
        question_text: q.question_text,
        old_picture: q.old_picture,
        new_picture:
          q.question_picture instanceof File ? q.question_picture.name : null,
        choices: [
          { label: "1", text: q.choice_1 },
          { label: "2", text: q.choice_2 },
          { label: "3", text: q.choice_3 },
          { label: "4", text: q.choice_4 },
        ],
        correct_choice: numToLabel[q.answer] || "",
      })),
    };

    const files = questions
      .map((q, index) =>
        q.question_picture instanceof File
          ? { key: `question_picture_${index}`, file: q.question_picture }
          : null
      )
      .filter(Boolean);

    Swal.fire({
      title: "ยืนยันการบันทึก?",
      showCancelButton: true,
      confirmButtonText: "บันทึกจริง",
      cancelButtonText: "ยกเลิก",
      width: "60%",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const data = await updateExam(payload, files);
        if (data.status === "success") {
          Swal.fire("สำเร็จ!", "อัปเดตข้อสอบเรียบร้อย", "success");
          navigate("/teacher/exams");
        } else {
          Swal.fire("ผิดพลาด", data.message || "บันทึกไม่สำเร็จ", "error");
        }
      } catch (err) {
        Swal.fire("ผิดพลาด", "เชื่อมต่อไม่สำเร็จ", "error");
      }
    });
  };

  const minutesToHHmm = (min) => {
    const h = Math.floor(min / 60).toString().padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const hhmmToMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  if (loading) return <p className="p-10">กำลังโหลด...</p>;

  return (
    <MathJaxContext config={config}>
      <section className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          {/* <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => setFormCount((prev) => prev + 1)}
              className="shadow rounded px-2 py-1 text-xl text-blue-700 font-bold w-10 h-10"
            >
              +
            </button>

            <div className="shadow rounded w-16 h-10 flex items-center justify-center">
              {formCount}
            </div>

            <button
              onClick={() => formCount > 1 && setFormCount((prev) => prev - 1)}
              className="shadow rounded px-2 py-1 text-xl text-blue-700 font-bold w-10 h-10"
            >
              -
            </button>

            <button
              onClick={handleAddForm}
              className="bg-blue-600 text-white shadow-md px-6 py-2.5 rounded-lg hover:bg-blue-700"
            >
              เพิ่มข้อ
            </button>
          </div> */}

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

              {/* การเพิ่มข้อสอบ */}
              <div>
                <h3 className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                  ➕ การเพิ่มข้อสอบ
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => formCount > 1 && setFormCount((prev) => prev - 1)}
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 rounded-lg shadow-sm font-medium">
                      {formCount}
                    </span>
                    <button
                      onClick={() => setFormCount((prev) => prev + 1)}
                      className="w-10 h-10 rounded-lg border  border-gray-200 flex items-center justify-center text-lg hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddForm}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-green-700"
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>


            {/* Questions */}
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div
                  key={q.question_id || index}
                  className="bg-white shadow-md rounded-xl p-6 relative"
                >
                  {/* Remove Button */}
                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveForm(index)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    >
                      <X size={22} />
                    </button>
                  )}

                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    ข้อที่ {index + 1}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Upload Image */}
                    <div className="md:col-span-1">
                      <p className="text-sm text-gray-600 mb-2">แนบรูปภาพ (ถ้ามี)</p>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center relative ">
                        {previews[index] ? (
                          <div className="w-full h-full relative">
                            <img
                              src={previews[index]}
                              alt="Preview"
                              className="w-full h-full object-contain rounded-xl"
                            />
                            <button
                              onClick={() => {
                                const newPreviews = [...previews];
                                newPreviews[index] = null;
                                setPreviews(newPreviews);
                                handleChange(index, "question_picture", null);

                                // mark state ว่าจะลบ
                                const updated = [...questions];
                                updated[index].question_picture = null;
                                updated[index].old_picture = null; // ✅ ส่งไปใน payload ถ้ากดบันทึก
                                setQuestions(updated);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor={`file-upload-${index}`}
                            className="cursor-pointer flex flex-col items-center text-gray-500"
                          >
                            <Upload className="w-8 h-8 mb-1" />
                            <span className="text-sm">เลือกไฟล์</span>
                            <input
                              id={`file-upload-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleChange(index, "question_picture", e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Right: Question & Choices */}
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
                              <div
                                key={i}
                                className={`flex items-center gap-3 border rounded-lg p-2 transition ${q.answer === val ? "border-green-500" : "border-gray-200"
                                  }`}
                              >
                                {/* Label: ก ข ค ง */}
                                <span
                                  className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-500`}
                                >
                                  {["ก", "ข", "ค", "ง"][i]}
                                </span>

                                {/* Input Field */}
                                <MathField
                                  className="flex-1 px-3 py-2 text-sm"
                                  placeholder={`ตัวเลือก ${i + 1}`}
                                  value={q[field]}
                                  onChange={(val) => handleChange(index, field, val)}
                                />

                                {/* Radio Button: เฉลย */}
                                <label className="flex items-center gap-1 text-sm text-gray-600">
                                  <input
                                    type="radio"
                                    name={`answer-${index}`}
                                    value={val}
                                    checked={q.answer === val}
                                    onChange={(e) => handleChange(index, "answer", e.target.value)}
                                    className="text-blue-600"
                                  />
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

            <div className="mt-4 text-center">
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-blue-700"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      </section>
    </MathJaxContext>
  );
};

export default EditExam;
