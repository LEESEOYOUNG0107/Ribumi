export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = 'https://kopis.or.kr' + url.pathname.replace('/kopis', '') + url.search;

  const response = await fetch(targetUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'text/xml',
      'Access-Control-Allow-Origin': '*',
    }
  });
}