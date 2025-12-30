/**
 * Database Audit Script
 * Thống kê các bảng trong database và số lượng records
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '../../projects/cms-backend/.env.local');
const envPath = path.resolve(process.cwd(), '../../projects/cms-backend/.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'inlandv_realestate'}`,
});

interface TableStats {
  table_name: string;
  row_count: number;
  table_size: string;
  indexes_size: string;
  total_size: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface IndexInfo {
  index_name: string;
  index_type: string;
  columns: string;
}

async function getTableStats(): Promise<TableStats[]> {
  const query = `
    SELECT 
      schemaname || '.' || tablename AS table_name,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
      pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

async function getRowCounts(): Promise<{ [key: string]: number }> {
  const tablesQuery = `
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;
  
  const tablesResult = await pool.query(tablesQuery);
  const tables = tablesResult.rows.map((row: any) => row.tablename);
  
  const counts: { [key: string]: number } = {};
  
  for (const table of tables) {
    try {
      const countResult = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
      counts[table] = parseInt(countResult.rows[0].count);
    } catch (error) {
      console.error(`Error counting rows in ${table}:`, error);
      counts[table] = -1;
    }
  }
  
  return counts;
}

async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = $1
    ORDER BY ordinal_position;
  `;
  
  const result = await pool.query(query, [tableName]);
  return result.rows;
}

async function getTableIndexes(tableName: string): Promise<IndexInfo[]> {
  const query = `
    SELECT
      i.relname AS index_name,
      am.amname AS index_type,
      array_to_string(array_agg(a.attname), ', ') AS columns
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_am am ON i.relam = am.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relkind = 'r'
      AND t.relname = $1
      AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    GROUP BY i.relname, am.amname
    ORDER BY i.relname;
  `;
  
  const result = await pool.query(query, [tableName]);
  return result.rows;
}

async function getForeignKeys(): Promise<any[]> {
  const query = `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

async function main() {
  console.log('🔍 Đang thống kê database...\n');
  
  try {
    // Get all tables
    const tableStats = await getTableStats();
    const rowCounts = await getRowCounts();
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 THỐNG KÊ CÁC BẢNG TRONG DATABASE');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Summary table
    console.log('TỔNG QUAN:\n');
    console.log('┌─────────────────────────────────────┬──────────────┬──────────────┬──────────────┐');
    console.log('│ Tên bảng                            │ Số records   │ Kích thước   │ Index size   │');
    console.log('├─────────────────────────────────────┼──────────────┼──────────────┼──────────────┤');
    
    for (const stat of tableStats) {
      const tableName = stat.table_name.replace('public.', '');
      const rowCount = rowCounts[tableName] ?? 0;
      const rowCountStr = rowCount >= 0 ? rowCount.toLocaleString() : 'N/A';
      const tableNamePadded = tableName.padEnd(35);
      const rowCountPadded = rowCountStr.padEnd(12);
      const totalSizePadded = stat.total_size.padEnd(12);
      const indexesSizePadded = stat.indexes_size.padEnd(12);
      
      console.log(`│ ${tableNamePadded} │ ${rowCountPadded} │ ${totalSizePadded} │ ${indexesSizePadded} │`);
    }
    
    console.log('└─────────────────────────────────────┴──────────────┴──────────────┴──────────────┘\n');
    
    // Detailed information for each table
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 CHI TIẾT TỪNG BẢNG');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    for (const stat of tableStats) {
      const tableName = stat.table_name.replace('public.', '');
      const rowCount = rowCounts[tableName] ?? 0;
      
      console.log(`\n📌 Bảng: ${tableName}`);
      console.log(`   Số records: ${rowCount >= 0 ? rowCount.toLocaleString() : 'N/A'}`);
      console.log(`   Kích thước: ${stat.total_size} (Table: ${stat.table_size}, Indexes: ${stat.indexes_size})`);
      
      // Get columns
      const columns = await getTableColumns(tableName);
      if (columns.length > 0) {
        console.log(`\n   Cột:`);
        for (const col of columns) {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
        }
      }
      
      // Get indexes
      const indexes = await getTableIndexes(tableName);
      if (indexes.length > 0) {
        console.log(`\n   Indexes:`);
        for (const idx of indexes) {
          console.log(`     - ${idx.index_name} (${idx.index_type}): ${idx.columns}`);
        }
      }
    }
    
    // Foreign keys
    const foreignKeys = await getForeignKeys();
    if (foreignKeys.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('🔗 FOREIGN KEYS');
      console.log('═══════════════════════════════════════════════════════════════\n');
      
      for (const fk of foreignKeys) {
        console.log(`   ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      }
    }
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📈 TỔNG KẾT');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const totalTables = tableStats.length;
    const totalRows = Object.values(rowCounts).reduce((sum, count) => sum + (count >= 0 ? count : 0), 0);
    const tablesWithData = Object.values(rowCounts).filter(count => count > 0).length;
    const emptyTables = Object.values(rowCounts).filter(count => count === 0).length;
    
    console.log(`   Tổng số bảng: ${totalTables}`);
    console.log(`   Bảng có dữ liệu: ${tablesWithData}`);
    console.log(`   Bảng trống: ${emptyTables}`);
    console.log(`   Tổng số records: ${totalRows.toLocaleString()}`);
    
    // List tables by usage
    console.log('\n   Bảng có nhiều dữ liệu nhất:');
    const sortedByRows = Object.entries(rowCounts)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10);
    
    for (const [table, count] of sortedByRows) {
      console.log(`     - ${table}: ${count.toLocaleString()} records`);
    }
    
    if (emptyTables > 0) {
      console.log('\n   Bảng trống (có thể không sử dụng):');
      const emptyTableNames = Object.entries(rowCounts)
        .filter(([_, count]) => count === 0)
        .map(([table, _]) => table);
      for (const table of emptyTableNames) {
        console.log(`     - ${table}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi thống kê database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();












