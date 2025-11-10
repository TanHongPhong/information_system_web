-- Quick fix script: Add warehouse statuses to CargoOrders constraint
-- Run this in your database SQL editor (Neon, pgAdmin, etc.)

-- Drop old constraint
ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS "CargoOrders_status_check";
ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS "cargoorders_status_check";

-- Add new constraint with warehouse statuses
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

-- Verify
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'CargoOrders_status_check';

