import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sepayApiKey = process.env.SEPAY_API_KEY;

if (!supabaseUrl) {
  throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL");
}

if (!serviceRoleKey) {
  throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      message: "Unauthorized",
    },
    { status: 401 }
  );
}

export async function POST(req: NextRequest) {
  try {
    // =====================================================
    // 1. KIỂM TRA SEPAY API KEY
    // =====================================================

    if (!sepayApiKey) {
      console.error("Thiếu SEPAY_API_KEY");

      return NextResponse.json(
        {
          success: false,
          message: "Server chưa cấu hình API key",
        },
        { status: 500 }
      );
    }

    const authorization =
      req.headers.get("authorization");

    if (
      !authorization ||
      authorization !== `Apikey ${sepayApiKey}`
    ) {
      console.warn(
        "Webhook SePay bị từ chối: API key không hợp lệ"
      );

      return unauthorized();
    }

    // =====================================================
    // 2. ĐỌC BODY
    // =====================================================

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "JSON không hợp lệ",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 3. LẤY THÔNG TIN CẦN THIẾT
    // =====================================================

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
    ).trim();

    const transferType = String(
      body.transferType ??
        body.transfer_type ??
        ""
    )
      .trim()
      .toLowerCase();

    // =====================================================
    // 4. CHỈ NHẬN GIAO DỊCH TIỀN VÀO
    // =====================================================

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

    // =====================================================
    // 5. VALIDATE
    // =====================================================

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Số tiền giao dịch không hợp lệ",
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json({
        success: true,
        message: "Không có nội dung chuyển khoản",
      });
    }

    /*
     * Transaction ID rất quan trọng để đối chiếu.
     *
     * Tuy nhiên SePay có thể gửi một số payload
     * không có trường id trong môi trường test.
     *
     * Vì vậy không chặn cứng ở đây.
     */

    // =====================================================
    // 6. TÌM MÃ ĐƠN
    // =====================================================

    const orderCodeMatch = content.match(
      /TRADAVIP[A-Z0-9]+|TRADAP[A-Z0-9]+/i
    );

    if (!orderCodeMatch) {
      console.log(
        "Bỏ qua giao dịch không có mã đơn:",
        content
      );

      return NextResponse.json({
        success: true,
        message: "Không tìm thấy mã đơn",
      });
    }

    const orderCode =
      orderCodeMatch[0].toUpperCase();

    console.log(
      "SePay:",
      {
        orderCode,
        amount,
        transactionId: transactionId || "N/A",
      }
    );

    // =====================================================
    // 7. VIP
    // =====================================================

    if (orderCode.startsWith("TRADAVIP")) {
      console.log(
        "Xử lý đơn VIP:",
        orderCode
      );

      const {
        data: vipOrder,
        error: vipOrderError,
      } = await supabaseAdmin
        .from("vip_orders")
        .select(
          "id, user_id, package_months, amount, status, order_code"
        )
        .eq("order_code", orderCode)
        .maybeSingle();

      if (vipOrderError) {
        console.error(
          "Lỗi tìm đơn VIP:",
          vipOrderError
        );

        return NextResponse.json(
          {
            success: false,
            message: "Lỗi database",
          },
          { status: 500 }
        );
      }

      if (!vipOrder) {
        return NextResponse.json({
          success: true,
          message: "Không tìm thấy đơn VIP",
        });
      }

      // ===================================================
      // KIỂM TRA SỐ TIỀN TRƯỚC KHI GỌI RPC
      // ===================================================

      if (amount !== Number(vipOrder.amount)) {
        console.warn(
          "Sai số tiền VIP:",
          {
            orderCode,
            received: amount,
            expected: vipOrder.amount,
          }
        );

        return NextResponse.json({
          success: true,
          message: "Số tiền VIP không đúng",
        });
      }

      // ===================================================
      // ATOMIC DATABASE TRANSACTION
      // ===================================================

      const { data: result, error: processError } =
        await supabaseAdmin.rpc(
          "process_vip_payment",
          {
            p_order_id: vipOrder.id,
            p_amount: amount,
          }
        );

      if (processError) {
        console.error(
          "Lỗi xử lý VIP:",
          processError
        );

        return NextResponse.json(
          {
            success: false,
            message: "Không thể xử lý thanh toán VIP",
          },
          { status: 500 }
        );
      }

      if (!result?.success) {
        console.warn(
          "VIP không được duyệt:",
          {
            orderCode,
            reason: result?.reason,
          }
        );

        return NextResponse.json({
          success: true,
          message:
            result?.reason ||
            "Không thể xử lý đơn VIP",
        });
      }

      if (result.already_processed) {
        return NextResponse.json({
          success: true,
          message:
            "Đơn VIP đã được xử lý trước đó",
          order_code: orderCode,
          transaction_id:
            transactionId || null,
        });
      }

      console.log(
        "ĐÃ CẤP VIP:",
        {
          orderCode,
          packageMonths:
            vipOrder.package_months,
          expiresAt:
            result.expires_at,
        }
      );

      return NextResponse.json({
        success: true,
        message:
          "Thanh toán VIP thành công",
        order_code: orderCode,
        transaction_id:
          transactionId || null,
        package_months:
          vipOrder.package_months,
        expires_at:
          result.expires_at,
      });
    }

    // =====================================================
    // 8. MUA PHIM
    // =====================================================

    if (!orderCode.startsWith("TRADAP")) {
      return NextResponse.json({
        success: true,
        message: "Mã đơn không hợp lệ",
      });
    }

    console.log(
      "Xử lý đơn phim:",
      orderCode
    );

    const {
      data: movieOrder,
      error: movieOrderError,
    } = await supabaseAdmin
      .from("movie_orders")
      .select(
        "id, user_id, movie_slug, movie_title, amount, status, order_code"
      )
      .eq("order_code", orderCode)
      .maybeSingle();

    if (movieOrderError) {
      console.error(
        "Lỗi tìm đơn phim:",
        movieOrderError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Lỗi database",
        },
        { status: 500 }
      );
    }

    if (!movieOrder) {
      return NextResponse.json({
        success: true,
        message: "Không tìm thấy đơn phim",
      });
    }

    // =====================================================
    // KIỂM TRA SỐ TIỀN CHÍNH XÁC
    // =====================================================

    if (amount !== Number(movieOrder.amount)) {
      console.warn(
        "Sai số tiền mua phim:",
        {
          orderCode,
          received: amount,
          expected: movieOrder.amount,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Số tiền không đúng",
      });
    }

    // =====================================================
    // ATOMIC DATABASE TRANSACTION
    // =====================================================

    const {
      data: result,
      error: processError,
    } = await supabaseAdmin.rpc(
      "process_movie_payment",
      {
        p_order_id: movieOrder.id,
        p_amount: amount,
      }
    );

    if (processError) {
      console.error(
        "Lỗi xử lý đơn phim:",
        processError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Không thể xử lý thanh toán mua phim",
        },
        { status: 500 }
      );
    }

    if (!result?.success) {
      console.warn(
        "Đơn phim không được duyệt:",
        {
          orderCode,
          reason: result?.reason,
        }
      );

      return NextResponse.json({
        success: true,
        message:
          result?.reason ||
          "Không thể xử lý đơn phim",
      });
    }

    if (result.already_processed) {
      return NextResponse.json({
        success: true,
        message:
          "Đơn phim đã được xử lý trước đó",
        order_code: orderCode,
        transaction_id:
          transactionId || null,
      });
    }

    console.log(
      "ĐÃ MỞ KHÓA PHIM:",
      {
        orderCode,
        movie:
          movieOrder.movie_title,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Thanh toán mua phim thành công",
      order_code: orderCode,
      transaction_id:
        transactionId || null,
    });
  } catch (error) {
    console.error(
      "SEPAY WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Webhook error",
      },
      { status: 500 }
    );
  }
}