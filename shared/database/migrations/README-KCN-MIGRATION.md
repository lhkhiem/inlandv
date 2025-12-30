# KCN Redesign Migration

## Quick Start

```bash
# Từ thư mục projects/cms-backend
npm run migrate:kcn
```

## Migration Files

1. **061_kcn_redesign_lookup_tables.sql**
   - Tạo các bảng lookup: `product_types`, `transaction_types`, `location_types`
   - Tạo các bảng vệ tinh: `property_product_types`, `property_transaction_types`, `property_location_types`
   - Thêm cột `park_type` vào `industrial_parks`
   - Thêm cột `industrial_cluster_id` vào `properties`
   - Tạo view `v_properties_filter`

2. **062_kcn_redesign_migrate_data.sql**
   - Migrate dữ liệu từ `properties.property_type` sang `property_product_types`
   - Migrate dữ liệu từ `properties.transaction_type` sang `property_transaction_types`
   - Migrate dữ liệu từ `properties.sub_category` sang `property_location_types`

3. **063_kcn_redesign_rollback.sql**
   - Rollback script (chỉ dùng khi cần)

## Cách chạy

### Method 1: npm script (Khuyến nghị)
```bash
cd projects/cms-backend
npm run migrate:kcn
```

### Method 2: SQL trực tiếp
```bash
psql -d your_database -f shared/database/migrations/061_kcn_redesign_lookup_tables.sql
psql -d your_database -f shared/database/migrations/062_kcn_redesign_migrate_data.sql
```

## Kiểm tra sau migration

```sql
-- Kiểm tra lookup tables
SELECT * FROM product_types;
SELECT * FROM transaction_types;
SELECT * FROM location_types;

-- Kiểm tra satellite tables có dữ liệu
SELECT COUNT(*) FROM property_product_types;
SELECT COUNT(*) FROM property_transaction_types;
SELECT COUNT(*) FROM property_location_types;

-- Test view
SELECT * FROM v_properties_filter LIMIT 5;
```

## Xem thêm

- [Migration Guide](../docs/DATABASE/migration-kcn-guide.md)
- [KCN Redesign Guide](../docs/DATABASE/kcn-redesign-guide.md)
- [KCN Redesign Summary](../docs/DATABASE/kcn-redesign-summary.md)
















