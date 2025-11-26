import Swal from "sweetalert2";
import http from "../http";

// บันทึกบทความใหม่
export const saveAllToServer = async (title, contentList, subchapter_id) => {
    try {
        const formData = new FormData();
        formData.append("title", title);

        formData.append("subchapter_id", subchapter_id); 

        contentList.forEach((item, idx) => {
            formData.append(`contentList[${idx}][type]`, item.type);
            formData.append(`contentList[${idx}][content]`, item.content || "");
            if (item.imageFile) {
                formData.append(`content_image_${idx}`, item.imageFile);
            }

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

        const res = await http.post('teachers/article/article.php', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'json'
        });

        let data = res.data;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('ไม่สามารถแปลง response เป็น JSON:', data);
                throw e;
            }
        }

        if (data.success) {
            Swal.fire({
                icon: 'success',
                text: 'บันทึกเนื้อหาสำเร็จ',
                confirmButtonText: 'ตกลง',
            }).then(() => {
                window.location.href = '/teacher/subchapter';
            });
        } else {
            Swal.fire({
                icon: 'error',
                text: data.message || 'ไม่สามารถบันทึกบทความได้',
                confirmButtonText: 'ตกลง',
            });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            text: 'ไม่สามารถเชื่อมต่อกับ Server ได้',
            confirmButtonText: 'ตกลง',
        });
    }
}

// ดึงบทความทั้งหมด
export const getArticles = async () => {
    try {
        const { data } = await http.get("teachers/article/get_article.php");
        if (data.success) {
            return data.articles.map(a => ({
                ...a,
                articles_id: a.articles_id
            }));
        }
        return [];
    } catch (err) {
        console.error("Error fetching articles:", err);
        return [];
    }
};

// ดึงรายละเอียดบทความ
export const getArticleDetail = async (articleId) => {
    try {
        const { data } = await http.get("teachers/article/get_article_detail.php", {
            params: { article_id: articleId },
        });
        if (!data.success) return null;
        const article = {
            ...data.article,
            articles_id: data.article.id, //
            contentList: data.article.contentList.map(content => ({
                ...content,
                contents_id: content.contents_id, //
                questions: content.questions ? content.questions.map(q => ({
                    ...q,
                    game_questions_id: q.game_questions_id //
                })) : []
            }))
        };
        return article;
    } catch (err) {
        console.error("Error fetching article detail:", err);
        return null;
    }
};

// แก้ไขบทความ
export const handleSaveChanges = async (articleId, articleTitle, editableContents) => {
    try {
        editableContents.forEach((c, idx) => {
            if (c.type === "game") {
                console.log("Game content idx=" + idx + ", id=" + c.id);
                console.log("Questions:", c.questions);
            }
        });

        const formData = new FormData();
        formData.append("article_id", articleId);
        formData.append("title", articleTitle);
        formData.append("contentList", JSON.stringify(editableContents));

        editableContents.forEach((content, index) => {
            if (content.imageFile) {
                formData.append(`content_image_${index}`, content.imageFile);
            }
        });

        const res = await http.post('teachers/article/edit_article.php', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'json' // บังคับ axios แปลง response
        });

        let data = res.data;

        // ถ้า PHP ไม่ส่ง JSON จริง ๆ
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('ไม่สามารถแปลง response เป็น JSON:', data);
                throw e;
            }
        }

        if (data.success) {
            Swal.fire({
                text: "บันทึกการแก้ไขสำเร็จ",
                icon: "success",
                confirmButtonText: "ตกลง",
            }).then(() => { window.location.href = '/teacher/subchapter' });
        } else {
            Swal.fire({
                text: "เกิดข้อผิดพลาด: " + data.message,
                icon: "warning",
                confirmButtonText: "ตกลง",
            });
        }
    } catch (err) {
        console.error("Error edit article:", err);
        Swal.fire({
            text: "ไม่สามารถบันทึกการแก้ไขได้",
            icon: "error",
            confirmButtonText: "ตกลง",
        });
    }
};


// ลบบทความ
export const deleteArticle = async (articleId) => {
    try {
        const { data } = await http.delete("teachers/article/article_delete.php", {
            data: { article_id: articleId },
        });
        return data;
    } catch (err) {
        console.error("Error deleting article:", err);
        return { success: false, message: "Error deleting article" };
    }
};

// ลบคำถามในเกม
export const deleteGameQuestion = async (questionId) => {
    try {
        const { data } = await http.post("teachers/article/delete_game.php", { id: questionId });
        return data;
    } catch (err) {
        console.error("Error deleting question:", err);
        return { success: false, message: err.message };
    }
};
