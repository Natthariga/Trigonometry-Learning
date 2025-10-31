import http from "./http";

// STUDENT
export const getHomeroomTeacher = async (studentId) => {
    const { data } = await http.get(`/chats/student_chat.php`, {
        params: { action: "getHomeroomTeacher", student_id: studentId },
    });
    return data;
};

export const startChat = async (teacherId, studentId) => {
    const formData = new FormData();
    formData.append("teacher_id", teacherId);
    formData.append("student_id", studentId);
    formData.append("action", "startChat");

    const { data } = await http.post(`/chats/student_chat.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" }, // สำคัญ
    });
     return data;
};

export const getStudentMessages = async (chatId) => {
    const { data } = await http.get(`/chats/student_chat.php`, {
        params: { action: "getMessages", chat_id: chatId },
    });
    return data;
};

// TEACHER
export const getChatsByTeacher = async (teacherId) => {
    const { data } = await http.get(`/chats/teacher_chat.php`, {
        params: { action: "getChatsByTeacher", teacher_id: teacherId },
    });
    return data;
};

export const getTeacherMessages = async (chatId) => {
    const { data } = await http.get(`/chats/teacher_chat.php`, {
        params: { action: "getMessages", chat_id: chatId },
    });
    return data;
};

// FILE UPLOAD
export const uploadMessageFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const { data } = await http.post(`/chats/uploadMessageFile.php`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    } catch (err) {
        console.error("❌ Upload error:", err);
        return { status: "error", message: "Upload failed" };
    }
};

// SEND MESSAGE
export const sendMessageAPI = async (payload) => {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => formData.append(key, payload[key]));

    const { data } = await http.post(`/chats/sendMessage.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
};
