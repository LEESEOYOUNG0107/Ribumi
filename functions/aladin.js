export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 사용자가 호출한 주소에서 /aladin 부분을 떼고 진짜 알라딘 주소로 변경
  const targetUrl = 'https://www.aladin.co.kr' + url.pathname.replace('/aladin', '') + url.search;

  // Cloudflare 서버가 알라딘 API를 직접 호출 (서버 대 서버 호출이라 CORS 제한이 없음)
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
  });

  // 응답을 받아오되, 프론트엔드(브라우저)에서 에러가 안 나도록 CORS 헤더를 강제로 추가해서 리턴
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', '*');

  return newResponse;
}