import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Sidebar from '../components/navBar';
import image1 from "../assets/person1.png";
import person2 from "../assets/person2.png";
import image2 from "../assets/Notebook.png";
import image3 from "../assets/Note_Edit.png";
import image4 from "../assets/File_Blank.png";
import image5 from "../assets/Trending_Up.png";
import item1 from "../assets/item1.png";
import item2 from "../assets/item2.png";
import item3 from "../assets/item3.png";
import '../style/home.css';
import Footer from '../components/footer';
import ChatWidget from '../components/chat_widget';
import { getUserId } from "../js/auth";

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen w-full">

      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 pt-24 bg-white text-gray-800 overflow-auto">
        <section id='header' className="flex justify-center items-center py-20 bg-gray-100 w-full md:p-3 min-h-[400px]">
          <div className="container mx-auto flex flex-col md:flex-row items-center space-y-10 md:space-y-0 md:space-x-10 px-4">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-semibold text-blue-950 mb-4 text-shadow-2xs">เริ่มต้นใช้งานทันที</h2>
              <p className="text-black text-base md:text-xl">ยินดีต้อนรับสู่ระบบการศึกษาที่ดีที่สุด เริ่มต้นเรียนรู้และพัฒนาทักษะของคุณกับเราได้ทันที</p>
            </div>
            <div className="w-full md:w-1/2">
              <img src={image1} alt="Person with Laptop" className="w-full md:w-2/3 h-auto rounded-xl mx-auto object-cover" />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-gray-800 mb-8">ฟีเจอร์<span className='text-blue-800'>แนะนำ</span></h3>
            <div className="col-md">

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10 place-items-center px-4 items-stretch">
                <Link to="/ai-practice" className="w-full p-6 bg-white rounded-xl shadow-md relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
                  <div className="flex flex-col text-start">
                    <img id='box1' src={image2} alt="บทเรียน" className="mb-4 imageBox w-32" />
                    <p className="text-md font-bold text-gray-700">โจทย์ตรีโกณมิติ</p>
                    <p className='text-sm my-1 text-gray-400'>ด้วยโจทย์ที่สร้างโดย AI เพื่อพัฒนาทักษะการคิดวิเคราะห์อย่างเป็นระบบ</p>
                  </div>
                </Link>

                <Link to="/triggraph" className="w-full p-6 bg-white rounded-xl shadow-md relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500 rounded-br-lg"></div>
                  <div className="flex flex-col text-start">
                    <img id='box1' src={image3} alt="บทเรียน" className="mb-4 imageBox w-32" />
                    <p className="text-md font-bold text-gray-700">สร้างกราฟตรีโกณมิติ</p>
                    <p className='text-sm my-1 text-gray-400'>เครื่องมือสำคัญที่ช่วยให้นักเรียนเข้าใจการเปลี่ยนแปลงของมุมและค่าฟังก์ชันได้อย่างชัดเจน</p>
                  </div>
                </Link>

                <Link to="/wolframAlpha" className="w-full p-6 bg-white rounded-xl shadow-md relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500 rounded-br-lg"></div>
                  <div className="flex flex-col text-start">
                    <img id='box1' src={image4} alt="บทเรียน" className="mb-4 imageBox w-32" />
                    <p className="text-md font-bold text-gray-700">ผู้ช่วยคำนวณสูตรขั้นสูง</p>
                    <p className='text-sm my-1 text-gray-400'>เครื่องมือคำนวณสูตรพื้นฐานของตรีโกณมิติพร้อมแสดงรูปภาพให้เห็นชัดเจน</p>
                  </div>
                </Link>

                <Link to="/score" className="w-full p-6 bg-white rounded-xl shadow-md relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 rounded-br-lg"></div>
                  <div className="flex flex-col text-start">
                    <img id='box1' src={image5} alt="บทเรียน" className="mb-4 imageBox w-32" />
                    <p className="text-md font-bold text-gray-700">อันดับคะแนน</p>
                    <p className='text-sm my-1 text-gray-400'>ฝึกคิดวิเคราะห์อย่างเป็นระบบ ผ่านเกมสนุกๆ เสริมความเข้าใจตรรกศาสตร์แบบไม่เครียด</p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col items-center sm:flex-row gap-8 py-8">
                <div>
                  <img src={person2} alt="Person with Laptop" className="w-65 h-auto rounded-xl mx-auto object-cover" />
                </div>

                <div className='flex flex-col py-8 px-4'>
                  <div className="item flex items-center py-4">
                    <img src={item1} alt="Person with Laptop" className="w-20 h-20 rounded-xl object-cover" />
                    <div className="col text-start">
                      <p className='font-semibold'>เกมตรีโกณมิติ</p>
                      <p className='text-sm my-1 text-gray-400'>ฝึกคิดวิเคราะห์อย่างเป็นระบบ ผ่านเกมสนุกๆ เสริมความเข้าใจตรรกศาสตร์แบบไม่เครียด</p>
                    </div>
                  </div>


                  <div className="item flex items-center">
                    <img src={item2} alt="Person with Laptop" className="w-20 h-20  rounded-xl object-cover" />
                    <div className="col text-start">
                      <p className='font-semibold'>อันดับคะแนน</p>
                      <p className='text-sm my-1 text-gray-400'>อันดับคะแนนในเกมตรีโกณมิติเหมือนการสะสมเหรียญทอง! แก้ปัญหาด้วยความเร็วจะได้เหรียญทองและกลายเป็นสุดยอดนักตรีโกณมิติในเกม!</p>
                    </div>
                  </div>

                  <div className="item flex items-center py-4">
                    <img src={item3} alt="Person with Laptop" className="w-20 h-20  rounded-xl object-cover" />
                    <div className="col text-start">
                      <p className='font-semibold'>เครื่องคำนวณตรีโกณมิติเบื้องต้น</p>
                      <p className='text-sm my-1 text-gray-400'>เครื่องมือนี้ช่วยคำนวณฟังก์ชันตรีโกณมิติพื้นฐาน เหมาะสำหรับนักเรียนที่ต้องการตรวจคำตอบหรือทำความเข้าใจแนวคิดเบื้องต้นในการเรียนตรีโกณมิติ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <ChatWidget studentId={getUserId()} />
      <Footer />
    </div>
  );
};

export default Home;