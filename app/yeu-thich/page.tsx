"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { movies } from "@/lib/movies";

type FavoriteMovie = {
  id: string;
  movie_slug: string;
  movie_title: string;
  created_at: string;
};

export default function YeuThichPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/dang-nhap");
      return;
    }

    const { data, error } = await supabase
      .from("user_favorites")
      .select("id, movie_slug, movie_title, created_at")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Lỗi tải danh sách yêu thích:", error);
      setFavorites([]);
    } else {
      setFavorites(data || []);
    }

    setLoading(false);
  }

  async function removeFavorite(id: string) {
    if (removingId) return;

    const confirmed = confirm(
      "Bạn có muốn bỏ phim này khỏi danh sách yêu thích không?"
    );

    if (!confirmed) return;

    setRemovingId(id);

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Lỗi xóa yêu thích:", error);

      alert("Không thể bỏ phim khỏi yêu thích.");

      setRemovingId(null);
      return;
    }

    setFavorites((current) =>
      current.filter((movie) => movie.id !== id)
    );

    setRemovingId(null);
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
              href="/phim"
              className="font-medium text-gray-400 transition hover:text-white"
            >
              Phim mới
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

        <div className="mb-10">

          <Link
            href="/tai-khoan"
            className="text-sm text-gray-500 transition hover:text-white"
          >
            ← Quay lại tài khoản
          </Link>

          <div className="mt-6 flex items-center gap-3">

            <span className="h-9 w-1.5 rounded-full bg-pink-500" />

            <h1 className="text-3xl font-black md:text-4xl">
              ❤️ Phim yêu thích
            </h1>

          </div>

          <p className="mt-3 text-gray-500">
            Những bộ phim bạn đã thêm vào danh sách yêu thích.
          </p>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

            <div className="text-3xl">
              ⏳
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Đang tải danh sách yêu thích...
            </p>

          </div>
        )}

        {/* EMPTY */}
        {!loading && favorites.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-pink-950/20 to-zinc-950 p-12 text-center">

            <div className="text-6xl">
              💔
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Chưa có phim yêu thích
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Khi bạn tìm thấy một bộ phim yêu thích,
              hãy bấm nút ❤️ để lưu lại và xem nhanh
              bất cứ lúc nào.
            </p>

            <Link
              href="/phim"
              className="mt-7 inline-flex rounded-xl bg-red-600 px-6 py-3 font-bold transition hover:bg-red-700"
            >
              🎬 Khám phá phim
            </Link>

          </div>
        )}

        {/* MOVIES */}
        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

            {favorites.map((favorite) => {

              const movie = movies.find(
                (item) => item.slug === favorite.movie_slug
              );

              // Nếu slug trong database không còn tồn tại
              // trong lib/movies.ts thì không hiển thị lỗi.
              if (!movie) {
                return null;
              }

              return (
                <div
                  key={favorite.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
                >

                  {/* POSTER */}
                  <Link href={movie.href}>

                    <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">

                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                      <span className="absolute left-3 top-3 rounded-md bg-pink-500 px-2 py-1 text-xs font-bold">
                        ❤️ YÊU THÍCH
                      </span>

                    </div>

                  </Link>

                  {/* INFO */}
                  <div className="p-4">

                    <Link href={movie.href}>

                      <h2 className="line-clamp-2 font-bold transition group-hover:text-red-500">
                        {movie.title}
                      </h2>

                    </Link>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                      {movie.description}
                    </p>

                    <p className="mt-3 text-xs text-gray-600">
                      Đã thêm:{" "}
                      {new Date(
                        favorite.created_at
                      ).toLocaleDateString("vi-VN")}
                    </p>

                    <div className="mt-4 flex gap-2">

                      <Link
                        href={movie.href}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-center text-xs font-bold transition hover:bg-red-700"
                      >
                        🎬 Xem phim
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          removeFavorite(favorite.id)
                        }
                        disabled={
                          removingId === favorite.id
                        }
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm transition hover:border-pink-500/40 hover:bg-pink-500/10 disabled:opacity-50"
                        title="Bỏ yêu thích"
                      >
                        {removingId === favorite.id
                          ? "..."
                          : "💔"}
                      </button>

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
                href="/tai-khoan"
                className="transition hover:text-white"
              >
                Tài khoản
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