"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MovieAccess = {
  id: string;
  movie_slug: string;
  price: number;
  started_at: string;
};

const movieInfo: Record<
  string,
  {
    title: string;
    poster: string;
    href: string;
    description: string;
  }
> = {
  "yeu-den-muc-cam-ky": {
    title: "Yêu Đến Mức Cấm Kỵ",
    poster: "/poster-yeu-den-muc-cam-ky.jpg",
    href: "/phim/yeu-den-muc-cam-ky",
    description:
      "Bộ phim drama tình cảm đầy day dứt và cảm xúc.",
  },

  "chap-niem-tram-hoang": {
    title: "Chấp Niệm Trầm Hoang",
    poster: "/poster-chap-niem-tram-hoang.jpg",
    href: "/phim/chap-niem-tram-hoang",
    description:
      "Một câu chuyện tình cảm đầy những chấp niệm.",
  },
};

export default function PhimCuaToiPage() {
  const router = useRouter();

  const [movies, setMovies] = useState<MovieAccess[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/dang-nhap");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("user_movie_access")
        .select(
          "id, movie_slug, price, started_at"
        )
        .eq("user_id", user.id)
        .order("started_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Lỗi tải phim đã mua:",
          error
        );
        setMovies([]);
      } else {
        setMovies(data ?? []);
      }

      setLoading(false);
    }

    loadMovies();
  }, [router]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN").format(
      price
    ) + "đ";
  }

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#050505] text-white"
      >
        <div className="text-gray-400">
          Đang tải phim của bạn...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
            TRÀ ĐÁ DRAMA
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-4xl">
            🎬 Phim của tôi
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Các bộ phim bạn đã mua và có quyền
            xem vĩnh viễn.
          </p>

          {email && (
            <p className="mt-2 text-xs text-gray-600">
              Tài khoản: {email}
            </p>
          )}
        </div>

        {/* KHÔNG CÓ PHIM */}
        {movies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111] px-6 py-16 text-center">

            <div className="text-5xl">
              🎬
            </div>

            <h2 className="mt-5 text-xl font-black">
              Bạn chưa mua bộ phim nào
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Những bộ phim bạn mua riêng sẽ
              xuất hiện tại đây và được xem
              vĩnh viễn.
            </p>

            <Link
              href="/phim"
              className="mt-7 inline-flex rounded-xl bg-red-600 px-6 py-3 text-sm font-black transition hover:bg-red-700"
            >
              🎬 Khám phá kho phim
            </Link>

          </div>
        ) : (
          <>
            {/* SỐ LƯỢNG */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Bạn đã mua{" "}
                <strong className="text-white">
                  {movies.length}
                </strong>{" "}
                bộ phim
              </div>

              <div className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400">
                ✓ QUYỀN XEM VĨNH VIỄN
              </div>
            </div>

            {/* DANH SÁCH */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {movies.map((item) => {
                const info =
                  movieInfo[item.movie_slug];

                if (!info) {
                  return null;
                }

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition hover:-translate-y-1 hover:border-red-500/40"
                  >

                    {/* POSTER */}
                    <Link href={info.href}>
                      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">

                        <img
                          src={info.poster}
                          alt={info.title}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />

                        <div className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1.5 text-xs font-black shadow-lg">
                          ✓ ĐÃ MUA
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 pt-16">
                          <div className="text-sm font-black">
                            🎬 Xem phim
                          </div>
                        </div>

                      </div>
                    </Link>

                    {/* INFO */}
                    <div className="p-5">

                      <h2 className="text-lg font-black">
                        {info.title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {info.description}
                      </p>

                      <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                        <div className="text-xs text-gray-500">
                          Quyền xem
                        </div>

                        <div className="mt-1 text-sm font-bold text-green-400">
                          ✓ Vĩnh viễn
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          Ngày mua
                        </span>

                        <span className="text-gray-400">
                          {formatDate(
                            item.started_at
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          Giá mua
                        </span>

                        <span className="font-bold text-white">
                          {formatPrice(
                            item.price
                          )}
                        </span>
                      </div>

                      <Link
                        href={info.href}
                        className="mt-5 flex h-11 items-center justify-center rounded-xl bg-red-600 text-sm font-black transition hover:bg-red-700"
                      >
                        ▶ Xem phim
                      </Link>

                    </div>
                  </div>
                );
              })}

            </div>
          </>
        )}

      </div>
    </main>
  );
}