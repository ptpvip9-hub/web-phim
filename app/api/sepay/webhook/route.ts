import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // =====================================================
    // 1. KIỂM TRA API KEY SEPAY
    // =====================================================
    const apiKey = req.headers.get("Authorization");
    const expectedKey = process.env.SEPAY_API_KEY;

    if (!expectedKey) {
      console.error("Thiếu SEPAY_API_KEY");

      return NextResponse.json(
        {
          success: false,
          message: "Server chưa cấu hình API key",
        },
        { status: 500 }
      );
    }

    if (apiKey !== `Apikey ${expectedKey}`) {
      console.log("Webhook SePay: API key không hợp lệ");

      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 2. ĐỌC DỮ LIỆU GIAO DỊCH
    // =====================================================
    const body = await req.json();

    console.log("=================================");
    console.log("SEPAY PAYMENT:");
    console.log(body);
    console.log("=================================");

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

    // =====================================================
    // 3. CHỈ NHẬN TIỀN VÀO
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
    // 4. KIỂM TRA DỮ LIỆU
    // =====================================================
    if (!amount || !content) {
      return NextResponse.json({
        success: true,
        message: "Không đủ dữ liệu giao dịch",
      });
    }

    // =====================================================
    // 5. TÌM MÃ ĐƠN
    //
    // VIP:
    // TRADAVIP3TABCDE
    //
    // Phim:
    // TRADAP...
    // =====================================================
    const orderCodeMatch = content.match(
      /TRADAVIP[A-Z0-9]+|TRADA[A-Z0-9]+/i
    );

    if (!orderCodeMatch) {
      console.log(
        "Không tìm thấy mã đơn:",
        content
      );

      return NextResponse.json({
        success: true,
        message: "Không tìm thấy mã đơn",
      });
    }

    const orderCode =
      orderCodeMatch[0].toUpperCase();

    console.log("MÃ ĐƠN:", orderCode);
    console.log("SỐ TIỀN:", amount);
    console.log("TRANSACTION ID:", transactionId);

    // =====================================================
    // 6. NẾU LÀ ĐƠN VIP
    // =====================================================
    if (orderCode.startsWith("TRADAVIP")) {
      console.log("➡️ Phát hiện đơn VIP");

      const { data: vipOrder, error: vipOrderError } =
        await supabaseAdmin
          .from("vip_orders")
          .select("*")
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
            message: "Lỗi database khi tìm đơn VIP",
          },
          { status: 500 }
        );
      }

      if (!vipOrder) {
        console.log(
          "Không tìm thấy đơn VIP:",
          orderCode
        );

        return NextResponse.json({
          success: true,
          message: "Không tìm thấy đơn VIP",
        });
      }

      // ---------------------------------------------------
      // Nếu đã duyệt rồi thì không cấp lại
      // ---------------------------------------------------
      if (vipOrder.status === "approved") {
        return NextResponse.json({
          success: true,
          message: "Đơn VIP đã được duyệt trước đó",
          order_code: orderCode,
          transaction_id: transactionId,
        });
      }

      // ---------------------------------------------------
      // Kiểm tra số tiền
      // ---------------------------------------------------
      if (amount < Number(vipOrder.amount)) {
        console.log(
          `Sai số tiền VIP. Nhận ${amount}, cần ${vipOrder.amount}`
        );

        return NextResponse.json({
          success: true,
          message: "Số tiền VIP không đúng",
        });
      }

      // ===================================================
      // 7. TÌM VIP HIỆN TẠI CỦA USER
      // ===================================================
      const { data: oldVip, error: oldVipError } =
        await supabaseAdmin
          .from("user_vip")
          .select("*")
          .eq("user_id", vipOrder.user_id)
          .order("expires_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (oldVipError) {
        console.error(
          "Lỗi tìm VIP cũ:",
          oldVipError
        );

        return NextResponse.json(
          {
            success: false,
            message: "Không thể kiểm tra VIP hiện tại",
          },
          { status: 500 }
        );
      }

      // ===================================================
      // 8. TÍNH NGÀY BẮT ĐẦU
      //
      // Nếu VIP cũ còn hạn:
      //   cộng tiếp từ ngày hết hạn cũ.
      //
      // Nếu VIP cũ hết hạn:
      //   tính từ thời điểm hiện tại.
      // ===================================================
      const now = new Date();

      let startedAt = now;

      if (
        oldVip &&
        oldVip.expires_at &&
        new Date(oldVip.expires_at) > now
      ) {
        startedAt = new Date(
          oldVip.expires_at
        );
      }

      // ===================================================
      // 9. CỘNG THÊM SỐ THÁNG
      // ===================================================
      const expiresAt = new Date(
        startedAt
      );

      expiresAt.setMonth(
        expiresAt.getMonth() +
          Number(vipOrder.package_months)
      );

      console.log(
        "VIP BẮT ĐẦU:",
        startedAt.toISOString()
      );

      console.log(
        "VIP HẾT HẠN:",
        expiresAt.toISOString()
      );

      // ===================================================
      // 10. CẬP NHẬT / TẠO VIP
      // ===================================================
      if (oldVip) {
        const { error: vipUpdateError } =
          await supabaseAdmin
            .from("user_vip")
            .update({
              package_months:
                vipOrder.package_months,
              price: vipOrder.amount,
              started_at:
                oldVip.started_at &&
                new Date(oldVip.expires_at) > now
                  ? oldVip.started_at
                  : now.toISOString(),
              expires_at:
                expiresAt.toISOString(),
            })
            .eq("id", oldVip.id);

        if (vipUpdateError) {
          console.error(
            "Lỗi cập nhật VIP:",
            vipUpdateError
          );

          return NextResponse.json(
            {
              success: false,
              message:
                "Không thể cập nhật quyền VIP",
            },
            { status: 500 }
          );
        }
      } else {
        const { error: vipInsertError } =
          await supabaseAdmin
            .from("user_vip")
            .insert({
              user_id: vipOrder.user_id,
              package_months:
                vipOrder.package_months,
              price: vipOrder.amount,
              started_at:
                now.toISOString(),
              expires_at:
                expiresAt.toISOString(),
            });

        if (vipInsertError) {
          console.error(
            "Lỗi tạo VIP:",
            vipInsertError
          );

          return NextResponse.json(
            {
              success: false,
              message:
                "Không thể tạo quyền VIP",
            },
            { status: 500 }
          );
        }
      }

      // ===================================================
      // 11. ĐÁNH DẤU ĐƠN VIP ĐÃ THANH TOÁN
      // ===================================================
      const { error: vipOrderUpdateError } =
        await supabaseAdmin
          .from("vip_orders")
          .update({
            status: "approved",
          })
          .eq("id", vipOrder.id);

      if (vipOrderUpdateError) {
        console.error(
          "Lỗi cập nhật đơn VIP:",
          vipOrderUpdateError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Đã cấp VIP nhưng chưa cập nhật trạng thái đơn",
          },
          { status: 500 }
        );
      }

      console.log(
        `🎉 ĐÃ DUYỆT VIP ${orderCode} - ${vipOrder.package_months} THÁNG`
      );

      return NextResponse.json({
        success: true,
        message:
          "Thanh toán VIP thành công",
        order_code: orderCode,
        transaction_id: transactionId,
        package_months:
          vipOrder.package_months,
        expires_at:
          expiresAt.toISOString(),
      });
    }

    // =====================================================
    // 12. NẾU KHÔNG PHẢI VIP → XỬ LÝ ĐƠN PHIM
    // =====================================================
    console.log("➡️ Phát hiện đơn mua phim");

    const {
      data: movieOrder,
      error: movieOrderError,
    } = await supabaseAdmin
      .from("movie_orders")
      .select("*")
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
          message:
            "Lỗi database khi tìm đơn phim",
        },
        { status: 500 }
      );
    }

    if (!movieOrder) {
      console.log(
        "Không tìm thấy đơn phim:",
        orderCode
      );

      return NextResponse.json({
        success: true,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // =====================================================
    // 13. ĐƠN PHIM ĐÃ DUYỆT
    // =====================================================
    if (movieOrder.status === "approved") {
      return NextResponse.json({
        success: true,
        message:
          "Đơn phim đã được duyệt trước đó",
        order_code: orderCode,
        transaction_id: transactionId,
      });
    }

    // =====================================================
    // 14. KIỂM TRA TIỀN ĐƠN PHIM
    // =====================================================
    if (
      amount < Number(movieOrder.amount)
    ) {
      console.log(
        `Sai số tiền phim. Nhận ${amount}, cần ${movieOrder.amount}`
      );

      return NextResponse.json({
        success: true,
        message: "Số tiền không đúng",
      });
    }

    // =====================================================
    // 15. CẤP QUYỀN XEM PHIM
    // =====================================================
    const {
      error: accessError,
    } = await supabaseAdmin
      .from("user_movie_access")
      .upsert(
        {
          user_id: movieOrder.user_id,
          movie_slug: movieOrder.movie_slug,
          price: movieOrder.amount,
          started_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,movie_slug",
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
          message:
            "Không thể cấp quyền xem phim",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 16. ĐÁNH DẤU ĐƠN PHIM ĐÃ THANH TOÁN
    // =====================================================
    const {
      error: movieUpdateError,
    } = await supabaseAdmin
      .from("movie_orders")
      .update({
        status: "approved",
      })
      .eq("id", movieOrder.id);

    if (movieUpdateError) {
      console.error(
        "Lỗi cập nhật đơn phim:",
        movieUpdateError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Đã cấp quyền nhưng chưa cập nhật đơn",
        },
        { status: 500 }
      );
    }

    console.log(
      `🎬 ĐÃ DUYỆT ĐƠN PHIM ${orderCode} - ${movieOrder.movie_title}`
    );

    // =====================================================
    // 17. TRẢ KẾT QUẢ CHO SEPAY
    // =====================================================
    return NextResponse.json({
      success: true,
      message:
        "Thanh toán mua phim thành công",
      order_code: orderCode,
      transaction_id: transactionId,
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