"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const POSTER = "/poster-yeu-den-muc-cam-ky.jpg";

const R2_BASE =
  "https://pub-189653ef3ebf47d2b0987a0944a4e8ac.r2.dev/yeu-den-muc-cam-ky";

const MOVIE_SLUG = "yeu-den-muc-cam-ky";
const MOVIE_TITLE = "Yêu Đến Mức Cấm Kỵ";
const MOVIE_PRICE = 20000;

const episodes = [
  { id: 1, title: "Tập 1–5", video: `${R2_BASE}/tap1-5.mp4` },
  { id: 2, title: "Tập 6–10", video: `${R2_BASE}/tap6-10.mp4` },
  { id: 3, title: "Tập 11–14", video: `${R2_BASE}/tap11-14.mp4` },
  { id: 4, title: "Tập 15–19", video: `${R2_BASE}/tap15-19.mp4` },
  { id: 5, title: "Tập 20–24", video: `${R2_BASE}/tap20-24.mp4` },
  { id: 6, title: "Tập 25–27", video: `${R2_BASE}/tap25-27.mp4` },
  { id: 7, title: "Tập 28–30", video: `${R2_BASE}/tap28-30.mp4` },
  { id: 8, title: "Tập 31–34", video: `${R2_BASE}/tap31-34.mp4` },
  { id: 9, title: "Tập 35–38", video: `${R2_BASE}/tap35-38.mp4` },
  { id: 10, title: "Tập 39–42", video: `${R2_BASE}/tap39-42.mp4` },
  { id: 11, title: "Tập 43–45", video: `${R2_BASE}/tap43-45.mp4` },
  { id: 12, title: "Tập 46–51", video: `${R2_BASE}/tap46-51.mp4` },
  { id: 13, title: "Tập 52–57", video: `${R2_BASE}/tap52-57.mp4` },
  { id: 14, title: "Tập 58–62", video: `${R2_BASE}/tap58-62.mp4` },
  { id: 15, title: "Tập 63–66", video: `${R2_BASE}/tap63-66.mp4` },
  { id: 16, title: "Tập 67–69", video: `${R2_BASE}/tap67-69.mp4` },
  { id: 17, title: "Tập 70–75", video: `${R2_BASE}/tap70-75.mp4` },
  { id: 18, title: "Tập cuối", video: `${R2_BASE}/tap-cuoi.mp4` },
];

