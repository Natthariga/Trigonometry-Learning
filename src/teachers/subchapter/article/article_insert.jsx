import React, { useState, useRef, useEffect } from "react";
import { MathfieldElement } from "mathlive";
import 'katex/dist/katex.min.css';
import ScrollTop from "../../../components/scroll";
import RenderContent from '../../../components/katex';
import { ReactSketchCanvas } from "react-sketch-canvas";
import { Plus, ArrowDown, ArrowUp, Gamepad2, Trash, Pen, FileDown, Eraser, XCircle, MoveRight } from "lucide-react";
import { saveAllToServer } from "../../../api/teachers/article";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebarAdmin";
import { useLocation } from "react-router-dom";

let geogebraGraph = null;
const GeoGebraScript = () => {
  if (geogebraGraph) return geogebraGraph;
  geogebraGraph = new Promise((resolve, reject) => {
    if (window.GGBApplet) return resolve();
    const existing = document.querySelector('script[src="https://cdn.geogebra.org/apps/deployggb.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('GeoGebra script failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.geogebra.org/apps/deployggb.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GeoGebra script failed to load'));
    document.body.appendChild(script);
  });
  return geogebraGraph;
};

const GraphContainer = ({ graphId, equation, appletsRef }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (!containerRef.current) return;
      await GeoGebraScript();
      if (!appletsRef.current[graphId]) {
        const applet = new window.GGBApplet({ appName: "graphing", width: 500, height: 300, showToolBar: true, showAlgebraInput: true, showMenuBar: true, }, true);
        applet.inject(containerRef.current);
        appletsRef.current[graphId] = applet;
      }

      const check = setInterval(() => {
        const a = appletsRef.current[graphId];
        if (a && typeof a.evalCommand === "function") {
          clearInterval(check);
          try {
            const cleanEq = convertLatexToGGB(equation);
            a.evalCommand(cleanEq);
          } catch (e) {
            console.warn("⚠️ GeoGebra error:", e);
          }
        }
      }, 200);
    };
    init();
  }, [graphId, equation, appletsRef]);

  return <div ref={containerRef} className="mt-2 w-full h-[300px] border border-gray-200 rounded" />;
};

