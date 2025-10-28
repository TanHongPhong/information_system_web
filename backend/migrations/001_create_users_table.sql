-- Tạo bảng users trên Neon PostgreSQL
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'transport_company')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index cho email để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index cho role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

