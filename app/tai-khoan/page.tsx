"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type VipInfo = {
  package_months: number;
  price: number;
  started_at: string;
  expires_at: string;
};

type VipPackage = {
  id: string;
  title: string;
  duration: string;
  price: string;
  priceNumber: number;
  popular: boolean;
};

export default function TaiKhoanPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedVip, setSelectedVip] = useState("3");
  const [vipInfo, setVipInfo] = useState<VipInfo | null>(null);
  const [expiredVip, setExpiredVip] = useState<VipInfo | null>(null);

  const [showPayment, setShowPayment] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  const [copied, setCopied] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const vipPackages: VipPackage[] = [
    {
      id: "1",
      title: "VIP 1 THÁNG",
      duration: "30 ngày",
      price: "79.000đ",
      priceNumber: 79000,
      popular: false,
    },
    {
      id: "3",
      title: "VIP 3 THÁNG",
      duration: "90 ngày",
      price: "189.000đ",
      priceNumber: 189000,
      popular: true,
    },
    {
      id: "6",
      title: "VIP 6 THÁNG",
      duration: "180 ngày",
      price: "359.000đ",
      priceNumber: 359000,
      popular: false,
    },
    {
      id: "12",
      title: "VIP 12 THÁNG",
      duration: "365 ngày",
      price: "599.000đ",
      priceNumber: 599000,
      popular: false,
    },
  ];

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/dang-nhap");
        return;
      }

      setEmail(user.email ?? "");

      await loadVip(user.id);

      setLoading(false);
    }

    loadUser();
  }, [router]);

  // =========================
  // LOAD VIP
  // =========================
  async function loadVip(userId: string) {
    // VIP ĐANG HOẠT ĐỘNG
    const { data: activeVip, error: activeError } =
      await supabase
        .from("user_vip")
        .select(
          "package_months, price, started_at, expires_at"
        )
        .eq("user_id", userId)
        .gt(
          "expires_at",
          new Date().toISOString()
        )
        .order("expires_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (!activeError && activeVip) {
      setVipInfo(activeVip);
      setExpiredVip(null);
      return;
    }

    // KHÔNG CÒN VIP → LẤY GÓI GẦN NHẤT
    const { data: latestVip } =
      await supabase
        .from("user_vip")
        .select(
          "package_months, price, started_at, expires_at"
        )
        .eq("user_id", userId)
        .order("expires_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    setVipInfo(null);

    if (latestVip) {
      setExpiredVip(latestVip);
    } else {
      setExpiredVip(null);
    }
  }

  // =========================
  // CLEAR POLLING
  // =========================
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  const selectedPackage = vipPackages.find(
    (pkg) => pkg.id === selectedVip
  );

  // =========================
  // FORMAT DATE
  // =========================
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

  // =========================
  // TÍNH SỐ NGÀY CÒN LẠI
  // =========================
  function getRemainingDays(date: string) {
    const now = new Date().getTime();
    const expires = new Date(date).getTime();

    const diff = expires - now;

    if (diff <= 0) {
      return 0;
    }

    return Math.ceil(
      diff / (1000 * 60 * 60 * 24)
    );
  }

  // =========================
  // ORDER CODE
  // =========================
  function createOrderCode() {
    const random = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    return `TRADAVIP${selectedVip}T${random}`;
  }

  // =========================
  // TẠO ĐƠN VIP
  // =========================
  async function handleCreateOrder() {
    if (!selectedPackage || creatingOrder) {
      return;
    }

    setCreatingOrder(true);
    setSuccessMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/dang-nhap");
      return;
    }

    const packageMonths = Number(
      selectedPackage.id
    );

    // KIỂM TRA ĐƠN ĐANG CHỜ
    const { data: existingOrder } =
      await supabase
        .from("vip_orders")
        .select(
          "id, order_code, package_months, amount, status"
        )
        .eq("user_id", user.id)
        .eq(
          "package_months",
          packageMonths
        )
        .eq(
          "amount",
          selectedPackage.priceNumber
        )
        .eq("status", "pending")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (existingOrder) {
      setOrderCode(
        existingOrder.order_code
      );

      setOrderCreated(true);
      setPaymentStatus("pending");
      setShowPayment(true);

      setCreatingOrder(false);

      startPaymentPolling(
        existingOrder.order_code,
        user.id
      );

      return;
    }

    // TẠO ĐƠN MỚI
    const newOrderCode =
      createOrderCode();

    const { error } = await supabase
      .from("vip_orders")
      .insert({
        user_id: user.id,
        package_months: packageMonths,
        amount:
          selectedPackage.priceNumber,
        order_code: newOrderCode,
        status: "pending",
      });

    if (error) {
      console.error(error);

      alert(
        "Không thể tạo đơn VIP. Vui lòng thử lại."
      );

      setCreatingOrder(false);
      return;
    }

    setOrderCode(newOrderCode);
    setOrderCreated(true);
    setPaymentStatus("pending");
    setShowPayment(true);
    setCreatingOrder(false);

    startPaymentPolling(
      newOrderCode,
      user.id
    );
  }

  // =========================
  // POLLING THANH TOÁN
  // =========================
  function startPaymentPolling(
    code: string,
    userId: string
  ) {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    checkPaymentStatus(code, userId);

    pollingRef.current = setInterval(() => {
      checkPaymentStatus(code, userId);
    }, 3000);
  }

  async function checkPaymentStatus(
    code: string,
    userId: string
  ) {
    const { data, error } =
      await supabase
        .from("vip_orders")
        .select("status")
        .eq("user_id", userId)
        .eq("order_code", code)
        .maybeSingle();

    if (error || !data) {
      return;
    }

    // THÀNH CÔNG
    if (data.status === "approved") {
      if (pollingRef.current) {
        clearInterval(
          pollingRef.current
        );

        pollingRef.current = null;
      }

      setPaymentStatus("approved");

      await loadVip(userId);

      setSuccessMessage(
        "🎉 Thanh toán thành công! VIP của bạn đã được kích hoạt."
      );

      setTimeout(() => {
        setShowPayment(false);
        setOrderCreated(false);
        setOrderCode("");
      }, 1500);
    }

    // TỪ CHỐI
    if (data.status === "rejected") {
      if (pollingRef.current) {
        clearInterval(
          pollingRef.current
        );

        pollingRef.current = null;
      }

      setPaymentStatus("rejected");
    }
  }

  // =========================
  // CHUYỂN KHOẢN
  // =========================
  function getTransferContent() {
    return orderCode;
  }

  // =========================
  // QR
  // =========================
  function getQrUrl() {
    if (!selectedPackage || !orderCode) {
      return "";
    }

    const amount =
      selectedPackage.priceNumber;

    const addInfo =
      encodeURIComponent(orderCode);

    const accountName =
      encodeURIComponent(
        "LAM THI THU HIEN"
      );

    return `https://img.vietqr.io/image/970403-070117517142-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  }

  // =========================
  // COPY
  // =========================
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

  // =========================
  // ĐÓNG PAYMENT
  // =========================
  function closePayment() {
    setShowPayment(false);
  }

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Đang tải tài khoản...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight:
          "calc(100vh - 78px)",
        background:
          "radial-gradient(circle at top, rgba(229,9,20,0.12), transparent 35%), #050505",
        color: "#fff",
        padding:
          "45px 20px 70px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* =========================
            TIÊU ĐỀ
        ========================= */}
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              color: "#e50914",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            TRÀ ĐÁ DRAMA
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: 900,
            }}
          >
            👤 Tài khoản
          </h1>
        </div>

        {/* =========================
            THÔNG BÁO
        ========================= */}
        {successMessage && (
          <div
            style={{
              marginBottom: "20px",
              padding:
                "15px 18px",
              borderRadius: "14px",
              background:
                "rgba(22,163,74,0.12)",
              border:
                "1px solid rgba(34,197,94,0.35)",
              color: "#86efac",
              fontWeight: 700,
            }}
          >
            {successMessage}
          </div>
        )}

        {/* =========================
            THÔNG TIN TÀI KHOẢN
        ========================= */}
        <section
          style={{
            background: "#111",
            border:
              "1px solid #292929",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #e50914, #7a0008)",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "27px",
                flexShrink: 0,
              }}
            >
              👤
            </div>

            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  marginBottom: "6px",
                }}
              >
                Tài khoản của bạn
              </div>

              <div
                style={{
                  color: "#999",
                  fontSize: "14px",
                  wordBreak:
                    "break-all",
                }}
              >
                {email}
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            TRẠNG THÁI VIP
        ========================= */}
        <section
          style={{
            background: vipInfo
              ? "linear-gradient(135deg, rgba(229,9,20,0.18), #111)"
              : expiredVip
              ? "linear-gradient(135deg, rgba(234,179,8,0.10), #111)"
              : "#111",

            border: vipInfo
              ? "1px solid rgba(229,9,20,0.5)"
              : expiredVip
              ? "1px solid rgba(234,179,8,0.3)"
              : "1px solid #292929",

            borderRadius: "18px",
            padding: "24px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#888",
                  fontSize: "13px",
                  marginBottom: "7px",
                }}
              >
                Trạng thái thành viên
              </div>

              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: vipInfo
                    ? "#ff4b55"
                    : expiredVip
                    ? "#facc15"
                    : "#ddd",
                }}
              >
                {vipInfo
                  ? "👑 Đang là thành viên VIP"
                  : expiredVip
                  ? "⚠️ VIP đã hết hạn"
                  : "Chưa là thành viên VIP"}
              </div>

              {/* VIP ACTIVE */}
              {vipInfo && (
                <>
                  <div
                    style={{
                      marginTop: "8px",
                      color: "#aaa",
                      fontSize: "14px",
                    }}
                  >
                    Gói VIP{" "}
                    <strong
                      style={{
                        color: "#fff",
                      }}
                    >
                      {
                        vipInfo.package_months
                      }{" "}
                      tháng
                    </strong>

                    {" • "}

                    Hết hạn ngày{" "}

                    <strong
                      style={{
                        color: "#fff",
                      }}
                    >
                      {formatDate(
                        vipInfo.expires_at
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      color: "#4ade80",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    🟢 Còn{" "}
                    {getRemainingDays(
                      vipInfo.expires_at
                    )}{" "}
                    ngày • VIP đang hoạt động
                  </div>
                </>
              )}

              {/* VIP HẾT HẠN */}
              {expiredVip &&
                !vipInfo && (
                  <>
                    <div
                      style={{
                        marginTop: "8px",
                        color: "#aaa",
                        fontSize: "14px",
                      }}
                    >
                      Gói VIP trước:{" "}
                      <strong
                        style={{
                          color: "#fff",
                        }}
                      >
                        {
                          expiredVip.package_months
                        }{" "}
                        tháng
                      </strong>
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        color: "#777",
                        fontSize: "13px",
                      }}
                    >
                      Đã hết hạn ngày{" "}
                      <strong
                        style={{
                          color: "#ccc",
                        }}
                      >
                        {formatDate(
                          expiredVip.expires_at
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        color: "#999",
                        fontSize: "13px",
                        lineHeight: 1.5,
                      }}
                    >
                      Bạn vẫn xem được
                      những bộ phim đã
                      mua vĩnh viễn.
                    </div>
                  </>
                )}

              {/* CHƯA TỪNG MUA */}
              {!vipInfo &&
                !expiredVip && (
                  <div
                    style={{
                      marginTop: "8px",
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    Bạn chưa có gói VIP
                    nào.
                  </div>
                )}
            </div>

            {/* BADGE / BUTTON */}
            {vipInfo ? (
              <div
                style={{
                  padding:
                    "10px 15px",
                  borderRadius: "20px",
                  background:
                    "rgba(229,9,20,0.12)",
                  border:
                    "1px solid rgba(229,9,20,0.35)",
                  color: "#ff4b55",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                VIP ACTIVE
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById(
                      "vip-packages"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }}
                style={{
                  border:
                    "1px solid rgba(229,9,20,0.4)",
                  borderRadius: "10px",
                  background:
                    "rgba(229,9,20,0.1)",
                  color: "#ff4b55",
                  padding:
                    "10px 15px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                👑{" "}
                {expiredVip
                  ? "Gia hạn VIP"
                  : "Mua VIP"}
              </button>
            )}
          </div>
        </section>

        {/* =========================
            GÓI VIP
        ========================= */}
        <section id="vip-packages">
          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "25px",
                fontWeight: 900,
              }}
            >
              👑 Đăng ký VIP
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#888",
                fontSize: "14px",
              }}
            >
              Chọn gói VIP phù hợp
              để xem toàn bộ nội
              dung trên Trà Đá
              Drama.
            </p>
          </div>

          {/* CÁC GÓI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "16px",
            }}
          >
            {vipPackages.map(
              (pkg) => {
                const selected =
                  selectedVip ===
                  pkg.id;

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() =>
                      setSelectedVip(
                        pkg.id
                      )
                    }
                    style={{
                      position:
                        "relative",
                      textAlign:
                        "left",
                      padding:
                        "23px",
                      borderRadius:
                        "18px",
                      border:
                        selected
                          ? "2px solid #e50914"
                          : "1px solid #292929",
                      background:
                        selected
                          ? "linear-gradient(145deg, rgba(229,9,20,0.16), #111)"
                          : "#111",
                      color: "#fff",
                      cursor:
                        "pointer",
                      boxShadow:
                        selected
                          ? "0 0 25px rgba(229,9,20,0.12)"
                          : "none",
                    }}
                  >
                    {pkg.popular && (
                      <div
                        style={{
                          position:
                            "absolute",
                          top: "-10px",
                          right: "15px",
                          padding:
                            "5px 9px",
                          borderRadius:
                            "20px",
                          background:
                            "#e50914",
                          color:
                            "#fff",
                          fontSize:
                            "10px",
                          fontWeight:
                            800,
                        }}
                      >
                        PHỔ BIẾN NHẤT
                      </div>
                    )}

                    <div
                      style={{
                        fontSize:
                          "14px",
                        fontWeight:
                          800,
                        color:
                          selected
                            ? "#ff4b55"
                            : "#bbb",
                        marginBottom:
                          "10px",
                      }}
                    >
                      👑{" "}
                      {pkg.title}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "28px",
                        fontWeight:
                          900,
                        marginBottom:
                          "4px",
                      }}
                    >
                      {pkg.price}
                    </div>

                    <div
                      style={{
                        color:
                          "#777",
                        fontSize:
                          "13px",
                        marginBottom:
                          "17px",
                      }}
                    >
                      Sử dụng trong{" "}
                      {pkg.duration}
                    </div>

                    <div
                      style={{
                        width:
                          "100%",
                        height:
                          "40px",
                        borderRadius:
                          "9px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          selected
                            ? "#e50914"
                            : "#1c1c1c",
                        color:
                          selected
                            ? "#fff"
                            : "#aaa",
                        fontWeight:
                          800,
                        fontSize:
                          "13px",
                      }}
                    >
                      {selected
                        ? "✓ Đã chọn"
                        : "Chọn gói này"}
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* THANH THANH TOÁN */}
          <div
            style={{
              marginTop:
                "20px",
              padding:
                "20px",
              borderRadius:
                "16px",
              background:
                "#111",
              border:
                "1px solid #292929",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: "18px",
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color:
                    "#888",
                  fontSize:
                    "13px",
                  marginBottom:
                    "5px",
                }}
              >
                Gói VIP đang chọn
              </div>

              <div
                style={{
                  fontSize:
                    "18px",
                  fontWeight:
                    900,
                }}
              >
                👑 VIP{" "}
                {selectedVip}{" "}
                tháng —{" "}
                {selectedPackage?.price}
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleCreateOrder
              }
              disabled={
                creatingOrder
              }
              style={{
                minWidth:
                  "200px",
                height:
                  "46px",
                border:
                  "none",
                borderRadius:
                  "11px",
                background:
                  creatingOrder
                    ? "#555"
                    : "#e50914",
                color:
                  "#fff",
                fontSize:
                  "15px",
                fontWeight:
                  800,
                cursor:
                  creatingOrder
                    ? "wait"
                    : "pointer",
              }}
            >
              {creatingOrder
                ? "Đang tạo đơn..."
                : "👑 Đăng ký VIP"}
            </button>
          </div>
        </section>
      </div>

      {/* =====================================================
          MODAL THANH TOÁN
      ===================================================== */}
      {showPayment &&
        orderCreated &&
        selectedPackage && (
          <div
            style={{
              position:
                "fixed",
              inset: 0,
              zIndex: 9999,
              background:
                "rgba(0,0,0,0.86)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "15px",
            }}
          >
            <div
              style={{
                width:
                  "100%",
                maxWidth:
                  "650px",
                maxHeight:
                  "calc(100vh - 30px)",
                overflowY:
                  "auto",
                background:
                  "#111",
                border:
                  "1px solid #333",
                borderRadius:
                  "20px",
                padding:
                  "20px",
                boxShadow:
                  "0 25px 70px rgba(0,0,0,0.85)",
                position:
                  "relative",
              }}
            >
              {/* ĐÓNG */}
              <button
                type="button"
                onClick={
                  closePayment
                }
                style={{
                  position:
                    "absolute",
                  right:
                    "12px",
                  top:
                    "12px",
                  width:
                    "34px",
                  height:
                    "34px",
                  borderRadius:
                    "50%",
                  border:
                    "1px solid #333",
                  background:
                    "#1b1b1b",
                  color:
                    "#aaa",
                  cursor:
                    "pointer",
                  fontSize:
                    "18px",
                  zIndex: 2,
                }}
              >
                ×
              </button>

              {/* TIÊU ĐỀ */}
              <div
                style={{
                  textAlign:
                    "center",
                  paddingRight:
                    "35px",
                }}
              >
                <div
                  style={{
                    color:
                      "#e50914",
                    fontSize:
                      "11px",
                    fontWeight:
                      800,
                    letterSpacing:
                      "2px",
                  }}
                >
                  TRÀ ĐÁ DRAMA
                </div>

                <h2
                  style={{
                    margin:
                      "5px 0 3px",
                    fontSize:
                      "22px",
                    fontWeight:
                      900,
                  }}
                >
                  👑 Thanh toán VIP
                </h2>

                <div
                  style={{
                    color:
                      "#888",
                    fontSize:
                      "13px",
                  }}
                >
                  {
                    selectedPackage.title
                  }
                </div>
              </div>

              {/* QR */}
              <div
                style={{
                  marginTop:
                    "12px",
                  display:
                    "flex",
                  justifyContent:
                    "center",
                }}
              >
                <div
                  style={{
                    background:
                      "#fff",
                    padding:
                      "7px",
                    borderRadius:
                      "11px",
                  }}
                >
                  <img
                    src={getQrUrl()}
                    alt="QR thanh toán VIP"
                    style={{
                      width:
                        "200px",
                      height:
                        "200px",
                      display:
                        "block",
                      objectFit:
                        "contain",
                    }}
                  />
                </div>
              </div>

              {/* SỐ TIỀN */}
              <div
                style={{
                  marginTop:
                    "12px",
                  padding:
                    "12px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(229,9,20,0.08)",
                  border:
                    "1px solid rgba(229,9,20,0.25)",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    color:
                      "#888",
                    fontSize:
                      "12px",
                    marginBottom:
                      "3px",
                  }}
                >
                  Số tiền cần chuyển
                </div>

                <div
                  style={{
                    fontSize:
                      "26px",
                    fontWeight:
                      900,
                    color:
                      "#ff4b55",
                  }}
                >
                  {
                    selectedPackage.price
                  }
                </div>
              </div>

              {/* THÔNG TIN */}
              <div
                style={{
                  marginTop:
                    "12px",
                  background:
                    "#171717",
                  border:
                    "1px solid #292929",
                  borderRadius:
                    "13px",
                  padding:
                    "14px",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "14px",
                    fontWeight:
                      800,
                    marginBottom:
                      "11px",
                  }}
                >
                  🏦 Thông tin chuyển khoản
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gap:
                      "9px",
                    fontSize:
                      "13px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        color:
                          "#777",
                      }}
                    >
                      Ngân hàng:{" "}
                    </span>

                    <strong>
                      Sacombank
                    </strong>
                  </div>

                  <div>
                    <span
                      style={{
                        color:
                          "#777",
                      }}
                    >
                      Chủ tài khoản:{" "}
                    </span>

                    <strong>
                      Lâm Thị Thu Hiền
                    </strong>
                  </div>

                  {/* STK */}
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap:
                        "10px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          color:
                            "#777",
                        }}
                      >
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
                      style={{
                        border:
                          "1px solid #333",
                        background:
                          "#222",
                        color:
                          "#ddd",
                        borderRadius:
                          "7px",
                        padding:
                          "6px 9px",
                        cursor:
                          "pointer",
                        fontSize:
                          "11px",
                        flexShrink:
                          0,
                      }}
                    >
                      {copied ===
                      "stk"
                        ? "✓ Đã copy"
                        : "Sao chép"}
                    </button>
                  </div>

                  {/* NỘI DUNG */}
                  <div
                    style={{
                      borderTop:
                        "1px solid #292929",
                      paddingTop:
                        "10px",
                    }}
                  >
                    <div
                      style={{
                        color:
                          "#777",
                        fontSize:
                          "11px",
                        marginBottom:
                          "5px",
                      }}
                    >
                      Nội dung chuyển khoản
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap:
                          "10px",
                      }}
                    >
                      <strong
                        style={{
                          color:
                            "#ff4b55",
                          fontSize:
                            "15px",
                          letterSpacing:
                            "0.4px",
                          wordBreak:
                            "break-all",
                        }}
                      >
                        {
                          getTransferContent()
                        }
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            getTransferContent(),
                            "content"
                          )
                        }
                        style={{
                          border:
                            "1px solid #333",
                          background:
                            "#222",
                          color:
                            "#ddd",
                          borderRadius:
                            "7px",
                          padding:
                            "6px 9px",
                          cursor:
                            "pointer",
                          fontSize:
                            "11px",
                          flexShrink:
                            0,
                        }}
                      >
                        {copied ===
                        "content"
                          ? "✓ Đã copy"
                          : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PENDING */}
              {paymentStatus ===
                "pending" && (
                <div
                  style={{
                    marginTop:
                      "12px",
                    padding:
                      "13px",
                    borderRadius:
                      "12px",
                    background:
                      "linear-gradient(135deg, rgba(234,179,8,0.10), rgba(255,255,255,0.03))",
                    border:
                      "1px solid rgba(234,179,8,0.25)",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "17px",
                      marginBottom:
                        "3px",
                    }}
                  >
                    ⏳
                  </div>

                  <div
                    style={{
                      color:
                        "#facc15",
                      fontWeight:
                        900,
                      fontSize:
                        "14px",
                    }}
                  >
                    ĐANG CHỜ THANH TOÁN
                  </div>

                  <div
                    style={{
                      color:
                        "#999",
                      fontSize:
                        "12px",
                      marginTop:
                        "5px",
                      lineHeight:
                        1.5,
                    }}
                  >
                    Hệ thống đang tự
                    động kiểm tra
                    giao dịch.
                    <br />
                    Khi nhận được tiền,
                    VIP sẽ được kích
                    hoạt tự động.
                  </div>

                  <div
                    style={{
                      marginTop:
                        "8px",
                      fontSize:
                        "11px",
                      color:
                        "#666",
                    }}
                  >
                    Mã đơn:{" "}
                    <strong
                      style={{
                        color:
                          "#aaa",
                      }}
                    >
                      {orderCode}
                    </strong>
                  </div>
                </div>
              )}

              {/* APPROVED */}
              {paymentStatus ===
                "approved" && (
                <div
                  style={{
                    marginTop:
                      "12px",
                    padding:
                      "15px",
                    borderRadius:
                      "12px",
                    background:
                      "rgba(34,197,94,0.10)",
                    border:
                      "1px solid rgba(34,197,94,0.35)",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "26px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    🎉
                  </div>

                  <div
                    style={{
                      color:
                        "#4ade80",
                      fontWeight:
                        900,
                      fontSize:
                        "16px",
                    }}
                  >
                    THANH TOÁN THÀNH CÔNG
                  </div>

                  <div
                    style={{
                      color:
                        "#aaa",
                      fontSize:
                        "12px",
                      marginTop:
                        "5px",
                    }}
                  >
                    VIP đã được kích
                    hoạt cho tài khoản
                    của bạn.
                  </div>
                </div>
              )}

              {/* REJECTED */}
              {paymentStatus ===
                "rejected" && (
                <div
                  style={{
                    marginTop:
                      "12px",
                    padding:
                      "14px",
                    borderRadius:
                      "12px",
                    background:
                      "rgba(220,38,38,0.10)",
                    border:
                      "1px solid rgba(220,38,38,0.3)",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#f87171",
                      fontWeight:
                        900,
                      fontSize:
                        "14px",
                    }}
                  >
                    ❌ ĐƠN THANH TOÁN BỊ TỪ CHỐI
                  </div>

                  <div
                    style={{
                      color:
                        "#999",
                      fontSize:
                        "12px",
                      marginTop:
                        "5px",
                    }}
                  >
                    Vui lòng tạo đơn mới
                    hoặc liên hệ quản
                    trị viên.
                  </div>
                </div>
              )}

              {/* LƯU Ý */}
              {paymentStatus ===
                "pending" && (
                <div
                  style={{
                    marginTop:
                      "10px",
                    padding:
                      "12px",
                    borderRadius:
                      "11px",
                    background:
                      "#171717",
                    border:
                      "1px solid #292929",
                    color:
                      "#999",
                    fontSize:
                      "11px",
                    lineHeight:
                      1.55,
                  }}
                >
                  <strong
                    style={{
                      color:
                        "#fff",
                    }}
                  >
                    📌 Lưu ý:
                  </strong>{" "}
                  Chuyển đúng số tiền và ghi
                  đúng nội dung chuyển khoản
                  để hệ thống tự động nhận diện
                  giao dịch.
                </div>
              )}
            </div>
          </div>
        )}
    </main>
  );
}