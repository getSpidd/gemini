export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);

  // 1. 设置目标域名
  const targetHost = 'generativelanguage.googleapis.com';
  url.hostname = targetHost;
  url.protocol = 'https:';

  // 2. 路径重写
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
  newRequest.headers.delete('host');

  // 4. 发起请求
  const response = await fetch(newRequest);

  // -----------------------
  // 新增：针对 models 接口的缓存逻辑
  // -----------------------
  // 检查 URL 是否包含 'models' 且请求成功
  if (url.pathname.endsWith('models') && response.status === 200) {
    
    // 创建一个新的 Response 对象，因为原始 response 的 headers 是只读的(immutable)可能无法修改
    const cachedResponse = new Response(response.body, response);

    // 设置缓存头
    // s-maxage=3600: 在 Vercel 边缘节点(CDN)缓存 1 小时 (3600秒)
    // stale-while-revalidate=86400: 缓存过期后，先返回旧数据，后台偷偷更新 (24小时内)
    cachedResponse.headers.set(
      'Cache-Control', 
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );

    return cachedResponse;
  }

  // 非 models 接口（如 chat 流式请求）直接返回，不设缓存
  return response;
}
