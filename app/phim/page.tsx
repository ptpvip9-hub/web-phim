"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { movies } from "@/lib/movies";

export default function PhimPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Tất cả");

  const genres = [
    "Tất cả",
    "Drama",
    "Tình cảm",
    "Ngôn tình",
    "Tổng tài",
  ];

  const filteredMovies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesSearch =
        !keyword ||
        movie.title.toLowerCase().includes(keyword) ||
        movie.slug.toLowerCase().includes(keyword) ||
        movie.genre.toLowerCase().includes(keyword);

      const matchesGenre =
        genre === "Tất cả" ||
        movie.genre.toLowerCase().includes(
          genre.toLowerCase()
        );

      return matchesSearch && matchesGenre;
    });
  }, [search, genre]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-5">

          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="text-3xl">
              🎬
            </span>

            <span className="text-lg font-black sm:text-xl">
              TRÀ ĐÁ{" "}
              <span className="text-red-500">
                DRAMA
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold md:flex">

            <Link
              href="/"
              className="text-gray-400 transition hover:text-white"
            >
              Trang chủ
            </Link>

            <Link
              href="/phim"
              className="text-white"
            >
              Kho phim
            </Link>

            <Link
              href="/yeu-thich"
              className="text-gray-400 transition hover:text-white"
            >
              ❤️ Yêu thích
            </Link>

            <Link
              href="/lich-su"
              className="text-gray-400 transition hover:text-white"
            >
              🕘 Lịch sử
            </Link>

          </nav>

          <Link
            href="/tai-khoan"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            👤 Tài khoản
          </Link>

        </div>
      </header>


      {/* HERO */}
      <section className="border-b border-white/10 bg-gradient-to-b from-red-950/20 to-transparent">

        <div className="mx-auto max-w-7xl px-5 pb-12 pt-14">

          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
            TRÀ ĐÁ DRAMA
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            Kho phim
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
            Khám phá những bộ phim drama, tình cảm và ngôn tình
            đang có trên TRÀ ĐÁ DRAMA.
          </p>


          {/* SEARCH */}
          <div className="mt-8 max-w-2xl">

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Tìm tên phim..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-4 pl-12 pr-12 text-sm text-white outline-none placeholder:text-gray-500 transition focus:border-red-500/60 focus:bg-white/[0.08]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                >
                  ✕
                </button>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* FILTER */}
      <section className="mx-auto max-w-7xl px-5 pt-8">

        <div className="flex flex-wrap gap-2">

          {genres.map((item) => {

            const active = genre === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setGenre(item)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-red-600 text-white shadow-lg shadow-red-950/30"
                    : "border border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}

        </div>

      </section>


      {/* MOVIE LIST */}
      <section className="mx-auto max-w-7xl px-5 py-10">

        <div className="mb-7 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
              {search
                ? "KẾT QUẢ TÌM KIẾM"
                : "TẤT CẢ PHIM"}
            </p>

            <h2 className="mt-1 text-2xl font-black md:text-3xl">
              {search
                ? `Tìm thấy ${filteredMovies.length} phim`
                : `${filteredMovies.length} bộ phim`}
            </h2>

          </div>

          {(search || genre !== "Tất cả") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setGenre("Tất cả");
              }}
              className="text-sm font-bold text-red-500 hover:text-red-400"
            >
              Xóa bộ lọc
            </button>
          )}

        </div>


        {filteredMovies.length === 0 ? (

          /* KHÔNG CÓ KẾT QUẢ */
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-5 py-20 text-center">

            <div className="text-5xl">
              🔍
            </div>

            <h3 className="mt-5 text-xl font-black">
              Không tìm thấy phim
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Thử tìm bằng tên phim khác nhé.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setGenre("Tất cả");
              }}
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-black transition hover:bg-red-700"
            >
              Xem tất cả phim
            </button>

          </div>

        ) : (

          /* DANH SÁCH PHIM */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {filteredMovies.map((movie) => (

              <Link
                key={movie.slug}
                href={movie.href}
                className="group block"
              >

                <div className="relative h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl transition hover:-translate-y-1 hover:border-red-500/40 sm:h-[400px]">

                  {/* POSTER */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/5" />


                  {/* BADGE */}
                  {movie.badge && (
                    <span className="absolute left-4 top-4 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-black shadow-lg">
                      {movie.badge}
                    </span>
                  )}


                  {/* EPISODES */}
                  <span className="absolute right-4 top-4 rounded-lg border border-white/20 bg-black/70 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                    {movie.episodes}
                  </span>


                  {/* INFO */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">

                    <h3 className="max-w-[80%] text-xl font-black leading-tight sm:text-2xl">
                      {movie.title}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-gray-300">
                      {movie.genre}
                    </p>

                    <p className="mt-2 max-w-[80%] text-xs leading-5 text-gray-400">
                      {movie.description}
                    </p>

                    <span className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 font-black shadow-xl transition group-hover:scale-110 group-hover:bg-red-500 sm:bottom-6 sm:right-6">
                      ▶
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>


      {/* VIP */}
      <section className="mx-auto max-w-7xl px-5 pb-16">

        <div className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-zinc-900 to-red-950/30 p-7 md:p-10">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">

            <div>

              <span className="rounded-full bg-yellow-500/15 px-3 py-1.5 text-xs font-black text-yellow-400">
                👑 THÀNH VIÊN VIP
              </span>

              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                Xem toàn bộ phim với VIP
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-400">
                Đăng ký VIP để mở quyền xem toàn bộ kho phim
                trong thời gian gói còn hiệu lực.
              </p>

            </div>

            <Link
              href="/tai-khoan#vip-packages"
              className="shrink-0 rounded-xl bg-yellow-500 px-6 py-3.5 font-black text-black transition hover:bg-yellow-400"
            >
              👑 Xem gói VIP
            </Link>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">

        <div className="mx-auto max-w-7xl px-5 py-12">

          <div className="grid gap-10 md:grid-cols-3">

            <div>

              <div className="flex items-center gap-3">

                <span className="text-3xl">
                  🎬
                </span>

                <span className="text-xl font-black">
                  TRÀ ĐÁ{" "}
                  <span className="text-red-500">
                    DRAMA
                  </span>
                </span>

              </div>

              <p className="mt-4 max-w-md text-sm leading-7 text-gray-500">
                Xem phim drama hay mỗi ngày. Lưu lịch sử,
                tiếp tục xem và quản lý những bộ phim yêu thích
                của bạn.
              </p>

            </div>


            <div>

              <h3 className="font-black">
                Khám phá
              </h3>

              <div className="mt-4 space-y-3 text-sm text-gray-500">

                <Link
                  href="/"
                  className="block hover:text-white"
                >
                  Trang chủ
                </Link>

                <Link
                  href="/phim"
                  className="block hover:text-white"
                >
                  Kho phim
                </Link>

                <Link
                  href="/yeu-thich"
                  className="block hover:text-white"
                >
                  ❤️ Yêu thích
                </Link>

                <Link
                  href="/lich-su"
                  className="block hover:text-white"
                >
                  🕘 Lịch sử xem
                </Link>

              </div>

            </div>


            <div>

              <h3 className="font-black">
                Tài khoản
              </h3>

              <div className="mt-4 space-y-3 text-sm text-gray-500">

                <Link
                  href="/tai-khoan"
                  className="block hover:text-white"
                >
                  👤 Trang tài khoản
                </Link>

                <Link
                  href="/phim-cua-toi"
                  className="block hover:text-white"
                >
                  🎬 Phim của tôi
                </Link>

                <Link
                  href="/lich-su-giao-dich"
                  className="block hover:text-white"
                >
                  💳 Lịch sử giao dịch
                </Link>

              </div>

            </div>

          </div>


          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-gray-600">
            © 2026 TRÀ ĐÁ DRAMA. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}