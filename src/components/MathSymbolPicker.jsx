import React from 'react';

const MathSymbolPicker = ({ onSymbolSelect }) => {
    const symbols = [
        // Basic Math Operators
        { symbol: '+', display: '+', desc: 'บวก', category: 'operators' },
        { symbol: '-', display: '-', desc: 'ลบ', category: 'operators' },
        { symbol: '\\times', display: '×', desc: 'คูณ', category: 'operators' },
        { symbol: '\\div', display: '÷', desc: 'หาร', category: 'operators' },
        { symbol: '=', display: '=', desc: 'เท่ากับ', category: 'operators' },
        { symbol: '\\ne', display: '≠', desc: 'ไม่เท่ากับ', category: 'operators' },
        { symbol: '\\approx', display: '≈', desc: 'ประมาณ', category: 'operators' },
        { symbol: '\\pm', display: '±', desc: 'บวกลบ', category: 'operators' },
        { symbol: '\\pi', display: 'π', desc: 'พาย', category: 'operators' },

        // Fractions and Powers
        { symbol: '\\frac{a}{b}', display: 'a⁄b', desc: 'เศษส่วน', category: 'fractions' },
        { symbol: 'x^2', display: 'x²', desc: 'กำลังสอง', category: 'powers' },
        { symbol: 'x^3', display: 'x³', desc: 'กำลังสาม', category: 'powers' },
        { symbol: 'x^n', display: 'xⁿ', desc: 'กำลัง n', category: 'powers' },
        { symbol: '\\sqrt{x}', display: '√x', desc: 'รากที่สอง', category: 'roots' },
        { symbol: '\\sqrt[n]{x}', display: 'ⁿ√x', desc: 'รากที่ n', category: 'roots' },
        { symbol: '\\sqrt{x}', display: '√( )', desc: 'รูทยาวแบบกรอกเอง', category: 'roots' },
        { symbol: '\\sqrt{\\Box + \\sqrt{\\Box}}', display: '√(… + √…)', desc: 'รูทซ้อนรูท', category: 'roots' },

        // Trigonometry
        { symbol: '\\sin', display: 'sin', desc: 'ไซน์', category: 'trigonometry' },
        { symbol: '\\cos', display: 'cos', desc: 'โคไซน์', category: 'trigonometry' },
        { symbol: '\\tan', display: 'tan', desc: 'แทนเจนต์', category: 'trigonometry' },
        { symbol: '\\csc', display: 'csc', desc: 'โคเซแคนต์', category: 'trigonometry' },
        { symbol: '\\sec', display: 'sec', desc: 'ซีแคนต์', category: 'trigonometry' },
        { symbol: '\\cot', display: 'cot', desc: 'โคแทนเจนต์', category: 'trigonometry' },
        { symbol: '\\theta', display: 'θ', desc: 'ทีต้า', category: 'trigonometry' },
        { symbol: '\\alpha', display: 'α', desc: 'อัลฟา', category: 'trigonometry' },
        { symbol: '\\beta', display: 'β', desc: 'บีต้า', category: 'trigonometry' },
        { symbol: '\\gamma', display: 'γ', desc: 'แกมมา', category: 'trigonometry' },


        { symbol: '<', display: '<', desc: 'น้อยกว่า', category: 'inequalities' },
        { symbol: '>', display: '>', desc: 'มากกว่า', category: 'inequalities' },
        { symbol: '\\leq', display: '≤', desc: 'น้อยกว่าหรือเท่ากับ', category: 'inequalities' },
        { symbol: '\\geq', display: '≥', desc: 'มากกว่าหรือเท่ากับ', category: 'inequalities' },

        // Sets
        { symbol: '\\mathbb{N}', display: 'ℕ', desc: 'จำนวนธรรมชาติ', category: 'numbers' },
        { symbol: '\\mathbb{Z}', display: 'ℤ', desc: 'จำนวนเต็ม', category: 'numbers' },
        { symbol: '\\mathbb{Q}', display: 'ℚ', desc: 'จำนวนตรรกยะ', category: 'numbers' },
        { symbol: '\\mathbb{R}', display: 'ℝ', desc: 'จำนวนจริง', category: 'numbers' },
        { symbol: '\\mathbb{C}', display: 'ℂ', desc: 'จำนวนเชิงซ้อน', category: 'numbers' },
        { symbol: '\\emptyset', display: '∅', desc: 'เซตว่าง', category: 'numbers' },
        { symbol: '\\subseteq', display: '⊆', desc: 'เซตย่อยหรือเท่ากับ', category: 'numbers' },
        { symbol: '\\supseteq', display: '⊇', desc: 'เซตใหญ่หรือเท่ากับ', category: 'numbers' },
        { symbol: '\\cup', display: '∪', desc: 'ยูเนียนเซต', category: 'numbers' },
        { symbol: '\\cap', display: '∩', desc: 'อินเตอร์เซกชันเซต', category: 'numbers' },
        { symbol: '\\infty', display: '∞', desc: 'อินฟินิตี้', category: 'numbers' },
        { symbol: '\\forall', display: '∀', desc: 'สำหรับทุก ๆ', category: 'numbers' },
        { symbol: '\\exists', display: '∃', desc: 'มีอย่างน้อยหนึ่ง', category: 'numbers' },
        { symbol: '\\notin', display: '∉', desc: 'ไม่เป็นสมาชิกเซต', category: 'numbers' },

        { symbol: '\\land', display: '∧', desc: 'และ (AND)', category: 'logic' },
        { symbol: '\\lor', display: '∨', desc: 'หรือ (OR)', category: 'logic' },
        { symbol: '\\neg', display: '¬', desc: 'ไม่ (NOT)', category: 'logic' },
        { symbol: '\\implies', display: '⇒', desc: 'ถ้า...แล้ว... (implies)', category: 'logic' },
        { symbol: '\\iff', display: '⇔', desc: 'ถ้าและเฉพาะเมื่อ (if and only if)', category: 'logic' },
        { symbol: '\\forall', display: '∀', desc: 'สำหรับทุก (for all)', category: 'logic' },
        { symbol: '\\exists', display: '∃', desc: 'มีอย่างน้อยหนึ่ง (there exists)', category: 'logic' },
        { symbol: '\\bot', display: '⊥', desc: 'ขัดแย้ง (contradiction)', category: 'logic' },
        { symbol: '\\top', display: '⊤', desc: 'จริงเสมอ (tautology)', category: 'logic' }
    ];

    const categories = [
        { id: 'operators', name: 'ตัวดำเนินการพื้นฐาน' },
        { id: 'fractions', name: 'เศษส่วนและกำลัง' },
        { id: 'powers', name: 'เลขยกกำลัง' },
        { id: 'roots', name: 'รากที่' },
        { id: 'trigonometry', name: 'ตรีโกณมิติ' },
        { id: 'inequalities', name: 'อสมการ' },
        { id: 'numbers', name: 'จำนวนจริงและเซตของจำนวนจริง' },
        { id: 'logic', name: 'ตรรกศาสตร์ (Logic)' }
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            {categories.map(category => (
                <div key={category.id} className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{category.name}</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {symbols
                            .filter(s => s.category === category.id)
                            .map((symbol, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSymbolSelect(symbol.symbol)}
                                    className="p-2 text-center border rounded hover:bg-gray-100 hover:border-gray-200 transition-colors flex flex-col items-center"
                                >
                                    <span className="text-lg mb-1">{symbol.display}</span>
                                    <span className="text-sm text-gray-600">{symbol.desc}</span>
                                </button>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MathSymbolPicker;
