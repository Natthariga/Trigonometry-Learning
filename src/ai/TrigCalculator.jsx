import React, { useState } from "react";
import { create, all } from "mathjs";

const math = create(all);

const trigButtons = [
    "sin(", "cos(", "tan(", "asin(", "acos(", "atan(",
    "π", "e", "^", "√(", "(", ")", ".",
    "7", "8", "9", "4", "5", "6", "1", "2", "3", "0",
    "+", "-", "*", "/"
];

export default function TrigCalculator() {
    const [expression, setExpression] = useState("");
    const [angleMode, setAngleMode] = useState("deg");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    const addToExpression = (val) => {
        setExpression((prev) => prev + val);
        setResult("");
        setError("");
    };

    const clearAll = () => {
        setExpression("");
        setResult("");
        setError("");
    };

    const calculate = () => {
        setError("");
        setResult("");
        if (!expression.trim()) {
            setError("กรุณากรอกนิพจน์ก่อนคำนวณ");
            return;
        }

        try {
            let exprToEval = expression;

            if (angleMode === "deg") {
                exprToEval = exprToEval.replace(
                    /(sin|cos|tan|asin|acos|atan)\(([^)]+)\)/g,
                    (match, func, angle) => {
                        return `${func}((${angle}) * pi / 180)`;
                    }
                );
            }

            const evalResult = math.evaluate(exprToEval);

            // ถ้าเป็นตัวเลข ให้ fix ทศนิยม 2 ตำแหน่ง
            setResult(evalResult.toFixed ? evalResult.toFixed(2) : evalResult.toString());
        } catch (e) {
            setError("นิพจน์ไม่ถูกต้องหรือคำนวณไม่ได้");
        }
    };


    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">
                เครื่องคิดเลขตรีโกณมิติ
            </h1>

            <div className="mb-3">
                <label className="font-semibold mr-2">หน่วยมุม:</label>
                <select
                    value={angleMode}
                    onChange={(e) => setAngleMode(e.target.value)}
                    className="border rounded p-1"
                >
                    <option value="deg">องศา (Degree)</option>
                    <option value="rad">เรเดียน (Radian)</option>
                </select>
            </div>

            <div className="mb-3 border rounded p-2 min-h-[40px] font-mono break-words bg-gray-50">
                {expression || "กรอกนิพจน์ด้านล่าง..."}
            </div>

            <div className="grid grid-cols-6 gap-2 mb-4">
                {trigButtons.map((btn) => (
                    <button
                        key={btn}
                        onClick={() => addToExpression(btn)}
                        className="p-2 bg-blue-100 rounded hover:bg-blue-200"
                    >
                        {btn}
                    </button>
                ))}

                <button
                    onClick={clearAll}
                    className="p-2 bg-red-400 rounded hover:bg-red-500 text-white font-bold col-span-2"
                >
                    ล้างค่า
                </button>
                <button
                    onClick={calculate}
                    className="p-2 bg-blue-600 rounded hover:bg-blue-700 text-white font-bold col-span-2"
                >
                    คำนวณ
                </button>
            </div>

            {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}

            {result && (
                <div className="bg-gray-100 p-4 rounded whitespace-pre-line font-mono">
                    <strong>ผลลัพธ์:</strong> {result}
                </div>
            )}
        </div>
    );
}
