"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function QuenMatKhauPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Vui lòng nhập email.");
      return;
    }

    setLoading(true);

    const redirectTo =
      `${window.location.origin}/dat-lai-mat-khau`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo,
      }
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "Nếu email này đã đăng ký tài khoản, bạn sẽ nhận được email lấy lại mật khẩu."
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/dang-nhap"
          style={{
            color: "#aaa",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Quay lại đăng nhập
        </Link>

        <div
          style={{
            marginTop: "25px",
            background: "#151515",
            border: "1px solid #292929",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 20px 50px rgba(0,0,0,.45)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "28px",
            }}
          >
            <div style={{ fontSize: "45px", marginBottom: "10px" }}>
              🔑
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "26px",
              }}
            >
              Lấy lại mật khẩu
            </h1>

            <p
              style={{
                color: "#888",
                fontSize: "14px",
                lineHeight: 1.5,
                marginTop: "9px",
              }}
            >
              Nhập email tài khoản để nhận liên kết đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                color: "#ddd",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              autoComplete="email"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                borderRadius: "10px",
                border: "1px solid #333",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            />

            {error && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(229,9,20,.1)",
                  border: "1px solid rgba(229,9,20,.3)",
                  color: "#ff626b",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                ❌ {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(34,197,94,.1)",
                  border: "1px solid rgba(34,197,94,.3)",
                  color: "#4ade80",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  marginBottom: "16px",
                }}
              >
                ✓ {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: loading ? "#555" : "#e50914",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "⏳ Đang gửi..."
                : "📧 Gửi email lấy lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}