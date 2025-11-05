# Kiểm tra SQL Queries trong Controllers

## 1. transactionControllers.js - createTransaction
**Query:**
```sql
INSERT INTO "Transactions" (
  order_id, company_id, amount, payment_method, payment_status,
  transaction_code, note, gateway_response, paid_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $5 = 'SUCCESS' THEN CURRENT_TIMESTAMP ELSE NULL END)
```
**Params:** 8 phần tử [$1-$8]
**Cột:** 9 cột (cột cuối dùng CASE với $5)
✅ **ĐÚNG** - 8 placeholders, 8 params

## 2. orderControllers.js - createCargoOrder
**Query:**
```sql
INSERT INTO "CargoOrders" (
  company_id, vehicle_id, customer_id, cargo_name, cargo_type,
  weight_kg, volume_m3, value_vnd,
  require_cold, require_danger, require_loading, require_insurance,
  pickup_address, dropoff_address, pickup_time, note, status
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
```
**Params:** 17 phần tử
**Cột:** 17 cột
✅ **ĐÚNG** - 17 placeholders, 17 params

## 3. paymentControllers.js - sepayWebhook
**Query:**
```sql
INSERT INTO "Transactions" (
  order_id, company_id, amount, payment_method, payment_status, transaction_code, paid_at, gateway_response
) VALUES ($1, $2, $3, $4, 'SUCCESS', $5, $6, $7)
```
**Params:** 7 phần tử [$1-$7]
**Cột:** 8 cột (payment_status hardcode 'SUCCESS')
✅ **ĐÚNG** - 7 placeholders, 7 params

## 4. companyControllers.js - getCompanies
**Query:** SELECT với subqueries
**Params:** [q, area, vehicle_type, min_rating, max_cost_per_km] - 5 params
**Placeholders:** $1, $2, $3, $4, $5
✅ **ĐÚNG**

## 5. companyControllers.js - getCompanyById
**Query:** SELECT với $1
**Params:** [id] - 1 param
✅ **ĐÚNG**

## 6. companyControllers.js - getVehiclesByCompany
**Query:** SELECT với $1, $2
**Params:** [companyId, status] - 2 params
✅ **ĐÚNG**

## 7. orderControllers.js - getCargoOrders
**Query:** Dynamic query với WHERE conditions
✅ **ĐÚNG** - Dynamic params được build đúng

## 8. transactionControllers.js - getTransactions
**Query:** Dynamic query với WHERE conditions
✅ **ĐÚNG** - Dynamic params được build đúng

## Kết luận
✅ Tất cả queries đều đúng về số lượng placeholder và params
✅ Không có lỗi SQL syntax
✅ Dynamic queries được build đúng cách

