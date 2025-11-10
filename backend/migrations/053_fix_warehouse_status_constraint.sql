-- Migration: Fix CargoOrders status constraint to include warehouse statuses
-- Date: 2024
-- Description: Add WAREHOUSE_RECEIVED, WAREHOUSE_STORED, WAREHOUSE_OUTBOUND to status constraint

-- Step 1: Drop existing constraint if exists
DO $$
BEGIN
    -- Drop constraint if it exists (case-insensitive search)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name ILIKE '%status_check%' 
        AND table_name = 'CargoOrders'
    ) THEN
        ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS "CargoOrders_status_check";
        ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS "cargoorders_status_check";
    END IF;
END $$;

-- Step 2: Add new constraint with all valid statuses including warehouse statuses
ALTER TABLE "CargoOrders" 
ADD CONSTRAINT "CargoOrders_status_check" 
CHECK (status IN (
    'PENDING_PAYMENT',
    'PAID',
    'ACCEPTED',
    'LOADING',
    'IN_TRANSIT',
    'WAREHOUSE_RECEIVED',
    'WAREHOUSE_STORED',
    'WAREHOUSE_OUTBOUND',
    'COMPLETED'
));

-- Step 3: Verify constraint was created
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.check_constraints 
        WHERE constraint_name = 'CargoOrders_status_check'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE '✅ Constraint CargoOrders_status_check đã được tạo thành công!';
    ELSE
        RAISE WARNING '⚠️ Constraint chưa được tạo, vui lòng kiểm tra lại.';
    END IF;
END $$;

-- Step 4: Display current constraint for verification
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'CargoOrders_status_check';

