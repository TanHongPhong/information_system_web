/**
 * Utility để tự động xóa đơn hàng chờ thanh toán quá 15 phút
 * Chạy function này định kỳ (mỗi 5 phút) bằng cron job hoặc setInterval
 */

import pool from "../config/db.js";

/**
 * Xóa các đơn hàng có status PENDING_PAYMENT và tạo hơn 15 phút
 * @returns {Promise<number>} Số lượng đơn hàng đã xóa
 */
export const cleanupPendingPaymentOrders = async () => {
  try {
    const result = await pool.query(
      `
      DELETE FROM "CargoOrders"
      WHERE status = 'PENDING_PAYMENT'
        AND created_at < NOW() - INTERVAL '15 minutes'
      RETURNING order_id, created_at;
      `
    );

    const deletedCount = result.rowCount;
    
    // Only log if deleted count > 0 (useful for monitoring)
    if (deletedCount > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🧹 Cleaned up ${deletedCount} pending payment orders older than 15 minutes`);
    }

    return deletedCount;
  } catch (err) {
    // Không log lỗi nếu là lỗi connection timeout khi khởi động
    // để tránh spam log khi database chưa sẵn sàng
    if (err.message.includes("timeout") || err.message.includes("ETIMEDOUT")) {
      console.error("❌ Lỗi khi xóa đơn hàng chờ thanh toán: Connection timeout");
      console.error("   Database có thể chưa sẵn sàng hoặc connection string chưa đúng");
    } else {
      console.error("❌ Lỗi khi xóa đơn hàng chờ thanh toán:", err.message);
    }
    throw err;
  }
};

/**
 * Chạy cleanup ngay lập tức (test)
 */
export const runCleanup = async () => {
  try {
    const count = await cleanupPendingPaymentOrders();
    console.log(`✅ Cleanup hoàn tất. Đã xóa ${count} đơn hàng.`);
    return count;
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    throw err;
  }
};

