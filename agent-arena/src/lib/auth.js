import { findAgent } from './db';

export function authenticateAgent(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const apiKey = authHeader.slice(7);
  return findAgent(a => a.api_key === apiKey);
}
