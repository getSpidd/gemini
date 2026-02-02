export const config = {
  runtime: 'edge', // 关键：开启 Edge 运行时，支持流式传输
};

export default async function handler(request) {
  const url = new URL(request.url);
  
  // 1. 设置目标域名
  const targetHost = 'generativelanguage.googleapis.com';
  url.hostname = targetHost;
  url.protocol = 'https:';

  // 2. 路径重写：/v1/ -> /v1beta/openai/
  // Vercel 可能会在路径前带上 /api，需要根据你的部署路径调整逻辑
  // 这里假设请求路径包含 /v1/
  if (url.pathname.includes('/v1/')) {
    url.pathname = url.pathname.replace('/v1/', '/v1beta/openai/');
  }

  // 3. 构建请求
  const newRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  });

  // 删除可能导致问题的 Host 头部，让 fetch 自动生成
  newRequest.headers.delete('host');

  // 4. 发起请求并流式返回
  return fetch(newRequest);
}
