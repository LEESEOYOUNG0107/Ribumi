import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Main.css";
import "./Search.css";
import Nav from "./Navi";
import Footer from "./Footer";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;
const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

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

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

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
          (d.results || []).filter(t => ![10764,10767,10763,10766].some(g => t.genre_ids?.includes(g)))
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

  const genreMap = {
  28: "액션", 12: "어드벤처", 16: "애니메이션", 35: "코미디",
  80: "범죄", 99: "다큐멘터리", 18: "드라마", 10751: "가족",
  14: "판타지", 36: "역사", 27: "공포", 10402: "음악",
  9648: "미스터리", 10749: "로맨스", 878: "SF", 10770: "TV 영화",
  53: "스릴러", 10752: "전쟁", 37: "서부",
  10759: "액션·모험", 10762: "키즈", 10763: "뉴스", 10764: "리얼리티",
  10765: "SF·판타지", 10766: "연속극", 10767: "토크쇼", 10768: "전쟁·정치"
};

  // 카드 컴포넌트들
  const MovieCard = ({ item }) => (
    <div className="platformCard" onClick={() => navigate(`/detail/movie/${item.id}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster_path})` }}></div>
      <div className="cardMeta">
        <h4 className="cardTitle">{item.title}</h4>
        <span className="cardGenre">{item.genre_ids?.map(id => genreMap[id]).filter(Boolean).slice(0,2).join('|')||"기타"}</span>
      </div>
      <div className="cardRatingGroup">
        <span className="cardYear">{item.release_date?.substring(0,4)}</span>
        <div className="cardRating">
          <span className="heart">♡</span>
          <span className="ratingScore">⭐{item.vote_average?.toFixed(1)}</span>
        </div>  
      </div>
    </div>
  );

  const TvCard = ({ item }) => (
    <div className="platformCard" onClick={() => navigate(`/detail/tv/${item.id}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster_path})` }}></div>
      <div className="cardMeta"><h4 className="cardTitle">{item.name}</h4></div>
      <div className="cardRatingGroup">
        <span className="cardYear">{item.first_air_date?.substring(0,4)}</span>
        <span className="ratingScore">⭐{item.vote_average?.toFixed(1)}</span>
      </div>
    </div>
  );

  const BookCard = ({ item }) => (
    <div className="platformCard" onClick={() => navigate(`/detail/book/${item.isbn13}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(${item.cover?.replace('/coversum/','/cover500/')})` }}></div>
      <div className="cardMeta"><h4 className="cardTitle">{item.title}</h4></div>
      <div className="cardRatingGroup">
        <span className="cardYear">{item.pubDate?.substring(0,4)}</span>
        <span className="ratingScore">⭐{item.customerReviewRank ? (item.customerReviewRank/2).toFixed(1) : "0.0"}</span>
      </div>
    </div>
  );

  const PerfCard = ({ item }) => (
    <div className="platformCard" onClick={() => navigate(`/detail/performance/${item.id}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(${item.poster})` }}></div>
      <div className="cardMeta">
        <h4 className="cardTitle">{item.title}</h4>
        <span className="cardGenre">{item.genre}</span>
      </div>
    </div>
  );

  const Section = ({ title, data, renderCard, refObj }) => {
    if (!data.length) return null;
    return (
      <section className="scrollSection" style={{ marginTop: '50px' }}>
        <h3 className="sectionTitle">{title} <span className="searchResultCount">({data.length})</span></h3>
        <div className="sliderWrapper">
          <button className="sliderBtn leftBtn" onClick={() => scrollLeft(refObj)}>&lt;</button>
          <div className="platformScroll" ref={refObj}>
            {data.map((item, i) => <div key={item.id || i}>{renderCard(item)}</div>)}
          </div>
          <button className="sliderBtn rightBtn" onClick={() => scrollRight(refObj)}>&gt;</button>
        </div>
      </section>
    );
  };

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

      <Section title="🎬 영화" data={movies} renderCard={(item) => <MovieCard item={item}/>} refObj={movieRef}/>
      <Section title="📺 드라마" data={tvShows} renderCard={(item) => <TvCard item={item}/>} refObj={tvRef}/>
      <Section title="📚 도서" data={books} renderCard={(item) => <BookCard item={item}/>} refObj={bookRef}/>
      <Section title="🎭 공연" data={performances} renderCard={(item) => <PerfCard item={item}/>} refObj={perfRef}/>

      <Footer />
    </div>
  );
}