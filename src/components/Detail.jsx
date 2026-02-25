import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function Detail() {
  const { type, id } = useParams();
  const location = useLocation();
  const nav = useNavigate();

  const [mainItem, setMainItem] = useState(location.state?.book || null);
  const [relatedMedias, setRelatedMedias] = useState([]); // 영상 (영화/드라마)
  const [relatedStages, setRelatedStages] = useState([]); // 공연 (연극/뮤지컬)
  const [relatedBooks, setRelatedBooks] = useState([]);   // 원작 도서 (추가)
  const [loading, setLoading] = useState(false);

  const TMDB_KEY = "403c12f87842be25cde1a02b954f1aa0";
  const KAKAO_KEY = "881d62978f7cbefd036b6aebe8e61d4c";
  const KOPIS_KEY = "YOUR_KOPIS_KEY"; 

  useEffect(() => {
    if (mainItem) {
      window.scrollTo(0, 0); // 새 작품 시 스크롤 상단으로
      searchRelatedContents(mainItem.title);
    }
  }, [id, type, mainItem?.title]);

const searchRelatedContents = async (title) => {
  setLoading(true);
  const coreTitle = title.split(':')[0].split('(')[0].trim();

  try {
    // 🎬 1. 영상 탐색 (TMDB)
    const mediaRes = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=ko-KR&query=${coreTitle}`
    );
    const mediaData = await mediaRes.json();
    
    const filteredMedias = mediaData.results?.filter(m => {
      const isSameTitle = (m.title || m.name) === title;
      const isSameId = String(m.id) === String(id);
      // 제목이 같거나 ID가 같으면(현재 작품이면) 제외!
      return !isSameId && (m.title || m.name || "").includes(coreTitle);
    }).slice(0, 6);
    setRelatedMedias(filteredMedias);

    // 📚 2. 원작 도서 탐색 (Kakao)
    const bookRes = await fetch(
      `https://dapi.kakao.com/v3/search/book?query=${coreTitle}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } }
    );
    const bookData = await bookRes.json();
    
    // 현재 보고 있는 게 BOOK 타입일 때만 제목으로 필터링
    const filteredBooks = bookData.documents?.filter(b => {
      if (type === 'BOOK') {
        // 현재 보고 있는 책과 제목이 너무 똑같으면 제외
        return b.title !== title && !b.title.includes(title);
      }
      return true; // 영화/공연 볼 때는 관련 책은 다 보여줌
    }).slice(0, 4);
    setRelatedBooks(filteredBooks);

    // 🎭 3. 공연 탐색 (KOPIS)
    const stageRes = await fetch(
      `http://www.kopis.or.kr/openApi/restful/pblprfr?service=${KOPIS_KEY}&shprnm=${coreTitle}&stdate=20230101&eddate=20261231&cpage=1&rows=10&json=yes`
    );
    const stageData = await stageRes.json();
    const filteredStages = (stageData.prfr || []).filter(s => {
      const isSameId = s.mt20id === id;
      return !isSameId && (s.genrenm === "연극" || s.genrenm === "뮤지컬");
    }).slice(0, 4);
    setRelatedStages(filteredStages);

  } catch (error) {
    console.error("탐색 실패:", error);
  } finally {
    setLoading(false);
  }
};

  if (!mainItem) return <div className="container mt-5">작품 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="container mt-5 pb-5">
      {/* 1. 상단: 메인 작품 정보 (세로 배치) */}
      <div className="row p-4 bg-white">
        <div className="col-12 col-md-4 mb-4 text-center">
          <img 
            src={mainItem.thumbnail || "https://via.placeholder.com/300x450"} 
            className="img-fluid rounded shadow-lg" 
            style={{ maxHeight: '500px' }}
            alt={mainItem.title} 
          />
        </div>
        <div className="col-12 col-md-8">
          <div className="mb-2">
            <span className={`badge ${type === 'BOOK' ? 'bg-primary' : 'bg-danger'}`}>{type}</span>
          </div>
          <h1 className="fw-bold mb-3">{mainItem.title}</h1>
          <p className="text-muted">저자/출연: {mainItem.authors?.join(", ") || "정보 없음"}</p>
          <hr />
          <h5>작품 소개</h5>
          <p className="text-secondary" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
            {mainItem.contents || "상세 정보가 없습니다."}
          </p>
          <button className="btn btn-dark btn-lg mt-3" onClick={() => nav("/bookrecord", { state: { book: mainItem, type } })}>
            📝 이 작품 기록 남기기
          </button>
        </div>
      </div>

      {/* 2. 하단: 유니버스 탐색 (세로 리스트 형태) */}
      <div className="mt-5 p-4 border-top">
        <h4 className="fw-bold mb-4 text-center">🔗 이 작품의 다른 모습 (유니버스 탐색)</h4>
        
        {loading ? (
          <p className="text-center py-5">연관된 원작 및 리메이크 작품을 찾는 중...</p>
        ) : (
          <div className="d-flex flex-column gap-5">
            
            {/* 📚 원작 도서 섹션: 주로 영화/드라마에서 원작 찾을 때 나옴 */}
            {relatedBooks.length > 0 && (
              <div className="related-group">
                <h5 className="border-start border-primary border-4 ps-2 mb-3">📚 관련/원작 도서</h5>
                <div className="row row-cols-1 g-3">
                  {relatedBooks.map((b, i) => (
                    <div key={i} className="col">
                      <div className="card h-100 flex-row align-items-center p-2 shadow-sm" onClick={() => nav(`/detail/BOOK/${b.isbn}`, { state: { book: b } })} style={{ cursor: 'pointer' }}>
                        <img src={b.thumbnail} style={{ width: '60px', height: '85px', objectFit: 'cover' }} className="rounded me-3" />
                        <div>
                          <h6 className="mb-1 text-truncate">{b.title}</h6>
                          <small className="text-muted">{b.authors[0]} | {b.publisher}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🎬 영상화 섹션: 주로 도서에서 리메이크작 찾을 때 나옴 */}
            {relatedMedias.length > 0 && (
              <div className="related-group">
                <h5 className="border-start border-danger border-4 ps-2 mb-3">🎬 관련 영화 · 드라마</h5>
                <div className="row row-cols-1 g-3">
                  {relatedMedias.map(m => (
                    <div key={m.id} className="col">
                      <div className="card h-100 flex-row align-items-center p-2 shadow-sm" onClick={() => nav(`/detail/${m.media_type === 'movie' ? 'MOVIE' : 'TV'}/${m.id}`, { state: { book: { title: m.title || m.name, thumbnail: `https://image.tmdb.org/t/p/w200${m.poster_path}`, contents: m.overview } } })} style={{ cursor: 'pointer' }}>
                        <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} style={{ width: '60px', height: '85px', objectFit: 'cover' }} className="rounded me-3" />
                        <div>
                          <h6 className="mb-1 text-truncate">{m.title || m.name}</h6>
                          <small className="text-muted">{m.media_type === 'movie' ? '영화' : '드라마'} | ⭐ {m.vote_average}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🎭 공연화 섹션 */}
            {relatedStages.length > 0 && (
              <div className="related-group">
                <h5 className="border-start border-success border-4 ps-2 mb-3">🎭 관련 연극 · 뮤지컬</h5>
                <div className="row row-cols-1 g-3">
                  {relatedStages.map(s => (
                    <div key={s.mt20id} className="col">
                      <div className="card h-100 flex-row align-items-center p-2 shadow-sm">
                        <img src={s.poster} style={{ width: '60px', height: '85px', objectFit: 'cover' }} className="rounded me-3" />
                        <div>
                          <h6 className="mb-1 text-truncate">{s.prfnm}</h6>
                          <small className="text-muted">{s.genrenm} | {s.fcltynm}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}