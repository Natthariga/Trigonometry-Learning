import React, { useState, useEffect } from "react";
import { MessageCircle, X, Paperclip } from "lucide-react";
import {
  getHomeroomTeacher,
  startChat,
  getStudentMessages,
  uploadMessageFile,
  sendMessageAPI,
  getBan,
  banChats,
  getWord
} from "../api/chats";
import { getUserId } from "../js/auth";
import { getFileUrl } from "../js/getFileUrl";
import { ChatImage } from "./chat_image";
import Swal from "sweetalert2";

export default function ChatWidget() {
  const studentId = Number(getUserId());
  const [isOpen, setIsOpen] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const messagesEndRef = React.useRef(null);

  //แบน
  // const words = ['คำหยาบ', 'หยาบ'];
  const [words, setWords] = useState([]);
  const [isBanned, setIsBanned] = useState(false);
  const [banEnd, setBanEnd] = useState(null);
  useEffect(() => {
    const checkBan = async () => {
      if (!studentId) return;
      const res = await getBan({ student_id: studentId });
      if (res.is_banned) {
        setIsBanned(true);
        setBanEnd(res.ban_end);
      }
    };
    checkBan();
  }, [studentId]);

  // useEffect(() => {
  //   getWord()
  //     .then((data) => setWords(data))
  //     .catch((error) => console.error("Error fetching students:", error));
  // }, []);

  useEffect(() => {
    getWord()
      .then((data) => {
        if (Array.isArray(data.words)) {
          setWords(data.words);
        } else if (Array.isArray(data)) {
          setWords(data);
        }
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, []);


  // useEffect(() => {
  //   const getWord = async () => {
  //     const res = await getWord({});
  //     // if (res.is_banned) {
  //     //   setIsBanned(true);
  //     //   setBanEnd(res.ban_end);
  //     // }
  //     console.log(res)
  //   };
  //   getWord();
  // }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  // chat
  useEffect(() => {
    if (!isOpen || !studentId) return;

    const initChat = async () => {
      // console.log(" Initializing student chat...");

      const res = await getHomeroomTeacher(studentId);

      if (res.status !== "success") return;

      setTeacher(res.teacher);
      const chatData = await startChat(res.teacher.teacher_id, studentId);
      setChatId(chatData.chat_id);

      if (!chatData.chat_id) {
        console.error("❌ chat_id undefined");
        return;
      }

      // console.log(" Student joining chat room:", chatData.chat_id);

      const msgData = await getStudentMessages(chatData.chat_id);
      if (msgData.status === "success") setMessages(msgData.messages);
    };

    initChat();
  }, [isOpen, studentId]);

  // โหลดข้อความเก่า
  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(async () => {
      const res = await getStudentMessages(chatId);
      if (res.status === "success") setMessages(res.messages);
    }, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

    // ตรวจคำหยาบ
    const Text = input.toLowerCase();
    let foundWord = words.find(w => Text.includes(w.word.toLowerCase()));

    if (foundWord) {
      const duration = 3;
      await banChats({ student_id: studentId, duration_days: duration, reason: "ใช้คำหยาบ" });

      const banEndDate = new Date();
      banEndDate.setDate(banEndDate.getDate() + duration);
      setIsBanned(true);
      setBanEnd(banEndDate.toISOString().split("T")[0]);

      Swal.fire("คุณถูกแบน", `คุณถูกแบน ${duration} วัน เนื่องจากใช้คำหยาบ`, "warning");
      setInput("");
      return;
    }

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
        role: 2,
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
            {messages.map((msg, idx) => {
              const isMine = Number(msg.role) === 2;
              return (
                <div
                  key={`${msg.message_id}-${idx}`} //unique key
                  className={`mb-4 ${isMine ? "text-right" : "text-left"}`}
                >
                  {msg.message_type === "text" && (
                    <div>
                      <div className={`inline-block px-3 py-2 rounded-lg ${isMine ? "bg-blue-100" : "bg-gray-200"}`}>
                        {msg.message_text}
                      </div>
                      <div className="mt-2 text-[12px] text-gray-600">
                        {new Date(msg.create_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  )}
                  {msg.message_type === "image" && (
                    <div>
                      <ChatImage file_url={msg.file_url} />

                      <div className="mt-2 text-[12px] text-gray-600">
                        {new Date(msg.create_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  )}

                  {msg.message_type === "file" && (
                    <div>
                      <a
                        href={getFileUrl(msg.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-block px-3 py-2 rounded-lg ${isMine ? "bg-blue-100" : "bg-gray-200"}`}
                      >
                        {msg.file_url.split('/').pop()}
                      </a>
                      <div className="mt-2 text-[12px] text-gray-600">{msg.time}</div>
                    </div>
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

            <div ref={messagesEndRef} />
            <div className="text-center">
              {isBanned ? `คุณถูกแบนจนถึง ${banEnd}` : ''}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <label className="cursor-pointer flex items-center">
              <Paperclip size={20} />
              <input
                type="file"
                hidden onChange={handleFileChange}
                disabled={isBanned}
              />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1 text-sm"
              placeholder={isBanned ? "ไม่สามารถส่งข้อความได้" : "พิมพ์ข้อความ..."}
              disabled={isBanned}
              onKeyDown={(e) => !isBanned && e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 text-sm"
              disabled={isBanned}
            >
              ส่ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
