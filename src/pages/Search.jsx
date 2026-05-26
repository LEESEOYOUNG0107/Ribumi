import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Main.css";
import "./Search.css";
import Nav from "../components/Navi";
import Footer from "../components/Footer";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;
const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

// 장르 맵핑은 바깥에 두어 여러 컴포넌트가 공유할 수 있게 합니다.
const genreMap = {
  28: "액션", 12: "모험", 16: "애니메이션", 35: "코미디", 80: "범죄", 99: "다큐멘터리",
  18: "드라마", 10751: "가족", 14: "판타지", 36: "역사", 27: "공포", 10402: "음악",
  9648: "미스터리", 10749: "로맨스", 878: "SF", 10770: "TV 영화", 53: "스릴러",
  10752: "전쟁", 37: "서부", 10759: "액션/모험", 10762: "아동", 10763: "뉴스",
  10764: "리얼리티", 10765: "SF/판타지", 10766: "소프", 10767: "토크", 10768: "전쟁/정치"
};

// 💡 1. 카드 컴포넌트들을 Search 메인 함수 "바깥"으로 완전히 분리했습니다.
const MovieCard = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div className="platformCard" onClick={() => navigate(`/detail/movie/${item.id}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster_path})` }}></div>
      <div className="cardMeta">
        <h4 className="cardTitle">{item.title}</h4>
        <span className="cardGenre">{item.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(' | ') || "기타"}</span>
      </div>
      <div className="cardRatingGroup">
        <span className="cardYear">{item.release_date?.substring(0, 4)}</span>
        <div className="cardRating">
          <span className="heart">♡</span>
          <span className="ratingScore">⭐{item.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

const TvCard = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div className="platformCard" onClick={() => navigate(`/detail/tv/${item.id}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster_path})` }}></div>
      <div className="cardMeta">
        <h4 className="cardTitle">{item.name}</h4>
        <span className="cardGenre">{item.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(' | ') || "기타"}</span>
      </div>
      <div className="cardRatingGroup">
        <span className="cardYear">{item.first_air_date?.substring(0, 4)}</span>
        <div className="cardRating">
          <span className="heart">♡</span>
          <span className="ratingScore">⭐{item.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

const BookCard = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div className="platformCard" onClick={() => navigate(`/detail/book/${item.isbn13}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(${item.cover?.replace('/coversum/', '/cover500/')})` }}></div>
      <div className="cardMeta"><h4 className="cardTitle">{item.title}</h4></div>
      <div className="cardRatingGroup">
        <span className="cardYear">{item.pubDate?.substring(0, 4)}</span>
        <div className="cardRating">
          <span className="heart">♡</span>
          <span className="ratingScore">⭐{item.customerReviewRank ? (item.customerReviewRank / 2).toFixed(1) : "0.0"}</span>
        </div>
      </div>
    </div>
  );
};

const PerfCard = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div className="platformCard" onClick={() => navigate(`/detail/performance/${item.id}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(${item.poster})` }}></div>
      <div className="cardMeta">
        <h4 className="cardTitle">{item.title}</h4>
        <span className="cardGenre">{item.genre} {item.place && `| ${item.place}`}</span>
      </div>
    </div>
  );
};

const Section = ({ title, data, renderCard }) => {
  // 처음에는 12개(대략 3줄 분량)만 보여주도록 설정합니다.
  const [visibleCount, setVisibleCount] = useState(12);

  if (!data || data.length === 0) return null;

  return (
    <section className="searchSection">
      <h3 className="sectionTitle">
        {title} <span className="searchResultCount">({data.length})</span>
      </h3>

      {/* 전체 데이터 중 visibleCount 개수만큼만 잘라서 화면에 보여줌. */}
      <div className="searchGrid">
        {data.slice(0, visibleCount).map((item, i) => (
          <div key={item.id || i}>{renderCard(item)}</div>
        ))}
      </div>

      {/* 전체 결과 개수가 현재 보여지는 개수보다 많을 때만 '더보기'를 띄움 */}
      {data.length > visibleCount && (
        <div className="showMoreBtnWrapper">
          <button className="showMoreBtn" onClick={() => setVisibleCount(data.length)}>
            더보기 ▾
          </button>
        </div>
      )}
    </section>
  );
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [books, setBooks] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(false);
  const movieRef = useRef(null);
  const tvRef = useRef(null);
  const bookRef = useRef(null);
  const perfRef = useRef(null);

  useEffect(() => {
    if (!query) return;
    const fetchAll = async () => {
      setLoading(true);

      // 영화
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&language=ko-KR&query=${encodeURIComponent(query)}`)
        .then(r => r.json()).then(d => setMovies(d.results || []));

      // 드라마
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&language=ko-KR&query=${encodeURIComponent(query)}`)
        .then(r => r.json()).then(d => setTvShows(
          (d.results || []).filter(t => ![10764, 10767, 10763, 10766].some(g => t.genre_ids?.includes(g)))
        ));

      // 도서
      fetch(`/aladin/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(query)}&QueryType=Keyword&MaxResults=15&start=1&SearchTarget=Book&output=js&Version=20131101`)
        .then(r => r.json()).then(d => setBooks(d.item || []));

      // 공연
      fetch(`/kopis/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=20250101&eddate=20271231&cpage=1&rows=15&shprfnm=${encodeURIComponent(query)}`)
        .then(r => r.text()).then(text => {
          const xml = new DOMParser().parseFromString(text, "text/xml");
          const nodes = xml.querySelectorAll("db");
          setPerformances(Array.from(nodes).map(n => ({
            id: n.querySelector("mt20id")?.textContent,
            title: n.querySelector("prfnm")?.textContent,
            poster: n.querySelector("poster")?.textContent,
            genre: n.querySelector("genrenm")?.textContent,
            place: n.querySelector("fcltynm")?.textContent,
          })));
        }).finally(() => setLoading(false));
    };
    fetchAll();
  }, [query]);

  const noResults = !loading && !movies.length && !tvShows.length && !books.length && !performances.length;

  return (
    <div className="frame mainWrapper">
      <Nav />
      <div className="searchPageHeader">
        <p className="searchQueryLabel">
          <span className="searchQueryWord">"{query}"</span> 검색 결과
        </p>
      </div>

      {loading && <div className="loading">검색 중입니다...🔍</div>}

      {noResults && (
        <div className="loading">"{query}"에 대한 검색 결과가 없습니다.</div>
      )}

      <Section title="영화" data={movies} renderCard={(item) => <MovieCard item={item} />} refObj={movieRef} />
      <Section title="TV" data={tvShows} renderCard={(item) => <TvCard item={item} />} refObj={tvRef} />
      <Section title="도서" data={books} renderCard={(item) => <BookCard item={item} />} refObj={bookRef} />
      <Section title="공연" data={performances} renderCard={(item) => <PerfCard item={item} />} refObj={perfRef} />

      <Footer />
    </div>
  );
}