"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

type Props = {
  movieSlug: string;
  episodeId: number;
  episodeTitle: string;
};

export default function Comments({
  movieSlug,
  episodeId,
  episodeTitle,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function loadComments() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("movie_slug", movieSlug)
      .eq("episode_id", episodeId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Lỗi tải bình luận:", error);
      setComments([]);
    } else {
      setComments(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadComments();
  }, [movieSlug, episodeId]);

  async function submitComment() {
    const text = content.trim();

    if (!text) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Bạn cần đăng nhập để bình luận.");
      return;
    }

    setSending(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        movie_slug: movieSlug,
        episode_id: episodeId,
        episode_title: episodeTitle,
        content: text,
        parent_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Lỗi gửi bình luận:", error);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } else if (data) {
      setComments((prev) => [data, ...prev]);
      setContent("");
    }

    setSending(false);
  }

  async function deleteComment(id: number) {
    const ok = confirm("Bạn có chắc muốn xóa bình luận này không?");

    if (!ok) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Lỗi xóa bình luận:", error);
      alert("Không thể xóa bình luận.");
      return;
    }

    setComments((prev) =>
      prev.filter((comment) => comment.id !== id)
    );
  }

  function formatTime(date: string) {
    const diff =
      Date.now() - new Date(date).getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);

    if (days < 30) return `${days} ngày trước`;

    return new Date(date).toLocaleDateString("vi-VN");
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">

      {/* HEADER */}
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
          THẢO LUẬN
        </p>

        <h2 className="mt-2 text-3xl font-black">
          💬 Bình luận {episodeTitle}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Cùng chia sẻ cảm nghĩ về tập phim này.
        </p>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitComment();
            }
          }}
          placeholder={
            userId
              ? "Bạn đang nghĩ gì về tập này?"
              : "Đăng nhập để tham gia bình luận..."
          }
          disabled={!userId || sending}
          maxLength={1000}
          rows={3}
          className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="mt-3 flex items-center justify-between gap-4">

          <span className="text-xs text-gray-600">
            {content.length}/1000
          </span>

          <button
            type="button"
            onClick={submitComment}
            disabled={!userId || !content.trim() || sending}
            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
          >
            {sending ? "Đang gửi..." : "💬 Gửi bình luận"}
          </button>

        </div>

        {!userId && (
          <p className="mt-3 text-xs text-gray-500">
            🔐 Bạn cần đăng nhập để bình luận.
          </p>
        )}

      </div>

      {/* COMMENTS */}
      <div className="mt-8">

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-gray-500">
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">

            <div className="text-4xl">
              💬
            </div>

            <p className="mt-3 font-bold">
              Chưa có bình luận nào
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Hãy là người đầu tiên bình luận về tập phim này.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {comments.map((comment) => (

              <div
                key={comment.id}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
              >

                <div className="flex items-start gap-3">

                  {/* AVATAR */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-lg">
                    👤
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="font-bold">
                        Thành viên
                      </span>

                      <span className="text-xs text-gray-600">
                        •
                      </span>

                      <span className="text-xs text-gray-600">
                        {formatTime(comment.created_at)}
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

                      {userId === comment.user_id && (
                        <button
                          type="button"
                          onClick={() =>
                            deleteComment(comment.id)
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

            ))}

          </div>
        )}

      </div>

    </section>
  );
}