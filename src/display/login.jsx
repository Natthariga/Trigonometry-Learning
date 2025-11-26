import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mainBg from "../assets/main.png";
import { loginApi } from "../api/auth";
import { login } from "../js/auth"; 

const Login = () => {
  const [account, setAccount] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginApi(account, password); //เรียกใช้ login

      if (data.status === "success") {
        login(data.user); // เก็บ session / localStorage

        // แยก role
        if (data.user.role === "student") {
          navigate("/home");
        } else if (data.user.role === "teacher") {
          navigate("/teacher/dashboard");
        } else if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${mainBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="flex justify-center items-center min-h-screen px-4"
    >
      <div className="flex flex-col-reverse md:flex-row w-full max-w-4xl rounded-xl shadow-lg overflow-hidden bg-white/80 backdrop-blur-md">
        {/* Login Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            เข้าสู่ระบบ
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg font-medium mb-1">
                บัญชีผู้ใช้หรือรหัสนักเรียน
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="กรอกบัญชีผู้ใช้ หรือ รหัสนักเรียน"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-lg text-white py-2 rounded transition"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        {/* Welcome / Signup */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-center bg-blue-500">
          <h2 className="text-white text-4xl font-bold mb-4">ยินดีต้อนรับ</h2>
          <p className="!text-white text-md mb-6">
            ยังไม่ได้เป็นสมาชิก? กรุณาสมัครสมาชิกเพื่อเข้าใช้งานบทเรียน
          </p>
          <Link to="/register">
            <button className="bg-white text-lg text-blue-500 hover:text-white hover:bg-blue-400 px-6 py-2 rounded transition">
              สมัครสมาชิก
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
