-- Migration: Add checkout_url to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS checkout_url TEXT;

-- Update existing plans with mock/placeholder checkout links
UPDATE plans SET checkout_url = 'https://buy.stripe.com/mock_start_plan' WHERE id = '32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0';
UPDATE plans SET checkout_url = 'https://buy.stripe.com/mock_basic_plan' WHERE id = '6f3dfe4e-905c-486e-923f-2cfb6e5d3e62';
UPDATE plans SET checkout_url = 'https://buy.stripe.com/mock_enterprise_plan' WHERE id = 'd35c09c2-51a0-4f38-b5d9-dcc3526e7d26';
