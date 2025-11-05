-- Migration: Thêm mã đơn hàng 4 số ngẫu nhiên (order_code)
-- Giữ nguyên order_id (SERIAL) làm primary key, thêm order_code để hiển thị cho user

SET search_path TO public;

-- 1) Thêm cột order_code (4 chữ số, unique)
ALTER TABLE "CargoOrders" 
ADD COLUMN IF NOT EXISTS order_code VARCHAR(4) UNIQUE;

-- 2) Tạo index cho order_code
CREATE INDEX IF NOT EXISTS idx_cargo_orders_code ON "CargoOrders"(order_code);

-- 3) Function để generate mã 4 số ngẫu nhiên (1000-9999)
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS VARCHAR(4) AS $$
DECLARE
    new_code VARCHAR(4);
    code_exists BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate mã 4 số ngẫu nhiên từ 1000 đến 9999
        new_code := LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0');
        
        -- Kiểm tra xem mã đã tồn tại chưa
        SELECT EXISTS(SELECT 1 FROM "CargoOrders" WHERE order_code = new_code) INTO code_exists;
        
        -- Nếu mã không tồn tại, trả về
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
        
        -- Tăng số lần thử
        attempts := attempts + 1;
        
        -- Nếu thử quá nhiều lần, raise error
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Không thể tạo mã đơn hàng duy nhất sau % lần thử', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4) Trigger để tự động generate order_code khi tạo order mới
CREATE OR REPLACE FUNCTION set_order_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ generate nếu order_code chưa có
    IF NEW.order_code IS NULL OR NEW.order_code = '' THEN
        NEW.order_code := generate_order_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_order_code
BEFORE INSERT ON "CargoOrders"
FOR EACH ROW
EXECUTE FUNCTION set_order_code();

-- 5) Cập nhật order_code cho các đơn hàng cũ (nếu chưa có)
DO $$
DECLARE
    order_record RECORD;
    new_code VARCHAR(4);
BEGIN
    FOR order_record IN
        SELECT order_id FROM "CargoOrders" WHERE order_code IS NULL OR order_code = ''
    LOOP
        new_code := generate_order_code();
        UPDATE "CargoOrders" 
        SET order_code = new_code 
        WHERE order_id = order_record.order_id;
    END LOOP;
END $$;

-- 6) Comment để giải thích
COMMENT ON COLUMN "CargoOrders".order_code IS 'Mã đơn hàng 4 chữ số ngẫu nhiên (1000-9999) để hiển thị cho khách hàng';

