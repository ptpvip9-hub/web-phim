"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DangNhapPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage("Đăng ký thất bại: " + error.message);
      } else {
        setMessage(
          "Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Đăng nhập thất bại: " + error.message);
      } else {
        setMessage("Đăng nhập thành công! 🎉");
      }
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#090909",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#151515",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#e50914",
            fontSize: "30px",
            marginBottom: "8px",
          }}
        >
          TRÀ ĐÁ DRAMA
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            marginBottom: "30px",
          }}
        >
          {isRegister ? "Tạo tài khoản mới" : "Đăng nhập tài khoản"}
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginTop: "8px",
              marginBottom: "20px",
              padding: "13px",
              borderRadius: "8px",
              border: "1px solid #333",
              background: "#222",
              color: "white",
              fontSize: "15px",
            }}
          />

          <label>Mật khẩu</label>

          <input
            type="password"
            placeholder="Ít nhất 6 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginTop: "8px",
              marginBottom: "25px",
              padding: "13px",
              borderRadius: "8px",
              border: "1px solid #333",
              background: "#222",
              color: "white",
              fontSize: "15px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#e50914",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Đang xử lý..."
              : isRegister
              ? "ĐĂNG KÝ"
              : "ĐĂNG NHẬP"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#ddd",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#aaa",
          }}
        >
          {isRegister
            ? "Đã có tài khoản?"
            : "Chưa có tài khoản?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
            style={{
              marginLeft: "8px",
              border: "none",
              background: "none",
              color: "#e50914",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </div>
      </div>
    </main>
  );
}