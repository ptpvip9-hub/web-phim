"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import LogoutButton from "./components/LogoutButton";

type Movie = {
  slug: string;
  title: string;
  poster: string;
  href: string;
  description: string;
  episodes: string;
  badge?: string;
  genre: string;
};

type WatchItem = {
  movie_slug: string;
  movie_title: string;
  episode_id: number;
  episode_title: string;
  progress_seconds: number;
  duration_seconds: number;
  updated_at: string;
};

const movies: Movie[] = [
  {
    slug: "yeu-den-muc-cam-ky",
    title: "Yêu Đến Mức Cấm Kỵ",
    poster: "/poster-yeu-den-muc-cam-ky.jpg",
    href: "/phim/yeu-den-muc-cam-ky",
    description:
      "Một câu chuyện tình yêu đầy day dứt, nơi những cảm xúc tưởng như không thể lại trở thành một mối tình không thể thoát khỏi.",
    episodes: "75+ tập",
    badge: "HOT",
    genre: "Drama • Tình cảm",
  },
  {
    slug: "chap-niem-tram-hoang",
    title: "Chấp Niệm Trầm Hoang",
    poster: "/poster-chap-niem-tram-hoang.jpg",
    href: "/phim/chap-niem-tram-hoang",
    description:
      "Một câu chuyện tình cảm nhiều bí mật, chấp niệm và những lựa chọn không dễ dàng.",
    episodes: "Full",
    badge: "MỚI",
    genre: "Drama • Ngôn tình",
  },
];

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getPercent(progress: number, duration: number) {
  if (!duration || duration <= 0) return 0;
  return Math.min(100, Math.max(0, (progress / duration) * 100));
}

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [watchHistory, setWatchHistory] = useState<WatchItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const featuredMovie = movies[0];

  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      setLoadingHistory(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUserEmail(user?.email ?? null);

      if (!user) {
        setWatchHistory([]);
        setLoadingHistory(false);
        return;
      }

      const { data, error } = await supabase
        .from("watch_history")
        .select(
          "movie_slug, movie_title, episode_id, episode_title, progress_seconds, duration_seconds, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Lỗi tải lịch sử trang chủ:", error);
        setWatchHistory([]);
      } else {
        // Mỗi phim chỉ hiển thị 1 mục: lấy lần xem gần nhất.
        const latest = new Map<string, WatchItem>();

        for (const item of data || []) {
          if (!latest.has(item.movie_slug)) {
            latest.set(item.movie_slug, item);
          }
        }

        setWatchHistory(Array.from(latest.values()));
      }

      setLoadingHistory(false);
    }

    loadHomeData();

    return () => {
      mounted = false;
    };
  }, []);

  const continueWatching = useMemo(() => {
    return watchHistory
      .map((item) => {
        const movie = movies.find((m) => m.slug === item.movie_slug);
        if (!movie) return null;

        return {
          ...item,
          movie,
          percent: getPercent(
            item.progress_seconds,
            item.duration_seconds
          ),
          href: `${movie.href}?tap=${item.episode_id}`,
        };
      })
      .filter(Boolean) as Array<
      WatchItem & {
        movie: Movie;
        percent: number;
        href: string;
      }
    >;
  }, [watchHistory]);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#050505] text-white">
      {/* HERO */}
      <section className="relative min-h-[650px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${featuredMovie.poster}")` }}
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050505] to-transparent" />

        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-5 py-20">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider">
                🔥 Đang hot
              </span>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-bold backdrop-blur">
                HD
              </span>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-bold backdrop-blur">
                75+ TẬP
              </span>
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.35em] text-red-500">
              TRÀ ĐÁ DRAMA • PHIM NỔI BẬT
            </p>

            <h1 className="mt-4 font-serif text-5xl font-black leading-[0.98] md:text-7xl">
              Yêu Đến Mức
              <br />
              <span className="text-white">Cấm Kỵ</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-gray-300 md:text-lg">
              {featuredMovie.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={featuredMovie.href}
                className="rounded-xl bg-red-600 px-7 py-3.5 font-black shadow-xl shadow-red-950/40 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                ▶ Xem ngay
              </Link>

              <Link
                href={featuredMovie.href}
                className="rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 font-bold backdrop-blur transition hover:bg-white/15"
              >
                ℹ Thông tin phim
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
              <span>🎭 Drama</span>
              <span>❤️ Tình cảm</span>
              <span>📺 75+ tập</span>
              <span>🎬 HD</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTINUE WATCHING */}
      {userEmail && !loadingHistory && continueWatching.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
                DÀNH CHO BẠN
              </p>
              <h2 className="mt-1 text-3xl font-black">
                ▶ Tiếp tục xem
              </h2>
            </div>

            <Link
              href="/lich-su"
              className="text-sm font-bold text-red-500 hover:text-red-400"
            >
              Xem lịch sử →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {continueWatching.map((item) => (
              <Link
                key={item.movie_slug}
                href={item.href}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition hover:-translate-y-1 hover:border-red-500/40"
              >
                <div className="flex gap-4 p-4">
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                    <img
                      src={item.movie.poster}
                      alt={item.movie.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 py-1">
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">
                      ĐANG XEM
                    </p>
                    <h3 className="mt-1 truncate text-lg font-black group-hover:text-red-400">
                      {item.movie.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      {item.episode_title}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {formatTime(item.progress_seconds)} /{" "}
                        {formatTime(item.duration_seconds)}
                      </span>
                      <span>{Math.round(item.percent)}%</span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* MOVIE GRID */}
      <section id="phim-moi" className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
              MỚI CẬP NHẬT
            </p>
            <h2 className="mt-1 text-3xl font-black md:text-4xl">
              Phim nổi bật
            </h2>
          </div>

          <Link
            href="/phim"
            className="text-sm font-bold text-red-500 hover:text-red-400"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {movies.map((movie) => (
            <Link
              key={movie.slug}
              href={movie.href}
              className="group block w-full min-w-0"
            >
              <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl sm:h-[400px]">
                {/* ẢNH PHỦ 100% CARD */}
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="absolute inset-0 z-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                />

                {/* LỚP PHỦ */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/25 to-black/5" />

                {/* BADGE GÓC TRÁI */}
                {movie.badge && (
                  <span className="absolute left-4 top-4 z-20 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-black shadow-lg">
                    {movie.badge}
                  </span>
                )}

                {/* SỐ TẬP GÓC PHẢI */}
                <span className="absolute right-4 top-4 z-20 rounded-lg border border-white/20 bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                  {movie.episodes}
                </span>

                {/* THÔNG TIN + NÚT PLAY, KHÔNG DÙNG FLEX ĐỂ TRÁNH ĐÈ NHAU */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
                  <h3 className="max-w-[80%] text-xl font-black leading-tight text-white drop-shadow-lg sm:text-2xl">
                    {movie.title}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-gray-200 drop-shadow">
                    {movie.genre}
                  </p>

                  <span className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-base font-black text-white shadow-xl transition duration-300 group-hover:scale-110 group-hover:bg-red-500 sm:bottom-6 sm:right-6">
                    ▶
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* VIP BANNER */}
      <section className="mx-auto max-w-7xl px-5 py-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-zinc-900 to-red-950/30 p-7 md:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div>
              <span className="rounded-full bg-yellow-500/15 px-3 py-1.5 text-xs font-black text-yellow-400">
                👑 THÀNH VIÊN VIP
              </span>
              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                Xem toàn bộ phim, không cần mua từng bộ
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-400">
                Đăng ký VIP để mở quyền xem toàn bộ kho phim trong thời gian
                gói còn hiệu lực.
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

      {/* GENRES */}
      <section className="border-y border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
              KHÁM PHÁ
            </p>
            <h2 className="mt-1 text-3xl font-black">Thể loại</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["🎭", "Drama"],
              ["❤️", "Tình cảm"],
              ["👑", "Tổng tài"],
              ["📖", "Ngôn tình"],
            ].map(([icon, name]) => (
              <Link
                key={name}
                href="/phim"
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-7 text-center transition hover:-translate-y-1 hover:border-red-500/50 hover:bg-red-500/[0.05]"
              >
                <div className="text-4xl transition group-hover:scale-110">
                  {icon}
                </div>
                <h3 className="mt-4 font-black">{name}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Khám phá phim →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎬</span>
                <span className="text-xl font-black">
                  TRÀ ĐÁ <span className="text-red-500">DRAMA</span>
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-gray-500">
                Xem phim drama hay mỗi ngày. Lưu lịch sử, tiếp tục xem và quản
                lý những bộ phim yêu thích của bạn.
              </p>
            </div>

            <div>
              <h3 className="font-black">Khám phá</h3>
              <div className="mt-4 space-y-3 text-sm text-gray-500">
                <Link href="/" className="block hover:text-white">
                  Trang chủ
                </Link>
                <Link href="/phim" className="block hover:text-white">
                  Kho phim
                </Link>
                <Link href="/yeu-thich" className="block hover:text-white">
                  ❤️ Yêu thích
                </Link>
                <Link href="/lich-su" className="block hover:text-white">
                  🕘 Lịch sử xem
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-black">Tài khoản</h3>
              <div className="mt-4 space-y-3 text-sm text-gray-500">
                <Link href="/tai-khoan" className="block hover:text-white">
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
