"use client";

import Link from "next/link";
import { useState } from "react";

const POSTER = "/poster-yeu-den-muc-cam-ky.jpg";

const VIDEO_URL =
  "https://pub-189653ef3ebf47d2b0987a0944a4e8ac.r2.dev/tap1-5.mp4";

const episodes = [
  {
    id: 1,
    title: "Tập 1–5",
    video: VIDEO_URL,
  },
];

export default function YeuDenMucCamKy() {
  const [currentEpisode, setCurrentEpisode] = useState(episodes[0]);

  const changeEpisode = (episode: (typeof episodes)[0]) => {
    setCurrentEpisode(episode);

    setTimeout(() => {
      document
        .getElementById("video-player")
        ?.scrollIntoView({
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

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="text-3xl">
              🎬
            </span>

            <span className="text-xl font-black">
              TRÀ ĐÁ{" "}
              <span className="text-red-500">
                DRAMA
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              href="/"
              className="font-medium text-gray-400 transition hover:text-white"
            >
              Trang chủ
            </Link>

            <Link
              href="/phim"
              className="font-medium text-gray-400 transition hover:text-white"
            >
              Phim
            </Link>

            <Link
              href="/phim/yeu-den-muc-cam-ky"
              className="font-medium text-white"
            >
              Phim mới
            </Link>

          </nav>

          <div className="hidden md:block">
            <div className="flex h-10 w-64 items-center rounded-full border border-white/10 bg-white/5 px-4">

              <input
                type="text"
                placeholder="Tìm phim..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />

              <span>
                🔍
              </span>

            </div>
          </div>

        </div>
      </header>

      {/* HERO PHIM */}
      <section className="relative overflow-hidden border-b border-white/10">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${POSTER}")`,
          }}
        />

        <div className="absolute inset-0 bg-black/75" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />

        <div className="relative mx-auto max-w-7xl px-5 py-24">

          <div className="max-w-3xl">

            <p className="text-sm font-bold uppercase tracking-[0.35em] text-red-500">
              PHIM NGẮN • DRAMA
            </p>

            <h1 className="mt-5 font-serif text-5xl font-black leading-tight md:text-7xl">
              Yêu Đến Mức
              <br />
              Cấm Kỵ
            </h1>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">

              <span className="rounded-md bg-red-600 px-3 py-1.5 font-bold">
                MỚI
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                Drama
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                Tập 1–5
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

      {/* KHU VỰC XEM PHIM */}
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

        {/* VIDEO */}
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

        <p className="mt-4 text-sm text-gray-500">
          Nếu video chưa phát, hãy nhấn nút ▶ trên trình phát.
        </p>

      </section>

      {/* DANH SÁCH TẬP */}
      <section className="border-y border-white/10 bg-zinc-950">

        <div className="mx-auto max-w-6xl px-5 py-14">

          <div className="mb-8">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              DANH SÁCH TẬP
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Các tập phim
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">

            {episodes.map((episode) => (

              <button
                key={episode.id}
                onClick={() => changeEpisode(episode)}
                className={`group rounded-xl border p-5 text-left transition ${
                  currentEpisode.id === episode.id
                    ? "border-red-500 bg-red-600/10"
                    : "border-white/10 bg-white/[0.03] hover:border-red-500/50 hover:bg-white/5"
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="font-bold">
                    {episode.title}
                  </span>

                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      currentEpisode.id === episode.id
                        ? "bg-red-600"
                        : "bg-white/10"
                    }`}
                  >
                    ▶
                  </span>

                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Xem ngay
                </p>

              </button>

            ))}

          </div>

        </div>

      </section>

      {/* THÔNG TIN PHIM */}
      <section className="mx-auto max-w-6xl px-5 py-16">

        <div className="grid gap-10 md:grid-cols-[260px_1fr]">

          <div className="overflow-hidden rounded-2xl border border-white/10">
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
                📺 Tập 1–5
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                HD
              </span>

            </div>

            <p className="mt-7 leading-8 text-gray-400">
              Một câu chuyện tình yêu đầy day dứt,
              nơi những cảm xúc tưởng như không thể
              lại trở thành một mối tình không thể
              thoát khỏi.
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">

        <div className="mx-auto max-w-6xl px-5 py-10">

          <div className="flex flex-col justify-between gap-5 md:flex-row">

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
                className="hover:text-white"
              >
                Trang chủ
              </Link>

              <Link
                href="/phim"
                className="hover:text-white"
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