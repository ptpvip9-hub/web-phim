"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type WatchItem = {
  id: string;
  movie_slug: string;
  movie_title: string;
  episode_id: number;
  episode_title: string;
  progress_seconds: number;
  duration_seconds: number;
  updated_at: string;
};

const movieInfo: Record<
  string,
  {
    poster: string;
    href: string;
  }
> = {
  "yeu-den-muc-cam-ky": {
    poster: "/poster-yeu-den-muc-cam-ky.jpg",
    href: "/phim/yeu-den-muc-cam-ky",
  },

  "chap-niem-tram-hoang": {
    poster: "/poster-chap-niem-tram-hoang.jpg",
    href: "/phim/chap-niem-tram-hoang",
  },
};

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor(
    (value % 3600) / 60
  );
  const secs = value % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

function getPercent(
  progress: number,
  duration: number
) {
  if (!duration || duration <= 0) return 0;

  return Math.min(
    100,
    Math.max(
      0,
      (progress / duration) * 100
    )
  );
}

export default function LichSuPage() {
  const router = useRouter();

  const [history, setHistory] = useState<WatchItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

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
    } else {
      // Mỗi phim chỉ hiển thị 1 lịch sử:
      // lấy tập được xem/cập nhật gần nhất.
      const latestByMovie = new Map<string, WatchItem>();

      for (const item of data || []) {
        if (!latestByMovie.has(item.movie_slug)) {
          latestByMovie.set(item.movie_slug, item);
        }
      }

      setHistory(Array.from(latestByMovie.values()));
    }

    setLoading(false);
  }

  async function clearHistoryItem(movieSlug: string) {
    const { error } = await supabase
      .from("watch_history")
      .delete()
      .eq("movie_slug", movieSlug);

    if (error) {
      console.error(
        "Lỗi xóa lịch sử phim:",
        error
      );
      alert("Không thể xóa lịch sử xem.");
      return;
    }

    setHistory((current) =>
      current.filter(
        (item) => item.movie_slug !== movieSlug
      )
    );
  }

  async function clearAllHistory() {
    const confirmed = confirm(
      "Bạn có chắc muốn xóa toàn bộ lịch sử xem không?"
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
      .eq("user_id", user.id);

    if (error) {
      alert("Không thể xóa lịch sử xem.");
      return;
    }

    setHistory([]);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="text-3xl">🎬</span>

            <span className="text-xl font-black">
              TRÀ ĐÁ{" "}
              <span className="text-red-500">
                DRAMA
              </span>
            </span>
          </Link>

          <Link
            href="/tai-khoan"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white"
          >
            👤 Tài khoản
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14">

        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <Link
              href="/tai-khoan"
              className="text-sm text-gray-500 hover:text-white"
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
              Những tập phim bạn đã xem gần đây.
            </p>
          </div>

          {!loading && history.length > 0 && (
            <button
              type="button"
              onClick={clearAllHistory}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/20"
            >
              🗑 Xóa toàn bộ lịch sử
            </button>
          )}

        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-3xl">⏳</div>
            <p className="mt-3 text-sm text-gray-500">
              Đang tải lịch sử xem...
            </p>
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center">

            <div className="text-6xl">🕘</div>

            <h2 className="mt-5 text-2xl font-black">
              Chưa có lịch sử xem
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Khi bạn xem phim, hệ thống sẽ tự động
              lưu lại tập và thời gian đã xem.
            </p>

            <Link
              href="/phim"
              className="mt-7 inline-flex rounded-xl bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
            >
              🎬 Xem phim
            </Link>

          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-4">

            {history.map((item) => {
              const info =
                movieInfo[item.movie_slug];

              const poster =
                info?.poster ||
                "/poster-yeu-den-muc-cam-ky.jpg";

              const baseHref =
                info?.href ||
                `/phim/${item.movie_slug}`;

              const href = `${baseHref}?tap=${item.episode_id}`;

              const percent = getPercent(
                item.progress_seconds,
                item.duration_seconds
              );

              const finished =
                item.duration_seconds > 0 &&
                item.progress_seconds >=
                  item.duration_seconds - 10;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
                >

                  <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">

                    <Link
                      href={href}
                      className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:w-[120px]"
                    >
                      <img
                        src={poster}
                        alt={item.movie_title}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${percent}%`,
                          }}
                        />
                      </div>
                    </Link>

                    <div className="flex-1">

                      <div className="flex flex-col justify-between gap-3 sm:flex-row">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                            {finished
                              ? "ĐÃ XEM XONG"
                              : "ĐANG XEM"}
                          </p>

                          <h2 className="mt-1 text-xl font-black">
                            {item.movie_title}
                          </h2>

                          <p className="mt-2 text-sm text-gray-400">
                            {item.episode_title}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            clearHistoryItem(
                              item.movie_slug
                            )
                          }
                          className="self-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-500 hover:border-red-500/30 hover:text-red-400"
                        >
                          🗑 Xóa
                        </button>

                      </div>

                      <div className="mt-5">

                        <div className="mb-2 flex justify-between text-xs text-gray-500">
                          <span>
                            {formatTime(
                              item.progress_seconds
                            )}
                          </span>

                          <span>
                            {formatTime(
                              item.duration_seconds
                            )}
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

                      <Link
                        href={href}
                        className="mt-5 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold hover:bg-red-700"
                      >
                        {finished
                          ? "▶ Xem lại"
                          : "▶ Tiếp tục xem"}
                      </Link>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-5 py-10">

          <p className="text-xl font-black">
            🎬 TRÀ ĐÁ{" "}
            <span className="text-red-500">
              DRAMA
            </span>
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Xem phim drama hay mỗi ngày.
          </p>

          <div className="mt-8 border-t border-white/10 pt-6 text-xs text-gray-600">
            © 2026 TRÀ ĐÁ DRAMA. All rights reserved.
          </div>

        </div>
      </footer>

    </main>
  );
}
