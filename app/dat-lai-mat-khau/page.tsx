"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DatLaiMatKhauPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const matched =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const notMatched =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setChecking(false);
      }
    });

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setChecking(false);
      }
    }

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!password) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (!confirmPassword) {
      setError("Vui lòng nhập lại mật khẩu mới.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hai mật khẩu không trùng nhau.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(
        "Không thể đặt lại mật khẩu. " + error.message
      );
      return;
    }

    setSuccess("Đặt lại mật khẩu thành công!");

    setPassword("");
    setConfirmPassword("");

    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/dang-nhap");
    }, 1500);
  }

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          color: "#aaa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Đang xác thực liên kết...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        padding: "50px 20px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
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
              🔐
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "26px",
              }}
            >
              Đặt lại mật khẩu
            </h1>

            <p
              style={{
                color: "#888",
                fontSize: "14px",
                marginTop: "9px",
              }}
            >
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* MẬT KHẨU MỚI */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  color: "#ddd",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                🔐 Mật khẩu mới
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                  disabled={loading}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 50px 13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                    background: "#0d0d0d",
                    color: "#fff",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((v) => !v)
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#999",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* NHẬP LẠI */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                color: "#ddd",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                🔐 Nhập lại mật khẩu mới
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  disabled={loading}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 85px 13px 14px",
                    borderRadius: "10px",
                    border: matched
                      ? "1px solid #22c55e"
                      : notMatched
                      ? "1px solid #ef4444"
                      : "1px solid #333",
                    background: "#0d0d0d",
                    color: "#fff",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {matched && (
                    <span
                      style={{
                        color: "#22c55e",
                        fontSize: "20px",
                        fontWeight: "800",
                      }}
                    >
                      ✓
                    </span>
                  )}

                  {notMatched && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "19px",
                        fontWeight: "800",
                      }}
                    >
                      ✕
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm((v) => !v)
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#999",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "2px",
                    }}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {matched && (
                <div
                  style={{
                    marginTop: "6px",
                    color: "#22c55e",
                    fontSize: "12px",
                  }}
                >
                  ✓ Hai mật khẩu trùng khớp
                </div>
              )}

              {notMatched && (
                <div
                  style={{
                    marginTop: "6px",
                    color: "#ef4444",
                    fontSize: "12px",
                  }}
                >
                  ✕ Hai mật khẩu chưa trùng khớp
                </div>
              )}
            </div>

            {error && (
              <div
                style={{
                  padding: "12px 14px",
                  marginBottom: "16px",
                  borderRadius: "10px",
                  background: "rgba(229,9,20,.1)",
                  border: "1px solid rgba(229,9,20,.3)",
                  color: "#ff626b",
                  fontSize: "13px",
                }}
              >
                ❌ {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: "12px 14px",
                  marginBottom: "16px",
                  borderRadius: "10px",
                  background: "rgba(34,197,94,.1)",
                  border: "1px solid rgba(34,197,94,.3)",
                  color: "#4ade80",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                ✓ {success}
                <div
                  style={{
                    marginTop: "5px",
                    color: "#888",
                    fontSize: "12px",
                  }}
                >
                  Đang chuyển về trang đăng nhập...
                </div>
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
                ? "⏳ Đang cập nhật..."
                : "🔐 Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}