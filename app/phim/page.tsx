export default function YeuDenMucCamKyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "white",
        padding: "30px",
      }}
    >
      <h1>Yêu Đến Mức Cấm Kỵ</h1>

      <video
        controls
        preload="auto"
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "block",
          backgroundColor: "black",
        }}
      >
        <source
          src="/videos/yeu-den-muc-cam-ky/tap1-5.mp4"
          type="video/mp4"
        />

        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </main>
  );
}