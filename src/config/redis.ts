import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redis: Redis | null = null;

export const connectRedis = (): Redis | null => {
  if (!redis) {
    try {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (!url || !token) {
        console.warn('Upstash Redis credentials missing, running without cache');
        return null;
      }

      redis = new Redis({
        url,
        token,
      });
      
      console.log('Upstash Redis client initialized');
    } catch (error) {
      console.error('Failed to initialize Upstash Redis:', error);
      redis = null;
    }
  }
  
  return redis;
};

export const getRedisClient = (): Redis | null => {
  return redis || connectRedis();
};
