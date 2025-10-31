import http from "../http";
import Swal from "sweetalert2";

// บันทึกบทความใหม่
export const saveAllToServer = async (title, contentList) => {
    try {
        const formData = new FormData();
        formData.append("title", title);

        contentList.forEach((item, idx) => {
            formData.append(`contentList[${idx}][type]`, item.type);
            formData.append(`contentList[${idx}][content]`, item.content || "");
            if (item.imageFile) formData.append(`content_image_${idx}`, item.imageFile);

            if (item.type === "graph") {
                formData.append(`contentList[${idx}][graphEquationValue]`, item.graphEquationValue || "");
                formData.append(`contentList[${idx}][graphExplanation]`, item.graphExplanation || "");
                formData.append(`contentList[${idx}][graphId]`, item.graphId || "");
            }

            if (item.type === "game" && item.questions) {
                item.questions.forEach((q, qIdx) => {
                    formData.append(`contentList[${idx}][questions][${qIdx}][question]`, q.question);
                    formData.append(`contentList[${idx}][questions][${qIdx}][answer]`, q.answer);
                    formData.append(`contentList[${idx}][questions][${qIdx}][points]`, q.points || 2);
                });
            }
        });

        const { data } = await http.post("/students/article/article.php", formData);

        if (data.success) {
            Swal.fire({ icon: 'success', text: 'บันทึกเนื้อหาสำเร็จ', confirmButtonText: 'ตกลง' })
                .then(() => window.location.href = '/');
        } else {
            Swal.fire({ icon: 'error', text: data.message || 'ไม่สามารถบันทึกบทความได้', confirmButtonText: 'ตกลง' });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', text: 'ไม่สามารถเชื่อมต่อกับ Server ได้', confirmButtonText: 'ตกลง' });
    }
};

// ดึงบทความทั้งหมด
export const getArticles = async () => {
    try {
        const { data } = await http.get("/students/article/get_article.php");
        return data.success ? data.articles : [];
    } catch (err) {
        console.error("Error fetching articles:", err);
        return [];
    }
};

// ดึงรายละเอียดบทความ
export const getArticleDetail = async (subchapterId) => {
    try {
        const { data } = await http.get(`/students/article/get_article_detail.php`, {
            params: { subchapter_id: subchapterId },
        });

        if (data && data.article) {
            const sortedContents = (data.article.contentList || []).sort((a, b) => a.position - b.position);
            return { ...data.article, contentList: sortedContents };
        }

        return null;
    } catch (err) {
        console.error("Error fetching article detail:", err);
        return null;
    }
};


// ลบบทความ (ไม่แก้โค้ด)
export const deleteArticle = async (articleId) => {
    try {
        const { data } = await http.post("/students/article/article_delete.php", { article_id: articleId });
        return data;
    } catch (err) {
        console.error("Error deleting article:", err);
        return { success: false, message: "Error deleting article" };
    }
};

// บันทึกการแก้ไขบทความ
export const handleSaveChanges = async (articleId, articleTitle, editableContents) => {
    try {
        const formData = new FormData();
        formData.append("article_id", articleId);
        formData.append("title", articleTitle);

        // ส่ง contentList เป็น JSON พร้อมปรับ id ให้ตรงกับ backend
        formData.append("contentList", JSON.stringify(editableContents.map(c => ({
            ...c,
            id: c.contents_id,
            questions: c.questions ? c.questions.map(q => ({
                ...q,
                id: q.game_questions_id
            })) : []
        }))));

        editableContents.forEach((c, idx) => {
            if (c.imageFile) formData.append(`content_image_${idx}`, c.imageFile);
        });

        const { data } = await http.post("/students/article/edit_article.php", formData);

        if (data.success) {
            Swal.fire({ text: "บันทึกการแก้ไขสำเร็จ", icon: "success", confirmButtonText: "ตกลง" })
                .then(() => window.location.href = '/');
        } else {
            Swal.fire({ text: "เกิดข้อผิดพลาด: " + data.message, icon: "warning", confirmButtonText: "ตกลง" });
        }
    } catch (err) {
        console.error("Error edit article:", err);
        Swal.fire({ text: "ไม่สามารถบันทึกการแก้ไขได้", icon: "error", confirmButtonText: "ตกลง" });
    }
};

// ลบคำถามเกม (ไม่แก้โค้ด)
export const deleteGameQuestion = async (questionId) => {
    try {
        const { data } = await http.post("/students/article/delete_game.php", { id: questionId });
        return data;
    } catch (err) {
        console.error("Error deleting question:", err);
        return { success: false, message: err.message };
    }
};

// บันทึกคะแนน
export const saveScore = async ({ content_id, user_id, score }) => {
    try {
        console.log("Sending score payload:", { content_id, user_id, score });

        const { data } = await http.post(
            "/students/article/math_game.php",
            JSON.stringify({ content_id, user_id, score }),
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        console.log("Result from saveScore:", data);
        return data;
    } catch (err) {
        console.error("Error saving score", err);
        return { success: false, message: "Error saving score" };
    }
};


// ดึงคะแนนสูงสุด
export const getTopscore = async (article_id = 0) => {
    try {
        const { data } = await http.get(`/students/article/score_game.php?article_id=${article_id}`);
        return data || [];
    } catch (err) {
        console.error("Error fetching score", err);
        return [];
    }
};
