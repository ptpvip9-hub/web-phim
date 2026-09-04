"use client";

import { useState } from "react";

export default function YeuDenMucCamKyPage() {
  const danhSachTap = [
    {
      ten: "Tập 1 - 5",
      video: "/videos/yeu-den-muc-cam-ky/tap1-5.mp4",
      vip: false,
    },
    {
      ten: "Tập 6 - 10",
      video: "/videos/yeu-den-muc-cam-ky/tap6-10.mp4",
      vip: true,
    },
    {
      ten: "Tập 11 - 15",
      video: "/videos/yeu-den-muc-cam-ky/tap11-15.mp4",
      vip: true,
    },
    {
      ten: "Tập 16 - 20",
      video: "/videos/yeu-den-muc-cam-ky/tap16-20.mp4",
      vip: true,
    },
  ];

  const [tapDangXem, setTapDangXem] = useState(0);
  const [thongBao, setThongBao] = useState("");

  function chonTap(index: number) {
    if (danhSachTap[index].vip) {
      setThongBao(
        "🔒 Đây là tập VIP. Hãy đăng ký VIP để tiếp tục xem!"
      );
      return;
    }

    setThongBao("");
    setTapDangXem(index);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#080808",
        color: "white",
        padding: "30px 15px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            marginBottom: "10px",
          }}
        >
          Yêu Đến Mức Cấm Kỵ
        </h1>

        <p
          style={{
            color: "#aaa",
            marginBottom: "20px",
          }}
        >
          Đang xem: {danhSachTap[tapDangXem].ten}
        </p>

        {/* VIDEO */}
        <div
          style={{
            backgroundColor: "black",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <video
            key={danhSachTap[tapDangXem].video}
            src={danhSachTap[tapDangXem].video}
            controls
            preload="metadata"
            style={{
              width: "100%",
              display: "block",
              backgroundColor: "black",
              maxHeight: "700px",
            }}
          />
        </div>

        {/* DANH SÁCH TẬP */}
        <h2
          style={{
            marginTop: "30px",
            marginBottom: "15px",
          }}
        >
          Danh sách tập
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {danhSachTap.map((tap, index) => (
            <button
              key={tap.ten}
              onClick={() => chonTap(index)}
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor:
                  tapDangXem === index
                    ? "#e50914"
                    : tap.vip
                    ? "#3a2b00"
                    : "#292929",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {tap.vip ? "🔒 VIP - " : ""}
              {tap.ten}
            </button>
          ))}
        </div>

        {/* THÔNG BÁO VIP */}
        {thongBao && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#241c00",
              borderRadius: "10px",
              color: "#ffd54a",
            }}
          >
            {thongBao}
          </div>
        )}

        {/* GÓI VIP */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#151515",
            borderRadius: "12px",
          }}
        >
          <h2>✨ Nâng cấp VIP</h2>

          <p style={{ color: "#aaa" }}>
            Đăng ký VIP để xem toàn bộ các tập mới nhất.
          </p>

          <button
            style={{
              padding: "12px 25px",
              backgroundColor: "#e50914",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Đăng ký VIP
          </button>
        </div>
      </div>
    </main>
  );
}