"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DangNhapPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    // =========================
    // ĐĂNG KÝ
    // =========================
    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage("Đăng ký thất bại: " + error.message);
      } else {
        setMessage(
          "Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản."
        );
      }

      setLoading(false);
      return;
    }

    // =========================
    // ĐĂNG NHẬP
    // =========================
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage("Đăng nhập thất bại: " + error.message);
      setLoading(false);
      return;
    }

    // Kiểm tra đăng nhập thành công
    if (data.session) {
      // Chuyển thẳng về trang chủ
      window.location.href = "/";
      return;
    }

    setMessage("Không thể đăng nhập. Vui lòng thử lại.");
    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #2b0808 0%, #120404 30%, #050505 75%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "25px 16px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* ÁNH SÁNG TRANG TRÍ */}
      <div
        style={{
          position: "fixed",
          width: "320px",
          height: "320px",
          background: "rgba(229, 9, 20, 0.12)",
          filter: "blur(100px)",
          borderRadius: "50%",
          top: "-120px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "fixed",
          width: "280px",
          height: "280px",
          background: "rgba(229, 9, 20, 0.08)",
          filter: "blur(100px)",
          borderRadius: "50%",
          bottom: "-100px",
          right: "-80px",
          pointerEvents: "none",
        }}
      />

      {/* TRANG CHỦ */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "25px",
          left: "25px",
          color: "#aaa",
          textDecoration: "none",
          fontSize: "14px",
          padding: "10px 15px",
          borderRadius: "10px",
          border: "1px solid #292929",
          background: "rgba(20,20,20,0.7)",
        }}
      >
        ← Trang chủ
      </Link>

      {/* KHUNG */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background:
            "linear-gradient(145deg, rgba(27,27,27,0.98), rgba(13,13,13,0.98))",
          padding: "38px",
          borderRadius: "22px",
          border: "1px solid #292929",
          boxShadow:
            "0 25px 80px rgba(0,0,0,0.7), 0 0 35px rgba(229,9,20,0.08)",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LOGO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "8px",
            }}
          >
            🎬
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "900",
            }}
          >
            <span style={{ color: "white" }}>TRÀ ĐÁ </span>
            <span style={{ color: "#e50914" }}>DRAMA</span>
          </h1>
        </div>

        {/* TIÊU ĐỀ */}
        <p
          style={{
            textAlign: "center",
            color: "#888",
            marginTop: "10px",
            marginBottom: "32px",
            fontSize: "14px",
          }}
        >
          {isRegister
            ? "Tạo tài khoản để bắt đầu xem phim"
            : "Đăng nhập để tiếp tục xem phim"}
        </p>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <label
            style={{
              display: "block",
              color: "#ddd",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "9px",
            }}
          >
            📧 Email
          </label>

          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 15px",
              marginBottom: "21px",
              borderRadius: "11px",
              border: "1px solid #333",
              outline: "none",
              background: "#1b1b1b",
              color: "white",
              fontSize: "15px",
            }}
          />

          {/* MẬT KHẨU */}
          <label
            style={{
              display: "block",
              color: "#ddd",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "9px",
            }}
          >
            🔒 Mật khẩu
          </label>

          <div
            style={{
              position: "relative",
              marginBottom: "26px",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={
                isRegister ? "new-password" : "current-password"
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 48px 14px 15px",
                borderRadius: "11px",
                border: "1px solid #333",
                outline: "none",
                background: "#1b1b1b",
                color: "white",
                fontSize: "15px",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                padding: "5px",
              }}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* NÚT */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              background: loading
                ? "#7d0a10"
                : "linear-gradient(135deg, #e50914, #b20710)",
              color: "white",
              fontWeight: "800",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : "0 8px 25px rgba(229,9,20,0.25)",
            }}
          >
            {loading
              ? "⏳ Đang xử lý..."
              : isRegister
              ? "✨ ĐĂNG KÝ TÀI KHOẢN"
              : "🔐 ĐĂNG NHẬP"}
          </button>
        </form>

        {/* THÔNG BÁO */}
        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "13px 15px",
              borderRadius: "10px",
              background: "#1d1d1d",
              border: "1px solid #333",
              textAlign: "center",
              color: message.includes("thành công")
                ? "#4ade80"
                : "#ff7777",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}

        {/* ĐỔI ĐĂNG NHẬP / ĐĂNG KÝ */}
        <div
          style={{
            textAlign: "center",
            marginTop: "28px",
            paddingTop: "22px",
            borderTop: "1px solid #252525",
            color: "#888",
            fontSize: "14px",
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
              setPassword("");
            }}
            style={{
              marginLeft: "7px",
              border: "none",
              background: "none",
              color: "#e50914",
              cursor: "pointer",
              fontWeight: "800",
              fontSize: "14px",
            }}
          >
            {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </div>

        {/* FOOTER */}
        <p
          style={{
            textAlign: "center",
            color: "#555",
            fontSize: "12px",
            marginTop: "22px",
            marginBottom: 0,
          }}
        >
          🎬 Xem phim • Drama • Giải trí
        </p>
      </div>
    </main>
  );
}