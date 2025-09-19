-- Disable email confirmation for easier testing and development
UPDATE auth.config SET 
  enable_confirmations = false
WHERE 
  name = 'confirmation';