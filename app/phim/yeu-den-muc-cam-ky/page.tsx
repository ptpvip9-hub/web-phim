"use client";

import { useState } from "react";

const VIDEO_URL =
  "https://pub-189653ef3ebf47d2b0987a0944a4e8ac.r2.dev/tap1-5.mp4";

const episodes = [
  {
    id: 1,
    title: "Tập 1",
    video: VIDEO_URL,
  },
];

export default function YeuDenMucCamKy() {
  const [currentEpisode, setCurrentEpisode] = useState(episodes[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const changeEpisode = (episode: (typeof episodes)[0]) => {
    setCurrentEpisode(episode);
    setIsPlaying(false);

    setTimeout(() => {
      document.getElementById("video-player")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <a
            href="/"
            className="text-xl font-bold tracking-wide"
          >
            🎬 TRÀ ĐÁ DRAMA
          </a>

          <nav className="hidden gap-7 text-sm text-gray-300 md:flex">
            <a
              href="/"
              className="transition hover:text-white"
            >
              Trang chủ
            </a>

            <a
              href="/#phim"
              className="transition hover:text-white"
            >
              Phim
            </a>

            <a
              href="/#phim-moi"
              className="transition hover:text-white"
            >
              Phim mới
            </a>
          </nav>

        </div>
      </header>


      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-white/10">

        {/* nền đỏ */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/50 via-black/80 to-black" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">

          <div className="max-w-4xl">

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
              PHIM NGẮN • DRAMA
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">
              YÊU ĐẾN MỨC
              <br />
              CẤM KỴ
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
              Một câu chuyện tình yêu đầy day dứt,
              nơi những cảm xúc tưởng như không thể
              lại trở thành một mối tình không thể
              thoát khỏi.
            </p>

            <button
              onClick={() =>
                document.getElementById("video-player")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
              className="mt-7 rounded-lg bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-500"
            >
              ▶ Xem phim
            </button>

          </div>

        </div>
      </section>


      {/* ================= VIDEO ================= */}
      <section
        id="video-player"
        className="mx-auto max-w-6xl px-4 py-10"
      >

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
              ĐANG XEM
            </p>

            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Yêu Đến Mức Cấm Kỵ
            </h2>

          </div>

          <div className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
            {currentEpisode.title}
          </div>

        </div>


        {/* VIDEO PLAYER */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">

          <video
            key={currentEpisode.video}
            className="block aspect-video w-full bg-black"
            controls
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source
              src={currentEpisode.video}
              type="video/mp4"
            />

            Trình duyệt của bạn không hỗ trợ phát video.
          </video>

        </div>


        {/* THÔNG TIN VIDEO */}
        <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950 p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-lg font-semibold">
                Yêu Đến Mức Cấm Kỵ - {currentEpisode.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {isPlaying
                  ? "Đang phát video..."
                  : "Nhấn nút Play để xem phim."}
              </p>

            </div>

            <span className="w-fit rounded-full bg-red-600/10 px-3 py-1 text-xs text-red-400">
              HD
            </span>

          </div>

        </div>

      </section>


      {/* ================= DANH SÁCH TẬP ================= */}
      <section
        id="tap-phim"
        className="mx-auto max-w-6xl px-4 pb-14"
      >

        <div className="mb-6">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            DANH SÁCH
          </p>

          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Các tập phim
          </h2>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {episodes.map((episode) => {

            const active =
              currentEpisode.id === episode.id;

            return (
              <button
                key={episode.id}
                onClick={() => changeEpisode(episode)}
                className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-red-600 bg-red-950/30"
                    : "border-white/10 bg-zinc-950 hover:border-white/30 hover:bg-zinc-900"
                }`}
              >

                {/* SỐ TẬP */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    active
                      ? "bg-red-600 text-white"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {String(episode.id).padStart(2, "0")}
                </div>


                {/* TÊN TẬP */}
                <div className="min-w-0 flex-1">

                  <p className="font-semibold">
                    {episode.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    Yêu Đến Mức Cấm Kỵ
                  </p>

                </div>


                {/* NÚT PLAY */}
                <div
                  className={`text-lg ${
                    active
                      ? "text-red-500"
                      : "text-gray-600 group-hover:text-red-500"
                  }`}
                >
                  ▶
                </div>

              </button>
            );
          })}

        </div>

      </section>


      {/* ================= GIỚI THIỆU ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-16">

        <div className="rounded-xl border border-white/10 bg-zinc-950 p-6 md:p-8">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            GIỚI THIỆU PHIM
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Yêu Đến Mức Cấm Kỵ
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-400">
            Có những tình cảm càng cố gắng chối bỏ
            lại càng trở nên sâu đậm. Giữa những ranh
            giới không thể vượt qua, tình yêu của họ
            dần trở thành một mối chấp niệm không dễ
            buông bỏ.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            ❤️ Cảm ơn mọi người đã ủng hộ Trà Đá Drama.
          </p>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 bg-zinc-950">

        <div className="mx-auto max-w-7xl px-4 py-8 text-center">

          <p className="font-semibold">
            🎬 TRÀ ĐÁ DRAMA
          </p>

          <p className="mt-2 text-xs text-gray-600">
            © 2026 Trà Đá Drama. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}