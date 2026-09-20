"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setEmail(null);
    setOpen(false);

    window.location.href = "/";
  }

  if (loading) {
    return null;
  }

  // ==========================================
  // CHƯA ĐĂNG NHẬP
  // ==========================================
  if (!email) {
    return (
      <Link
        href="/dang-nhap"
        className="auth-login-link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 18px",
          borderRadius: "11px",
          border: "1px solid rgba(229, 9, 20, 0.75)",
          background: "rgba(0, 0, 0, 0.65)",
          color: "white",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "700",
          whiteSpace: "nowrap",
        }}
      >
        🔐 Đăng nhập / Đăng ký
      </Link>
    );
  }

  // ==========================================
  // ĐÃ ĐĂNG NHẬP
  // ==========================================
  return (
    <div
      className="auth-controls"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        position: "relative",
        whiteSpace: "nowrap",
      }}
    >
      {/* ======================================
          NÚT TÀI KHOẢN
      ====================================== */}
      <button
        className="auth-account-button"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "9px 13px",
          borderRadius: "10px",
          border: "1px solid #292929",
          background: "#111",
          color: "white",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span>👤</span>

        <span
          className="auth-email"
          style={{
            maxWidth: "160px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={email}
        >
          {email}
        </span>

        <span
          style={{
            fontSize: "11px",
            color: "#888",
          }}
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* ======================================
          NÚT ĐĂNG XUẤT BÊN NGOÀI
      ====================================== */}
      <button
        className="auth-logout-button"
        type="button"
        onClick={handleLogout}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "9px 13px",
          borderRadius: "10px",
          border: "1px solid rgba(229, 9, 20, 0.65)",
          background: "rgba(229, 9, 20, 0.10)",
          color: "#ff4d57",
          fontSize: "14px",
          fontWeight: "700",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        🚪 Đăng xuất
      </button>

      {/* ======================================
          MENU TÀI KHOẢN
      ====================================== */}
      {open && (
        <div
          className="auth-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: "95px",
            width: "240px",
            background: "#151515",
            border: "1px solid #333",
            borderRadius: "14px",
            padding: "8px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
            zIndex: 1000,
          }}
        >
          {/* ==================================
              THÔNG TIN TÀI KHOẢN
          ================================== */}
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid #292929",
              marginBottom: "5px",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              👤 Tài khoản
            </div>

            <div
              style={{
                color: "#777",
                fontSize: "12px",
                marginTop: "5px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={email}
            >
              {email}
            </div>
          </div>

          {/* ==================================
              TRANG TÀI KHOẢN
          ================================== */}
          <Link
            href="/tai-khoan"
            onClick={() => setOpen(false)}
            style={menuItemStyle}
          >
            👤 Trang tài khoản
          </Link>

          {/* ==================================
              ĐỔI MẬT KHẨU
          ================================== */}
          <Link
            href="/doi-mat-khau"
            onClick={() => setOpen(false)}
            style={menuItemStyle}
          >
            🔐 Đổi mật khẩu
          </Link>

          {/* ==================================
              PHIM CỦA TÔI
          ================================== */}
          <Link
            href="/phim-cua-toi"
            onClick={() => setOpen(false)}
            style={menuItemStyle}
          >
            🎬 Phim của tôi
          </Link>

          {/* ==================================
              LỊCH SỬ GIAO DỊCH
          ================================== */}
          <Link
            href="/lich-su-giao-dich"
            onClick={() => setOpen(false)}
            style={menuItemStyle}
          >
            💳 Lịch sử giao dịch
          </Link>

          {/* ==================================
              YÊU THÍCH
          ================================== */}
          <Link
            href="/yeu-thich"
            onClick={() => setOpen(false)}
            style={menuItemStyle}
          >
            ❤️ Yêu thích
          </Link>

          {/* ==================================
              LỊCH SỬ XEM
          ================================== */}
          <Link
            href="/lich-su"
            onClick={() => setOpen(false)}
            style={menuItemStyle}
          >
            🕘 Lịch sử xem
          </Link>

          {/* ==================================
              ĐĂNG XUẤT TRONG MENU
          ================================== */}
          <div
            style={{
              borderTop: "1px solid #292929",
              marginTop: "5px",
              paddingTop: "5px",
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "11px 12px",
                border: "none",
                borderRadius: "9px",
                background: "transparent",
                color: "#ff4d57",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// STYLE CHO CÁC ITEM TRONG MENU
// ==========================================
const menuItemStyle = {
  display: "block",
  padding: "11px 12px",
  borderRadius: "9px",
  color: "#ddd",
  textDecoration: "none",
  fontSize: "14px",
};