import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  getChatsByTeacher,
  getTeacherMessages,
  uploadMessageFile,
  sendMessageAPI
} from "../api/chats";
import { getUserId } from "../js/auth";
import Sidebar from "../components/sidebarAdmin";
import { Paperclip } from "lucide-react";
import { getFileUrl } from "../js/getFileUrl";

const SOCKET_URL = "wss://socket-server-839f.onrender.com";
// const SOCKET_URL = "http://localhost:3001"; 

export default function CommunicationCenter() {
  const teacherId = Number(getUserId());
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [chatId, setChatId] = useState(null);

  const [socket, setSocket] = useState(null);

  // useEffect(() => {
  //   const s = io(SOCKET_URL, { transports: ["websocket"] });
  //   s.on("connect", () => console.log("✅ Teacher connected:", s.id));
  //   s.on("connect_error", (err) => console.log("❌ Teacher socket connect error:", err));
  //   setSocket(s);
  //   return () => s.disconnect();
  // }, []);

  useEffect(() => {
    if (!teacherId) return;
    const fetchChats = async () => {
      const res = await getChatsByTeacher(teacherId);
      if (res.status === "success") setStudents(res.chats);
    };
    fetchChats();
  }, [teacherId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      console.log("📩 Teacher received newMessage:", msg);

      if (msg.chat_id === selectedStudent?.chat_id) {
        setChatMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedStudent]);


  const openChat = async (student) => {
    setSelectedStudent(student);

    setChatId(student.chat_id);

    if (socket) {
      console.log("👥 Teacher joining chat room:", student.chat_id);
      socket.emit("joinChat", student.chat_id);
    }
    const res = await getTeacherMessages(student.chat_id);
    if (res.status === "success") setChatMessages(res.messages);
  };

  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(async () => {
      const res = await getTeacherMessages(chatId);
      if (res.status === "success") setChatMessages(res.messages);
    }, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // ส่งข้อความ
  const handleSend = async () => {
    if (!input.trim() && !file) return;
    if (!selectedStudent?.chat_id) return;

    let message_type = "text";
    let message_text = input;
    let file_url = null;

    if (file) {
      const uploadRes = await uploadMessageFile(file);
      if (uploadRes.status === "success") {
        message_type = uploadRes.file_type;
        message_text = "";
        file_url = uploadRes.file_url;
      } else {
        alert("Upload failed: " + uploadRes.message);
        return;
      }
    }

    // 1️⃣ เก็บฐานข้อมูล
    const res = await sendMessageAPI({
      chat_id: selectedStudent.chat_id,
      sender_id: teacherId,
      message_text,
      message_type,
      file_url: file_url || "",
    });

    if (res.status === "success") {
      const newMsg = {
        message_id: res.message_id,
        chat_id: selectedStudent.chat_id,
        sender_id: teacherId,
        message_text,
        message_type,
        file_url,
        create_at: new Date().toISOString(),
        // first_name: getFullName().split(" ")[0],
        // last_name: getFullName().split(" ")[1] || "",
        role: 1,
      };

      // 2️⃣ อัปเดต local state
      setChatMessages((prev) => [...prev, newMsg]);

      // 3️⃣ ส่งผ่าน Socket.IO ให้คนอื่นเห็นเรียลไทม์
      socket.emit("sendMessage", newMsg);
    }

    setInput("");
    setFile(null);
    setPreview(null);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    setFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview({
      file,
      url: previewUrl,
      type: file.type.startsWith("image") ? "image" : "file",
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Sidebar - รายชื่อนักเรียน */}
      <div className="w-1/4 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">รายชื่อนักเรียน</h2>
        {students.map((student) => (
          <div
            key={student.chat_id}
            className={`p-2 cursor-pointer rounded ${selectedStudent?.chat_id === student.chat_id
              ? "bg-blue-100"
              : "hover:bg-gray-100"
              }`}
            onClick={() => openChat(student)}
          >
            {student.student_name}
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {selectedStudent ? (
          <>
            <div className="p-4 border-b border-gray-200 font-semibold">
              {selectedStudent.student_name}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`mb-2 flex ${msg.sender_id === teacherId ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.message_type === "text" ? (
                    <div
                      className={`p-2 rounded-lg max-w-xs ${msg.sender_id === teacherId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                        }`}
                    >
                      {msg.message_text}
                    </div>
                  ) : msg.message_type === "image" ? (
                    <img
                      src={getFileUrl(msg.file_url)}
                      alt="ส่งมา"
                      className="max-w-[200px] rounded"
                    />
                  ) : (
                    <a
                      href={getFileUrl(msg.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-600"
                    >
                      ดาวน์โหลดไฟล์
                    </a>
                  )}
                </div>
              ))}

              {/* preview file */}
              {preview && (
                <div className="mb-2">
                  {preview.type === "image" ? (
                    <img
                      src={preview.url}
                      alt="preview"
                      className="max-w-[150px] rounded"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-2 border rounded bg-gray-100">
                      📎 <span>{preview.file.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center">
              <label
                htmlFor="file-upload"
                className="cursor-pointer mr-2 flex items-center text-gray-600 hover:text-blue-500"
              >
                <Paperclip size={20} />
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 border border-gray-200 rounded px-3 py-2 mr-2"
              />

              <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                ส่ง
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            เลือกห้องแชทจากด้านซ้าย
          </div>
        )}
      </div>
    </div>
  );
}
