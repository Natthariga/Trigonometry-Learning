import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getUserId } from '../../js/auth';
import { editSubchapter } from "../../api/teachers/subchapter";

const EditSubchapterModal = ({ subchapterData, onClose, onUpdated }) => {
    const [subchapterName, setSubchapterName] = useState(subchapterData?.subchapter_name || "");
    const [subchapterDescription, setSubchapterDescription] = useState(subchapterData?.subchapter_description || "");
    const [videoFile, setVideoFile] = useState(null);
    const [subchapterFile, setSubchapterFile] = useState(null);

    useEffect(() => {
        setSubchapterName(subchapterData?.subchapter_name || "");
        setSubchapterDescription(subchapterData?.subchapter_description || "");
    }, [subchapterData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = getUserId();
        const formData = new FormData();
        formData.append("subchapter_id", subchapterData.subchapter_id);
        formData.append("subchapter_name", subchapterName);
        formData.append("subchapter_description", subchapterDescription);
        formData.append("teacher_id", userId);
        if (videoFile) formData.append("subchapter_link", videoFile);
        if (subchapterFile) formData.append("subchapter_file", subchapterFile);

        Swal.fire({
            title: "กำลังอัปโหลด...",
            html: `<div id="progress-bar" class="bg-blue-500 h-2 rounded-full" style="width: 0%"></div>`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const res = await editSubchapter(formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    const bar = document.getElementById("progress-bar");
                    if (bar) bar.style.width = `${percent}%`;
                }
            });

            Swal.close();

            if (res.status === "success") {
                Swal.fire({ icon: "success", title: "แก้ไขสำเร็จ" }).then(() => {
                    onUpdated?.();
                    onClose();
                });
            } else {
                Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: res.message || "" });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "เชื่อมต่อไม่ได้",
                text: error.message.includes("timeout")
                    ? "ไฟล์ใหญ่เกินไป หรือหมดเวลาเชื่อมต่อ"
                    : "โปรดลองใหม่อีกครั้ง",
            });
        }
    };


    return (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative border border-gray-200">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h1 className="text-[20px] font-semibold text-blue-800 mb-6 text-center">
                    แก้ไขบทเรียน
                </h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบทเรียน</label>
                        <input
                            type="text"
                            value={subchapterName}
                            onChange={(e) => setSubchapterName(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg  focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                        <textarea
                            value={subchapterDescription}
                            onChange={(e) => setSubchapterDescription(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            rows="3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดวิดีโอใหม่ (ถ้าต้องการเปลี่ยน)</label>
                        <input
                            type="file"
                            name="subchapter_link"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0])}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            อัปโหลดไฟล์ประกอบใหม่ (ถ้าต้องการเปลี่ยน)
                        </label>
                        <input
                            type="file"
                            name="subchapter_file"
                            accept="application/pdf"
                            onChange={(e) => setSubchapterFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white shadow-md px-6 py-2.5 rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-600 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            บันทึก
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-600 bg-gray-50 px-6 py-2.5 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-200 hover:text-gray-800 hover:shadow"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSubchapterModal;
