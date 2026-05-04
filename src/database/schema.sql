-- Supabase Database Schema for URL Shortener

-- Create URLs table
CREATE TABLE urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Click Analytics table
CREATE TABLE click_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url_id UUID REFERENCES urls(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(2),
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_urls_short_id ON urls(short_id);
CREATE INDEX idx_urls_expires_at ON urls(expires_at);
CREATE INDEX idx_click_analytics_url_id ON click_analytics(url_id);
CREATE INDEX idx_click_analytics_created_at ON click_analytics(created_at);
CREATE INDEX idx_click_analytics_country ON click_analytics(country);

-- Function to increment clicks
CREATE OR REPLACE FUNCTION increment_clicks(url_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_clicks INTEGER;
BEGIN
  UPDATE urls 
  SET clicks = clicks + 1, updated_at = NOW()
  WHERE id = url_id
  RETURNING clicks INTO new_clicks;
  
  RETURN new_clicks;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired URLs
CREATE OR REPLACE FUNCTION cleanup_expired_urls()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM urls 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) policies
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to URLs for redirects
CREATE POLICY "Allow public read access to URLs" ON urls
  FOR SELECT USING (true);

-- Allow public insert for URL creation
CREATE POLICY "Allow public insert for URLs" ON urls
  FOR INSERT WITH CHECK (true);

-- Allow public read access to analytics
CREATE POLICY "Allow public read access to analytics" ON click_analytics
  FOR SELECT USING (true);

-- Allow public insert for analytics
CREATE POLICY "Allow public insert for analytics" ON click_analytics
  FOR INSERT WITH CHECK (true);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_urls_updated_at
  BEFORE UPDATE ON urls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
