"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type VipOrder = {
  id: string;
  user_id: string;
  package_months: number;
  amount: number;
  order_code: string;
  status: string;
};

export default function AdminVipPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<VipOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/dang-nhap");
      return;
    }

    // Kiểm tra tài khoản có phải admin không
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id, email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !admin) {
      router.push("/");
      return;
    }

    // Lấy danh sách đơn VIP
    const { data, error } = await supabase
      .from("vip_orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Không tải được danh sách đơn VIP.");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function approveOrder(order: VipOrder) {
    const confirmApprove = confirm(
      `Duyệt đơn ${order.order_code} cho gói ${order.package_months} tháng?`
    );

    if (!confirmApprove) return;

    setMessage("Đang duyệt...");

    // 1. Cập nhật trạng thái đơn
    const { error: orderError } = await supabase
      .from("vip_orders")
      .update({
        status: "approved",
      })
      .eq("id", order.id);

    if (orderError) {
      console.error(orderError);
      setMessage("Không thể cập nhật trạng thái đơn.");
      return;
    }

    // 2. Tính ngày hết hạn
    const startedAt = new Date();

    const expiresAt = new Date(startedAt);
    expiresAt.setMonth(expiresAt.getMonth() + order.package_months);

    // 3. Kiểm tra VIP cũ
    const { data: oldVip } = await supabase
      .from("user_vip")
      .select("id")
      .eq("user_id", order.user_id)
      .maybeSingle();

    if (oldVip) {
      // Nếu đã có VIP thì cập nhật
      const { error: vipError } = await supabase
        .from("user_vip")
        .update({
          package_months: order.package_months,
          price: order.amount,
          started_at: startedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", oldVip.id);

      if (vipError) {
        console.error(vipError);
        setMessage(
          "Đơn đã duyệt nhưng không cập nhật được quyền VIP."
        );
        return;
      }
    } else {
      // Nếu chưa có VIP thì tạo mới
      const { error: vipError } = await supabase
        .from("user_vip")
        .insert({
          user_id: order.user_id,
          package_months: order.package_months,
          price: order.amount,
          started_at: startedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        });

      if (vipError) {
        console.error(vipError);
        setMessage(
          "Đơn đã duyệt nhưng không tạo được quyền VIP."
        );
        return;
      }
    }

    setMessage("✅ Đã duyệt và cấp VIP thành công!");

    // Tải lại danh sách
    await checkAdminAndLoad();
  }

  async function rejectOrder(order: VipOrder) {
    const confirmReject = confirm(
      `Bạn có chắc muốn từ chối đơn ${order.order_code}?`
    );

    if (!confirmReject) return;

    const { error } = await supabase
      .from("vip_orders")
      .update({
        status: "rejected",
      })
      .eq("id", order.id);

    if (error) {
      console.error(error);
      setMessage("Không thể từ chối đơn.");
      return;
    }

    setMessage("Đã từ chối đơn.");

    await checkAdminAndLoad();
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
        }}
      >
        <div>Đang tải trang quản trị...</div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            👑 Quản lý VIP
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "8px",
            }}
          >
            Quản lý và duyệt đơn đăng ký VIP
          </p>

          {message && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px 15px",
                background: "#f0fdf4",
                borderRadius: "10px",
                color: "#166534",
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              marginTop: "25px",
              overflowX: "auto",
            }}
          >
            {orders.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#777",
                }}
              >
                Chưa có đơn VIP nào.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      textAlign: "left",
                    }}
                  >
                    <th style={thStyle}>Mã đơn</th>
                    <th style={thStyle}>User ID</th>
                    <th style={thStyle}>Gói</th>
                    <th style={thStyle}>Số tiền</th>
                    <th style={thStyle}>Trạng thái</th>
                    <th style={thStyle}>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={tdStyle}>
                        <strong>{order.order_code}</strong>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontSize: "12px",
                          maxWidth: "180px",
                          wordBreak: "break-all",
                        }}
                      >
                        {order.user_id}
                      </td>

                      <td style={tdStyle}>
                        {order.package_months} tháng
                      </td>

                      <td style={tdStyle}>
                        {Number(order.amount).toLocaleString("vi-VN")}đ
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: 600,
                            background:
                              order.status === "approved"
                                ? "#dcfce7"
                                : order.status === "rejected"
                                ? "#fee2e2"
                                : "#fef3c7",
                            color:
                              order.status === "approved"
                                ? "#166534"
                                : order.status === "rejected"
                                ? "#991b1b"
                                : "#92400e",
                          }}
                        >
                          {order.status === "approved"
                            ? "Đã duyệt"
                            : order.status === "rejected"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {order.status === "pending" ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={() => approveOrder(order)}
                              style={{
                                border: "none",
                                background: "#16a34a",
                                color: "white",
                                padding: "9px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              ✓ Duyệt
                            </button>

                            <button
                              onClick={() => rejectOrder(order)}
                              style={{
                                border: "none",
                                background: "#dc2626",
                                color: "white",
                                padding: "9px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              ✕ Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#777" }}>
                            Đã xử lý
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const thStyle = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
};