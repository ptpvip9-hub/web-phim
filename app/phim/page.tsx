import Link from "next/link";

const POSTER = "/poster-yeu-den-muc-cam-ky.jpg";

export default function PhimPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>

            <span className="text-xl font-black">
              TRÀ ĐÁ{" "}
              <span className="text-red-500">
                DRAMA
              </span>
            </span>
          </Link>

          {/* MENU */}
          <nav className="hidden items-center gap-8 md:flex">

            <Link
              href="/"
              className="font-medium text-gray-400 transition hover:text-white"
            >
              Trang chủ
            </Link>

            <Link
              href="/phim"
              className="relative font-medium text-white"
            >
              Phim

              <span className="absolute -bottom-6 left-0 h-0.5 w-full bg-red-500" />
            </Link>

            <Link
              href="/phim/yeu-den-muc-cam-ky"
              className="font-medium text-gray-400 transition hover:text-white"
            >
              Phim mới
            </Link>

          </nav>

          {/* SEARCH */}
          <div className="hidden md:block">
            <div className="flex h-10 w-64 items-center rounded-full border border-white/15 bg-white/5 px-4">

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

      {/* TITLE */}
      <section className="border-b border-white/10 bg-gradient-to-b from-red-950/30 to-black">

        <div className="mx-auto max-w-7xl px-5 py-16">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            TRÀ ĐÁ DRAMA
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Kho phim
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-gray-400">
            Khám phá những bộ phim drama và tình cảm
            đang được cập nhật tại TRÀ ĐÁ DRAMA.
          </p>

        </div>

      </section>

      {/* FILTER */}
      <section className="mx-auto max-w-7xl px-5 py-8">

        <div className="flex flex-wrap gap-3">

          <button className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold">
            Tất cả
          </button>

          <button className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/10">
            Drama
          </button>

          <button className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/10">
            Tình cảm
          </button>

          <button className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/10">
            Ngôn tình
          </button>

        </div>

      </section>

      {/* MOVIE */}
      <section className="mx-auto max-w-7xl px-5 pb-20">

        <div className="mb-8 flex items-center gap-3">

          <span className="h-8 w-1.5 rounded-full bg-red-500" />

          <h2 className="text-2xl font-black">
            Yêu Đến Mức Cấm Kỵ
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

          <Link
            href="/phim/yeu-den-muc-cam-ky"
            className="group"
          >

            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900">

              <img
                src={POSTER}
                alt="Yêu Đến Mức Cấm Kỵ"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

              <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold">
                MỚI
              </span>

              <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-bold">
                Tập 1–5
              </span>

            </div>

            <h3 className="mt-3 font-bold transition group-hover:text-red-500">
              Yêu Đến Mức Cấm Kỵ
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Drama • Tập 1–5
            </p>

          </Link>

        </div>

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

              <Link href="/" className="hover:text-white">
                Trang chủ
              </Link>

              <Link href="/phim" className="hover:text-white">
                Phim
              </Link>

              <Link
                href="/phim/yeu-den-muc-cam-ky"
                className="hover:text-white"
              >
                Phim mới
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