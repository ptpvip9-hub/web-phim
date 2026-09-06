"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const POSTER = "/poster-yeu-den-muc-cam-ky.jpg";

const R2_BASE =
  "https://pub-189653ef3ebf47d2b0987a0944a4e8ac.r2.dev/yeu-den-muc-cam-ky";

const episodes = [
  {
    id: 1,
    title: "Tập 1–5",
    video: `${R2_BASE}/tap1-5.mp4`,
  },
  {
    id: 2,
    title: "Tập 6–10",
    video: `${R2_BASE}/tap6-10.mp4`,
  },
  {
    id: 3,
    title: "Tập 11–14",
    video: `${R2_BASE}/tap11-14.mp4`,
  },
  {
    id: 4,
    title: "Tập 15–19",
    video: `${R2_BASE}/tap15-19.mp4`,
  },
  {
    id: 5,
    title: "Tập 20–24",
    video: `${R2_BASE}/tap20-24.mp4`,
  },
  {
    id: 6,
    title: "Tập 25–27",
    video: `${R2_BASE}/tap25-27.mp4`,
  },
  {
    id: 7,
    title: "Tập 28–30",
    video: `${R2_BASE}/tap28-30.mp4`,
  },
  {
    id: 8,
    title: "Tập 31–34",
    video: `${R2_BASE}/tap31-34.mp4`,
  },
  {
    id: 9,
    title: "Tập 35–38",
    video: `${R2_BASE}/tap35-38.mp4`,
  },
  {
    id: 10,
    title: "Tập 39–42",
    video: `${R2_BASE}/tap39-42.mp4`,
  },
  {
    id: 11,
    title: "Tập 43–45",
    video: `${R2_BASE}/tap43-45.mp4`,
  },
  {
    id: 12,
    title: "Tập 46–51",
    video: `${R2_BASE}/tap46-51.mp4`,
  },
  {
    id: 13,
    title: "Tập 52–57",
    video: `${R2_BASE}/tap52-57.mp4`,
  },
  {
    id: 14,
    title: "Tập 58–62",
    video: `${R2_BASE}/tap58-62.mp4`,
  },
  {
    id: 15,
    title: "Tập 63–66",
    video: `${R2_BASE}/tap63-66.mp4`,
  },
  {
    id: 16,
    title: "Tập 67–69",
    video: `${R2_BASE}/tap67-69.mp4`,
  },
  {
    id: 17,
    title: "Tập 70–75",
    video: `${R2_BASE}/tap70-75.mp4`,
  },
  {
    id: 18,
    title: "Tập cuối",
    video: `${R2_BASE}/tap-cuoi.mp4`,
  },
];

