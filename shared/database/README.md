# Database Schema

## Overview
Shared database schema for Inland Real Estate project. Used by both `public-backend` and `cms-backend`.

## Setup

### 1. Create Database
```bash
createdb inland_realestate
```

### 2. Run Migration
```bash
# From project root
psql -d inland_realestate -f shared/database/schema.sql

# Or from backend project
cd projects/public-backend
npm run migrate
```

## Schema Structure

### Tables
- **users** - Admin and sales users
- **projects** - Real estate projects
- **listings** - Individual properties
- **posts** - Blog/news articles
- **leads** - Customer inquiries
- **jobs** - Job postings

### Indexes
All tables have appropriate indexes for performance optimization.

### Sample Data
Schema includes sample data for testing.

## Migration Files
Migration files are located in `shared/database/migrations/` for version control.

