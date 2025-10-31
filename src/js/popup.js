// const timeStringToSeconds = (timeStr) => {
//     const [h, m, s] = timeStr.split(':').map(Number);
//     return h * 3600 + m * 60 + s;
// };

// export const handleTimeUpdate = (
//     videoRef,
//     popups,
//     shownPopups,
//     setShownPopups,
//     currentPopup,
//     setCurrentPopup,
//     setIsPopupOpen
// ) => {
//     if (!videoRef.current) return;

//     // ถ้าเป็น video.js player ใช้ currentTime() แทน property
//     const currentTime = Math.floor(
//         typeof videoRef.current.currentTime === "function"
//             ? videoRef.current.currentTime()
//             : videoRef.current.currentTime
//     );

//     popups.forEach((popup) => {
//         const popupTime = timeStringToSeconds(popup.time_video);
//         if (
//             currentTime >= popupTime &&
//             !shownPopups.has(popup.popup_id) &&
//             currentPopup === null
//         ) {
//             setCurrentPopup(popup);
//             setShownPopups((prev) => new Set(prev).add(popup.popup_id));
//             setIsPopupOpen(true);

//             // หยุดวิดีโอทันที
//             if (typeof videoRef.current.pause === "function") {
//                 videoRef.current.pause();
//             } else if (typeof videoRef.current.pause === "function") {
//                 videoRef.current.pause();
//             }
//         }
//     });
// };

// export const handleAnswered = async (
//     popupId,
//     answer,
//     setIsPopupOpen,
//     setCurrentPopup,
//     videoRef,
//     studentId
// ) => {
//     console.log(`Answered popup ${popupId}: ${answer}`);

//     try {
//         const formData = new FormData();
//         formData.append("student_id", studentId);
//         formData.append("popup_id", popupId);
//         formData.append("popup_answer", answer);

//         const res = await fetch(
//             "http://localhost/trigo/students/subchapter/popup/popup_interaction.php",
//             {
//                 method: "POST",
//                 body: formData,
//             }
//         );

//         const data = await res.json();
//         console.log("Answer saved:", data);
//     } catch (err) {
//         console.error("Error saving answer:", err);
//     }

//     // ปิด popup
//     setIsPopupOpen(false);
//     setCurrentPopup(null);

//     // เล่นวิดีโอต่อ
//     if (videoRef.current) {
//         if (typeof videoRef.current.play === "function") {
//             videoRef.current.play();
//         } else if (typeof videoRef.current.play === "function") {
//             videoRef.current.play();
//         }
//     }
// };
