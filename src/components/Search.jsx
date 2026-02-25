import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { XMLParser } from "fast-xml-parser";

export default function Search() {
  const [search, setSearch] = useState(""); // 검색어 상태
  const [books, setBooks] = useState([]);   // 도서 결과
  const [medias, setMedias] = useState([]); // 영화/드라마 결과
  const [stages, setStages] = useState([]); // 공연 결과
  
  const inputRef = useRef();
  const nav = useNavigate();
  const parser = new XMLParser()

  const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_KEY;
  const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

  const fetchAll = async () => {
    if (search.trim() === "") {
      inputRef.current.focus();
      return;
    }

    try {
      // 1. 도서 검색
      const bookRes = await fetch(
        `https://dapi.kakao.com/v3/search/book?query=${search}`,
        { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } }
      );
      const bookData = await bookRes.json();
      setBooks(bookData.documents || []);

      // 2. 미디어 검색
      const mediaRes = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=ko-KR&query=${search}`
      );
      const mediaData = await mediaRes.json();
      setMedias(mediaData.results || []);

       // 3. 공연 검색
      const stageRes = await fetch(
        `/openApi/restful/pblprfr?service=${KOPIS_KEY}&shprfnm=${encodeURIComponent(search)}&stdate=20200101&eddate=20261231&cpage=1&rows=100`
      );

      const xmlText = await stageRes.text();
      const jsonObj = parser.parse(xmlText);
      const rawData = jsonObj.dbs?.db;
      const stageList = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
      setStages(stageList);
    } catch (error) {
      console.error("통합 검색 중 오류 발생:", error);
    }
  };

  return (
    <div className="container mt-4">
      {/* 검색창 */}
      <div className="input-group mb-5">
        <input 
          ref={inputRef}
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.keyCode === 13 && fetchAll()}
          placeholder="도서, 영화, 연극 등을 입력하세요..."
        />
        <button className="btn btn-primary" onClick={fetchAll}>검색</button>
      </div>

      <div className="search-results">
        {/* 1. 도서 섹션: 결과가 있을 때만 map으로 반복 출력 */}
        {books.length > 0 && (
          <div className="mb-5">
            <h3>📚 검색된 도서</h3>
            <div className="d-flex overflow-auto gap-3 pb-3">
              {books.map((book) => (
                <div key={book.isbn} className="card p-2" style={{ minWidth: "180px", maxWidth: "180px" }}>
                  <div 
                    onClick={() => nav(`/detail/BOOK/${book.isbn}`, { state: { book: { 
                      title: book.title, 
                      thumbnail: book.thumbnail, 
                      authors: book.authors,
                      contents: book.contents 
                    }, type: 'BOOK' }})} 
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={book.thumbnail || "https://via.placeholder.com/150"} className="card-img-top" alt={book.title} style={{height: "240px", objectFit: "cover"}} />
                    <div className="card-body p-2">
                      <h6 className="card-title text-truncate">{book.title}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. 미디어 섹션: 영화/드라마/애니 */}
        {medias.length > 0 && (
          <div className="mb-5">
            <h3>🎬 검색된 미디어</h3>
            <div className="d-flex overflow-auto gap-3 pb-3">
              {medias.filter(m => m.poster_path).map((m) => (
                <div key={m.id} className="card p-2" style={{ minWidth: "180px", maxWidth: "180px" }}>
                  <div 
                    onClick={() => nav(`/detail/${m.media_type === 'movie' ? 'MOVIE' : 'TV'}/${m.id}`, { state: { book: {
                      title: m.title || m.name,
                      thumbnail: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                      contents: m.overview,
                      authors: ["미디어 콘텐츠"]
                    }, type: m.media_type === 'movie' ? 'MOVIE' : 'TV' }})} 
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="card-img-top" alt={m.title || m.name} style={{height: "240px", objectFit: "cover"}} />
                    <div className="card-body p-2">
                      <h6 className="card-title text-truncate">{m.title || m.name}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 공연 섹션 */}
        {stages.length > 0 && (
          <div className="mb-5">
            <h3>🎭 검색된 공연 (연극/뮤지컬)</h3>
            <div className="d-flex overflow-auto gap-3 pb-3">
              {stages.map((s) => (
                <div key={s.mt20id} className="card p-2" style={{ minWidth: "180px", maxWidth: "180px" }}>
                  <div onClick={() => nav(`/detail/STAGE/${s.mt20id}`, { state: { book: {
                      title: s.prfnm,
                      thumbnail: s.poster,
                      contents: `${s.fcltynm}에서 공연 중`,
                      authors: [s.genrenm]
                    }, type: 'STAGE' }})}
                    style={{ cursor: 'pointer' }} >
                    <img src={s.poster} className="card-img-top" alt={s.prfnm} style={{height: "240px", objectFit: "cover"}} />
                    <div className="card-body p-2">
                      <h6 className="card-title text-truncate">{s.prfnm}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 결과 없음 */}
        {books.length === 0 && medias.length === 0 && stages.length === 0 && search && (
          <div className="text-center mt-5 text-muted">
            <p>"{search}"에 대한 검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}