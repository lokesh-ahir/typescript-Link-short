import { nanoid } from 'nanoid';
import { getSupabaseClient } from '../config/supabase';
import { getRedisClient } from '../config/redis';
import { URL, ClickAnalytics } from '../models/url';

export class URLService {
  private get supabase() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not initialized');
    return client;
  }

  private get redis() {
    return getRedisClient();
  }


  async generateShortId(): Promise<string> {
    let shortId = nanoid(6);
    let { data: existing } = await this.supabase
      .from('urls')
      .select('short_id')
      .eq('short_id', shortId)
      .maybeSingle();

    while (existing) {
      shortId = nanoid(6);
      ({ data: existing } = await this.supabase
        .from('urls')
        .select('short_id')
        .eq('short_id', shortId)
        .maybeSingle());
    }

    return shortId;
  }

  async createShortUrl(originalUrl: string, expiresAt?: string): Promise<URL> {
    const shortId = await this.generateShortId();

    const { data, error } = await this.supabase
      .from('urls')
      .insert({
        short_id: shortId,
        original_url: originalUrl,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUrl(shortId: string): Promise<URL | null> {
    let urlData: URL | null = null;


    if (this.redis) {
      urlData = await this.redis.get<URL>(`url:${shortId}`);
    }


    if (!urlData) {
      const { data, error } = await this.supabase
        .from('urls')
        .select('*')
        .eq('short_id', shortId)
        .maybeSingle();

      if (error || !data) return null;
      urlData = data;


      if (this.redis) {
        await this.redis.set(`url:${shortId}`, urlData, { ex: 3600 });
      }
    }


    if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
      return null;
    }

    return urlData;
  }

  async trackClick(urlId: string, shortId: string, analytics: Partial<ClickAnalytics>): Promise<void> {

    const { error: rpcError } = await this.supabase.rpc('increment_clicks', { url_id: urlId });
    if (rpcError) throw new Error(`RPC Error: ${rpcError.message}`);


    const { error: insertError } = await this.supabase.from('click_analytics').insert({
      url_id: urlId,
      ...analytics
    });
    if (insertError) throw new Error(`Insert Error: ${insertError.message}`);


  }

  async getAnalytics(shortId: string) {
    const { data: url } = await this.supabase
      .from('urls')
      .select('id, clicks')
      .eq('short_id', shortId)
      .single();

    if (!url) return null;

    const { data: analytics } = await this.supabase
      .from('click_analytics')
      .select('*')
      .eq('url_id', url.id);

    return {
      total_clicks: url.clicks,
      unique_clicks: new Set(analytics?.map(a => a.ip_address)).size,
      clicks_by_date: this.processDateStats(analytics || []),
      top_countries: this.processCountryStats(analytics || []),
    };
  }

  private processDateStats(analytics: ClickAnalytics[]) {
    const stats: Record<string, number> = {};
    analytics.forEach(a => {
      const date = new Date(a.created_at).toISOString().split('T')[0];
      if (date) {
        stats[date] = (stats[date] || 0) + 1;
      }
    });
    return Object.entries(stats).map(([date, count]) => ({ date, count }));
  }

  private processCountryStats(analytics: ClickAnalytics[]) {
    const stats: Record<string, number> = {};
    analytics.forEach(a => {
      if (a.country) stats[a.country] = (stats[a.country] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }
}
