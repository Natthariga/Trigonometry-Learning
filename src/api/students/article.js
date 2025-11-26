import http from "../http";

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