const DefinitionInsert = () => {
  const location = useLocation();
  const { subchapter_id } = location.state || {};
  const [functionName, setFunctionName] = useState("");
  const [contentList, setContentList] = useState([]);
  const [newType, setNewType] = useState("definition");
  const [newGraphEquation, setNewGraphEquation] = useState("");
  const [newGraphExplanation, setNewGraphExplanation] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const canvasRef = useRef({});
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const graphEquationRef = useRef(null);
  const graphExplanationRef = useRef(null);
  const fileInputRef = useRef(null);
  const appletsRef = useRef({});
  const modalEditorRef = useRef(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  // const [gameList, setGameList] = useState([]);
  const [gameList, setGameList] = useState([
    {
      question: "",
      answer: "",
      questionRef: React.createRef(),
      answerRef: React.createRef()
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);


  const insertMath = (container) => {
    if (!container) return;

    // const mathfield = new MathfieldElement();
    const mathfield = document.createElement("math-field");
    mathfield.virtualKeyboardMode = "onfocus";
    mathfield.style.display = "inline-block";
    mathfield.style.minWidth = "60px";
    mathfield.style.margin = "0 4px";
    mathfield.style.verticalAlign = "middle";

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(mathfield);

    const space = document.createTextNode("\u00A0");
    mathfield.after(space);

    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

  };


  const getCleanHTML = (container) => {
    if (!container) return "";

    container.querySelectorAll("math-field").forEach((mf) => {
      const latex = typeof mf.getValue === "function" ? mf.getValue().trim() : (mf.value || "").trim();
      if (!latex) {
        mf.remove();
        return;
      }
      const textNode = document.createTextNode(`\\(${latex}\\)`);
      mf.replaceWith(textNode);
    });

    const html = container.innerHTML
      .replace(/&nbsp;/g, ' ')
      .replace(/<div>(\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();

    return html;
  };


  const ConvertMathFieldsText = (container) => {
    const regex = /\\\((([\s\S]*?))\\\)/g;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        let lastIndex = 0;
        let match;
        const frag = document.createDocumentFragment();
        let anyMatch = false;

        while ((match = regex.exec(text)) !== null) {
          anyMatch = true;
          const before = text.slice(lastIndex, match.index);
          if (before) frag.appendChild(document.createTextNode(before));
          const latex = match[1];
          const mf = new MathfieldElement();
          mf.virtualKeyboardMode = "onfocus";
          mf.style.display = "inline-block";
          mf.style.minWidth = "60px";
          mf.style.margin = "0 4px";
          mf.style.verticalAlign = "middle";
          if (typeof mf.setValue === "function") mf.setValue(latex);
          else mf.value = latex;
          frag.appendChild(mf);
          frag.appendChild(document.createTextNode(" "));
          lastIndex = regex.lastIndex;
        }
        if (!anyMatch) return;
        const after = text.slice(lastIndex);
        if (after) frag.appendChild(document.createTextNode(after));
        node.replaceWith(frag);
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(ch => walk(ch));
      }
    };
    Array.from(container.childNodes).forEach(c => walk(c));
  };

  const handleAddContent = () => {
    let item = null;
    if (newType === 'graph') {

      let equationValue = "";
      if (graphEquationRef.current) {
        const mf = graphEquationRef.current.querySelector("math-field");
        equationValue = mf ? mf.getValue().trim() : graphEquationRef.current.textContent.trim();
      }

      item = {
        type: 'graph',
        title: newTitle,
        content: "",
        graphEquation: getCleanHTML(graphEquationRef.current),
        graphEquationValue: equationValue,
        graphExplanation: getCleanHTML(graphExplanationRef.current),
        graphId: `ggb-${Date.now()}`,
        image: newImage,
        imageFile: newImageFile
      };
    } else {
      item = {
        type: newType,
        title: newTitle,
        content: getCleanHTML(editorRef.current),
        graphEquation: "",
        graphEquationValue: "",
        graphExplanation: "",
        graphId: null,
        image: newImage,
        imageFile: newImageFile
      };
    }

    if (editIndex !== null) {
      const updated = [...contentList];
      updated[editIndex] = item;
      setContentList(updated);
      setEditIndex(null);
    } else {
      setContentList([...contentList, item]);
    }

    if (editorRef.current) editorRef.current.innerHTML = "";
    if (graphEquationRef.current) graphEquationRef.current.innerHTML = "";
    if (graphExplanationRef.current) graphExplanationRef.current.innerHTML = "";
    setNewGraphEquation("");
    setNewGraphExplanation("");
    setNewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    setNewType("definition");
  };


  const handleEdit = (index) => {
    const item = contentList[index];
    setEditIndex(index);
    setNewType(item.type);
    setNewGraphEquation(item.graphEquationValue || "");
    setNewGraphExplanation(item.graphExplanation || "");
    setNewImage(item.image || null);

    if (item.type === 'graph') {
      if (graphEquationRef.current) {
        const tempEq = document.createElement("div");
        tempEq.innerHTML = item.graphEquation || "";
        ConvertMathFieldsText(tempEq);
        graphEquationRef.current.innerHTML = "";
        while (tempEq.firstChild) graphEquationRef.current.appendChild(tempEq.firstChild);
      }
      if (graphExplanationRef.current) {
        const tempEx = document.createElement("div");
        tempEx.innerHTML = item.graphExplanation || "";
        ConvertMathFieldsText(tempEx);
        graphExplanationRef.current.innerHTML = "";
        while (tempEx.firstChild) graphExplanationRef.current.appendChild(tempEx.firstChild);
      }
    } else {
      if (editorRef.current) {
        const temp = document.createElement("div");
        temp.innerHTML = item.content || "";
        ConvertMathFieldsText(temp);
        editorRef.current.innerHTML = "";
        while (temp.firstChild) editorRef.current.appendChild(temp.firstChild);
      }
    }

    setTimeout(() => {
      if (editorContainerRef.current) {
        editorContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);
  };

  const handleDelete = (index) => {
    const toDelete = contentList[index];
    if (toDelete?.graphId && appletsRef.current[toDelete.graphId]) {
      try { appletsRef.current[toDelete.graphId].remove(); } catch (e) { }
      delete appletsRef.current[toDelete.graphId];
    }
    setContentList(contentList.filter((_, i) => i !== index));
  };

  const moveUp = (index) => { if (index === 0) return; const updated = [...contentList];[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]; setContentList(updated); };
  const moveDown = (index) => { if (index === contentList.length - 1) return; const updated = [...contentList];[updated[index + 1], updated[index]] = [updated[index], updated[index + 1]]; setContentList(updated); };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleClear = (index) => {
    if (canvasRef.current[index]) {
      canvasRef.current[index].clearCanvas();
    }
  };

  const handleEraser = (index) => {
    if (canvasRef.current[index]) {
      canvasRef.current[index].eraseMode(true);
    }
  };

  const handlePen = (index) => {
    if (canvasRef.current[index]) {
      canvasRef.current[index].eraseMode(false);
    }
  };

  const handleSave = async (index) => {
    if (!canvasRef.current[index]) return;

    try {
      const canvasData = await canvasRef.current[index].exportImage("png");
      const combinedCanvas = document.createElement("canvas");
      const ctx = combinedCanvas.getContext("2d");

      const width = 800;
      const noteHeight = 150;
      const paperHeight = 500;
      combinedCanvas.width = width;
      combinedCanvas.height = noteHeight + paperHeight + 20;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
      const rawContent = contentList[index]?.content || "โน้ตว่างเปล่า";
      const noteText = rawContent
        .replace(/<[^>]+>/g, " ")               // ลบ HTML tag
        .replace(/\\\(/g, "")                   // ลบ \( 
        .replace(/\\\)/g, "")                   // ลบ \)
        .replace(/\\sin/g, "sin")               // แปลง \sin
        .replace(/\\cos/g, "cos")               // แปลง \cos
        .replace(/\\tan/g, "tan")               // แปลง \tan
        .replace(/\\frac{([^}]+)}{([^}]+)}/g, "$1/$2") // แปลง \frac{a}{b} เป็น a/b
        .replace(/\\cdot/g, "*")                // แปลง \cdot
        .replace(/\\times/g, "x")               // แปลง \times
        .replace(/\\sqrt{([^}]+)}/g, "√($1)")  // แปลง \sqrt
        .replace(/\s+/g, " ")                   // จัด spacing
        .trim();

      ctx.fillStyle = "#000000";
      ctx.font = "16px sans-serif";
      const wrappedText = wrapText(ctx, noteText, 20, 30, width - 40, 22);
      wrappedText.forEach(({ text, y }) => ctx.fillText(text, 20, y));

      const img = new Image();
      img.src = canvasData;
      img.onload = () => {
        ctx.drawImage(img, 0, noteHeight, width, paperHeight);
        const link = document.createElement("a");
        link.href = combinedCanvas.toDataURL("image/png");
        link.download = `note-${index + 1}.png`;
        link.click();
      };
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push({ text: line, y });
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    lines.push({ text: line, y });
    return lines;
  }

  const getThaiDate = () => {
    const now = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return now.toLocaleDateString("th-TH", options);
  };

  return (
    <section className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 rounded-md p-6 w-full overflow-y-auto container text-[18px]">
        <div className="">
          <div id="topic" className="relative flex justify-between items-center my-10 bg-white border border-gray-100 p-3 rounded">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-blue-500" />

            <div className="pl-4">
              <h1 className="text-[22px] font-semibold text-blue-700">เพิ่มสรุปเนื้อหา</h1>
            </div>
            <span className="text-gray-500 text-sm">{getThaiDate()}</span>
          </div>

          <div className="mb-2">
            <label htmlFor="article-title" className="font-semibold">ชื่อบทความ:</label>
            <input type="text" id="article-title" name="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400 transition duration-200 outline-none" placeholder="กรอกชื่อนิยาม" />
          </div>

          <div className="w-full flex space-x-2 rounded-lg justify-center">
            {['definition', 'warning', 'graph', 'text'].map((type) => (
              <button key={type} onClick={() => setNewType(type)} className={`flex-1 py-2 rounded-lg font-semibold ${newType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{type === 'definition' ? 'นิยาม' : type === 'warning' ? 'ข้อควรระวัง' : type === 'graph' ? 'กราฟ' : 'ข้อความ'}</button>
            ))}
          </div>

          <div ref={editorContainerRef} className="w-full bg-white py-4">
            {newType === 'graph' ? (
              <>
                <label className="font-semibold">สมการกราฟ:</label>
                <div ref={graphEquationRef} className="w-full border border-gray-200  p-2 min-h-[50px]" contentEditable suppressContentEditableWarning />
                <div className="text-sm text-red-500 py-1"> ** ถ้าจะเพิ่มองศา หรือ ° ให้เขียนคำว่า <span className="font-semibold">deg</span>  ในช่องแป้นพิมแทรกสมการ **</div>
                <div className="py-2">
                  <button onClick={() => insertMath(graphEquationRef.current)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 hover:scale-[1.02] transition-all duration-200 shadow-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span className="font-medium">แทรกสมการ</span>
                  </button>
                </div>

                <label className="font-semibold mt-2">คำอธิบายกราฟ:</label>
                <div ref={graphExplanationRef} className="w-full border border-gray-200  p-2 min-h-[150px]" contentEditable suppressContentEditableWarning />

                <div className="py-2">
                  <button onClick={() => insertMath(graphExplanationRef.current)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 hover:scale-[1.02] transition-all duration-200 shadow-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span className="font-medium">แทรกสมการ</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div ref={editorRef} className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400 transition duration-200 outline-none min-h-[150px]" contentEditable suppressContentEditableWarning />
                <div className="py-4">
                  <div className="text-sm text-red-500"> ** ถ้าจะเพิ่มองศา หรือ ° ให้เขียนคำว่า <span className="font-semibold">deg</span>  ในช่องแป้นพิมแทรกสมการ **</div>
                  <button onClick={() => insertMath(editorRef.current)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 hover:scale-[1.02] transition-all duration-200 shadow-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span className="font-medium">แทรกสมการ</span>
                  </button>

                  <div className="py-4">
                    <label className="font-semibold text-sm mb-1 text-gray-700 px-1">อัปโหลดรูปภาพ (ถ้ามี):</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-white file:bg-blue-500 hover:file:bg-blue-600 file:cursor-pointer" />
                    {newImage && (<img src={newImage} alt="Preview" className="mt-2 w-48 h-auto border mx-auto" />)}
                  </div>
                </div>

              </>
            )}

            <button onClick={handleAddContent} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
              {editIndex !== null ? 'บันทึกการแก้ไข' : 'เพิ่มเนื้อหา'}
            </button>

          </div>
        </div>

        {contentList.length > 0 && (
          <div className="w-full space-y-6 py-4">
            {contentList.map((item, index) => (
              <div key={index} className={`relative p-4 rounded-sm ${item.type === "definition" ? "border-l-4 bg-blue-50 border-blue-500" : item.type === "warning" ? "bg-red-50 border-l-4 border-red-500" : item.type === "note" ? "border" : item.type === "graph" ? "border border-gray-300" : item.type === "text" ? "border-l-4 border-gray-400 bg-gray-50" : ""}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-semibold text-[22px] ${item.type === "definition" ? "text-blue-600" : item.type === "warning" ? "text-red-700" : item.type === "note" ? "" : item.type === "graph" ? "text-green-700" : "text-gray-800"}`}>
                    {item.type === "definition" ? "นิยาม" : item.type === "warning" ? "ข้อควรระวัง" : item.type === "note" ? "โน้ต" : item.type === "graph" ? "กราฟ" : item.type === "game" ? "เกมแบบฝึกหัด" : "ข้อความ"}</span>

                  <div className="space-x-2">
                    {item.type !== "game" && (<button onClick={() => handleEdit(index)} title="แก้ไข" className="px-1 py-2 bg-yellow-400 rounded hover:bg-yellow-600"><Pen size={20} className="text-white" /></button>)}

                    <button onClick={() => handleDelete(index)} title="ลบ" className="px-1 py-2 bg-red-500 text-white rounded hover:bg-red-600"><Trash size={20} className="text-white" /></button>

                    <button onClick={() => moveUp(index)} className="px-1 py-2 bg-gray-50 rounded hover:bg-gray-300"><ArrowUp size={20} className="text-gray-700" /></button>
                    <button onClick={() => moveDown(index)} className="px-1 py-2 bg-gray-50 rounded hover:bg-gray-300"><ArrowDown size={20} className="text-gray-700" /></button>
                  </div>
                </div>


                <div className="prose max-w-none">
                  {item.type === "graph" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div>
                        <GraphContainer graphId={item.graphId} equation={item.graphEquationValue} appletsRef={appletsRef} />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2">คำอธิบายกราฟ</h5>
                        <RenderContent html={item.graphExplanation} />
                      </div>
                    </div>
                  ) : item.type === "note" ? (
                    <div>
                      <span className="text-center text-[20px]"><RenderContent html={item.content} /></span>
                      <div className="mt-4">
                        <div className="flex justify-center"><ReactSketchCanvas ref={(el) => (canvasRef.current[index] = el)} width="800px" height="500px" strokeWidth={2} strokeColor="blue" eraserWidth={10} style={{ maxWidth: "100%", height: "500px", border: "1px solid #ccc", borderRadius: "4px", }} /></div>
                        <div className="mt-2 flex gap-4 justify-center text-[15px]">
                          <button onClick={() => handlePen(index)} className="border border-gray-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><Pen size={14} className="text-green-800" />ปากกา</button>
                          <button onClick={() => handleClear(index)} className="border border-gray-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><XCircle size={14} className="text-red-800" />ล้างหน้ากระดาษ</button>
                          <button onClick={() => handleEraser(index)} className="border border-gray-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><Eraser size={14} className="text-blue-800" />ยางลบ</button>
                          <button onClick={() => handleSave(index)} className="border border-gray-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><FileDown size={14} className="text-yellow-800" />บันทึกโน้ต</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <RenderContent html={item.content} />
                  )}
                </div>

                {item.image && (
                  <img src={item.image} alt="Attached" className="mt-3 w-48 h-auto border border-gray-200" />
                )}

                {item.type === "game" && (
                  <div className="border border-gray-200 p-6 mt-4">
                    <div className="font-semibold mb-3 text-blue-700 text-center text-[22px]">เกมแบบฝึกหัด</div>
                    <div className="text-sm mb-4 text-center text-gray-700">ให้นักเรียนจับคู่คำถาม และคำตอบให้ถูกต้อง (ข้อละ 2 คะแนน)</div>

                    <div className="space-y-4">
                      {item.questions.map((q, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white shadow hover:shadow-md transition-all duration-200">
                          <div className="text-sm font-semibold mb-1 text-gray-800">คำถามที่ {idx + 1}:</div>

                          <div className="flex flex-col md:flex-row justify-between gap-3 text-[18px]">
                            <div className="flex-1 border border-blue-200 px-3 py-2 rounded bg-blue-50">
                              <math-field style={{ minWidth: "100%", background: "transparent", outline: "none", }} contentEditable="true" value={q.question} onInput={(e) => { const newQuestions = [...item.questions]; newQuestions[idx].question = e.target.value; item.questions = newQuestions; setContentList([...contentList]); }}></math-field>
                            </div>

                            <div className="hidden md:flex items-center justify-center w-6 text-gray-400"><MoveRight /></div>
                            <div className="flex-1 border-2 border-dashed border-green-400 px-3 py-2 rounded bg-green-50">
                              <math-field style={{ minWidth: "100%", background: "transparent", outline: "none", }} contentEditable="true" value={q.answer} onInput={(e) => { const newQuestions = [...item.questions]; newQuestions[idx].answer = e.target.value; item.questions = newQuestions; setContentList([...contentList]); }}></math-field>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {contentList.length > 0 && (
          <div className="w-full  mt-4 flex justify-end">
            <button
              onClick={() => {
                if (!newTitle) {
                  Swal.fire({
                    icon: 'warning',
                    text: 'กรุณากรอกชื่อบทความก่อนบันทึก',
                    confirmButtonText: 'ตกลง',
                  });
                  return;
                }
                const contentListWithPosition = contentList.map((item, idx) => ({ ...item, position: idx }));
                saveAllToServer(newTitle, contentListWithPosition , subchapter_id);
              }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transform transition-transform duration-200 hover:scale-105">บันทึกทั้งหมด</button>
          </div>
        )}

        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
          <ScrollTop />
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-orange-700 flex items-center justify-center text-2xl relative group"><Pen />
            <span className="absolute right-full mr-3 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">เพิ่มโน้ต</span>
          </button>

          <button onClick={() => setIsGameModalOpen(true)} className="bg-green-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center text-2xl relative group"><Gamepad2 />
            <span className="absolute right-full mr-3 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">เพิ่มเกม</span>
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
              <h2 className="text-[20px] font-semibold mb-3 text-center text-blue-700">เพิ่มโน้ต</h2>
              <div ref={modalEditorRef} contentEditable suppressContentEditableWarning className="w-full border border-gray-200 rounded-lg p-2 min-h-[100px] focus:outline-none mb-4" style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }} onInput={(e) => setNoteContent(e.currentTarget.innerHTML)} />

              <button onClick={() => insertMath(modalEditorRef.current)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 hover:scale-[1.02] transition-all duration-200 shadow-sm mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
                  <Plus className="w-4 h-4" />
                </span>
                <span className="font-medium">แทรกสมการ</span>
              </button>

              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded hover:bg-gray-100">ยกเลิก</button>
                <button onClick={() => {
                  const cleanNote = getCleanHTML(modalEditorRef.current); const newItem = { type: "note", content: cleanNote };
                  setContentList((prev) => [...prev, newItem]);
                  setIsModalOpen(false); setNoteContent(""); if (modalEditorRef.current) modalEditorRef.current.innerHTML = "";
                }} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">บันทึก</button>
              </div>
            </div>
          </div>
        )}

        {isGameModalOpen && (
          <div className="fixed inset-0 bg-opacity-50 z-50 overflow-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[90vh] overflow-auto">
                <div className="text-[20px] font-semibold  text-center text-blue-800">เพิ่มเกม (คำถามและคำตอบ)</div>
                <div className="text-center text-sm">เพิ่มคำถามคำตอบ จะแสดงในรูปบบจับคู่ คำถาม-คำตอบ</div>

                {gameList.map((q, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3">
                    <label className="text-sm text-blue-500">คำถามข้อที่ {i + 1}</label>
                    <div className="text-sm text-red-500"> ** ถ้าจะเพิ่มองศา หรือ ° ให้เขียนคำว่า <span className="font-semibold">deg</span>  ในช่องแป้นพิมแทรกสมการ **</div>
                    <div ref={q.questionRef} contentEditable className="border border-gray-200 p-2 rounded min-h-[40px] mt-1" onInput={(e) => { const newList = [...gameList]; newList[i].question = e.currentTarget.innerHTML; setGameList(newList); }}></div>

                    <button onClick={() => insertMath(q.questionRef.current)} className="mt-1 mb-2 px-3 py-1 rounded border border-green-500 text-green-600 hover:bg-green-50">แทรกสมการ</button>

                    <label className="mt-2 block">คำตอบ:</label>
                    <div ref={q.answerRef} contentEditable className="border border-gray-200 p-2 rounded min-h-[40px] mt-1" onInput={(e) => { const newList = [...gameList]; newList[i].answer = e.currentTarget.innerHTML; setGameList(newList); }}></div>
                    <button onClick={() => insertMath(q.answerRef.current)} className="mt-1 px-3 py-1 rounded border border-green-500 text-green-600 hover:bg-green-50">แทรกสมการ</button>
                  </div>
                ))}

                <div className="flex justify-between mt-3">
                  <button onClick={() => setGameList([...gameList, { question: "", answer: "", questionRef: React.createRef(), answerRef: React.createRef() }])} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 transition-all duration-200">
                    <Plus className="w-4 h-4" /><span>เพิ่มคำถาม</span>
                  </button>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => setIsGameModalOpen(false)} className="px-4 py-2 rounded hover:bg-gray-100">ยกเลิก</button>

                  <button onClick={() => {
                    const cleanedGameList = gameList.map((q) => ({
                      question: getCleanHTML(q.questionRef.current),
                      answer: getCleanHTML(q.answerRef.current),
                    }));

                    setContentList((prev) => {
                      const lastGameIndex = prev.findIndex(item => item.type === "game");

                      if (lastGameIndex !== -1) {
                        const updatedList = [...prev];
                        const existingQuestions = updatedList[lastGameIndex].questions.map(q => q.question + q.answer);
                        const newQuestions = cleanedGameList.filter(
                          q => !existingQuestions.includes(q.question + q.answer)
                        );
                        updatedList[lastGameIndex].questions.push(...newQuestions);
                        return updatedList;
                      } else {
                        return [...prev, { type: "game", questions: cleanedGameList }];
                      }
                    }); setGameList([]); setIsGameModalOpen(false);
                  }}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">บันทึกเกม</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DefinitionInsert;
