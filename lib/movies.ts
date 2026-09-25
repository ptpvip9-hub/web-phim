export type Movie = {
  slug: string;
  title: string;
  poster: string;
  href: string;
  description: string;
  episodes: string;
  badge?: string;
  genre: string;
};

export const movies: Movie[] = [
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

  {
    slug: "hay-de-em-yeu-anh",
    title: "Hãy Để Em Yêu Anh",
    poster: "/poster-hay-de-em-yeu-anh.jpg",
    href: "/phim/hay-de-em-yeu-anh",
    description:
      "Một câu chuyện tình cảm đầy cảm xúc với những lựa chọn và rung động khó quên.",
    episodes: "13 tập",
    badge: "MỚI",
    genre: "Drama • Tình cảm",
  },

  {
    slug: "nhan-ha-truong-ninh",
    title: "Nhạn Hạ Trường Ninh",
    poster: "/poster-nhan-ha-truong-ninh.jpg",
    href: "/phim/nhan-ha-truong-ninh",
    description:
      "Một câu chuyện tình cảm đầy cảm xúc với những bí mật và lựa chọn khó đoán.",
    episodes: "29 tập",
    badge: "MỚI",
    genre: "Drama • Tình cảm",
  },
];