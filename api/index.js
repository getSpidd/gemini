// api/index.js
import { STATIC_MODELS_DATA } from './models.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);

  // 1. 拦截 /models 请求，直接返回导入的静态数据
  if (url.pathname.endsWith('/models')) {
    return new Response(JSON.stringify(STATIC_MODELS_DATA), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // 给客户端（浏览器）设置较长的缓存时间，减少请求次数
        'Cache-Control': 'public, max-age=86400' 
      }
    });
  }

  // 2. 其他请求（Chat, Stream）正常代理到 Google
  const targetHost = 'generativelanguage.googleapis.com';
  url.hostname = targetHost;
  url.protocol = 'https:';

  if (url.pathname.includes('/v1/')) {
    url.pathname = url.pathname.replace('/v1/', '/v1beta/openai/');
  }

  const newRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  });
  newRequest.headers.delete('host');

  return fetch(newRequest);
}
