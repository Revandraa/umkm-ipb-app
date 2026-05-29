-- Add hashed_password column to users table for backend self-managed auth
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255) NOT NULL DEFAULT '$2b$12$defaultdummyhashvalueforauthplaceholder';

-- Add payment_proof column to orders table for upload validation
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof VARCHAR(512);
