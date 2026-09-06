import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // =========================
    // 1. Kiểm tra API KEY
    // =========================
    const apiKey = req.headers.get("Authorization");

    const expectedKey = process.env.SEPAY_API_KEY;

    if (!expectedKey) {
      console.error("Thiếu SEPAY_API_KEY");
      return NextResponse.json(
        { success: false, message: "Server chưa cấu hình API key" },
        { status: 500 }
      );
    }

    if (apiKey !== `Apikey ${expectedKey}`) {
      console.log("Webhook SePay: API key không hợp lệ");

      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // 2. Đọc dữ liệu giao dịch
    // =========================
    const body = await req.json();

    console.log("SEPAY PAYMENT:", body);

    const amount = Number(
      body.transferAmount ??
        body.amount ??
        body.transfer_amount ??
        0
    );

    const content = String(
      body.content ??
        body.description ??
        ""
    ).trim();

    const transactionId = String(
      body.id ??
        body.transaction_id ??
        body.transactionId ??
        ""
    );

    const transferType = String(
      body.transferType ??
        body.transfer_type ??
        ""
    ).toLowerCase();

    // Chỉ nhận tiền vào
    if (
      transferType &&
      transferType !== "in" &&
      transferType !== "credit"
    ) {
      return NextResponse.json({
        success: true,
        message: "Bỏ qua giao dịch tiền ra",
      });
    }

    // =========================
    // 3. Kiểm tra dữ liệu
    // =========================
    if (!amount || !content) {
      return NextResponse.json({
        success: true,
        message: "Không đủ dữ liệu giao dịch",
      });
    }

    // =========================
    // 4. Tìm mã đơn trong nội dung
    // =========================
    const orderCodeMatch = content.match(
      /TRADA[A-Z0-9]+/i
    );

    if (!orderCodeMatch) {
      console.log("Không tìm thấy mã đơn:", content);

      return NextResponse.json({
        success: true,
        message: "Không tìm thấy mã đơn",
      });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();

    console.log("Mã đơn:", orderCode);
    console.log("Số tiền:", amount);

    // =========================
    // 5. Tìm đơn hàng
    // =========================
    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("movie_orders")
        .select("*")
        .eq("order_code", orderCode)
        .maybeSingle();

    if (orderError) {
      console.error("Lỗi tìm đơn:", orderError);

      return NextResponse.json(
        {
          success: false,
          message: "Lỗi database",
        },
        { status: 500 }
      );
    }

    if (!order) {
      console.log("Không tìm thấy đơn:", orderCode);

      return NextResponse.json({
        success: true,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // =========================
    // 6. Nếu đã duyệt thì bỏ qua
    // =========================
    if (order.status === "approved") {
      return NextResponse.json({
        success: true,
        message: "Đơn đã được duyệt trước đó",
      });
    }

    // =========================
    // 7. Kiểm tra số tiền
    // =========================
    if (amount < Number(order.amount)) {
      console.log(
        `Sai số tiền. Nhận ${amount}, cần ${order.amount}`
      );

      return NextResponse.json({
        success: true,
        message: "Số tiền không đúng",
      });
    }

    // =========================
    // 8. Cấp quyền xem phim
    // =========================
    const { error: accessError } =
      await supabaseAdmin
        .from("user_movie_access")
        .upsert(
          {
            user_id: order.user_id,
            movie_slug: order.movie_slug,
            price: order.amount,
            started_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,movie_slug",
          }
        );

    if (accessError) {
      console.error(
        "Lỗi cấp quyền phim:",
        accessError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Không thể cấp quyền xem phim",
        },
        { status: 500 }
      );
    }

    // =========================
    // 9. Đánh dấu đơn đã thanh toán
    // =========================
    const { error: updateError } =
      await supabaseAdmin
        .from("movie_orders")
        .update({
          status: "approved",
        })
        .eq("id", order.id);

    if (updateError) {
      console.error(
        "Lỗi cập nhật đơn:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Đã cấp quyền nhưng chưa cập nhật đơn",
        },
        { status: 500 }
      );
    }

    console.log(
      `ĐÃ DUYỆT ĐƠN ${orderCode} - ${order.movie_title}`
    );

    // =========================
    // 10. Trả kết quả cho SePay
    // =========================
    return NextResponse.json({
      success: true,
      message: "Thanh toán thành công",
      order_code: orderCode,
      transaction_id: transactionId,
    });
  } catch (error) {
    console.error("SEPAY WEBHOOK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook error",
      },
      { status: 500 }
    );
  }
}