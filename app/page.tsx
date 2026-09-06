import Link from "next/link";

const POSTER = "/poster-yeu-den-muc-cam-ky.jpg";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5">

          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <span className="text-3xl">
              🎬
            </span>

            <span className="text-xl font-black tracking-tight">
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
              className="relative font-medium text-white"
            >
              Trang chủ

              <span className="absolute -bottom-6 left-0 h-0.5 w-full bg-red-500" />
            </Link>

            <Link
              href="/phim"
              className="font-medium text-gray-400 transition hover:text-white"
            >
              Phim
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

              <span className="text-lg">
                🔍
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-[680px] overflow-hidden">

        {/* ẢNH BÌA */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${POSTER}")`,
          }}
        />

        {/* LỚP TỐI */}
        <div className="absolute inset-0 bg-black/35" />

        {/* TỐI BÊN TRÁI */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />

        {/* TỐI DƯỚI */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#050505] to-transparent" />

        {/* NỘI DUNG */}
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-20">

          <div className="max-w-2xl">

            <p className="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-red-500">
              PHIM HOT • DRAMA
            </p>

            <h1 className="font-serif text-5xl font-black leading-[1.05] md:text-7xl">

              Yêu Đến Mức

              <br />

              <span className="text-white">
                Cấm Kỵ
              </span>

            </h1>

            {/* INFO */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-300">

              <span className="rounded bg-red-600 px-2 py-1 font-bold">
                MỚI
              </span>

              <span>
                Drama
              </span>

              <span>
                •
              </span>

              <span>
                Tập 1–5
              </span>

              <span>
                •
              </span>

              <span>
                HD
              </span>

            </div>

            {/* MÔ TẢ */}
            <p className="mt-6 max-w-xl text-base leading-8 text-gray-300 md:text-lg">
              Một câu chuyện tình yêu đầy day dứt,
              nơi những cảm xúc tưởng như không thể
              lại trở thành một mối tình không thể
              thoát khỏi.
            </p>

            {/* BUTTON */}
            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/phim/yeu-den-muc-cam-ky"
                className="rounded-lg bg-red-600 px-7 py-3.5 font-bold shadow-xl shadow-red-950/40 transition hover:scale-105 hover:bg-red-700"
              >
                ▶ Xem ngay
              </Link>

              <Link
                href="/phim/yeu-den-muc-cam-ky"
                className="rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 font-bold backdrop-blur transition hover:bg-white/20"
              >
                ☷ Xem thông tin
              </Link>

            </div>

            {/* DOT */}
            <div className="mt-10 flex gap-2">

              <span className="h-1 w-8 rounded-full bg-red-500" />

              <span className="h-1 w-8 rounded-full bg-white/30" />

              <span className="h-1 w-8 rounded-full bg-white/30" />

            </div>

          </div>

        </div>

      </section>

      {/* ================= PHIM MỚI ================= */}
      <section
        id="phim-moi"
        className="mx-auto max-w-7xl px-5 py-14"
      >

        <div className="mb-8 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <span className="h-8 w-1.5 rounded-full bg-red-500" />

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                MỚI CẬP NHẬT
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Phim mới
              </h2>

            </div>

          </div>

          <Link
            href="/phim"
            className="text-sm font-medium text-red-500 hover:text-red-400"
          >
            Xem tất cả →
          </Link>

        </div>

        {/* CARD PHIM */}
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

              <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold">
                MỚI
              </span>

              <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2.5 py-1 text-xs font-bold">
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

      {/* ================= THÔNG TIN PHIM ================= */}
      <section className="border-y border-white/10 bg-zinc-950">

        <div className="mx-auto max-w-7xl px-5 py-16">

          <div className="grid gap-10 md:grid-cols-[260px_1fr]">

            {/* POSTER */}
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">

              <img
                src={POSTER}
                alt="Yêu Đến Mức Cấm Kỵ"
                className="h-full w-full object-cover"
              />

            </div>

            {/* INFO */}
            <div className="flex flex-col justify-center">

              <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
                PHIM ĐANG CÓ TRÊN TRÀ ĐÁ DRAMA
              </p>

              <h2 className="mt-3 text-3xl font-black md:text-5xl">
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

              <p className="mt-6 max-w-3xl leading-8 text-gray-400">
                Một câu chuyện tình yêu đầy day dứt,
                nơi những cảm xúc tưởng như không thể
                lại trở thành một mối tình không thể
                thoát khỏi.
              </p>

              <div className="mt-8">

                <Link
                  href="/phim/yeu-den-muc-cam-ky"
                  className="inline-flex rounded-lg bg-red-600 px-7 py-3.5 font-bold transition hover:bg-red-700"
                >
                  ▶ Xem phim ngay
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= THỂ LOẠI ================= */}
      <section
        id="the-loai"
        className="mx-auto max-w-7xl px-5 py-14"
      >

        <div className="mb-8 flex items-center gap-3">

          <span className="h-8 w-1.5 rounded-full bg-red-500" />

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
              KHÁM PHÁ
            </p>

            <h2 className="mt-1 text-3xl font-black">
              Thể loại
            </h2>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <a
            href="#phim-moi"
            className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 text-center transition hover:-translate-y-1 hover:border-red-500"
          >
            <div className="text-4xl">
              🎭
            </div>

            <h3 className="mt-4 font-bold">
              Drama
            </h3>

          </a>

          <a
            href="#phim-moi"
            className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 text-center transition hover:-translate-y-1 hover:border-red-500"
          >
            <div className="text-4xl">
              ❤️
            </div>

            <h3 className="mt-4 font-bold">
              Tình cảm
            </h3>

          </a>

          <a
            href="#phim-moi"
            className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 text-center transition hover:-translate-y-1 hover:border-red-500"
          >
            <div className="text-4xl">
              👑
            </div>

            <h3 className="mt-4 font-bold">
              Tổng tài
            </h3>

          </a>

          <a
            href="#phim-moi"
            className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 text-center transition hover:-translate-y-1 hover:border-red-500"
          >
            <div className="text-4xl">
              📖
            </div>

            <h3 className="mt-4 font-bold">
              Ngôn tình
            </h3>

          </a>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 bg-black">

        <div className="mx-auto max-w-7xl px-5 py-12">

          <div className="grid gap-10 md:grid-cols-3">

            {/* BRAND */}
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
                Xem phim drama hay mỗi ngày.
                Cảm ơn bạn đã đồng hành cùng
                TRÀ ĐÁ DRAMA.
              </p>

            </div>

            {/* LIÊN KẾT */}
            <div>

              <h3 className="font-bold">
                Liên kết
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
                  Phim
                </Link>

                <Link
                  href="/phim/yeu-den-muc-cam-ky"
                  className="block hover:text-white"
                >
                  Phim mới
                </Link>

              </div>

            </div>

            {/* GIỚI THIỆU */}
            <div>

              <h3 className="font-bold">
                TRÀ ĐÁ DRAMA
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Nơi cập nhật những bộ drama
                hấp dẫn và những câu chuyện
                tình cảm đầy cảm xúc.
              </p>

            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-gray-600">
            © 2026 TRÀ ĐÁ DRAMA. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}