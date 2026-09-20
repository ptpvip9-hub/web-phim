"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DoiMatKhauPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // KIỂM TRA ĐĂNG NHẬP
  // ==========================================
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/dang-nhap");
        return;
      }

      setEmail(user.email ?? "");
      setChecking(false);
    }

    checkUser();
  }, [router]);

  // ==========================================
  // KIỂM TRA 2 MẬT KHẨU MỚI
  // ==========================================
  const passwordMatched =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const passwordNotMatched =
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  // ==========================================
  // ĐỔI MẬT KHẨU
  // ==========================================
  async function handleChangePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ------------------------------
    // MẬT KHẨU HIỆN TẠI
    // ------------------------------
    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    // ------------------------------
    // MẬT KHẨU MỚI
    // ------------------------------
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    // ------------------------------
    // NHẬP LẠI MẬT KHẨU
    // ------------------------------
    if (!confirmPassword) {
      setError("Vui lòng nhập lại mật khẩu mới.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và mật khẩu nhập lại không khớp.");
      return;
    }

    // ------------------------------
    // KHÔNG CHO GIỐNG MK CŨ
    // ------------------------------
    if (currentPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setLoading(true);

    // ==========================================
    // LẤY USER
    // ==========================================
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      setLoading(false);
      router.replace("/dang-nhap");
      return;
    }

    // ==========================================
    // KIỂM TRA MẬT KHẨU HIỆN TẠI
    // ==========================================
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (signInError) {
      setLoading(false);
      setError("Mật khẩu hiện tại không chính xác.");
      return;
    }

    // ==========================================
    // CẬP NHẬT MẬT KHẨU
    // ==========================================
    const { error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    setLoading(false);

    if (updateError) {
      setError(
        "Không thể đổi mật khẩu. " + updateError.message
      );
      return;
    }

    // ==========================================
    // THÀNH CÔNG
    // ==========================================
    setSuccess("Đổi mật khẩu thành công!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/tai-khoan");
    }, 1500);
  }

  // ==========================================
  // ĐANG KIỂM TRA
  // ==========================================
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
          fontSize: "14px",
        }}
      >
        Đang kiểm tra tài khoản...
      </main>
    );
  }

  // ==========================================
  // GIAO DIỆN
  // ==========================================
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        {/* QUAY LẠI */}
        <button
          type="button"
          onClick={() => router.push("/tai-khoan")}
          style={{
            border: "none",
            background: "transparent",
            color: "#aaa",
            fontSize: "14px",
            cursor: "pointer",
            padding: "0",
            marginBottom: "25px",
          }}
        >
          ← Quay lại tài khoản
        </button>

        {/* KHUNG */}
        <div
          style={{
            background: "#151515",
            border: "1px solid #292929",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          }}
        >
          {/* TIÊU ĐỀ */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                fontSize: "44px",
                marginBottom: "10px",
              }}
            >
              🔐
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: "800",
              }}
            >
              Đổi mật khẩu
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#888",
                fontSize: "14px",
              }}
            >
              Đổi mật khẩu cho tài khoản của bạn
            </p>
          </div>

          {/* EMAIL */}
          <div
            style={{
              padding: "12px 14px",
              background: "#101010",
              border: "1px solid #252525",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                color: "#777",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              Tài khoản
            </div>

            <div
              style={{
                color: "#ddd",
                fontSize: "14px",
                fontWeight: "600",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            {/* ==================================
                MẬT KHẨU HIỆN TẠI
            ================================== */}
            <PasswordInput
              label="🔑 Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              setShow={setShowCurrent}
              autoComplete="current-password"
              disabled={loading}
            />

            {/* ==================================
                MẬT KHẨU MỚI
            ================================== */}
            <PasswordInput
              label="🔐 Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              setShow={setShowNew}
              autoComplete="new-password"
              disabled={loading}
            />

            {/* ==================================
                NHẬP LẠI MẬT KHẨU
            ================================== */}
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

              <div
                style={{
                  position: "relative",
                }}
              >
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
                    padding: "13px 90px 13px 14px",
                    borderRadius: "10px",
                    border:
                      passwordMatched
                        ? "1px solid #22c55e"
                        : passwordNotMatched
                        ? "1px solid #ef4444"
                        : "1px solid #333",
                    background: "#0d0d0d",
                    color: "#fff",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />

                {/* TRẠNG THÁI + MẮT */}
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
                  {/* DẤU KIỂM TRA */}
                  {passwordMatched && (
                    <span
                      style={{
                        color: "#22c55e",
                        fontSize: "19px",
                        fontWeight: "800",
                      }}
                      title="Mật khẩu trùng khớp"
                    >
                      ✓
                    </span>
                  )}

                  {passwordNotMatched && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "19px",
                        fontWeight: "800",
                      }}
                      title="Mật khẩu không trùng khớp"
                    >
                      ✕
                    </span>
                  )}

                  {/* NÚT MẮT */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm((prev) => !prev)
                    }
                    disabled={loading}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#999",
                      cursor: "pointer",
                      padding: "3px",
                      fontSize: "18px",
                      lineHeight: 1,
                    }}
                    title={
                      showConfirm
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* TEXT KIỂM TRA */}
              {passwordMatched && (
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

              {passwordNotMatched && (
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

            {/* ==================================
                THÔNG BÁO LỖI
            ================================== */}
            {error && (
              <div
                style={{
                  padding: "12px 14px",
                  marginBottom: "16px",
                  borderRadius: "10px",
                  background: "rgba(229, 9, 20, 0.10)",
                  border:
                    "1px solid rgba(229, 9, 20, 0.30)",
                  color: "#ff626b",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                ❌ {error}
              </div>
            )}

            {/* ==================================
                THÀNH CÔNG
            ================================== */}
            {success && (
              <div
                style={{
                  padding: "12px 14px",
                  marginBottom: "16px",
                  borderRadius: "10px",
                  background: "rgba(34, 197, 94, 0.10)",
                  border:
                    "1px solid rgba(34, 197, 94, 0.30)",
                  color: "#4ade80",
                  fontSize: "13px",
                  lineHeight: 1.5,
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
                  Đang quay lại trang tài khoản...
                </div>
              </div>
            )}

            {/* ==================================
                NÚT ĐỔI
            ================================== */}
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
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "⏳ Đang xử lý..."
                : "🔐 Đổi mật khẩu"}
            </button>
          </form>

          {/* GỢI Ý */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "10px",
              background: "#101010",
              border: "1px solid #252525",
              color: "#777",
              fontSize: "12px",
              lineHeight: 1.6,
            }}
          >
            💡 Mật khẩu mới phải có ít nhất 6 ký tự và phải
            khác mật khẩu hiện tại.
          </div>
        </div>
      </div>
    </main>
  );
}

// ==========================================
// COMPONENT Ô MẬT KHẨU
// ==========================================
type PasswordInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  autoComplete: string;
  disabled: boolean;
};

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  show,
  setShow,
  autoComplete,
  disabled,
}: PasswordInputProps) {
  return (
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
        {label}
      </label>

      <div
        style={{
          position: "relative",
        }}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
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
          onClick={() => setShow((prev) => !prev)}
          disabled={disabled}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            color: "#999",
            cursor: "pointer",
            padding: "4px",
            fontSize: "18px",
            lineHeight: 1,
          }}
          title={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}