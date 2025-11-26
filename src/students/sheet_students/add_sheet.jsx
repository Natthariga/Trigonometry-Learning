import React, { useState } from "react";
import { getUserId } from '../../js/auth';
import Swal from "sweetalert2";
import { addSheet } from "../../api/students/sheet";

const AddSheet = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        coverImage: null,
        contentFile: null,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = "กรุณากรอกชื่อบทความ";
        if (!formData.coverImage) newErrors.coverImage = "กรุณาเลือกรูปภาพปก";
        if (!formData.contentFile) newErrors.contentFile = "กรุณาเลือกไฟล์เนื้อหา";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            student_id: getUserId(),
            title: formData.title,
            coverImage: formData.coverImage,
            contentFile: formData.contentFile,
        };

        try {
            const result = await addSheet(payload);

            if (result.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "สำเร็จ",
                    text: "ข้อมูลถูกบันทึกเรียบร้อย รอการอนุมัติจากครูประจำชั้น",
                });
                onSubmit?.(result.newSheet); // ถ้ามีส่ง callback
                onClose();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: result.message,
                });
            }
        } catch (err) {
            console.error("Error:", err);
            Swal.fire({
                icon: "error",
                title: "ข้อผิดพลาด",
                text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
            });
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-center">เพิ่มชีทสรุปใหม่</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">ชื่อชีท <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">รูปภาพหน้าปก <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            name="coverImage"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full"
                        />
                        {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">ไฟล์เนื้อหา <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            name="contentFile"
                            accept=".pdf,.doc,.docx"
                            onChange={handleChange}
                            className="w-full"
                        />
                        {errors.contentFile && <p className="text-red-500 text-sm mt-1">{errors.contentFile}</p>}
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-3 w-full">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-400 w-full "
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white w-full "
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSheet;
