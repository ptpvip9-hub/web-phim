"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { movies } from "@/lib/movies";

type WatchHistory = {
  id: string;
  movie_slug: string;
  movie_title: string;
  episode_id: number;
  episode_title: string;
  progress_seconds: number;
  duration_seconds: number;
  updated_at: string;
};

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds || 0));

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getPercent(
  progress: number,
  duration: number
) {
  if (!duration || duration <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (progress / duration) * 100)
  );
}

export default function LichSuPage() {
  const router = useRouter();

  const [history, setHistory] = useState<WatchHistory[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/dang-nhap");
      return;
    }

    const { data, error } = await supabase
      .from("watch_history")
      .select(
        "id, movie_slug, movie_title, episode_id, episode_title, progress_seconds, duration_seconds, updated_at"
      )
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Lỗi tải lịch sử xem:",
        error
      );

      setHistory([]);
      setLoading(false);
      return;
    }

    /*
     * Mỗi phim chỉ hiển thị 1 lần.
     *
     * Vì dữ liệu được sắp xếp updated_at giảm dần
     * nên bản ghi đầu tiên của mỗi movie_slug
     * chính là lần xem gần nhất.
     */
    const latestByMovie = new Map<
      string,
      WatchHistory
    >();

    for (const item of data || []) {
      if (!latestByMovie.has(item.movie_slug)) {
        latestByMovie.set(item.movie_slug, item);
      }
    }

    setHistory(
      Array.from(latestByMovie.values())
    );

    setLoading(false);
  }

  async function removeMovieHistory(
    movieSlug: string
  ) {
    const confirmed = confirm(
      "Bạn có muốn xóa lịch sử xem của phim này không?"
    );

    if (!confirmed) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/dang-nhap");
      return;
    }

    const { error } = await supabase
      .from("watch_history")
      .delete()
      .eq("user_id", user.id)
      .eq("movie_slug", movieSlug);

    if (error) {
      console.error(
        "Lỗi xóa lịch sử:",
        error
      );

      alert(
        "Không thể xóa lịch sử xem."
      );

      return;
    }

    setHistory((current) =>
      current.filter(
        (item) =>
          item.movie_slug !== movieSlug
      )
    );
  }

  async function clearAllHistory() {
    if (clearing) return;

    const confirmed = confirm(
      "Bạn có chắc muốn xóa toàn bộ lịch sử xem không?"
    );

    if (!confirmed) return;

    setClearing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/dang-nhap");
      setClearing(false);
      return;
    }

    const { error } = await supabase
      .from("watch_history")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Lỗi xóa toàn bộ lịch sử:",
        error
      );

      alert(
        "Không thể xóa toàn bộ lịch sử."
      );

      setClearing(false);
      return;
    }

    setHistory([]);
    setClearing(false);
  }

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
              href="/yeu-thich"
              className="font-medium text-gray-400 transition hover:text-white"
            >
              ❤️ Yêu thích
            </Link>

          </nav>

          <Link
            href="/tai-khoan"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            👤 Tài khoản
          </Link>

        </div>

      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-14">

        {/* TITLE */}
        <div className="mb-10">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <Link
                href="/tai-khoan"
                className="text-sm text-gray-500 transition hover:text-white"
              >
                ← Quay lại tài khoản
              </Link>

              <div className="mt-6 flex items-center gap-3">

                <span className="h-9 w-1.5 rounded-full bg-red-500" />

                <h1 className="text-3xl font-black md:text-4xl">
                  🕘 Lịch sử xem
                </h1>

              </div>

              <p className="mt-3 text-gray-500">
                Những bộ phim bạn đã xem gần đây.
              </p>

            </div>

            {!loading &&
              history.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllHistory}
                  disabled={clearing}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-50"
                >
                  {clearing
                    ? "⏳ Đang xóa..."
                    : "🗑️ Xóa toàn bộ lịch sử"}
                </button>
              )}

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

            <div className="text-3xl">
              ⏳
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Đang tải lịch sử xem...
            </p>

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          history.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-red-950/20 to-zinc-950 p-12 text-center">

              <div className="text-6xl">
                🕘
              </div>

              <h2 className="mt-5 text-2xl font-black">
                Chưa có lịch sử xem
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                Khi bạn xem phim, hệ thống sẽ
                tự động lưu lại tập và vị trí xem
                để bạn có thể tiếp tục lần sau.
              </p>

              <Link
                href="/phim"
                className="mt-7 inline-flex rounded-xl bg-red-600 px-6 py-3 font-bold transition hover:bg-red-700"
              >
                🎬 Khám phá phim
              </Link>

            </div>
          )}

        {/* HISTORY */}
        {!loading &&
          history.length > 0 && (
            <div className="space-y-5">

              {history.map((item) => {

                /*
                 * Lấy toàn bộ thông tin phim
                 * từ lib/movies.ts
                 */
                const movie = movies.find(
                  (m) =>
                    m.slug === item.movie_slug
                );

                /*
                 * Nếu phim không còn trong
                 * movies.ts thì bỏ qua.
                 */
                if (!movie) {
                  return null;
                }

                const percent = getPercent(
                  item.progress_seconds,
                  item.duration_seconds
                );

                const watchHref =
                  `${movie.href}?tap=${item.episode_id}`;

                return (
                  <div
                    key={item.movie_slug}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition hover:border-red-500/30"
                  >

                    <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">

                      {/* POSTER */}
                      <Link
                        href={watchHref}
                        className="relative block h-56 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:h-48 sm:w-32"
                      >

                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold">
                          ĐANG XEM
                        </span>

                      </Link>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col justify-between gap-3 sm:flex-row">

                          <div className="min-w-0">

                            <Link href={watchHref}>

                              <h2 className="text-xl font-black transition group-hover:text-red-400">
                                {movie.title}
                              </h2>

                            </Link>

                            <p className="mt-2 text-sm text-gray-400">
                              {item.episode_title}
                            </p>

                          </div>

                          <p className="shrink-0 text-xs text-gray-600">
                            {new Date(
                              item.updated_at
                            ).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>

                        </div>

                        {/* PROGRESS */}
                        <div className="mt-6">

                          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">

                            <span>
                              Đã xem{" "}
                              {formatTime(
                                item.progress_seconds
                              )}
                              {" / "}
                              {formatTime(
                                item.duration_seconds
                              )}
                            </span>

                            <span>
                              {Math.round(
                                percent
                              )}
                              %
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/10">

                            <div
                              className="h-full bg-red-500 transition-all"
                              style={{
                                width: `${percent}%`,
                              }}
                            />

                          </div>

                        </div>

                        {/* BUTTONS */}
                        <div className="mt-6 flex flex-wrap gap-3">

                          <Link
                            href={watchHref}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold transition hover:bg-red-700"
                          >
                            ▶ Tiếp tục xem
                          </Link>

                          <Link
                            href={movie.href}
                            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:text-white"
                          >
                            ℹ Thông tin phim
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              removeMovieHistory(
                                item.movie_slug
                              )
                            }
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:border-red-500/30 hover:bg-red-500/10"
                            title="Xóa lịch sử phim này"
                          >
                            🗑️
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">

        <div className="mx-auto max-w-7xl px-5 py-10">

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

              <Link
                href="/yeu-thich"
                className="transition hover:text-white"
              >
                Yêu thích
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