import { Request, Response } from 'express';
import { URLService } from '../services/urlService';

const urlService = new URLService();

export class URLController {
  async shorten(req: Request, res: Response) {
    try {
      const { originalUrl, expiresAt } = req.body;
      if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required' });

      const urlData = await urlService.createShortUrl(originalUrl, expiresAt);
      
      res.status(201).json({
        ...urlData,
        shortUrl: `${process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`}/${urlData.short_id}`
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async redirect(req: Request, res: Response) {
    try {
      const shortId = req.params.shortId as string;
      const urlData = await urlService.getUrl(shortId);

      if (!urlData) {
        const fallbackUrl = process.env.FALLBACK_URL;
        if (fallbackUrl) {
          return res.redirect(fallbackUrl);
        }
        return res.status(404).json({ error: 'URL not found or expired' });
      }


      urlService.trackClick(urlData.id, shortId, {
        ip_address: req.ip,
        user_agent: req.get('user-agent'),

      }).catch(err => console.error('Analytics error:', err));

      res.redirect(urlData.original_url);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const shortId = req.params.shortId as string;
      const stats = await urlService.getAnalytics(shortId);
      
      if (!stats) return res.status(404).json({ error: 'Analytics not found' });
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getInfo(req: Request, res: Response) {
    try {
      const shortId = req.params.shortId as string;
      const urlData = await urlService.getUrl(shortId);
      
      if (!urlData) return res.status(404).json({ error: 'URL info not found' });
      res.json(urlData);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
