    "use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const POSTER = "/poster-nhan-ha-truong-ninh.jpg";

const R2_BASE =
  "https://pub-189653ef3ebf47d2b0987a0944a4e8ac.r2.dev/nhan-ha-truong-ninh";

const MOVIE_SLUG = "nhan-ha-truong-ninh";
const MOVIE_TITLE = "Nhạn Hạ Trường Ninh";
const MOVIE_PRICE = 15000;

type Episode = {
  id: number;
  title: string;
  video: string;
};

const episodes = [
  {
    id: 1,
    title: "Tập 1–4",
    video: `${R2_BASE}/tap-1-4.mp4`,
  },
  ...Array.from({ length: 25 }, (_, index) => {
    const episode = index + 5;

    return {
      id: episode,
      title: `Tập ${episode}`,
      video: `${R2_BASE}/tap-${episode}.mp4`,
    };
  }),
];

type Comment = {
  id: number;
  user_id: string;
  movie_slug: string;
  episode_id: number;
  episode_title: string;
  content: string;
  parent_id: number | null;
  created_at: string;
};

export default function NhanHaTruongNinh() {
  const router = useRouter();

  const [currentEpisode, setCurrentEpisode] = useState(episodes[0]);

  // 🕘 LỊCH SỬ XEM / TIẾP TỤC XEM
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const saveHistoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHistorySaveAt = useRef(0);
  const pendingResumeRef = useRef<{
    episodeId: number;
    progressSeconds: number;
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [isVip, setIsVip] = useState(false);
  const [hasMovieAccess, setHasMovieAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // ❤️ YÊU THÍCH
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(true);

  // 💬 BÌNH LUẬN
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentSending, setCommentSending] = useState(false);
  const [commentUser, setCommentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [showVipChoice, setShowVipChoice] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [copied, setCopied] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "approved"
  >("pending");

  // =========================================
  // KIỂM TRA VIP + MUA PHIM + YÊU THÍCH
  // =========================================

  useEffect(() => {
    async function checkAccess() {
      setCheckingAccess(true);
      setFavoriteLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsVip(false);
        setHasMovieAccess(false);
        setIsFavorite(false);
        setCheckingAccess(false);
        setFavoriteLoading(false);
        return;
      }

      // VIP
      const { data: vipData, error: vipError } = await supabase
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

      // ĐÃ MUA PHIM
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

      // ❤️ KIỂM TRA YÊU THÍCH
      const {
        data: favoriteData,
        error: favoriteError,
      } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("movie_slug", MOVIE_SLUG)
        .maybeSingle();

      if (favoriteError) {
        console.error(
          "Lỗi kiểm tra yêu thích:",
          favoriteError
        );
        setIsFavorite(false);
      } else {
        setIsFavorite(!!favoriteData);
      }

      setCheckingAccess(false);
      setFavoriteLoading(false);
    }

    checkAccess();
  }, []);

  // =========================================
  // 🕘 TẢI LỊCH SỬ XEM
  // =========================================

  useEffect(() => {
    let cancelled = false;

    async function loadWatchHistory() {
      setHistoryLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setHistoryLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("watch_history")
        .select(
          "episode_id, progress_seconds, duration_seconds, updated_at"
        )
        .eq("user_id", user.id)
        .eq("movie_slug", MOVIE_SLUG)
        .order("updated_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Lỗi tải lịch sử xem:", error);
        setHistoryLoading(false);
        return;
      }

      if (data) {
        const savedEpisode = episodes.find(
          (episode) => episode.id === data.episode_id
        );

        if (savedEpisode) {
          // Quan trọng: lần cuối xem tập nào thì mở đúng tập đó.
          setCurrentEpisode(savedEpisode);

          // Lưu vị trí để chờ video load xong rồi mới seek.
          if (
            data.progress_seconds > 0 &&
            data.duration_seconds > 0 &&
            data.progress_seconds < data.duration_seconds - 5
          ) {
            pendingResumeRef.current = {
              episodeId: data.episode_id,
              progressSeconds: data.progress_seconds,
            };
          } else {
            pendingResumeRef.current = null;
          }
        }
      }

      setHistoryLoading(false);
    }

    loadWatchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  // Khi video đã load metadata, khôi phục đúng vị trí đã xem lần trước.
  function handleVideoLoadedMetadata() {
    const video = videoRef.current;
    const pending = pendingResumeRef.current;

    if (!video || !pending) return;
    if (pending.episodeId !== currentEpisode.id) return;

    const safePosition = Math.min(
      pending.progressSeconds,
      Math.max(0, video.duration - 5)
    );

    if (safePosition > 0 && Number.isFinite(safePosition)) {
      try {
        video.currentTime = safePosition;
      } catch (error) {
        console.error("Không thể khôi phục vị trí xem:", error);
      }
    }

    pendingResumeRef.current = null;
  }

  // =========================================
  // 🕘 LƯU LỊCH SỬ XEM
  // =========================================

  async function saveWatchHistory(force = false) {
    const video = videoRef.current;

    if (!video) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const progressSeconds = Math.max(
      0,
      Math.floor(video.currentTime || 0)
    );

    const durationSeconds = Math.max(
      0,
      Math.floor(video.duration || 0)
    );

    if (!force && progressSeconds < 5) {
      return;
    }

    // Khi đang xem, tối đa khoảng 1 lần / 10 giây.
    if (!force && Date.now() - lastHistorySaveAt.current < 10000) {
      return;
    }

    lastHistorySaveAt.current = Date.now();

    const { error } = await supabase
      .from("watch_history")
      .upsert(
        {
          user_id: user.id,
          movie_slug: MOVIE_SLUG,
          movie_title: MOVIE_TITLE,
          episode_id: currentEpisode.id,
          episode_title: currentEpisode.title,
          progress_seconds: progressSeconds,
          duration_seconds: durationSeconds,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,movie_slug,episode_id",
        }
      );

    if (error) {
      console.error("Lỗi lưu lịch sử xem:", error);
    }
  }

  function scheduleSaveHistory() {
    // Đang phát thì lưu khoảng 1 lần / 10 giây.
    // Không debounce theo từng onTimeUpdate vì video phát liên tục.
    if (saveHistoryTimer.current) return;

    const elapsed = Date.now() - lastHistorySaveAt.current;
    const delay = Math.max(1000, 10000 - elapsed);

    saveHistoryTimer.current = setTimeout(() => {
      saveHistoryTimer.current = null;
      void saveWatchHistory(true);
    }, delay);
  }

  function handleVideoPause() {
    if (saveHistoryTimer.current) {
      clearTimeout(saveHistoryTimer.current);
      saveHistoryTimer.current = null;
    }

    void saveWatchHistory(true);
  }

  function handleVideoEnded() {
    if (saveHistoryTimer.current) {
      clearTimeout(saveHistoryTimer.current);
      saveHistoryTimer.current = null;
    }

    void saveWatchHistory(true);
  }

  // Tự lưu khi rời trang / đóng tab.
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Trình duyệt không đảm bảo chờ async request ở beforeunload.
      // Vì vậy onPause + tự lưu mỗi ~10 giây mới là cơ chế chính.
      void saveWatchHistory(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (saveHistoryTimer.current) {
        clearTimeout(saveHistoryTimer.current);
      }
    };
  }, [currentEpisode.id]);

  // =========================================
  // ❤️ THÊM / BỎ YÊU THÍCH
  // =========================================

  async function toggleFavorite() {
    if (favoriteLoading) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const goLogin = confirm(
        "Bạn cần đăng nhập để thêm phim vào yêu thích.\n\n" +
          "Bạn có muốn đến trang đăng nhập không?"
      );

      if (goLogin) {
        router.push("/dang-nhap");
      }

      return;
    }

    setFavoriteLoading(true);

    if (isFavorite) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_slug", MOVIE_SLUG);

      if (error) {
        console.error(
          "Lỗi bỏ yêu thích:",
          error
        );

        alert(
          "Không thể bỏ phim khỏi yêu thích."
        );

        setFavoriteLoading(false);
        return;
      }

      setIsFavorite(false);
    } else {
      const { error } = await supabase
        .from("user_favorites")
        .insert({
          user_id: user.id,
          movie_slug: MOVIE_SLUG,
          movie_title: MOVIE_TITLE,
        });

      if (error) {
        console.error(
          "Lỗi thêm yêu thích:",
          error
        );

        alert(
          "Không thể thêm phim vào yêu thích."
        );

        setFavoriteLoading(false);
        return;
      }

      setIsFavorite(true);
    }

    setFavoriteLoading(false);
  }

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
  // KIỂM TRA THANH TOÁN
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

      const { data: order, error } = await supabase
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
        setHasMovieAccess(true);

        setTimeout(() => {
          if (cancelled) return;

          setShowPayment(false);
          setOrderCode("");

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

    checkPayment();

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
  // MUA PHIM
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
  // QR
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

  const changeEpisode = async (episode: Episode) => {
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

    // Lưu tập hiện tại trước khi chuyển sang tập khác.
    await saveWatchHistory(true);

    // Nếu người dùng tự chọn tập mới thì không dùng vị trí resume của tập cũ.
    pendingResumeRef.current = null;
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


  // =========================================
  // 💬 BÌNH LUẬN
  // =========================================

  async function loadComments() {
    setCommentLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Thành viên";

      setCommentUser({
        id: user.id,
        name,
      });
    } else {
      setCommentUser(null);
    }

    const { data, error } = await supabase
      .from("comments")
      .select(
        "id, user_id, movie_slug, episode_id, episode_title, content, parent_id, created_at"
      )
      .eq("movie_slug", MOVIE_SLUG)
      .eq("episode_id", currentEpisode.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi tải bình luận:", error);
      setComments([]);
    } else {
      setComments(data ?? []);
    }

    setCommentLoading(false);
  }

  useEffect(() => {
    void loadComments();
  }, [currentEpisode.id]);

  async function submitComment() {
    const content = commentText.trim();

    if (!content || commentSending) return;

    if (!commentUser) {
      const goLogin = confirm(
        "Bạn cần đăng nhập để bình luận.\n\nBạn có muốn đến trang đăng nhập không?"
      );

      if (goLogin) {
        router.push("/dang-nhap");
      }

      return;
    }

    setCommentSending(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: commentUser.id,
        movie_slug: MOVIE_SLUG,
        episode_id: currentEpisode.id,
        episode_title: currentEpisode.title,
        content,
        parent_id: null,
      })
      .select(
        "id, user_id, movie_slug, episode_id, episode_title, content, parent_id, created_at"
      )
      .single();

    if (error) {
      console.error("Lỗi gửi bình luận:", error);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } else if (data) {
      setComments((prev) => [data, ...prev]);
      setCommentText("");
    }

    setCommentSending(false);
  }

  async function deleteComment(commentId: number) {
    const ok = confirm("Bạn có chắc muốn xóa bình luận này không?");

    if (!ok) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", commentUser?.id ?? "");

    if (error) {
      console.error("Lỗi xóa bình luận:", error);
      alert("Không thể xóa bình luận.");
      return;
    }

    setComments((prev) =>
      prev.filter((comment) => comment.id !== commentId)
    );
  }

  function formatCommentTime(date: string) {
    const diff = Math.max(
      0,
      Date.now() - new Date(date).getTime()
    );

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);

    if (days < 30) return `${days} ngày trước`;

    return new Date(date).toLocaleDateString("vi-VN");
  }

  const fullAccess =
    isVip || hasMovieAccess;

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HERO */}
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
              {MOVIE_TITLE}
            </h1>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">

              <span className="rounded-md bg-red-600 px-3 py-1.5 font-bold">
                FULL
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                Drama
              </span>

              <span className="rounded-md bg-white/10 px-3 py-1.5">
                29 TẬP
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
              Một câu chuyện tình cảm đầy cảm xúc, với những cuộc gặp gỡ và lựa chọn làm thay đổi số phận của các nhân vật.
            </p>

            {/* NÚT XEM + YÊU THÍCH */}
            <div className="mt-8 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("video-player")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
                className="rounded-lg bg-red-600 px-7 py-3.5 font-bold transition hover:scale-105 hover:bg-red-700"
              >
                ▶ Xem phim
              </button>

              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`rounded-lg border px-6 py-3.5 font-bold transition ${
                  isFavorite
                    ? "border-pink-500/50 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
                    : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                } disabled:cursor-wait disabled:opacity-60`}
              >
                {favoriteLoading
                  ? "⏳ Đang xử lý..."
                  : isFavorite
                  ? "❤️ Đã yêu thích"
                  : "♡ Thêm yêu thích"}
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* VIDEO */}
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
              {MOVIE_TITLE}
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
            {currentEpisode.title}
          </span>

        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">

          <video
            ref={videoRef}
            key={currentEpisode.video}
            className="block aspect-video w-full bg-black"
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={handleVideoLoadedMetadata}
            onTimeUpdate={scheduleSaveHistory}
            onPause={handleVideoPause}
            onEnded={handleVideoEnded}
          >
            <source
              src={currentEpisode.video}
              type="video/mp4"
            />

            Trình duyệt của bạn không hỗ trợ phát video.
          </video>

        </div>

        {!historyLoading && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-400">
            🕘 Lịch sử xem của bạn được tự động lưu.
            Lần sau quay lại phim, hệ thống sẽ mở lại
            tập bạn xem gần nhất.
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">

          <p className="text-sm text-gray-500">
            Đang phát:{" "}
            <span className="text-gray-300">
              {currentEpisode.title}
            </span>
          </p>

          <p className="text-sm text-gray-600">
            {currentEpisode.id} / {episodes.length}
          </p>

        </div>

      </section>

      {/* DANH SÁCH TẬP */}
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
                🔒 Tập 5 trở đi: mua bộ 15.000đ hoặc đăng ký VIP.
              </p>
            )}

          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">

            {episodes.map((episode) => {

              const isActive =
                currentEpisode.id === episode.id;

              const isFinal = false;

              const isLocked =
                episode.id >= 5 &&
                !isVip &&
                !hasMovieAccess;

              return (
                <button
                  key={episode.id}
                  type="button"
                  onClick={() =>
                    changeEpisode(episode)
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
                      {isLocked ? "🔒" : "▶"}
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


      {/* 💬 BÌNH LUẬN */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            THẢO LUẬN
          </p>

          <h2 className="mt-2 text-3xl font-black">
            💬 Bình luận {currentEpisode.title}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Chia sẻ cảm nghĩ của bạn về tập phim đang xem.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submitComment();
              }
            }}
            maxLength={1000}
            rows={3}
            placeholder={
              commentUser
                ? `Bình luận với tên "${commentUser.name}"...`
                : "Đăng nhập để tham gia bình luận..."
            }
            className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/50"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-xs text-gray-600">
              {commentText.length}/1000
            </span>

            <button
              type="button"
              onClick={() => void submitComment()}
              disabled={!commentText.trim() || commentSending}
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
            >
              {commentSending ? "Đang gửi..." : "💬 Gửi bình luận"}
            </button>
          </div>

          {!commentUser && (
            <p className="mt-3 text-xs text-gray-500">
              🔐 Bạn cần đăng nhập để bình luận.
            </p>
          )}
        </div>

        <div className="mt-8">
          {commentLoading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-7 text-center text-sm text-gray-500">
              Đang tải bình luận...
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <div className="text-4xl">💬</div>
              <p className="mt-3 font-bold">Chưa có bình luận nào</p>
              <p className="mt-1 text-sm text-gray-500">
                Hãy là người đầu tiên bình luận về {currentEpisode.title}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const displayName =
                  comment.user_id === commentUser?.id
                    ? commentUser.name
                    : "Thành viên";

                return (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-lg">
                        👤
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">
                            {displayName}
                          </span>

                          {comment.user_id === commentUser?.id && (
                            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                              BẠN
                            </span>
                          )}

                          <span className="text-xs text-gray-600">
                            • {formatCommentTime(comment.created_at)}
                          </span>
                        </div>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-gray-300">
                          {comment.content}
                        </p>

                        <div className="mt-3 flex items-center gap-4">
                          <button
                            type="button"
                            className="text-xs text-gray-500 transition hover:text-red-400"
                          >
                            ❤️ Thích
                          </button>

                          {comment.user_id === commentUser?.id && (
                            <button
                              type="button"
                              onClick={() =>
                                void deleteComment(comment.id)
                              }
                              className="text-xs text-gray-600 transition hover:text-red-400"
                            >
                              🗑 Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MUA RIÊNG */}
      {!isVip && !hasMovieAccess && (
        <section className="mx-auto max-w-6xl px-5 py-12">

          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 to-zinc-900 p-7">

            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-red-500">
                  MỞ KHÓA PHIM
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  🎬 Xem trọn bộ {MOVIE_TITLE}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Không cần đăng ký VIP.
                  Chỉ cần mua riêng bộ phim này.
                </p>

                <p className="mt-3 text-2xl font-black text-red-400">
                  15.000đ
                </p>

              </div>

              <button
                type="button"
                onClick={handleBuyMovie}
                disabled={creatingOrder}
                className="w-full max-w-full rounded-xl bg-red-600 px-5 py-4 font-black transition hover:bg-red-700 disabled:cursor-wait disabled:bg-gray-600 md:w-auto md:min-w-[220px]"
              >
                {creatingOrder
                  ? "Đang tạo đơn..."
                  : "🔓 Mua bộ phim — 15.000đ"}
              </button>

            </div>

            <div className="mt-6 border-t border-white/10 pt-5 text-sm text-gray-500">

              👑 Muốn xem tất cả phim trên website?

              <button
                type="button"
                onClick={() =>
                  router.push("/tai-khoan")
                }
                className="ml-1 font-bold text-yellow-400 hover:underline"
              >
                Đăng ký VIP
              </button>

            </div>

          </div>

        </section>
      )}

      {/* ĐÃ MUA */}
      {!isVip && hasMovieAccess && (
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

      {/* THÔNG TIN PHIM */}
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
                📺 29 tập
              </span>

              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-gray-300">
                🎬 HD
              </span>

            </div>

            <p className="mt-7 leading-8 text-gray-400">
              Một câu chuyện tình cảm đầy cảm xúc, với những cuộc gặp gỡ và lựa chọn làm thay đổi số phận của các nhân vật.
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
                  Tập 1–4 miễn phí.
                  Tập 5 trở đi cần mở khóa.
                </p>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
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

      {/* MODAL CHỌN MUA / VIP */}
      {showVipChoice && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">

          <div className="relative w-full max-w-[600px] max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111] p-5 shadow-2xl sm:p-7">

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
                  15000.đ
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

      {/* MODAL THANH TOÁN */}
      {showPayment && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/90 p-5 backdrop-blur-sm">

          <div className="relative w-full max-w-[720px] max-h-[92vh] overflow-y-auto rounded-[22px] border border-white/10 bg-[#111] p-5 shadow-2xl sm:p-7">

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

            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center">

              <div className="text-sm text-gray-400">
                Số tiền cần chuyển
              </div>

              <div className="mt-1 text-4xl font-black text-red-400">
                15.000đ
              </div>

            </div>

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

            {paymentStatus === "pending" && (
              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm leading-7 text-gray-400">

                <strong className="text-yellow-400">
                  📌 Lưu ý:
                </strong>

                <br />

                Chuyển đúng{" "}
                <strong className="text-white">
                  15.000đ
                </strong>{" "}
                và ghi đúng mã đơn:

                <strong className="ml-1 text-red-400">
                  {orderCode}
                </strong>

                <br />

                Không cần báo admin.
                Hệ thống sẽ tự động xác nhận thanh toán.

              </div>
            )}

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