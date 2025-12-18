-- Create review table for inventory item reviews
-- This table stores reviews written by registered users for inventory items

CREATE TABLE IF NOT EXISTS public.review (
    review_id SERIAL PRIMARY KEY,
    review_text TEXT NOT NULL,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    inv_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    FOREIGN KEY (inv_id) REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES public.account(account_id) ON DELETE CASCADE
);

-- Create index on inv_id for faster lookups when displaying reviews for a specific vehicle
CREATE INDEX IF NOT EXISTS idx_review_inv_id ON public.review(inv_id);

-- Create index on account_id for faster lookups when displaying user's reviews
CREATE INDEX IF NOT EXISTS idx_review_account_id ON public.review(account_id);

-- Create index on review_date for ordered retrieval
CREATE INDEX IF NOT EXISTS idx_review_date ON public.review(review_date);