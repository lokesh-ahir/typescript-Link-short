import { Request } from 'express';

export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  const realIP = req.headers['x-real-ip'] as string | undefined;
  const cfConnectingIP = req.headers['cf-connecting-ip'] as string | undefined;
  
  if (forwarded && forwarded.length > 0) {
    const firstIp = forwarded.split(',')[0];
    return firstIp ? firstIp.trim() : '127.0.0.1';
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         (req.connection as any)?.socket?.remoteAddress || 
         '127.0.0.1';
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
