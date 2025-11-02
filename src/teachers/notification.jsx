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
import { Paperclip, MessageCircle } from "lucide-react";
import { getFileUrl } from "../js/getFileUrl";
import { ChatImage } from "../components/chat_image";

export default function CommunicationCenter() {
  const teacherId = Number(getUserId());
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    if (!teacherId) return;
    const fetchChats = async () => {
      const res = await getChatsByTeacher(teacherId);
      if (res.status === "success") setStudents(res.chats);
    };
    fetchChats();
  }, [teacherId]);

  useEffect(() => {

    const handleNewMessage = (msg) => {
      console.log("📩 Teacher received newMessage:", msg);

      if (msg.chat_id === selectedStudent?.chat_id) {
        setChatMessages((prev) => [...prev, msg]);
      }
    };

  }, [selectedStudent]);


  const openChat = async (student) => {
    setSelectedStudent(student);

    setChatId(student.chat_id);

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

    // เก็บฐานข้อมูล
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

      //อัปเดต local state
      setChatMessages((prev) => [...prev, newMsg]);
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
      <div className={`w-full md:w-1/4 border-r border-gray-200 p-4 overflow-y-auto mt-5 md:mt-0
                  ${selectedStudent && "hidden sm:block md:block"}`}>
        <div className="border-b-2 flex items-center md:justify-between gap-4 py-4">
          <h2 className="text-xl font-semibold text-center text-blue-900 flex gap-1 items-center border py-1 px-2 rounded border-gray-100"><MessageCircle size={16} />กล่องข้อความ</h2>
          <div className="w-5 h-5 bg-blue-950 rounded-full flex  justify-center items-center text-white font-bold ">{students.length}</div>
        </div>
        {students.map((student) => (
          <div
            key={student.chat_id}
            className={`p-2 cursor-pointer mt-2 flex items-center gap-2 rounded ${selectedStudent?.chat_id === student.chat_id
              ? "bg-blue-950 text-white shadow-lg"
              : "text-gray-900 border-b border-gray-100 hover:bg-blue-200"
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
            {/* ปุ่มย้อนกลับ */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="sm:hidden flex items-center text-blue-600 hover:underline"
              >
                ←
              </button>
              <span className="font-semibold">{selectedStudent.student_name}</span>
            </div>

            <div className="flex-1 p-4 pt-4 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`mb-4 flex ${msg.sender_id === teacherId ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.message_type === "text" ? (
                    <div>
                      <div
                        className={`p-2 rounded-lg max-w-xs ${msg.sender_id === teacherId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-black"
                          }`}
                      >
                        {msg.message_text}
                      </div>
                      <div className="mt-2 text-[12px] text-gray-600">
                        {new Date(msg.create_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  ) : msg.message_type === "image" ? (
                    <div>
                      <ChatImage file_url={msg.file_url} />
                      <div className="mt-2 text-[12px] text-gray-600">
                        {new Date(msg.create_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
