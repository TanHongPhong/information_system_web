-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng Transactions (Giao dịch thanh toán)
CREATE TABLE IF NOT EXISTS "Transactions" (
  transaction_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES "CargoOrders"(order_id) ON DELETE RESTRICT,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE RESTRICT,
  -- Thông tin thanh toán
  amount DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL, -- 'momo', 'vietqr', 'zalopay', 'bank_transfer', 'cash'
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED')),
  transaction_code VARCHAR(100) UNIQUE, -- Mã giao dịch từ payment gateway
  -- Thời gian
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Metadata
  note TEXT,
  gateway_response TEXT -- JSON response từ payment gateway (nếu có)
);

-- 2) Index
CREATE INDEX IF NOT EXISTS idx_transactions_order ON "Transactions"(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company ON "Transactions"(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON "Transactions"(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON "Transactions"(transaction_code);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON "Transactions"(created_at);

-- 3) Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION transactions_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON "Transactions"
FOR EACH ROW EXECUTE FUNCTION transactions_set_updated_at();

-- 4) Trigger: Khi payment thành công, cập nhật status của CargoOrder
CREATE OR REPLACE FUNCTION transactions_update_order_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'SUCCESS' AND OLD.payment_status != 'SUCCESS' THEN
    UPDATE "CargoOrders"
    SET status = 'SUBMITTED', updated_at = CURRENT_TIMESTAMP
    WHERE order_id = NEW.order_id AND status = 'DRAFT';
    
    NEW.paid_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_update_order
AFTER UPDATE OF payment_status ON "Transactions"
FOR EACH ROW
WHEN (NEW.payment_status = 'SUCCESS')
EXECUTE FUNCTION transactions_update_order_status();