export default function YeuDenMucCamKy() {
  const router = useRouter();

  const [currentEpisode, setCurrentEpisode] = useState(episodes[0]);

  // Quyền xem
  const [isVip, setIsVip] = useState(false);
  const [hasMovieAccess, setHasMovieAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Modal chọn mở khóa
  const [showVipChoice, setShowVipChoice] = useState(false);

  // Modal thanh toán
  const [showPayment, setShowPayment] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [copied, setCopied] = useState("");

  // Trạng thái thanh toán
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "approved"
  >("pending");

  // =========================================
  // KIỂM TRA QUYỀN VIP + MUA PHIM
  // =========================================

  useEffect(() => {
    async function checkAccess() {
      setCheckingAccess(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsVip(false);
        setHasMovieAccess(false);
        setCheckingAccess(false);
        return;
      }

      // KIỂM TRA VIP
      const { data: vipData, error: vipError } =
        await supabase
          .from("user_vip")
          .select("expires_at")
          .eq("user_id", user.id)
          .gt("expires_at", new Date().toISOString())
          .order("expires_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (vipError) {
        console.error("Lỗi kiểm tra VIP:", vipError);
        setIsVip(false);
      } else {
        setIsVip(!!vipData);
      }

      // KIỂM TRA ĐÃ MUA PHIM
      const {
        data: movieAccess,
        error: movieError,
      } = await supabase
        .from("user_movie_access")
        .select("id, movie_slug")
        .eq("user_id", user.id)
        .eq("movie_slug", MOVIE_SLUG)
        .maybeSingle();

      if (movieError) {
        console.error(
          "Lỗi kiểm tra quyền phim:",
          movieError
        );

        setHasMovieAccess(false);
      } else {
        setHasMovieAccess(!!movieAccess);
      }

      setCheckingAccess(false);
    }

    checkAccess();
  }, []);

  // =========================================
  // TẠO MÃ ĐƠN
  // =========================================

  function createMovieOrderCode() {
    const random = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `TRADAP${random}`;
  }

  // =========================================
  // TỰ KIỂM TRA TRẠNG THÁI ĐƠN
  // =========================================

  useEffect(() => {
    if (!showPayment || !orderCode) {
      return;
    }

    let cancelled = false;

    async function checkPayment() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      const { data: order, error } =
        await supabase
          .from("movie_orders")
          .select("status")
          .eq("order_code", orderCode)
          .eq("user_id", user.id)
          .maybeSingle();

      if (error) {
        console.error(
          "Lỗi kiểm tra thanh toán:",
          error
        );

        return;
      }

      if (order?.status === "approved") {
        if (cancelled) return;

        setPaymentStatus("approved");

        // Cập nhật quyền ngay trên giao diện
        setHasMovieAccess(true);

        // Đợi một chút để người dùng thấy thông báo thành công
        setTimeout(() => {
          if (cancelled) return;

          setShowPayment(false);
          setOrderCode("");

          // Cuộn xuống video
          setTimeout(() => {
            document
              .getElementById("video-player")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
          }, 200);

          alert(
            "🎉 Thanh toán thành công!\n\n" +
              "Bộ phim đã được mở khóa. Bạn có thể xem toàn bộ các tập."
          );
        }, 1200);
      }
    }

    // Kiểm tra ngay lần đầu
    checkPayment();

    // Sau đó cứ 3 giây kiểm tra 1 lần
    const interval = setInterval(
      checkPayment,
      3000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showPayment, orderCode]);

  // =========================================
  // MUA RIÊNG BỘ PHIM
  // =========================================

  async function handleBuyMovie() {
    if (creatingOrder) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const goLogin = confirm(
        "Bạn cần đăng nhập để mua bộ phim.\n\n" +
          "Bạn có muốn đến trang đăng nhập không?"
      );

      if (goLogin) {
        router.push("/dang-nhap");
      }

      return;
    }

    setCreatingOrder(true);

    // -----------------------------------------
    // KIỂM TRA ĐÃ CÓ ĐƠN ĐANG CHỜ CHƯA
    // -----------------------------------------

    const { data: existingOrder } =
      await supabase
        .from("movie_orders")
        .select("order_code, status")
        .eq("user_id", user.id)
        .eq("movie_slug", MOVIE_SLUG)
        .eq("status", "pending")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (existingOrder?.order_code) {
      setOrderCode(existingOrder.order_code);
      setPaymentStatus("pending");
      setShowPayment(true);
      setCreatingOrder(false);
      return;
    }

    // -----------------------------------------
    // TẠO ĐƠN MỚI
    // -----------------------------------------

    const newOrderCode =
      createMovieOrderCode();

    const { error } = await supabase
      .from("movie_orders")
      .insert({
        user_id: user.id,
        movie_slug: MOVIE_SLUG,
        movie_title: MOVIE_TITLE,
        amount: MOVIE_PRICE,
        order_code: newOrderCode,
        status: "pending",
      });

    if (error) {
      console.error(
        "Lỗi tạo đơn mua phim:",
        error
      );

      alert(
        "Không thể tạo đơn mua phim.\n\n" +
          "Vui lòng thử lại."
      );

      setCreatingOrder(false);
      return;
    }

    setOrderCode(newOrderCode);
    setPaymentStatus("pending");
    setShowPayment(true);
    setCreatingOrder(false);
  }

  // =========================================
  // QR THANH TOÁN
  // =========================================

  function getQrUrl() {
    if (!orderCode) return "";

    const amount = MOVIE_PRICE;

    const addInfo =
      encodeURIComponent(orderCode);

    const accountName =
      encodeURIComponent(
        "LAM THI THU HIEN"
      );

    return `https://img.vietqr.io/image/970403-070117517142-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  }

  // =========================================
  // COPY
  // =========================================

  async function copyText(
    text: string,
    type: string
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      alert("Không thể sao chép.");
    }
  }

  // =========================================
  // CHỌN TẬP
  // =========================================

  const changeEpisode = (
    episode: (typeof episodes)[number]
  ) => {
    if (checkingAccess) return;

    const isLocked = episode.id >= 5;

    if (
      isLocked &&
      !isVip &&
      !hasMovieAccess
    ) {
      setShowVipChoice(true);
      return;
    }

    setCurrentEpisode(episode);

    setTimeout(() => {
      document
        .getElementById("video-player")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  };

  const fullAccess =
    isVip || hasMovieAccess;

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="relative overflow-hidden border-b border-white/10">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${POSTER}")`,
          }}
        />

        <div className="absolute inset-0 bg-black/75" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/30" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">

          <div className="max-w-3xl">

            <p className="text-sm font-bold uppercase tracking-[0.35em] text-red-500">
              PHIM NGẮN • DRAMA
            </p>

            <h1 className="mt-5 font-serif text-5xl font-black leading-tight md:text-7xl">
              YÊU ĐẾN MỨC
              <br />
              CẤM KỴ
            </h1>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">

              <span className="rounded-md bg-red-600 px-3 py-1.5 font-bold">
                FULL
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                Drama
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                75+ TẬP
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                HD
              </span>

              {isVip && (
                <span className="rounded-md bg-yellow-500/20 px-3 py-1.5 font-bold text-yellow-400">
                  👑 VIP
                </span>
              )}

              {!isVip &&
                hasMovieAccess && (
                  <span className="rounded-md bg-green-500/20 px-3 py-1.5 font-bold text-green-400">
                    ✓ ĐÃ MUA BỘ
                  </span>
                )}

            </div>

            <p className="mt-7 max-w-2xl text-base leading-8 text-gray-300 md:text-lg">
              Một câu chuyện tình yêu đầy day dứt,
              nơi những cảm xúc tưởng như không thể
              lại trở thành một mối tình không thể
              thoát khỏi.
            </p>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById(
                    "video-player"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }}
              className="mt-8 rounded-lg bg-red-600 px-7 py-3.5 font-bold transition hover:scale-105 hover:bg-red-700"
            >
              ▶ Xem phim
            </button>

          </div>

        </div>

      </section>

      {/* =====================================
          VIDEO
      ===================================== */}

      <section
        id="video-player"
        className="mx-auto max-w-6xl px-5 py-14"
      >

        <div className="mb-7 flex items-end justify-between gap-5">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              ĐANG XEM
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Yêu Đến Mức Cấm Kỵ
            </h2>

          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
            {currentEpisode.title}
          </span>

        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">

          <video
            key={currentEpisode.video}
            className="block aspect-video w-full bg-black"
            controls
            playsInline
            preload="metadata"
          >

            <source
              src={currentEpisode.video}
              type="video/mp4"
            />

            Trình duyệt của bạn không hỗ trợ phát video.

          </video>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <p className="text-sm text-gray-500">
            Đang phát:{" "}

            <span className="text-gray-300">
              {currentEpisode.title}
            </span>
          </p>

          <p className="text-sm text-gray-600">
            {currentEpisode.id} /{" "}
            {episodes.length}
          </p>

        </div>

      </section>

      {/* =====================================
          DANH SÁCH TẬP
      ===================================== */}

      <section className="border-y border-white/10 bg-zinc-950">

        <div className="mx-auto max-w-6xl px-5 py-14">

          <div className="mb-8">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              DANH SÁCH TẬP
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Các tập phim
            </h2>

            <p className="mt-2 text-gray-500">
              Chọn nhóm tập muốn xem
            </p>

            {checkingAccess ? (

              <p className="mt-3 text-sm text-gray-500">
                Đang kiểm tra quyền xem...
              </p>

            ) : isVip ? (

              <p className="mt-3 text-sm font-semibold text-yellow-400">
                👑 Tài khoản VIP — Bạn có thể xem toàn bộ phim.
              </p>

            ) : hasMovieAccess ? (

              <p className="mt-3 text-sm font-semibold text-green-400">
                ✓ Bạn đã mua bộ phim — Có thể xem toàn bộ.
              </p>

            ) : (

              <p className="mt-3 text-sm text-gray-500">
                🔒 Tập 20 trở đi: mua bộ 20.000đ hoặc đăng ký VIP.
              </p>

            )}

          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">

            {episodes.map((episode) => {

              const isActive =
                currentEpisode.id ===
                episode.id;

              const isFinal =
                episode.title ===
                "Tập cuối";

              const isLocked =
                episode.id >= 5 &&
                !isVip &&
                !hasMovieAccess;

              return (

                <button
                  key={episode.id}
                  type="button"
                  onClick={() =>
                    changeEpisode(
                      episode
                    )
                  }
                  className={`group rounded-2xl border p-5 text-left transition ${
                    isActive
                      ? "border-red-500 bg-red-600/10"
                      : isLocked
                      ? "border-white/10 bg-white/[0.02] opacity-75 hover:border-yellow-500/50"
                      : "border-white/10 bg-white/[0.03] hover:border-red-500/50 hover:bg-white/5"
                  }`}
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                        {isFinal
                          ? "KẾT THÚC"
                          : `PHẦN ${episode.id}`}
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {episode.title}
                      </h3>

                    </div>

                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${
                        isActive
                          ? "bg-red-600"
                          : isLocked
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-white/10 group-hover:bg-red-600"
                      }`}
                    >
                      {isLocked
                        ? "🔒"
                        : "▶"}
                    </span>

                  </div>

                  <p className="mt-4 text-sm text-gray-500">

                    {isActive
                      ? "● Đang phát"
                      : isLocked
                      ? "🔒 Mở khóa"
                      : "Nhấn để xem"}

                  </p>

                </button>

              );

            })}

          </div>

        </div>

      </section>

      {/* =====================================
          MUA RIÊNG BỘ PHIM
      ===================================== */}

      {!isVip &&
        !hasMovieAccess && (

          <section className="mx-auto max-w-6xl px-5 py-12">

            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 to-zinc-900 p-7">

              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

                <div>

                  <p className="text-sm font-bold uppercase tracking-widest text-red-500">
                    MỞ KHÓA PHIM
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    🎬 Xem trọn bộ{" "}
                    {MOVIE_TITLE}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Không cần đăng ký VIP.
                    Chỉ cần mua riêng bộ phim này.
                  </p>

                  <p className="mt-3 text-2xl font-black text-red-400">
                    20.000đ
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleBuyMovie()
                  }
                  disabled={creatingOrder}
                  className="min-w-[220px] rounded-xl bg-red-600 px-7 py-4 font-black transition hover:bg-red-700 disabled:cursor-wait disabled:bg-gray-600"
                >

                  {creatingOrder
                    ? "Đang tạo đơn..."
                    : "🔓 Mua bộ phim — 20.000đ"}

                </button>

              </div>

              <div className="mt-6 border-t border-white/10 pt-5 text-sm text-gray-500">

                👑 Muốn xem tất cả phim trên website?

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/tai-khoan"
                    )
                  }
                  className="ml-1 font-bold text-yellow-400 hover:underline"
                >
                  Đăng ký VIP
                </button>

              </div>

            </div>

          </section>

        )}

      {/* =====================================
          ĐÃ MUA
      ===================================== */}

      {!isVip &&
        hasMovieAccess && (

          <section className="mx-auto max-w-6xl px-5 pb-12">

            <div className="rounded-2xl border border-green-500/30 bg-green-950/20 p-6">

              <div className="text-lg font-black text-green-400">
                ✓ Bạn đã mở khóa bộ phim
              </div>

              <p className="mt-2 text-sm text-gray-400">
                Bạn có thể xem toàn bộ các tập của{" "}
                {MOVIE_TITLE}.
              </p>

            </div>

          </section>

        )}

      {/* =====================================
          THÔNG TIN PHIM
      ===================================== */}

      <section className="mx-auto max-w-6xl px-5 py-16">

        <div className="grid gap-10 md:grid-cols-[280px_1fr]">

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">

            <img
              src={POSTER}
              alt={MOVIE_TITLE}
              className="h-full w-full object-cover"
            />

          </div>

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              THÔNG TIN PHIM
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              {MOVIE_TITLE}
            </h2>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-md bg-red-600/20 px-3 py-2 text-sm text-red-400">
                🎭 Drama
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                ❤️ Tình cảm
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                📺 75+ tập
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                🎬 HD
              </span>

            </div>

            <p className="mt-7 leading-8 text-gray-400">
              Một câu chuyện tình yêu đầy day dứt,
              nơi những cảm xúc tưởng như không thể
              lại trở thành một mối tình không thể
              thoát khỏi.
            </p>

            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">

              <p className="text-sm font-bold text-white">
                📌 Trạng thái
              </p>

              {isVip ? (

                <p className="mt-2 text-sm font-semibold text-yellow-400">
                  👑 VIP ACTIVE — Bạn được xem toàn bộ phim.
                </p>

              ) : hasMovieAccess ? (

                <p className="mt-2 text-sm font-semibold text-green-400">
                  ✓ Đã mua bộ — Bạn được xem toàn bộ phim này.
                </p>

              ) : (

                <p className="mt-2 text-sm text-gray-500">
                  Tập 1–19 miễn phí.
                  Tập 20 trở đi cần mở khóa.
                </p>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="border-t border-white/10 bg-black">

        <div className="mx-auto max-w-6xl px-5 py-10">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

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

            </div>

          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-xs text-gray-600">
            © 2026 TRÀ ĐÁ DRAMA. All rights reserved.
          </div>

        </div>

      </footer>

      {/* =====================================
          MODAL CHỌN MUA PHIM / VIP
      ===================================== */}

      {showVipChoice && (

        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">

          <div className="relative w-full max-w-[600px] rounded-3xl border border-white/10 bg-[#111] p-7 shadow-2xl">

            <button
              type="button"
              onClick={() =>
                setShowVipChoice(false)
              }
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xl text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">
                🔒
              </div>

              <h2 className="mt-5 text-2xl font-black">
                Tập phim này đã được khóa
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Bạn có thể mua riêng bộ phim
                hoặc đăng ký thành viên VIP
                để xem phim.
              </p>

            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">

              <button
                type="button"
                onClick={() => {
                  setShowVipChoice(false);
                  handleBuyMovie();
                }}
                className="group rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-left transition hover:border-red-500 hover:bg-red-500/20"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-2xl">
                  🎬
                </div>

                <h3 className="mt-4 text-lg font-black">
                  Mua riêng bộ phim
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Mở khóa toàn bộ các tập
                  của bộ phim này.
                </p>

                <div className="mt-4 text-xl font-black text-red-400">
                  20.000đ
                </div>

                <div className="mt-4 rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-black text-white">
                  🔓 Mua ngay
                </div>

              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVipChoice(false);
                  router.push("/tai-khoan");
                }}
                className="group rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-left transition hover:border-yellow-500 hover:bg-yellow-500/20"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 text-2xl">
                  👑
                </div>

                <h3 className="mt-4 text-lg font-black">
                  Đăng ký thành viên VIP
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Xem toàn bộ phim trên
                  Trà Đá Drama trong thời gian VIP.
                </p>

                <div className="mt-4 text-xl font-black text-yellow-400">
                  👑 VIP
                </div>

                <div className="mt-4 rounded-lg bg-yellow-500 px-4 py-3 text-center text-sm font-black text-black">
                  Đăng ký VIP
                </div>

              </button>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowVipChoice(false)
              }
              className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              Để sau
            </button>

          </div>

        </div>

      )}

      {/* =====================================
          MODAL CHỜ THANH TOÁN
      ===================================== */}

      {showPayment && (

        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/90 p-5 backdrop-blur-sm">

          <div className="relative w-full max-w-[720px] rounded-[22px] border border-white/10 bg-[#111] p-7 shadow-2xl">

            {/* KHÔNG CHO ĐÓNG KHI ĐANG CHỜ */}
            {paymentStatus === "approved" && (
              <button
                type="button"
                onClick={() =>
                  setShowPayment(false)
                }
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1b1b1b] text-lg text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}

            <div className="text-center">

              <div className="text-xs font-extrabold tracking-[2px] text-red-500">
                TRÀ ĐÁ DRAMA
              </div>

              <h2 className="mt-2 text-2xl font-black">
                🎬 Mua bộ phim
              </h2>

              <div className="mt-1 text-sm text-gray-500">
                {MOVIE_TITLE}
              </div>

            </div>

            {/* TRẠNG THÁI */}

            {paymentStatus === "pending" ? (

              <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">
                  ⏳
                </div>

                <div className="mt-3 text-lg font-black text-yellow-400">
                  ĐANG CHỜ THANH TOÁN
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Hệ thống đang tự động kiểm tra giao dịch của bạn.
                  <br />
                  Sau khi nhận được tiền, phim sẽ tự động mở khóa.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                  Đang kiểm tra giao dịch...
                </div>

              </div>

            ) : (

              <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-3xl">
                  ✓
                </div>

                <div className="mt-3 text-lg font-black text-green-400">
                  THANH TOÁN THÀNH CÔNG
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  Bộ phim đã được mở khóa.
                  <br />
                  Đang chuyển bạn đến phần xem phim...
                </p>

              </div>

            )}

            {/* GIÁ */}

            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center">

              <div className="text-sm text-gray-400">
                Số tiền cần chuyển
              </div>

              <div className="mt-1 text-4xl font-black text-red-400">
                20.000đ
              </div>

            </div>

            {/* QR */}

            {paymentStatus === "pending" && (

              <div className="mt-6 flex justify-center">

                <div className="rounded-2xl bg-white p-3">

                  <img
                    src={getQrUrl()}
                    alt="QR thanh toán mua phim"
                    className="block h-[270px] w-[270px]"
                  />

                </div>

              </div>

            )}

            {/* THÔNG TIN */}

            {paymentStatus === "pending" && (

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#171717] p-5">

                <div className="mb-4 text-sm font-black">
                  🏦 Thông tin chuyển khoản
                </div>

                <div className="space-y-3 text-sm">

                  <div>
                    <span className="text-gray-500">
                      Ngân hàng:{" "}
                    </span>

                    <strong>
                      Sacombank
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Chủ tài khoản:{" "}
                    </span>

                    <strong>
                      Lâm Thị Thu Hiền
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <span className="text-gray-500">
                        Số tài khoản:{" "}
                      </span>

                      <strong>
                        070117517142
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          "070117517142",
                          "stk"
                        )
                      }
                      className="rounded-lg border border-white/10 bg-[#222] px-3 py-2 text-xs text-gray-300 hover:bg-[#292929]"
                    >
                      {copied === "stk"
                        ? "✓ Đã copy"
                        : "Sao chép"}
                    </button>

                  </div>

                  <div className="border-t border-white/10 pt-4">

                    <div className="mb-2 text-xs text-gray-500">
                      Nội dung chuyển khoản
                    </div>

                    <div className="flex items-center justify-between gap-3">

                      <strong className="text-base tracking-wide text-red-400">
                        {orderCode}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            orderCode,
                            "content"
                          )
                        }
                        className="rounded-lg border border-white/10 bg-[#222] px-3 py-2 text-xs text-gray-300 hover:bg-[#292929]"
                      >
                        {copied === "content"
                          ? "✓ Đã copy"
                          : "Sao chép"}
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            )}

            {/* LƯU Ý */}

            {paymentStatus === "pending" && (

              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm leading-7 text-gray-400">

                <strong className="text-yellow-400">
                  📌 Lưu ý:
                </strong>

                <br />

                Chuyển đúng{" "}

                <strong className="text-white">
                  20.000đ
                </strong>

                {" "}và ghi đúng mã đơn:

                <strong className="ml-1 text-red-400">
                  {orderCode}
                </strong>

                <br />

                Không cần báo admin.
                Hệ thống sẽ tự động xác nhận thanh toán.

              </div>

            )}

            {/* CHỜ */}

            {paymentStatus === "pending" && (

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">

                <div className="text-sm font-bold text-yellow-400">
                  ⏳ ĐANG CHỜ HỆ THỐNG XÁC NHẬN
                </div>

                <p className="mt-2 text-xs leading-6 text-gray-500">
                  Sau khi giao dịch thành công,
                  cửa sổ này sẽ tự đóng và bạn có thể
                  xem toàn bộ phim.
                </p>

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}