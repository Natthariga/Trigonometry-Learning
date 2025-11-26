import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/navBar";
import "../../style/lessons.css";
import SubchapterPopup from "./subchapter_popup";
import { handleAnswered } from "../../api/students/popup";
import { getUserId } from "../../js/auth";
import { getFileUrl } from "../../js/getFileUrl";
import Footer from "../../components/footer";
import Swal from "sweetalert2";
import { getPopups, getSubchapterDetail, toggleFavorite, checkFavorite, getProgress, updateProgress } from "../../api/students/subchapter";
import { Book, Sheet } from "lucide-react";
import { FaGamepad, FaQuestionCircle } from "react-icons/fa";

import { getArticleDetail } from "../../api/students/article";
import MatchingGame from "../article/match_game";

const Lessons = (isFavoritedInitial = false) => {
    //------
    const location = useLocation();
    const subchapterId = location.state?.subchapterId;
    const [data, setData] = useState(null);
    const studentId = getUserId();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const navigate = useNavigate();

    // popup state
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popups, setPopups] = useState([]);
    const [currentPopup, setCurrentPopup] = useState(null);
    const [shownPopups, setShownPopups] = useState(new Set());

    // video refs + state
    const videoRef = useRef(null); // reference ของ video
    const [playing, setPlaying] = useState(false); // สถานะการดู
    const [duration, setDuration] = useState(0); // ความยาววิดีโอทั้งหมด(วินาที)
    const [currentTime, setCurrentTime] = useState(0); // เวลาเล่นปัจจุบันของวิดีโอ (วินาที)
    const [maxPlayed, setMaxPlayed] = useState(0); // เวลาสูงสุดที่เล่นไปได้
    const [intervalId, setIntervalId] = useState(null); // clear pause
    const [resumeTime, setResumeTime] = useState(0); // เวลาเริ่มต้นที่เคยดูไปแล้ว
    const [progressData, setProgressData] = useState(null);

    // โหลด progress ตอนเข้า
    useEffect(() => {
        const fetchProgress = async () => {
            if (!studentId || !subchapterId) return;

            const result = await getProgress(studentId, subchapterId);
            if (result?.status === "success" && result.progress) {
                const progress = result.progress;
                const lastTime = progress.max_time || progress.current_time || 0;
                setProgressData(progress);
                if (videoRef.current) {
                    videoRef.current.currentTime = lastTime;
                }
                setResumeTime(lastTime);
                setCurrentTime(lastTime);
                setMaxPlayed(progress.max_time || lastTime);
            }
        };

        fetchProgress();
    }, [studentId, subchapterId]);

    // clear pause
    useEffect(() => {
        return () => {
            if (intervalId) clearInterval(intervalId);
            if (videoRef.current) {
                updateProgress({
                    student_id: studentId,
                    subchapter_id: subchapterId,
                    current_time: Math.floor(videoRef.current.currentTime),
                    watched_to_end: 0,
                    is_completed: 0,
                });
            }
        };
    }, [intervalId]);

    // โหลดข้อมูล subchapter
    useEffect(() => {
        const fetchSubchapter = async () => {
            try {
                const result = await getSubchapterDetail(subchapterId);
                if (result.status === "success" && result.data.length > 0) {
                    setData(result.data[0]);
                }
            } catch (err) {
                console.error("โหลด subchapter error:", err);
            }
        };
        if (subchapterId) fetchSubchapter();
    }, [subchapterId]);

    // โหลด popup
    useEffect(() => {
        const fetchPopups = async () => {
            try {
                const data = await getPopups(subchapterId, studentId);
                if (data.status === "success" && Array.isArray(data.popup)) {
                    setPopups(data.popup);
                    const answered = Array.isArray(data.answered_popup) ? data.answered_popup : [];
                    setShownPopups(new Set(answered.map((x) => Number(x))));
                }
            } catch (err) {
                console.error("โหลด popup error:", err);
            }
        };
        if (subchapterId && studentId) fetchPopups();
    }, [subchapterId, studentId]);

    // กดเล่น
    const handlePlay = () => {
        setPlaying(true);
        // if (intervalId) return;

        // const id = setInterval(() => {
        //     if (videoRef.current) {
        //         const t = Math.floor(videoRef.current.currentTime);
        //         setCurrentTime(t);
        //         setMaxPlayed(prev => Math.max(prev, t));

        //         updateProgress({
        //             student_id: studentId,
        //             subchapter_id: subchapterId,
        //             current_time: t,
        //             max_time: Math.max(maxPlayed, t), // ✅ เก็บมากสุดเสมอ
        //             watched_to_end: 0,
        //             is_completed: 0,
        //         });
        //     }
        // }, 5000);

        // setIntervalId(id);
    };

    // กดหยุด
    const handlePause = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        if (videoRef.current) {
            const t = Math.floor(videoRef.current.currentTime);
            setCurrentTime(t);
            setMaxPlayed(prev => Math.max(prev, t));

            updateProgress({
                student_id: studentId,
                subchapter_id: subchapterId,
                current_time: t,
                max_time: Math.max(maxPlayed, t),
                watched_to_end: 0,
                is_completed: 0,
            });
        }
    };

    // จบวิดีโอ
    const handleEnded = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        if (videoRef.current) {
            const d = videoRef.current.duration;
            setCurrentTime(d);
            setMaxPlayed(d);
            setPlaying(false);
        }

        // ตรวจ popup ว่าตอบครบหรือยัง
        const allAnswered = popups.every(p => shownPopups.has(p.popup_id));

        updateProgress({
            student_id: studentId,
            subchapter_id: subchapterId,
            current_time: Math.floor(videoRef.current.duration),
            max_time: Math.floor(videoRef.current.duration),
            watched_to_end: allAnswered ? 1 : 0,  //เช็คว่าดูจบหรือยัง
            is_completed: 0,
        });

        if (!progressData?.is_completed) {
            handleShowWelcomePopup(subchapterId, data.subchapter_name);
        }
    };

    // เมื่อ posttest เสร็จ
    const markCompleted = () => {
        updateProgress({
            student_id: studentId,
            subchapter_id: subchapterId,
            current_time: Math.floor(videoRef.current.duration),
            max_time: Math.floor(videoRef.current.duration),
            watched_to_end: 1, // ดูจบแล้ว
            is_completed: 1,   // จบบทเรียน
        });
    };

    // ตั้งค่า duration และ resume time
    const handleLoadedMetadata = () => {
        if (videoRef.current && resumeTime > 0) {
            videoRef.current.currentTime = resumeTime;
        }
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    // update เวลา
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            let t = videoRef.current.currentTime;

            // ถ้าใกล้จบแล้ว
            if (duration && duration - t < 0.3) {
                t = duration;
            }

            setCurrentTime(t);
            setMaxPlayed((prev) => Math.max(prev, t));

            // ตรวจสอบ popup
            popups.forEach((popup) => {
                const [h, m, s] = popup.time_video.split(":").map(Number);
                const popupTime = h * 3600 + m * 60 + s;
                if (
                    t >= popupTime &&
                    !shownPopups.has(popup.popup_id) &&
                    currentPopup === null
                ) {
                    setCurrentPopup(popup);
                    setIsPopupOpen(true);
                    setShownPopups((prev) => new Set(prev).add(popup.popup_id));
                    videoRef.current.pause();
                    setPlaying(false);
                }
            });
        }
    };

    // ปุ่ม play
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (playing) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setPlaying(!playing);
    };

    // การ seek control
    const handleSeek = (e) => {
        const seekTo = parseFloat(e.target.value);
        if (videoRef.current) {
            if (seekTo <= maxPlayed) {
                videoRef.current.currentTime = seekTo;
                setCurrentTime(seekTo);
            } else {
                videoRef.current.currentTime = maxPlayed;
                setCurrentTime(maxPlayed);
            }
        }
    };

    // format เวลา
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return [m, s].map(v => String(v).padStart(2, "0")).join(":");
    };

    // popup ท้ายวิดีโอ
    const handleShowWelcomePopup = (subchapterId, subchapterName) => {
        Swal.fire({
            title: "ยินดีต้อนรับ",
            html: `<p>เข้าสู่แบบทดสอบหลังเรียนเรื่อง <b>${subchapterName}</b></p>`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "เริ่มทำแบบทดสอบ",
            cancelButtonText: "ปิด",
        }).then((result) => {
            if (result.isConfirmed) {
                markCompleted();
                navigate("/posttest", { state: { subchapterId } });
            }
        });
    };

    // โหลดสถานะตอน mount
    useEffect(() => {
        const fetchStatus = async () => {
            const data = await checkFavorite(subchapterId);
            if (data.status === "success") {
                console.log("checkFavorite:", data);
                setIsFavorited(data.isFavorited === true);
            }
        };
        fetchStatus();
    }, [subchapterId]);


    // favorite
    const [isFavorited, setIsFavorited] = useState(isFavoritedInitial);

    // กด Favorite
    const handleToggleFavorite = async () => {
        try {
            const data = await toggleFavorite(subchapterId);
            if (data.status === "success") {
                setIsFavorited(data.isFavorited === true); // ใช้ค่าที่ backend ส่งมา
            }
        } catch (err) {
            console.error("toggle favorite error:", err);
        }
    };

    //game
    const [showGame, setShowGame] = useState(false);
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleOpenGame = async (subchapterId) => {
        setLoading(true);
        try {
            const data = await getArticleDetail(subchapterId);
            const gameContent = data.contentList.find((c) => c.type === "game");
            if (!gameContent) {
                Swal.fire({
                    icon: "info",
                    title: "ยังไม่มีเกมในบทเรียนนี้",
                    confirmButtonText: "ตกลง",
                });
                return;
            }
            setGameData(gameContent);
            setShowGame(true);
        } catch (err) {
            Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการโหลดเกม" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex flex-col min-h-screen bg-gray-50">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="flex-1 p-6 pt-32 container mx-auto">
                {data && (
                    <>
                        {/* หัวข้อ */}
                        <div className="flex justify-between items-center mb-6 gap-4">
                            <h1 className="text-xl md:text-3xl font-bold text-indigo-700">
                                {data?.subchapter_name}
                            </h1>
                            <button
                                onClick={handleToggleFavorite}
                                className={`p-3 rounded-xl shadow flex items-center justify-center gap-2 text-lg font-semibold transition ${isFavorited
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {/* แสดงเฉพาะอิโมจิบนมือถือ */}
                                <span className="inline md:hidden">
                                    {isFavorited ? "❤️" : "🤍"}
                                </span>

                                {/* แสดงทั้งอิโมจิ + ข้อความบน Desktop */}
                                <span className="hidden md:inline">
                                    {isFavorited ? "❤️ บทเรียนที่ชอบแล้ว" : "🤍 เพิ่มในบทเรียนที่ชอบ"}
                                </span>
                            </button>

                        </div>

                        {/* เนื้อหา */}
                        <div>
                            {/* Video */}
                            <div className="lg:col-span-7 space-y-4">
                                <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-200">
                                    <video
                                        ref={videoRef}
                                        src={getFileUrl(data.subchapter_link)}
                                        className="w-full aspect-video"
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onTimeUpdate={handleTimeUpdate}
                                        onPlay={handlePlay}
                                        onPause={handlePause}
                                        onEnded={handleEnded}
                                        controls={false}
                                    />

                                    {/* ปุ่ม play */}
                                    {!playing && (
                                        <button
                                            onClick={togglePlay}
                                            className="absolute inset-0 flex items-center justify-center text-white bg-black/40 hover:bg-black/50 transition"
                                        >
                                            ▶
                                        </button>
                                    )}
                                </div>

                                {/* ปรับแต่ง Controls */}
                                <div className="bg-white shadow-md rounded-2xl p-5 space-y-4">
                                    {/* Progress bar */}
                                    <div className="relative w-full">
                                        <input
                                            type="range"
                                            min={0}
                                            max={duration || 0}
                                            step="0.01"
                                            value={Math.min(currentTime, duration)}
                                            onChange={handleSeek}
                                            className="w-full accent-blue-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>


                                    {/* ปุ่ม Control */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={togglePlay}
                                            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:scale-105 transition"
                                        >
                                            {playing ? "⏸ หยุด" : "▶ เล่น"}
                                        </button>
                                        <span className="text-sm font-medium text-gray-600">
                                            {duration > 0
                                                ? `${((Math.min(currentTime, duration) / duration) * 100).toFixed(1)}%`
                                                : "0%"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* เมนู */}
                            <aside className="space-y-4 lg:col-span-5 mt-4">
                                <div className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transform hover:scale-105 transition cursor-pointer hover:bg-gray-100">
                                    <Link to={`/article/${subchapterId}`} target="_blank" rel="noopener noreferrer">
                                        <div className="flex items-center gap-6">
                                            <Book className="w-12 h-14 mb-3 text-green-600" ></Book>
                                            <h2 className="font-semibold text-gray-800 text-lg">สรุปเนื้อหา</h2>
                                        </div>
                                    </Link>
                                </div>

                                <div
                                    onClick={() => {
                                        if (data?.subchapter_file) {
                                            window.open(getFileUrl(data.subchapter_file), "_blank");
                                        }
                                    }}
                                    className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transform hover:scale-105 transition cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-6">
                                        <Sheet className="w-12 h-14 mb-3 text-orange-600" ></Sheet>
                                        <h2 className="font-semibold text-gray-800 text-lg">เอกสารประกอบ</h2>
                                    </div>
                                </div>

                                <div
                                    onClick={() => handleOpenGame(subchapterId)}
                                    className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transform hover:scale-105 transition cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-6">
                                        <FaQuestionCircle className="w-12 h-14 mb-3 text-blue-600" />
                                        <h2 className="font-semibold text-gray-800 text-lg">คำถาม</h2>
                                    </div>
                                </div>

                                {showGame && gameData && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                                        <div className="bg-white rounded-2xl shadow-lg p-6 w-[95%] max-w-3xl relative">
                                            <button
                                                onClick={() => setShowGame(false)}
                                                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
                                            >
                                                ✕
                                            </button>
                                            <MatchingGame
                                                questions={gameData.questions}
                                                content_id={gameData.id}
                                            />
                                        </div>
                                    </div>
                                )}

                                {loading && (
                                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xl">
                                        กำลังโหลดเกม...
                                    </div>
                                )}

                            </aside>

                        </div>

                    </>
                )}

                {/* Popup */}
                {isPopupOpen && currentPopup && (
                    <SubchapterPopup
                        popup={currentPopup}
                        onAnswered={(popupId, answer) =>
                            handleAnswered(
                                popupId,
                                answer,
                                setIsPopupOpen,
                                setCurrentPopup,
                                videoRef,
                                studentId
                            )
                        }
                    />
                )}
            </main>

            <Footer />
        </section>
    );
};

export default Lessons;