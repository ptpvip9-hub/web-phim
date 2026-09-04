import Link from "next/link";

const movies = [
  {
    title: "Chấp Niệm Trầm Hoang",
    episodes: "24 tập",
    slug: "chap-niem-tram-hoang",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Yêu Đến Mức Cấm Kỵ",
    episodes: "36 tập",
    slug: "yeu-den-muc-cam-ky",
    image:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* MENU */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-8 py-5">
        <Link href="/" className="text-2xl font-bold text-red-500">
          PHIM HAY
        </Link>

        <nav className="flex gap-6 text-sm">
          <Link href="/">Trang chủ</Link>

          <Link href="/phim">Phim mới</Link>

          <Link href="#vip">VIP</Link>
        </nav>

        <button className="rounded-lg bg-red-600 px-5 py-2 font-semibold">
          Đăng nhập
        </button>
      </header>

      {/* BANNER */}
      <section className="mx-auto max-w-6xl px-8 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-red-950 to-zinc-900 p-10">

          <p className="mb-3 text-red-400">
            PHIM ĐẶC SẮC
          </p>

          <h1 className="text-4xl font-bold">
            Xem phim hay mọi lúc, mọi nơi
          </h1>

          <p className="mt-4 max-w-xl text-zinc-300">
            Khám phá những bộ phim hấp dẫn và cập nhật tập mới mỗi ngày.
          </p>

          {/* LINK SANG TRANG PHIM */}
          <Link
            href="/phim"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-bold"
          >
            ▶ Xem phim ngay
          </Link>

        </div>
      </section>

      {/* DANH SÁCH PHIM */}
      <section className="mx-auto max-w-6xl px-8 pb-16">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            🔥 Phim mới cập nhật
          </h2>

          <Link href="/phim" className="text-red-400">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {movies.map((movie) => (
            <div
              key={movie.slug}
              className="overflow-hidden rounded-xl bg-zinc-900"
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="h-64 w-full object-cover"
              />

              <div className="p-4">

                <h3 className="font-bold">
                  {movie.title}
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  {movie.episodes}
                </p>

                {/* LINK VÀO TỪNG PHIM */}
                <Link
                  href={`/phim/${movie.slug}`}
                  className="mt-4 block rounded-lg bg-red-600 py-2 text-center text-sm font-semibold"
                >
                  ▶ Xem phim
                </Link>

              </div>
            </div>
          ))}

        </div>
      </section>

      {/* VIP */}
      <section
        id="vip"
        className="mx-auto max-w-4xl px-8 pb-20 text-center"
      >
        <div className="rounded-2xl border border-yellow-500/30 bg-zinc-900 p-10">

          <p className="text-yellow-400">
            👑 THÀNH VIÊN VIP
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Xem toàn bộ nội dung VIP
          </h2>

          <p className="mt-4 text-zinc-400">
            Nâng cấp tài khoản để mở khóa các nội dung dành riêng cho thành viên.
          </p>

          <button className="mt-6 rounded-lg bg-yellow-500 px-8 py-3 font-bold text-black">
            Xem các gói VIP
          </button>

        </div>
      </section>

    </main>
  );
}