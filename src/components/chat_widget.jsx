import React, { useState, useEffect } from "react";
import { MessageCircle, X, Paperclip } from "lucide-react";
import {
  getHomeroomTeacher,
  startChat,
  getStudentMessages,
  uploadMessageFile,
  sendMessageAPI
} from "../api/chats";
import { getUserId } from "../js/auth";
import { getFileUrl } from "../js/getFileUrl";
import { io } from "socket.io-client";

const SOCKET_URL = "wss://socket-server-839f.onrender.com";
// const SOCKET_URL = "http://localhost:3001";

export default function ChatWidget() {
  const studentId = Number(getUserId());
  const [isOpen, setIsOpen] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [socket, setSocket] = useState(null);

  const toggleChat = () => setIsOpen(!isOpen);

  // ⚡ เชื่อม Socket.IO
  // useEffect(() => {
  //   const s = io(SOCKET_URL, { transports: ["websocket"] });

  //   s.on("connect", () => console.log("✅ Student connected:", s.id));
  //   s.on("connect_error", (err) => console.warn("❌ Student socket connect error:", err));
  //   s.on("disconnect", (reason) => console.log("⚡ Student disconnected:", reason));

  //   setSocket(s);
  //   return () => s.disconnect();
  // }, []);

  // init chat
  useEffect(() => {
    if (!isOpen || !studentId || !socket) return;

    const initChat = async () => {
      console.log("🔹 Initializing student chat...");

      const res = await getHomeroomTeacher(studentId);
      if (res.status !== "success") return;

      setTeacher(res.teacher);
      const chatData = await startChat(res.teacher.teacher_id, studentId);
      setChatId(chatData.chat_id);

      if (!chatData.chat_id) {
        console.error("❌ chat_id undefined");
        return;
      }

      console.log("👥 Student joining chat room:", chatData.chat_id);
      socket.emit("joinChat", chatData.chat_id);

      socket.on("newMessage", (msg) => {
        console.log("📩 Student received newMessage:", msg);
        if (msg.chat_id === chatData.chat_id) setMessages((prev) => [...prev, msg]);
      });

      const msgData = await getStudentMessages(chatData.chat_id);
      if (msgData.status === "success") setMessages(msgData.messages);
    };

    initChat();
  }, [isOpen, studentId, socket]);

  // polling ข้อความเก่า (สำรอง)
  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(async () => {
      const res = await getStudentMessages(chatId);
      if (res.status === "success") setMessages(res.messages);
    }, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };
  const clearPreview = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;
    if (!chatId) return;

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

    const payload = {
      chat_id: chatId,
      sender_id: studentId,
      message_text,
      message_type,
      file_url: file_url || ""
    };

    const res = await sendMessageAPI(payload);

    if (res.status === "success") {
      const newMsg = {
        message_id: res.message_id,
        chat_id: chatId,
        sender_id: studentId,
        message_text,
        message_type,
        file_url,
        create_at: new Date().toISOString(),
        // first_name: getFullName().split(" ")[0],
        // last_name: getFullName().split(" ")[1] || "",
        role: 2,
      };

      setMessages((prev) => [...prev, newMsg]);

      socket.emit("sendMessage", newMsg);
    }

    setInput("");
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleChat}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="w-80 h-96 bg-white shadow-2xl rounded-xl flex flex-col absolute bottom-16 right-0">
          <div className="bg-blue-600 text-white p-3 rounded-t-xl font-semibold">
            {teacher ? `แชทกับครู ${teacher.first_name}` : "กำลังโหลด..."}
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto text-sm">
            {messages.map((msg, idx) => {
              const isMine = Number(msg.role) === 2;
              return (
                <div
                  key={`${msg.message_id}-${idx}`} // ✅ unique key
                  className={`mb-2 ${isMine ? "text-right" : "text-left"}`}
                >
                  {msg.message_type === "text" && (
                    <div className={`inline-block px-3 py-2 rounded-lg ${isMine ? "bg-blue-100" : "bg-gray-200"}`}>
                      {msg.message_text}
                    </div>
                  )}
                  {msg.message_type === "image" && (
                    <img
                      src={getFileUrl(msg.file_url)}
                      alt="uploaded"
                      className="max-w-[150px] rounded-lg inline-block"
                    />
                  )}
                  {msg.message_type === "file" && (
                    <a
                      href={getFileUrl(msg.file_url)} // ต้องใช้ href ไม่ใช่ src
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      📎 ดาวน์โหลดไฟล์
                    </a>
                  )}
                </div>
              );
            })}


            {/* Preview */}
            {preview && (
              <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded">
                {file?.type?.startsWith("image/") ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <span>📎 {file?.name}</span>
                )}
                <button
                  onClick={clearPreview}
                  className="text-red-500 text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <label className="cursor-pointer flex items-center">
              <Paperclip size={20} />
              <input type="file" hidden onChange={handleFileChange} />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1 text-sm"
              placeholder="พิมพ์ข้อความ..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 text-sm"
            >
              ส่ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
