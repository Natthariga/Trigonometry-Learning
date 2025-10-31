import React, { useState, useEffect } from "react";
import { MessageCircle, X, Paperclip } from "lucide-react";
import {
  getHomeroomTeacher,
  startChat,
  getStudentMessages,
  uploadMessageFile,
} from "../api/chats";
import { getUserId, getFullName } from "../js/auth";

export default function ChatWidget() {
  const studentId = Number(getUserId());
  const [isOpen, setIsOpen] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const toggleChat = () => setIsOpen(!isOpen);


  // init chat
  useEffect(() => {
    if (!isOpen || !studentId) return;

    const initChat = async () => {
      const res = await getHomeroomTeacher(studentId);
      if (res.status === "success") {

        setTeacher(res.teacher);

        const chatData = await startChat(res.teacher.teacher_id, studentId);
        setChatId(chatData.chat_id);

        const msgData = await getStudentMessages(chatData.chat_id);

                  console.log(chatData);

        if (msgData.status === "success") setMessages(msgData.messages);
      }
    };

    initChat();
  }, [isOpen, studentId]);

  // polling ข้อความทุก 3 วินาที
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const res = await getStudentMessages(chatId);
      if (res.status === "success") setMessages(res.messages);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [chatId]);

  // handle file
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

  // send message
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

    const payload = new FormData();
    payload.append("chat_id", chatId);
    payload.append("sender_id", studentId);
    payload.append("message_text", message_text);
    payload.append("message_type", message_type);
    payload.append("file_url", file_url || "");

    // const res = await fetch(`${BASE_URL}/chats/sendMessage.php`, {
    //   method: "POST",
    //   body: payload,
    //   credentials: "include",
    // }).then((r) => r.json());

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
        chat_id,
        sender_id: studentId,
        message_text,
        message_type,
        file_url,
        create_at: new Date().toISOString(),
        first_name: getFullName().split(" ")[0],
        last_name: getFullName().split(" ")[1] || "",
        role: 2, // นักเรียน
      };

      setMessages((prev) => [...prev, newMsg]);
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
            {messages.map((msg) => {
              const isMine = Number(msg.role) === 2;
              return (
                <div
                  key={msg.message_id}
                  className={`mb-2 ${isMine ? "text-right" : "text-left"}`}
                >
                  {msg.message_type === "text" && (
                    <div
                      className={`inline-block px-3 py-2 rounded-lg ${isMine ? "bg-blue-100" : "bg-gray-200"
                        }`}
                    >
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
                      src={getFileUrl(msg.file_url)}
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