export default function YeuDenMucCamKy() {
  const [currentEpisode, setCurrentEpisode] = useState(episodes[0]);
const [isVip, setIsVip] = useState(false);
const [checkingVip, setCheckingVip] = useState(true);

useEffect(() => {
  async function checkVip() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsVip(false);
      setCheckingVip(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("is_vip, vip_expires_at")
      .eq("user_id", user.id)
      .single();

    if (
      data?.is_vip === true &&
      data?.vip_expires_at &&
      new Date(data.vip_expires_at) > new Date()
    ) {
      setIsVip(true);
    } else {
      setIsVip(false);
    }

    setCheckingVip(false);
  }

  checkVip();
}, []);
  const changeEpisode = (episode: (typeof episodes)[number]) => {
  // Tập 1-19 miễn phí
  // Tập 20+ chỉ VIP mới xem được
  if (episode.id >= 5 && !isVip) {
  const buy = confirm(
    "🔒 Nội dung này cần mở khóa.\n\n" +
    "💰 Giá mua bộ phim: 20.000đ\n\n" +
    "Bạn có muốn mua quyền xem các tập 20+ không?"
  );

  if (buy) {
    alert("Tính năng thanh toán sẽ được mở ở bước tiếp theo.");
  }

  return;

  }

  setCurrentEpisode(episode);

  setTimeout(() => {
    document.getElementById("video-player")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 100);
};

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5">

          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>

            <span className="text-xl font-black tracking-wide">
              TRÀ ĐÁ{" "}
              <span className="text-red-500">
                DRAMA
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-gray-400 transition hover:text-white"
            >
              Trang chủ
            </Link>

            <Link
              href="/phim"
              className="text-gray-400 transition hover:text-white"
            >
              Phim
            </Link>

            <Link
              href="/phim/yeu-den-muc-cam-ky"
              className="text-white"
            >
              Phim mới
            </Link>
          </nav>

          <div className="hidden md:block">
            <div className="flex h-10 w-56 items-center rounded-full border border-white/10 bg-white/5 px-4">
              <input
                type="text"
                placeholder="Tìm phim..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
              <span>🔍</span>
            </div>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${POSTER}")`,
          }}
        />

        <div className="absolute inset-0 bg-black/75" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/30" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">

          <div className="max-w-3xl">

            <p className="text-sm font-bold uppercase tracking-[0.35em] text-red-500">
              PHIM NGẮN • DRAMA
            </p>

            <h1 className="mt-5 font-serif text-5xl font-black leading-tight md:text-7xl">
              YÊU ĐẾN MỨC
              <br />
              CẤM KỴ
            </h1>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">

              <span className="rounded-md bg-red-600 px-3 py-1.5 font-bold">
                FULL
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                Drama
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                75+ TẬP
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                HD
              </span>

            </div>

            <p className="mt-7 max-w-2xl text-base leading-8 text-gray-300 md:text-lg">
              Một câu chuyện tình yêu đầy day dứt,
              nơi những cảm xúc tưởng như không thể
              lại trở thành một mối tình không thể
              thoát khỏi.
            </p>

            <button
              onClick={() => {
                document
                  .getElementById("video-player")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }}
              className="mt-8 rounded-lg bg-red-600 px-7 py-3.5 font-bold transition hover:scale-105 hover:bg-red-700"
            >
              ▶ Xem phim
            </button>

          </div>

        </div>
      </section>

      {/* VIDEO */}
      <section
        id="video-player"
        className="mx-auto max-w-6xl px-5 py-14"
      >

        <div className="mb-7 flex items-end justify-between gap-5">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              ĐANG XEM
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Yêu Đến Mức Cấm Kỵ
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
            {currentEpisode.title}
          </span>

        </div>

        {/* VIDEO PLAYER */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">

          <video
            key={currentEpisode.video}
            className="block aspect-video w-full bg-black"
            controls
            playsInline
            preload="metadata"
          >
            <source
              src={currentEpisode.video}
              type="video/mp4"
            />

            Trình duyệt của bạn không hỗ trợ phát video.
          </video>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <p className="text-sm text-gray-500">
            Đang phát:{" "}
            <span className="text-gray-300">
              {currentEpisode.title}
            </span>
          </p>

          <p className="text-sm text-gray-600">
            {currentEpisode.id} / {episodes.length}
          </p>

        </div>

      </section>

      {/* EPISODES */}
      <section className="border-y border-white/10 bg-zinc-950">

        <div className="mx-auto max-w-6xl px-5 py-14">

          <div className="mb-8">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              DANH SÁCH TẬP
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Các tập phim
            </h2>

            <p className="mt-2 text-gray-500">
              Chọn nhóm tập muốn xem
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">

            {episodes.map((episode) => {

              const isActive =
                currentEpisode.id === episode.id;

              const isFinal =
                episode.title === "Tập cuối";

              return (
                <button
                  key={episode.id}
                  onClick={() => changeEpisode(episode)}
                  className={`group rounded-2xl border p-5 text-left transition ${
                    isActive
                      ? "border-red-500 bg-red-600/10"
                      : "border-white/10 bg-white/[0.03] hover:border-red-500/50 hover:bg-white/5"
                  }`}
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                        {isFinal ? "KẾT THÚC" : `PHẦN ${episode.id}`}
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {episode.title}
                      </h3>

                    </div>

                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${
                        isActive
                          ? "bg-red-600"
                          : "bg-white/10 group-hover:bg-red-600"
                      }`}
                    >
                      ▶
                    </span>

                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    {isActive
                      ? "● Đang phát"
                      : "Nhấn để xem"}
                  </p>

                </button>
              );
            })}

          </div>

        </div>

      </section>

      {/* INFORMATION */}
      <section className="mx-auto max-w-6xl px-5 py-16">

        <div className="grid gap-10 md:grid-cols-[280px_1fr]">

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">

            <img
              src={POSTER}
              alt="Yêu Đến Mức Cấm Kỵ"
              className="h-full w-full object-cover"
            />

          </div>

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              THÔNG TIN PHIM
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Yêu Đến Mức Cấm Kỵ
            </h2>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-md bg-red-600/20 px-3 py-2 text-sm text-red-400">
                🎭 Drama
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                ❤️ Tình cảm
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                📺 75+ tập
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                🎬 HD
              </span>

            </div>

            <p className="mt-7 leading-8 text-gray-400">
              Một câu chuyện tình yêu đầy day dứt,
              nơi những cảm xúc tưởng như không thể
              lại trở thành một mối tình không thể
              thoát khỏi.
            </p>

            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <p className="text-sm font-bold text-white">
                📌 Trạng thái
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Đã cập nhật đầy đủ các tập phim.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">

        <div className="mx-auto max-w-6xl px-5 py-10">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

            <div>

              <p className="text-xl font-black">
                🎬 TRÀ ĐÁ{" "}
                <span className="text-red-500">
                  DRAMA
                </span>
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Xem phim drama hay mỗi ngày.
              </p>

            </div>

            <div className="flex gap-6 text-sm text-gray-500">

              <Link
                href="/"
                className="transition hover:text-white"
              >
                Trang chủ
              </Link>

              <Link
                href="/phim"
                className="transition hover:text-white"
              >
                Kho phim
              </Link>

            </div>

          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-xs text-gray-600">
            © 2026 TRÀ ĐÁ DRAMA. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}