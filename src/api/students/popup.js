import http from "../http";

// format HH:MM:SS เป็น Second
const timeStringToSeconds = (timeStr) => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
};


// โชว์ popup ระหว่างดูวิดีโอ และหยุด
export const handleTimeUpdate = (
    videoRef,
    popups,
    shownPopups,
    setShownPopups,
    currentPopup,
    setCurrentPopup,
    setIsPopupOpen
) => {
    // ตรวจเวลาปัจจุบันของวิดีโอ
    if (!videoRef.current) return;
    const currentTime = Math.floor(
        typeof videoRef.current.currentTime === "function"
            ? videoRef.current.currentTime()
            : videoRef.current.currentTime
    );

    // เช็คเวลา popup 
    popups.forEach((popup) => {
        const popupTime = timeStringToSeconds(popup.time_video);
        if (
            currentTime >= popupTime &&
            !shownPopups.has(popup.popup_id) &&
            currentPopup === null
        ) {
            setCurrentPopup(popup);
            setShownPopups((prev) => new Set(prev).add(popup.popup_id));
            setIsPopupOpen(true);

            // หยุดวิดีโอทันที
            if (typeof videoRef.current.pause === "function") {
                videoRef.current.pause();
            } else if (typeof videoRef.current.pause === "function") {
                videoRef.current.pause();
            }
        }
    });
};

// บันทึกคำตอบ popup interaction
export const handleAnswered = async (
    popupId,
    answer,
    setIsPopupOpen,
    setCurrentPopup,
    videoRef,
    studentId
) => {
    // console.log(`Answered popup ${popupId}: ${answer}`);

    try {
        const formData = new FormData();
        formData.append("student_id", studentId);
        formData.append("popup_id", popupId);
        formData.append("popup_answer", answer);

        const res = await http.post(
            "students/subchapter/popup/popup_interaction.php",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        const data = res.data;
        console.log("Answer saved:", data);
    } catch (err) {
        console.error("Error saving answer:", err);
    }

    // ปิด popup
    setIsPopupOpen(false);
    setCurrentPopup(null);

    // เล่นวิดีโอต่อ
    if (videoRef.current) {
        if (typeof videoRef.current.play === "function") {
            videoRef.current.play();
        } else if (typeof videoRef.current.play === "function") {
            videoRef.current.play();
        }
    }
};
