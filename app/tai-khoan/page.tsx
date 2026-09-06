"use client";

import { useEffect, useState } from "react";
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

  const [showPayment, setShowPayment] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [copied, setCopied] = useState("");

  const vipPackages: VipPackage[] = [
    {
      id: "1",
      title: "VIP 1 THÁNG",
      duration: "30 ngày",
      price: "69.000đ",
      priceNumber: 69000,
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

      const { data, error } = await supabase
        .from("user_vip")
        .select("package_months, price, started_at, expires_at")
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setVipInfo(data);
      }

      setLoading(false);
    }

    loadUser();
  }, [router]);

  const selectedPackage = vipPackages.find(
    (pkg) => pkg.id === selectedVip
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function createOrderCode() {
    const random = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    return `TRADA${selectedVip}T${random}`;
  }

  async function handleCreateOrder() {
    if (!selectedPackage || creatingOrder) return;

    setCreatingOrder(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/dang-nhap");
      return;
    }

    const newOrderCode = createOrderCode();

    const { error } = await supabase.from("vip_orders").insert({
      user_id: user.id,
      package_months: selectedPackage.id === "12"
        ? 12
        : Number(selectedPackage.id),
      amount: selectedPackage.priceNumber,
      order_code: newOrderCode,
      status: "pending",
    });

    if (error) {
      console.error(error);
      alert("Không thể tạo đơn VIP. Vui lòng thử lại.");
      setCreatingOrder(false);
      return;
    }

    setOrderCode(newOrderCode);
    setOrderCreated(true);
    setShowPayment(true);
    setCreatingOrder(false);
  }

  function getTransferContent() {
    return orderCode;
  }

  function getQrUrl() {
    if (!selectedPackage || !orderCode) return "";

    const amount = selectedPackage.priceNumber;
    const addInfo = encodeURIComponent(orderCode);
    const accountName = encodeURIComponent("LAM THI THU HIEN");

    return `https://img.vietqr.io/image/970403-070117517142-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  }

  async function copyText(text: string, type: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      alert("Không thể sao chép.");
    }
  }

  function closePayment() {
    setShowPayment(false);
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 78px)",
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
        minHeight: "calc(100vh - 78px)",
        background:
          "radial-gradient(circle at top, rgba(229,9,20,0.12), transparent 35%), #050505",
        color: "#fff",
        padding: "45px 25px 70px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
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

        {/* THÔNG TIN TÀI KHOẢN */}
        <section
          style={{
            background: "#111",
            border: "1px solid #292929",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "30px",
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
                alignItems: "center",
                justifyContent: "center",
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
                }}
              >
                {email}
              </div>
            </div>
          </div>
        </section>

        {/* TRẠNG THÁI VIP */}
        <section
          style={{
            background: vipInfo
              ? "linear-gradient(135deg, rgba(229,9,20,0.18), #111)"
              : "#111",
            border: vipInfo
              ? "1px solid rgba(229,9,20,0.5)"
              : "1px solid #292929",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                  color: vipInfo ? "#ff4b55" : "#ddd",
                }}
              >
                {vipInfo
                  ? "👑 Đang là thành viên VIP"
                  : "Chưa là thành viên VIP"}
              </div>

              {vipInfo && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#aaa",
                    fontSize: "14px",
                  }}
                >
                  Gói VIP {vipInfo.package_months} tháng • Hết hạn ngày{" "}
                  <strong style={{ color: "#fff" }}>
                    {formatDate(vipInfo.expires_at)}
                  </strong>
                </div>
              )}
            </div>

            {vipInfo && (
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: "20px",
                  background: "rgba(229,9,20,0.12)",
                  border: "1px solid rgba(229,9,20,0.35)",
                  color: "#ff4b55",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                VIP ACTIVE
              </div>
            )}
          </div>
        </section>

        {/* ĐĂNG KÝ VIP */}
        <section>
          <div style={{ marginBottom: "18px" }}>
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
                margin: "7px 0 0",
                color: "#888",
                fontSize: "14px",
              }}
            >
              Chọn gói VIP phù hợp để xem nội dung dành riêng cho thành viên.
            </p>
          </div>

          {/* CÁC GÓI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            {vipPackages.map((pkg) => {
              const selected = selectedVip === pkg.id;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedVip(pkg.id)}
                  style={{
                    position: "relative",
                    textAlign: "left",
                    padding: "25px",
                    borderRadius: "18px",
                    border: selected
                      ? "2px solid #e50914"
                      : "1px solid #292929",
                    background: selected
                      ? "linear-gradient(145deg, rgba(229,9,20,0.16), #111)"
                      : "#111",
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: selected
                      ? "0 0 25px rgba(229,9,20,0.12)"
                      : "none",
                  }}
                >
                  {pkg.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-11px",
                        right: "18px",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        background: "#e50914",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      PHỔ BIẾN NHẤT
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: selected ? "#ff4b55" : "#bbb",
                      marginBottom: "12px",
                    }}
                  >
                    👑 {pkg.title}
                  </div>

                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: 900,
                      marginBottom: "5px",
                    }}
                  >
                    {pkg.price}
                  </div>

                  <div
                    style={{
                      color: "#777",
                      fontSize: "13px",
                      marginBottom: "20px",
                    }}
                  >
                    Sử dụng trong {pkg.duration}
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "42px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: selected ? "#e50914" : "#1c1c1c",
                      color: selected ? "#fff" : "#aaa",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    {selected ? "✓ Đã chọn" : "Chọn gói này"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* THANH CHỌN GÓI */}
          <div
            style={{
              marginTop: "22px",
              padding: "22px",
              borderRadius: "16px",
              background: "#111",
              border: "1px solid #292929",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#888",
                  fontSize: "13px",
                  marginBottom: "6px",
                }}
              >
                Gói VIP đang chọn
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                }}
              >
                👑 VIP {selectedVip} tháng — {selectedPackage?.price}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={creatingOrder}
              style={{
                minWidth: "200px",
                height: "48px",
                border: "none",
                borderRadius: "11px",
                background: creatingOrder ? "#555" : "#e50914",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 800,
                cursor: creatingOrder ? "wait" : "pointer",
              }}
            >
              {creatingOrder
                ? "Đang tạo đơn..."
                : "👑 Đăng ký VIP"}
            </button>
          </div>
        </section>
      </div>

      {/* MODAL THANH TOÁN */}
      {showPayment && orderCreated && selectedPackage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "720px",
              background: "#111",
              border: "1px solid #333",
              borderRadius: "22px",
              padding: "28px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
              position: "relative",
            }}
          >
            {/* ĐÓNG */}
            <button
              type="button"
              onClick={closePayment}
              style={{
                position: "absolute",
                right: "18px",
                top: "15px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #333",
                background: "#1b1b1b",
                color: "#aaa",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ×
            </button>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#e50914",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "2px",
                }}
              >
                TRÀ ĐÁ DRAMA
              </div>

              <h2
                style={{
                  margin: "8px 0 5px",
                  fontSize: "25px",
                  fontWeight: 900,
                }}
              >
                👑 Thanh toán VIP
              </h2>

              <div
                style={{
                  color: "#888",
                  fontSize: "14px",
                }}
              >
                {selectedPackage.title}
              </div>
            </div>

            {/* QR */}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "12px",
                  borderRadius: "15px",
                }}
              >
                <img
                  src={getQrUrl()}
                  alt="QR thanh toán VIP"
                  style={{
                    width: "270px",
                    height: "270px",
                    display: "block",
                  }}
                />
              </div>
            </div>

            {/* SỐ TIỀN */}
            <div
              style={{
                marginTop: "22px",
                padding: "17px",
                borderRadius: "14px",
                background: "rgba(229,9,20,0.09)",
                border: "1px solid rgba(229,9,20,0.3)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#888",
                  fontSize: "13px",
                  marginBottom: "5px",
                }}
              >
                Số tiền cần chuyển
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  color: "#ff4b55",
                }}
              >
                {selectedPackage.price}
              </div>
            </div>

            {/* THÔNG TIN CHUYỂN KHOẢN */}
            <div
              style={{
                marginTop: "18px",
                background: "#171717",
                border: "1px solid #292929",
                borderRadius: "15px",
                padding: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  marginBottom: "15px",
                }}
              >
                🏦 Thông tin chuyển khoản
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "11px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <span style={{ color: "#777" }}>Ngân hàng: </span>
                  <strong>Sacombank</strong>
                </div>

                <div>
                  <span style={{ color: "#777" }}>Chủ tài khoản: </span>
                  <strong>Lâm Thị Thu Hiền</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div>
                    <span style={{ color: "#777" }}>Số tài khoản: </span>
                    <strong>070117517142</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyText("070117517142", "stk")
                    }
                    style={{
                      border: "1px solid #333",
                      background: "#222",
                      color: "#ddd",
                      borderRadius: "8px",
                      padding: "7px 10px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {copied === "stk" ? "✓ Đã copy" : "Sao chép"}
                  </button>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #292929",
                    paddingTop: "13px",
                  }}
                >
                  <div
                    style={{
                      color: "#777",
                      fontSize: "12px",
                      marginBottom: "7px",
                    }}
                  >
                    Nội dung chuyển khoản
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <strong
                      style={{
                        color: "#ff4b55",
                        fontSize: "16px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {getTransferContent()}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(getTransferContent(), "content")
                      }
                      style={{
                        border: "1px solid #333",
                        background: "#222",
                        color: "#ddd",
                        borderRadius: "8px",
                        padding: "7px 10px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {copied === "content"
                        ? "✓ Đã copy"
                        : "Sao chép"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* VÍ DỤ */}
            <div
              style={{
                marginTop: "16px",
                padding: "15px",
                borderRadius: "13px",
                background: "#171717",
                border: "1px solid #292929",
                color: "#aaa",
                fontSize: "13px",
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#fff" }}>
                📌 Ví dụ:
              </strong>{" "}
              Bạn mua VIP 3 tháng thì chuyển{" "}
              <strong style={{ color: "#fff" }}>
                189.000đ
              </strong>{" "}
              và ghi đúng nội dung{" "}
              <strong style={{ color: "#ff4b55" }}>
                {orderCode}
              </strong>
              .
              <br />
              Sau khi chuyển khoản, vui lòng giữ lại giao dịch để đối
              chiếu.
            </div>

            {/* TRẠNG THÁI */}
            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                color: "#999",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              🕐 Đơn hàng đang ở trạng thái{" "}
              <strong style={{ color: "#fff" }}>
                CHỜ DUYỆT
              </strong>
              .
              <br />
              VIP chỉ được kích hoạt sau khi thanh toán được xác nhận.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}