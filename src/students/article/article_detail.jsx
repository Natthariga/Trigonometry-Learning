import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getArticleDetail } from "../../api/students/article";
import ScrollTop from "../../components/scroll";
import Footer from "../../components/footer";
import bgAi from '../../assets/bg-ai.png';
import { ReactSketchCanvas } from "react-sketch-canvas";
import html2canvas from "html2canvas-pro";
import { Pen, FileDown, Eraser, XCircle, MoveRight } from "lucide-react";
import GeoGraph from "../../components/geogebra";
import RenderContent from '../../components/katex';
import Sidebar from "../../components/navBar";
import MatchingGame from "./match_game";
import { getFileUrl } from "../../js/getFileUrl";

const ArticleDetail = () => {
    const { subchapterId } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef([]);
    const containerRef = useRef([]);

    useEffect(() => {
        const fetchArticle = async () => {
            const data = await getArticleDetail(subchapterId); 
            if (data) {
                const sortedContents = (data.contentList || []).sort((a, b) => a.position - b.position);
                setArticle({ ...data, contentList: sortedContents });
            }
            setLoading(false);
        };

        fetchArticle();
    }, [subchapterId]);

    const handleSave = async (id) => {
        try {
            const element = containerRef.current[id];
            const canvas = await html2canvas(element);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `note_${id}.png`;
            link.click();
        } catch (error) {
            console.error("Error saving image", error);
        }
    };

    const handlePen = (id) => canvasRef.current[id].eraseMode(false);
    const handleEraser = (id) => canvasRef.current[id].eraseMode(true);
    const handleClear = (id) => canvasRef.current[id].clearCanvas();

    if (!article) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 p-6">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png"
                    alt="not found"
                    className="w-40 h-40 mb-6 opacity-80"
                />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">ไม่พบบทความ</h2>
                <p className="text-gray-500 mb-6">บทความที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
                <button
                    onClick={() => (window.location.href = "/")}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    กลับหน้าแรก
                </button>
            </div>
        );
    }


    return (
        <section className="flex flex-col min-h-screen w-full">
            <Sidebar />
            <div className="flex-1 pt-24 w-full overflow-y-auto">
                <ScrollTop />
                <div>
                    <div className="bg-cover bg-center p-7 text-white" style={{ backgroundImage: `url(${bgAi})` }}>
                        <h2 className="text-[30px] font-bold mb-2 text-center">{article.title}</h2>
                    </div>
                </div>

                {(article.contentList || []).map((content) => (
                    <div key={content.id} className="py-4 p-10 border-b border-gray-200">
                        {content.type === "text" && (
                            <div className="text-black text-base leading-relaxed flex gap-4 flex-col md:flex-row justify-center items-center p-4">
                                {content.image && (<img src={ getFileUrl(content.image)} alt="text-content" className="w-[400px] flex-1 mt-3 max-w-full" />)}
                                <div className="flex-1">
                                    <RenderContent html={content.content} />
                                </div>
                            </div>
                        )}

                        {content.type === "definition" && (
                            <div className="relative rounded-md border-2 border-transparent p-4 [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,#6b21a8,#3b82f6)_border-box] shadow-sm">
                                <div className="absolute -top-3 left-4 bg-white px-2"><span className="font-semibold text-orange-600 py-1 px-2 rounded bg-red-500 text-white shadow-sm">นิยาม</span></div>
                                <div className="text-black text-base leading-relaxed flex gap-4 flex-col md:flex-row justify-center items-center p-4">
                                    {content.image && (<img src={ getFileUrl(content.image)} alt="definition" className="w-[400px] flex-1 mt-3 max-w-full" />)}
                                    <div className="flex-1">
                                        <RenderContent html={content.content} />
                                    </div>
                                </div>
                            </div>

                        )}

                        {content.type === "warning" && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                <p className="font-semibold text-[22px] text-red-700">ข้อควรระวัง!</p>
                                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                                    {content.image && (<img src={ getFileUrl(content.image)} alt="warning" className="flex-1 w-[400px] flex-1 mt-3 max-w-full" />)}
                                    <div className="flex-1">
                                        <RenderContent html={content.content} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {content.type === "note" && (
                            <div ref={(el) => (containerRef.current[content.id] = el)} className="p-4 border w-full max-w-4xl bg-white items-center mx-auto note-capture">
                                <h6>โจทย์:</h6>
                                <div className="flex-1 text-center">
                                    <RenderContent html={content.content} />
                                </div>

                                <ReactSketchCanvas ref={(el) => (canvasRef.current[content.id] = el)} width="800px" height="500px" strokeWidth={2} strokeColor="blue" eraserWidth={10} style={{ maxWidth: "100%", height: "500px" }} />

                                <div className="mt-2 flex gap-4 justify-center text-[15px]">
                                    <button onClick={() => handlePen(content.id)} className="border px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><Pen size={14} className="text-green-800" />ปากกา</button>
                                    <button onClick={() => handleClear(content.id)} className="border px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><XCircle size={14} className="text-red-800" />ล้างหน้ากระดาษ</button>
                                    <button onClick={() => handleEraser(content.id)} className="border px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><Eraser size={14} className="text-blue-800" />ยางลบ</button>
                                    <button onClick={() => handleSave(content.id)} className="border px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><FileDown size={14} className="text-yellow-800" />บันทึกโน้ต</button>
                                </div>

                            </div>
                        )}

                        {content.type === "table" && (
                            <div className="overflow-auto border rounded p-2 bg-gray-50" dangerouslySetInnerHTML={{ __html: content.content }} />
                        )}

                        {content.type === "graph" && (
                            <div className="border-gray-300 border-t-4 border-t-blue-500 p-4 bg-blue-50">
                                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                                    <GeoGraph equation={content.graphEquationValue} className="flex-1" />
                                    <div className="flex-1">
                                        <RenderContent html={content.graphExplanation} />
                                    </div>
                                </div>
                                {content.image && (<img src={ getFileUrl(content.image)} alt="graph" className="w-[400px] flex-1 mt-3 max-w-full items-center mx-auto" />)}
                            </div>
                        )}

                        {/* {content.type === "game" && content.questions && (
                            <div className="flex flex-col md:flex-row justify-between gap-3 text-[18px]">
                                <div className="flex-1 border px-3 py-2 ">
                                    <MatchingGame questions={content.questions} content_id={content.id} />
                                </div>
                            </div>
                        )} */}

                        {content.type === "image" && content.image && (
                            <img src={getFileUrl(content.image)} alt="content" className="max-w-full rounded-md shadow" />
                        )}
                    </div>
                ))}
            </div>
            <Footer />
        </section>
    );
};

export default ArticleDetail;
