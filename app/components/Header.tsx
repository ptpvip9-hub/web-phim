"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";

const movies = [
  {
    title: "Yêu Đến Mức Cấm Kỵ",
    info: "Drama • Tập 1–5",
    poster: "/poster-yeu-den-muc-cam-ky.jpg",
    href: "/phim/yeu-den-muc-cam-ky",
  },
  {
    title: "Chấp Niệm Trầm Hoang",
    info: "Drama • Tình cảm",
    poster: "/poster-chap-niem-tram-hoang.jpg",
    href: "/phim/chap-niem-tram-hoang",
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  if (pathname === "/dang-nhap") {
    return null;
  }

  const keyword = search.trim().toLowerCase();

  const results = keyword
    ? movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
      )
    : [];

  function handleSearchSubmit() {
    if (results.length > 0) {
      router.push(results[0].href);
      setSearch("");
      setShowResults(false);
    } else if (keyword) {
      router.push(`/phim?search=${encodeURIComponent(search.trim())}`);
      setShowResults(false);
    }
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "rgba(0,0,0,0.97)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          height: "78px",
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: "32px",
          boxSizing: "border-box",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "30px",
              lineHeight: "1",
            }}
          >
            🎬
          </span>

          <span
            style={{
              display: "inline-block",
              fontSize: "24px",
              fontWeight: 900,
              lineHeight: "1",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                opacity: 1,
              }}
            >
              TRÀ ĐÁ
            </span>

            <span
              style={{
                color: "#ff1a2a",
                opacity: 1,
                marginLeft: "5px",
              }}
            >
              DRAMA
            </span>
          </span>
        </Link>

        {/* MENU */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            height: "100%",
          }}
        >
          <Link
            href="/"
            style={{
              color: pathname === "/" ? "#fff" : "#999",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: pathname === "/" ? 700 : 500,
              whiteSpace: "nowrap",
            }}
          >
            Trang chủ
          </Link>

          <Link
            href="/phim"
            style={{
              color: pathname.startsWith("/phim") ? "#fff" : "#999",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: pathname.startsWith("/phim") ? 700 : 500,
              whiteSpace: "nowrap",
            }}
          >
            Phim
          </Link>

          <Link
            href="/phim"
            style={{
              color: "#999",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Phim mới
          </Link>
        </nav>

        {/* KHOẢNG TRỐNG */}
        <div style={{ flex: 1 }} />

        {/* TÌM KIẾM */}
        <div
          style={{
            position: "relative",
            width: "270px",
            flexShrink: 1,
          }}
        >
          <input
            type="text"
            value={search}
            placeholder="Tìm phim..."
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              if (search.trim()) {
                setShowResults(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }

              if (e.key === "Escape") {
                setShowResults(false);
              }
            }}
            style={{
              width: "100%",
              height: "48px",
              boxSizing: "border-box",
              padding: "0 48px 0 18px",
              borderRadius: "25px",
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
              outline: "none",
              fontSize: "14px",
            }}
          />

          <button
            type="button"
            onClick={handleSearchSubmit}
            style={{
              position: "absolute",
              right: "5px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "38px",
              height: "38px",
              border: "none",
              borderRadius: "50%",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "19px",
            }}
          >
            🔍
          </button>

          {/* KẾT QUẢ TÌM KIẾM */}
          {showResults && keyword && (
            <div
              style={{
                position: "absolute",
                top: "56px",
                left: 0,
                right: 0,
                background: "#151515",
                border: "1px solid #333",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 15px 40px rgba(0,0,0,0.7)",
              }}
            >
              {results.length > 0 ? (
                results.map((movie) => (
                  <Link
                    key={movie.href}
                    href={movie.href}
                    onClick={() => {
                      setSearch("");
                      setShowResults(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px",
                      textDecoration: "none",
                      color: "white",
                      borderBottom: "1px solid #252525",
                    }}
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      style={{
                        width: "42px",
                        height: "58px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {movie.title}
                      </div>

                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "12px",
                          color: "#888",
                        }}
                      >
                        {movie.info}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div
                  style={{
                    padding: "18px",
                    textAlign: "center",
                    color: "#888",
                    fontSize: "14px",
                  }}
                >
                  Không tìm thấy phim "{search}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* TÀI KHOẢN */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}