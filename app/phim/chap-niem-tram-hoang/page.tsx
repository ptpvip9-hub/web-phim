export default function PhimPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">

      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold">
          Chấp Niệm Trầm Hoang
        </h1>

        <p className="mt-2 text-zinc-400">
          Xem phim online - Tập mới nhất
        </p>

        {/* Khung video */}
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center">
          <p className="text-zinc-400">
            Video phim sẽ hiển thị tại đây
          </p>
        </div>

        {/* Danh sách tập */}
        <h2 className="mt-8 text-2xl font-bold">
          Danh sách tập
        </h2>

        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-10">

          <button className="rounded-lg bg-red-600 p-3 font-bold">
            Tập 1
          </button>

          <button className="rounded-lg bg-zinc-800 p-3">
            Tập 2
          </button>

          <button className="rounded-lg bg-zinc-800 p-3">
            Tập 3
          </button>

          <button className="rounded-lg bg-zinc-800 p-3">
            Tập 4
          </button>

          <button className="rounded-lg bg-zinc-800 p-3">
            Tập 5
          </button>

        </div>

      </div>

    </main>
  );
}