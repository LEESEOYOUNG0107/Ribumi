export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const targetUrl = 'https://kopis.or.kr' + url.pathname.replace('/kopis', '') + url.search;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
  });

  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', '*');

  return newResponse;
}