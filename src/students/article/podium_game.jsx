import React, { useEffect, useState } from "react";
import { getTopscore, getArticles } from "../../api/students/article";
import background from '../../assets/game_background.png';
import { getFileUrl } from "../../js/getFileUrl";

const Podiumscore = () => {
  const [scores, setScores] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectArticle, setSelectArticle] = useState(0);

  // ดึงบทความ
  useEffect(() => {
    const fetchArticles = async () => {
      const data = await getArticles();
      setArticles(data);
      setSelectArticle(0);
    };
    fetchArticles();
  }, []);

  // ดึงคะแนนตามบทความที่เลือก
  useEffect(() => {
    const fetchScores = async () => {
      const data = await getTopscore(selectArticle);
      setScores(data);
    };
    fetchScores();
  }, [selectArticle]);

  const snowflakes = Array.from({ length: 20 });

  // กำหนดลำดับ podium: 2-1-3
  const podiumOrder = scores.length === 3 ? [1, 0, 2] : scores.map((_, idx) => idx);

  return (
    <section
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center pt-10"
      style={{ backgroundImage: `url(${background})` }}
    >
      <style>{`
        .snowflake { top: -10%; color: white; opacity: 0.8; position: absolute; animation: fall linear infinite; pointer-events: none; }
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } }
      `}</style>

      {snowflakes.map((_, i) => (
        <div
          key={`snowflake-${i}`}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${5 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${10 + Math.random() * 20}px`
          }}
        >
          ❄
        </div>
      ))}

      {/* เลือกบทความ */}
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-medium text-purple-700 drop-shadow-lg">⭐️ Leaderboard ⭐️</h2>
        <div className="px-6">
          <select
            value={selectArticle}
            onChange={(e) => setSelectArticle(Number(e.target.value))}
            className="px-4 py-2 rounded-lg text-gray-700 bg-white"
          >
            <option value={0}>รวมทุกบทความ</option>
            {articles.map(a => (
              <option key={a.articles_id} value={a.articles_id}>{a.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-center space-x-4 h-screen">
        {scores.length === 0 ? (
          <p className="text-white text-xl mt-10">ยังไม่มีผู้เล่นในบทความนี้</p>
        ) : (
          podiumOrder.map((pos, idx) => {
            const isFirst = pos === 0;
            const podiumHeight = isFirst ? "h-56" : pos === 1 ? "h-40" : "h-32";
            const topAvatar = isFirst ? "-top-40" : "-top-24";
            const borderColor = isFirst ? "border-yellow-400" : pos === 1 ? "border-gray-400" : "border-orange-400";
            const emoji = isFirst ? "🏆" : pos === 1 ? "🥈" : "🥉";
            const topEmoji = isFirst ? "-top-20" : "-top-4";

            return (
              <div key={`podium-${idx}`} className="flex flex-col items-center relative">
                {/* Avatar */}
                <div className={`absolute ${topAvatar} w-20 h-20 flex items-center justify-center z-10`}>
                  <div className={`absolute inset-0 rounded-full border-4 ${borderColor}`}></div>
                  <img
                    src={getFileUrl(scores[pos]?.avatar) || getFileUrl('uploads/imageprofile/default-profile.png')}
                    alt={scores[pos]?.username || "-"}
                    className="w-16 h-16 rounded-full z-10"
                  />
                </div>

                {/* Podium block */}
                <div className={`bg-yellow-300 w-20 ${podiumHeight} flex justify-center items-${isFirst ? "end" : "center"} rounded-t-lg relative ${!isFirst && pos === 1 ? "bg-gray-300" : ""} ${!isFirst && pos === 2 ? "bg-orange-300" : ""}`}>
                  <span className={`absolute ${topEmoji} text-yellow-500 text-[80px]`}>{emoji}</span>
                </div>

                {/* Info */}
                <div className="mt-2 text-center">
                  <p className="font-semibold">{scores[pos]?.username || "-"}</p>
                  <p className="text-gray-500">{scores[pos]?.score || 0} คะแนน</p>
                  <p className="text-sm text-gray-400">{scores[pos]?.article_title || ""}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Podiumscore;
