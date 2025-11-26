import React, { useEffect, useState, useRef, use } from "react";
import { useParams } from "react-router-dom";
import { getArticleDetail , handleSaveChanges , deleteGameQuestion } from "../../api/teachers/article";
import ScrollTop from "../../components/scroll";
import Footer from "../../components/footer";
import { MoveRight, Trash2 } from "lucide-react";
import RenderContent from './extend/katex';
import Swal from "sweetalert2";

const ArticleEdit = (content, onChange) => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef([]);
    const [editableContents, setEditableContents] = useState([]);
    const questionRefs = useRef({});
    const answerRefs = useRef({});
    const [text, setText] = useState(content.content || '');

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            const data = await getArticleDetail(id);
            if (data && data.article) {
                const sortedContents = (data.article.contentList || []).sort((a, b) => a.position - b.position);
                setArticle({ ...data.article, contentList: sortedContents });
                setEditableContents(sortedContents.map(c => ({
                    ...c,
                    questions: (c.questions || []).map((q) => ({
                        id: q.id,
                        question: q.question || "",
                        answer: q.answer || "",
                        points: q.points ?? 2
                    }))
                })));
            }
            setLoading(false);
        };

        fetchArticle();
    }, [id]);


    useEffect(() => {
        if (!text) {
            setText(content.content || '');
        }
    }, [content.content]);

    const handleInput = (contentId, e) => {
        const value = e.target.value ?? e.target.getValue?.();
        setEditableContents(prev =>
            prev.map(c => (c.id === contentId ? { ...c, content: value } : c))
        );
    };

    const handleGraphChange = (contentId, field, value) => {
        setEditableContents(prev =>
            prev.map(c => c.id === contentId ? { ...c, [field]: value } : c)
        );
    };

    const handleGameQuestionChange = (contentId, qIdx, field, value) => {
        console.log("update game:", contentId, qIdx, field, value);
        setEditableContents(prev =>
            prev.map(c => {
                if (c.id === contentId && c.questions) {
                    const newQuestions = [...c.questions];
                    newQuestions[qIdx] = { ...newQuestions[qIdx], [field]: value };
                    return { ...c, questions: newQuestions };
                }
                return c;
            })
        );

    };

    useEffect(() => {
        const textareas = document.querySelectorAll("textarea");
        textareas.forEach((ta) => {
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        });
    }, [editableContents]);

    const prepareContentsForSave = () => {
        return editableContents.map(c => {
            const newContent = { ...c };
            if (c.type === "game" && c.questions) {
                newContent.questions = c.questions
                    .map(q => ({
                        id: q.id,
                        question: q.question,
                        answer: q.answer,
                        points: q.points ?? 2
                    }));

            }
            delete newContent.ref;
            if (newContent.questions) {
                newContent.questions.forEach(q => delete q.ref);
            }

            return newContent;
        });
    };

    const handleDeleteQuestion = async (contentId, qIdx) => {
        const contentItem = editableContents.find(c => c.id === contentId);
        if (!contentItem || !Array.isArray(contentItem.questions)) return;

        const question = contentItem.questions[qIdx];
        if (!question || !question.id) return;

        const resultConfirm = await Swal.fire({
            text: "ต้องการที่จะลบข้อนี้?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (!resultConfirm.isConfirmed) return;

        const result = await deleteGameQuestion(question.id);

        if (result?.success) {
            Swal.fire('ลบเรียบร้อย!', '', 'success');

            setEditableContents(prev =>
                prev.map(c =>
                    c.id === contentId
                        ? { ...c, questions: c.questions.filter((_, index) => index !== qIdx) }
                        : c
                )
            );
        } else {
            Swal.fire('เกิดข้อผิดพลาด', result?.message || 'ไม่สามารถลบได้', 'error');
        }
    };

    if (loading) return <p className="p-4">กำลังโหลดบทความ...</p>;
    if (!article) return <p className="p-4">ไม่พบบทความ</p>;

    return (
        <section className="flex flex-col min-h-screen w-full">
            <div className="flex-1 rounded-md p-6 pt-32 w-full overflow-y-auto container">
                <ScrollTop />
                <div>
                    <div className="border-t-4 mb-2 pl-2 border-blue-500 bg-gray-100 p-2">
                        <label className="flex items-center justify-center font-semibold text-[22px]">ชื่อบทความ</label>
                        <input type="text" value={article.title} onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))} className="border break-words whitespace-pre-wrap w-full h-12 rounded-sm" />
                    </div>
                </div>

                {editableContents.map((content) => (
                    <div key={content.id} className="py-4 border-b border-gray-200">
                        {content.type === "text" && (
                            <div className="border-l-4 pl-2 border-gray-800 bg-gray-100 p-2">
                                <div className="font-semibold text-blue-600 mb-2">ข้อความอธิบาย: </div>
                                <div className="flex flex-col gap-2 justify-center items-center py-2">
                                    {content.image && <img src={content.image} alt="" className="w-[400px]" />}
                                    <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { setEditableContents(prev => prev.map(c => c.id === content.id ? { ...c, imageFile: file } : c)); } }} />
                                </div>
                                <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} contentEditable="true" value={content.content} onInput={e => handleInput(content.id, e)} multiline={true} className="w-full border p-2 rounded-sm bg-white break-words whitespace-pre-wrap"></math-field>
                                <div className="text-sm py-1 text-red-800">** หากจะพิมพ์องศา ให้พิมคำว่า deg **</div>
                                <div className="border p-2 mt-2">
                                    <div className="text-center font-semibold bg-gray-200 mb-2">เนื้อหาเดิม</div>
                                    <div className="text-sm flex gap-2 items-center"><RenderContent html={content.content} /></div>
                                </div>
                            </div>
                        )}

                        {content.type === "definition" && (
                            <div>
                                <div className="border-l-4 pl-2 border-purple-800 bg-purple-50 p-2">
                                    <h6 className="font-semibold text-blue-800">บทนิยาม</h6>

                                    <div className="flex flex-col justify-center items-center py-2 gap-2">
                                        {content.image && <img src={content.image} alt="" className="w-[400px]" />}
                                        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { setEditableContents(prev => prev.map(c => c.id === content.id ? { ...c, imageFile: file } : c)); } }} />
                                    </div>
                                    <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} contentEditable="true" value={content.content} onInput={e => handleInput(content.id, e)} multiline={true} className="w-full border p-2 rounded-sm bg-white break-words whitespace-pre-wrap"></math-field>
                                    <div className="text-sm py-1 text-red-800">** หากจะพิมพ์องศา ให้พิมคำว่า deg **</div>
                                    <div className="border p-2 mt-2 bg-white">
                                        <div className="text-center font-semibold bg-gray-200 mb-2">เนื้อหาเดิม</div>
                                        <div className="text-sm flex gap-2 items-center"><RenderContent html={content.content} /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {content.type === "warning" && (
                            <div className="border-l-4 pl-2 border-red-800 bg-red-50 p-2">
                                <div>
                                    <h6 className="font-semibold text-red-500">ข้อควรระวัง</h6>
                                    <div className="flex flex-col gap-2 justify-center items-center py-2">
                                        {content.image && <img src={content.image} alt="" className="w-[400px]" />}
                                        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { setEditableContents(prev => prev.map(c => c.id === content.id ? { ...c, imageFile: file } : c)); } }} />
                                    </div>
                                    <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} contentEditable="true" value={content.content} onInput={e => handleInput(content.id, e)} multiline={true} className="w-full border p-2 rounded-sm bg-white break-words whitespace-pre-wrap"></math-field>
                                    <div className="text-sm py-1 text-red-800">** หากจะพิมพ์องศา ให้พิมคำว่า deg **</div>
                                    <div className="border p-2 mt-2 bg-white">
                                        <div className="text-center font-semibold bg-gray-200 mb-2">เนื้อหาเดิม</div>
                                        <div className="text-sm flex gap-2 items-center"><RenderContent html={content.content} /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {content.type === "note" && (
                            <div ref={(el) => (containerRef.current[content.id] = el)} className="border-l-4 border-yellow-600 bg-yellow-50 p-2 ">
                                <h6 className="font-semibold text-blue-800">โน้ต</h6>
                                <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} contentEditable="true" value={content.content} onInput={e => handleInput(content.id, e)} multiline={true} className="w-full border p-2 rounded-sm bg-white break-words whitespace-pre-wrap"></math-field>
                                <div className="text-sm py-1 text-red-800">** หากจะพิมพ์องศา ให้พิมคำว่า deg **</div>
                                <div className="border p-2 mt-2 bg-white">
                                    <div className="text-center font-semibold bg-gray-200 mb-2">เนื้อหาเดิม</div>
                                    <div className="text-sm flex gap-2 items-center"><RenderContent html={content.content} /></div>
                                </div>
                            </div>
                        )}

                        {content.type === "table" && (
                            <div className="overflow-auto border rounded p-2 bg-gray-50" dangerouslySetInnerHTML={{ __html: content.content }} />
                        )}

                        {content.type === "graph" && (
                            <div className="border-t-4 pl-2 border-blue-800 bg-blue-50 p-2">
                                <div>
                                    <div className="font-semibold text-blue-800 mb-2">สมการกราฟ: </div>
                                    <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} contentEditable="true" value={content.graphEquationValue || ""} onInput={e => handleGraphChange(content.id, "graphEquationValue", e.target.value)} multiline={true} className="w-full border p-2 rounded-sm bg-white break-words whitespace-pre-wrap" ></math-field>
                                    <div className="text-sm py-1 text-red-800">** หากจะพิมพ์องศา ให้พิมคำว่า deg **</div>
                                    <div className="border p-2 mt-2 bg-white">
                                        <div className="text-center font-semibold bg-gray-200 mb-2">สมการเดิม</div>
                                        <div className="text-sm flex gap-2 items-center"><RenderContent html={content.graphEquationValue || ""} /></div>
                                    </div>
                                </div>
                                <hr className="border-blue-800" />
                                <div>
                                    <div className="font-semibold text-blue-800 mb-2"> คำอธิบายกราฟ: </div>
                                    <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} contentEditable="true" value={content.graphExplanation || ""} onInput={e => handleGraphChange(content.id, "graphExplanation", e.target.value)} multiline={true} className="w-full border p-2 rounded-sm bg-white break-words whitespace-pre-wrap" ></math-field>
                                    <div className="text-sm py-1 text-red-800">** หากจะพิมพ์องศา ให้พิมคำว่า deg **</div>
                                    <div className="border p-2 mt-2 bg-white">
                                        <div className="text-center font-semibold bg-gray-200 mb-2">คำอธิบายกราฟเดิม</div>
                                        <div className="text-sm flex gap-2 items-center"><RenderContent html={content.graphExplanation || ""} /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {content.questions.map((q, idx) => (
                            <div key={q.id || idx} >
                                <div className="p-3 rounded-lg bg-white shadow hover:shadow-md transition-all duration-200 relative">
                                    <button onClick={() => handleDeleteQuestion(content.id, idx)} className="absolute top-2 right-2 bg-red-600 text-white px-1 py-2 rounded hover:bg-red-700 " title="ลบ"> <Trash2 size={15} /></button>

                                    <div className="text-sm font-semibold mb-1 text-gray-800">คำถามที่ {idx + 1}:</div>
                                    <div className="flex flex-col md:flex-row justify-between gap-3 text-[18px]">

                                        <div className="flex-1 border border-blue-200 px-3 py-2 rounded bg-blue-50">
                                            <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} value={q.question} ref={el => questionRefs.current[q.id ?? idx] = el} onInput={e => handleGameQuestionChange(content.id, idx, "question", e.target.getValue())} />
                                            <div className="text-sm flex items-center gap-2">
                                                <span className="font-semibold">ตัวอย่างการแสดงผล</span> <RenderContent html={q.question} />
                                            </div>
                                        </div>

                                        <div className="hidden md:flex items-center justify-center w-6 text-gray-400"><MoveRight /></div>

                                        <div className="flex-1 border-2 border-dashed border-green-400 px-3 py-2 rounded bg-green-50">
                                            <math-field style={{ minWidth: "100%", background: "transparent", outline: "none" }} value={q.answer} ref={el => answerRefs.current[q.id ?? idx] = el} onInput={e => handleGameQuestionChange(content.id, idx, "answer", e.target.value)} />
                                            <div className="text-sm flex items-center gap-2">
                                                <span className="font-semibold">ตัวอย่างการแสดงผล</span> <RenderContent html={q.answer} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {content.type === "image" && content.image && (
                            <img src={content.image} alt="content" className="max-w-full rounded-md shadow" />
                        )}
                    </div>
                ))}
                <div className="flex justify-end py-4"><button onClick={() => handleSaveChanges(id, article.title, prepareContentsForSave())} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 btn-primary inline-flex font-semibold transition-transform duration-300 hover:-translate-y-1">บันทึกการแก้ไข </button></div>
            </div>
            <Footer />
        </section>
    );
};

export default ArticleEdit;
