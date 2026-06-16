export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = 'https://www.aladin.co.kr' + url.pathname.replace('/aladin', '') + url.search;

  const response = await fetch(targetUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}