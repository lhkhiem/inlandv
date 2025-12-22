# Database Migrations Guide

Hướng dẫn sử dụng migrations.

## ⚠️ Lưu ý

**Schema mới nhất**: Sử dụng `shared/database/schema-v2.sql` cho thiết kế v2 (Final Design).

## Migration Files

### Schema v2 (Mới nhất - Khuyến nghị)
- `shared/database/schema-v2.sql` - Schema đầy đủ v2 với thiết kế Hybrid Approach

### Migrations cũ (tham khảo)
Migrations được lưu trong `shared/database/migrations/`:
- `001_initial_schema.sql` - Tạo tất cả tables (schema cũ)
- `002_add_indexes.sql` - Thêm indexes (schema cũ)

## Running Migrations

### Option 1: Run All Migrations
```bash
# From project root
psql -d inland_realestate -f shared/database/migrations/001_initial_schema.sql
psql -d inland_realestate -f shared/database/migrations/002_add_indexes.sql
psql -d inland_realestate -f shared/database/seeds/sample_data.sql
```

### Option 2: Use Full Schema v2 (Khuyến nghị)
```bash
# Run complete schema v2 (thiết kế mới nhất)
psql -d inland_realestate -f shared/database/schema-v2.sql
```

### Option 3: Use Old Full Schema (Không khuyến nghị)
```bash
# Run complete schema (schema cũ)
psql -d inland_realestate -f shared/database/schema.sql
```

### Option 4: Use Migration Script
```bash
cd projects/public-backend
npm run migrate
```

## Creating New Migrations

1. Create new file: `shared/database/migrations/003_description.sql`
2. Write migration SQL
3. Update migration script if needed
4. Test migration
5. Commit to version control

## Migration Best Practices

- Always backup before migration
- Test on development first
- Use transactions when possible
- Document breaking changes
- Version control all migrations

