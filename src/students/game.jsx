import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Circle, Line, Text } from "react-konva";
import Swal from "sweetalert2";
import Sidebar from "../components/navBar";
import Footer from "../components/footer";

const TrigGame = () => {
    const [stageSize, setStageSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [timeLeft, setTimeLeft] = useState(300);
    const [showNextButtons, setShowNextButtons] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);


    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2 - 60;
    const radius = 200;
    const step = 200 / 16;

    useEffect(() => {
        const handleResize = () => {
            setStageSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            Swal.fire({
                icon: "info",
                text: "หมดเวลา!",
                confirmButtonText: "กลับหน้าหลัก",
            }).then(() => {
                window.location.href = "/";
            });
            return;
        }

        const timerId = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timerId);
    }, [timeLeft]);

    const anglesList = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

    const [angles, setAngles] = React.useState(() => {
        const initial = {};
        anglesList.forEach((angle) => {
            if ([0, 90, 180, 270].includes(angle)) {
                initial[angle] = angle.toString();
            } else {
                initial[angle] = "";
            }
        });
        return initial;
    });

    const [inputProps, setInputProps] = React.useState({
        visible: false,
        x: 0,
        y: 0,
        angleKey: null,
    });

    const inputRef = useRef();

    const handleChange = (e) => {
        const value = e.target.value.trim();
        setAngles(prev => ({
            ...prev,
            [inputProps.angleKey]: value,
        }));
    };


    const handleTextClick = (angle, x, y) => {
        if ([0, 90, 180, 270].includes(angle)) return;

        setInputProps({
            visible: true, x, y, angleKey: angle,
        });
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 0);
    };

    const lines = [];
    const texts = [];

    for (let i = 0; i < anglesList.length; i++) {
        const angle = anglesList[i];
        const rad = (angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(rad);
        const y = centerY + radius * Math.sin(rad);

        lines.push(
            <Line key={`line-${angle}`} points={[centerX, centerY, x, y]} stroke="black" strokeWidth={2} />
        );

        const textX = centerX + (radius + 30) * Math.cos(rad);
        const textY = centerY - (radius + 30) * Math.sin(rad);

        const isMainAngle = [0, 90, 180, 270].includes(angle);

        if (isMainAngle) {
            texts.push(
                <Text key={`text-${angle}`} x={textX - 15} y={textY - 10} text={`${angle}°`} fontSize={20} fill="black" />
            );
        } else {
            const isCorrect = angles[angle] === String(angle);
            const fillColor = !submitted
                ? "black"
                : isCorrect
                    ? "blue"
                    : "red";

            texts.push(
                <Text key={`text-${angle}`} x={textX - 10} y={textY - 10} text={angles[angle] === "" ? "___°" : `${angles[angle]}°`} fontSize={18} fill={fillColor}
                    onClick={() => handleTextClick(angle, textX - 10, textY - 10)} style={{ cursor: "pointer" }}
                />
            );

        }
    }

    const checkAnswers = () => {
        setSubmitted(true);
        const anglesToCheck = anglesList.filter(angle => ![0, 90, 180, 270].includes(angle));

        const allFilled = anglesToCheck.every(angle => {
            const val = angles[angle];
            return val !== undefined && val.toString().trim() !== "";
        });

        if (!allFilled) {
            Swal.fire({
                icon: "warning",
                text: "กรุณากรอกคำตอบให้ครบทุกช่องก่อนบันทึก",
                confirmButtonText: "ตกลง",
            });
            return;
        }

        const allCorrect = anglesToCheck.every(angle => {
            const val = angles[angle];
            return val !== undefined && val.toString().trim() === angle.toString();
        });

        if (allCorrect) {
            Swal.fire({
                icon: "success",
                title: "ถูกต้องทั้งหมด!",
                showCancelButton: true,
                confirmButtonText: "ข้อต่อไป",
                cancelButtonText: "กลับหน้าหลัก",
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log("ไปข้อต่อไป");
                } else {
                    window.location.href = "/";
                }
            });
        } else {
            Swal.fire({
                icon: "error",
                text: "คำตอบไม่ถูกต้อง!! กรุณาตรวจสอบคำตอบอีกครั้ง",
                confirmButtonText: "ตกลง",
            });
        }
    };

    return (
        <section className="flex flex-col min-h-screen">
            {/* <Sidebar /> */}

            <div
                // className="pt-32" 
                style={{ position: "relative", width: "100vw", height: "100vh" }}>
                <div className=" text-center pt-4 text-[26px] font-bold">
                    <p className="text-blue-900">ใส่องศาแล้วดูว่า จุดบนวงกลมอยู่ตรงไหน และมีค่า sin/cos เท่าไหร่</p>
                </div>
                <div className="absolute top-8 right-2.5 z-10 bg-blue-600 p-4 text-white rounded flex flex-col items-center justify-center text-center">
                    <div className="font-bold">เวลาที่เหลือ:</div>
                    <div className="text-2xl">
                        {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                        {(timeLeft % 60).toString().padStart(2, "0")}
                    </div>
                </div>
                <Stage width={stageSize.width} height={stageSize.height}>
                    <Layer>
                        <Circle x={centerX} y={centerY} radius={radius} stroke="black" strokeWidth={3} />
                        {lines}
                        {texts}
                        <Line points={[centerX - radius, centerY, centerX + radius, centerY]} stroke="#005ee1" strokeWidth={3} />
                        <Line points={[centerX, centerY - radius, centerX, centerY + radius]} stroke="#005ee1" strokeWidth={3} />
                    </Layer>
                </Stage>

                {inputProps.visible && (
                    <input ref={inputRef} type="text" value={angles[inputProps.angleKey]} onChange={handleChange}
                        style={{ position: "absolute", top: inputProps.y, left: inputProps.x, width: 50, fontSize: 18, textAlign: "center", }}
                        onBlur={() => setInputProps({ ...inputProps, visible: false })}
                    />
                )}
                {showNextButtons && (
                    <div className="mt-4 flex justify-center gap-4">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={() => console.log("ไปข้อต่อไป")}
                        >
                            ข้อต่อไป
                        </button>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={() => window.location.href = "/"}
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                )}
                <button className="absolute  bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 text-lg bg-blue-600 text-white rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:scale-105" onClick={checkAnswers}>
                    บันทึกคำตอบ
                </button>
            </div>
            <Footer />
        </section>
    );
};

export default TrigGame;
