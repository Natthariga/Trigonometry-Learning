import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/navBar';
import image1 from '../../assets/Exam.png';
import { getUserId } from '../../js/auth';
import Footer from '../../components/footer';
import Swal from "sweetalert2";
import { getStudentScores } from "../../api/students/exam";

const SubExamstudent = () => {
  const { subchapterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialName = location.state?.chapterName || 'แบบทดสอบทั้งหมด';
  const [chapterName, setChapterName] = useState(initialName);
  const [subchapters, setSubchapters] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ข้อมูลคะแนนก่อนเรียน/หลังเรียน + จำนวนครั้งทำ + จำนวนข้อ
  const [pretestData, setPretestData] = useState({});
  const [posttestData, setPosttestData] = useState({});

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const fetchScores = async () => {
    try {
      const studentId = getUserId();
      const data = await getStudentScores(studentId, subchapterId);

      if (data.status === 'success') {
        const preData = {};
        const postData = {};
        const subchapterList = [];

        Object.entries(data.data).forEach(([subchapterId, val]) => {
          subchapterList.push({
            subchapter_id: subchapterId,
            subchapter_name: val.subchapter_name,
            time_limit_minutes: val.time_limit_minutes,
            full_score: val.full_score,
            created_at: val.created_at,
            watched_to_end: Number(val.watched_to_end)
          });

          preData[subchapterId] = {
            score: val.pretest_score ?? 0,
            attempt_count: val.pretest_attempts ?? 0,
            question_count: val.full_score ?? 0,
          };
          postData[subchapterId] = {
            score: val.posttest_score ?? 0,
            attempt_count: val.posttest_attempts ?? 0,
            question_count: val.full_score ?? 0,
            has_posttest: val.has_posttest ?? false,
          };
        });

        setPretestData(preData);
        setPosttestData(postData);
        setSubchapters(subchapterList);
      }
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  };

  useEffect(() => {
    fetchScores();
    if (location.state?.chapterName) setChapterName(location.state.chapterName);
  }, [subchapterId, location.state]);

  const handleOpenSubchapter = (sub) => {
    const postInfo = posttestData[sub.subchapter_id] || {};

    if (postInfo.has_posttest) {
      Swal.fire({
        title: `คะแนนล่าสุดของคุณ ${postInfo.score}/${sub.full_score}`,
        text: "คุณต้องการทำแบบทดสอบอีกครั้งหรือเข้าสู่บทเรียน?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "ทำแบบทดสอบอีกครั้ง",
        cancelButtonText: "เข้าสู่บทเรียน",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/posttest", { state: { subchapterId: sub.subchapter_id } });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/lessons", { state: { subchapterId: sub.subchapter_id } });
        }
      });
    } else {
      Swal.fire({
        title: "ยินดีต้อนรับ",
        html: `เข้าสู่แบบทดสอบหลังเรียนเรื่อง <b>${sub.subchapter_name}</b>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "เริ่มทำแบบทดสอบ",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/posttest", { state: { subchapterId: sub.subchapter_id } });
        }
      });
    }
  };

  return (
    <section className="flex flex-col min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 p-8 pt-32 w-full overflow-y-auto">
        <div className="m-6 flex justify-between items-center px-6 border border-gray-100 p-2 rounded-lg">
          <div className="flex flex-col">
            <div className="border-l-4 border-blue-500 pl-4">
              <h1 className="text-3xl font-bold text-gray-700">{chapterName}</h1>
              <div className="py-1 text-gray-600 text-md">
                จำนวนแบบทดสอบทั้งหมด: {subchapters.length} แบบทดสอบ
              </div>
            </div>
          </div>
        </div>

        <div id="subchapter_list" className="col">
          <div className="m-5">
            {subchapters.length > 0 ? (
              subchapters.map((sub) => {
                const preInfo = pretestData[sub.subchapter_id] || { score: 0, question_count: 0 };
                const postInfo = posttestData[sub.subchapter_id] || { score: 0, question_count: 0 };

                const watchedDone = Number(sub.watched_to_end) === 1;
                const didPretest = (preInfo.attempt_count ?? 0) > 0;
                const isLocked = !(watchedDone && didPretest);

                const reasons = [];
                if (!didPretest) reasons.push("ทำแบบทดสอบก่อนเรียน");
                if (!watchedDone) reasons.push("ดูวิดีโอให้จบ");

                return (
                  <div
                    key={sub.subchapter_id}
                    onClick={() => {
                      if (isLocked) {
                        Swal.fire({
                          icon: "warning",
                          title: "ไม่สามารถทำแบบทดสอบหลังเรียนได้",
                          text: `กรุณา${reasons.join(" และ ")}ก่อน`,
                          confirmButtonText: "เข้าใจแล้ว",
                        });
                      } else {
                        handleOpenSubchapter(sub);
                      }
                    }}
                    className={`cursor-pointer block bg-white p-4 m-4 rounded-xl border border-gray-200 shadow-sm
                      transition duration-300 ease-in-out transform hover:-translate-y-1
                      ${isLocked ? 'opacity-50 cursor-not-allowed hover:shadow-none hover:border-gray-200' : 'hover:shadow-lg hover:border-blue-400'}
                    `}
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={image1} alt={sub.subchapter_name} className="w-8 h-10 object-contain" />
                        <div className="col m-2">
                          <h2 className="text-2xl font-bold text-blue-800 text-start">{sub.subchapter_name}</h2>
                          <p className="text-[12px] text-gray-500">
                            <span className="text-blue-800 text-md font-bold">
                              เวลาในการทำข้อสอบ: {sub.time_limit_minutes ?? 'ไม่ระบุ'} นาที
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-start sm:justify-end gap-2">
                        {postInfo.question_count > 0 ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[13px] text-gray-500 ">
                              คะแนนแบบทดสอบหลังเรียน {postInfo.score}/{postInfo.question_count}
                            </span>
                            <div
                              className="relative md:w-32 w-full h-2 bg-gray-300 rounded overflow-hidden"
                              title={`คะแนนหลังเรียน: ${postInfo.score} / ${postInfo.question_count}`}
                            >
                              <div
                                className="h-full w-full bg-green-500"
                                style={{ width: `${(postInfo.score / postInfo.question_count) * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[13px] text-gray-500">
                            ยังไม่ทำแบบทดสอบหลังเรียน
                          </span>
                        )}
                        {isLocked && <div className="text-red-500" title="ต้องทำ pretest และเรียนบทเรียนก่อน">🔒</div>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center">ไม่พบข้อมูลบททดสอบ</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SubExamstudent;
