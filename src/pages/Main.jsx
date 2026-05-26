import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import Nav from "../components/Navi";
import Footer from "../components/Footer";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const genreMap = {
  28: "액션", 12: "어드벤처", 16: "애니메이션", 35: "코미디",
  80: "범죄", 99: "다큐멘터리", 18: "드라마", 10751: "가족",
  14: "판타지", 36: "역사", 27: "공포", 10402: "음악",
  9648: "미스터리", 10749: "로맨스", 878: "SF", 10770: "TV 영화",
  53: "스릴러", 10752: "전쟁", 37: "서부",
  10759: "액션·모험", 10762: "키즈", 10763: "뉴스", 10764: "리얼리티",
  10765: "SF·판타지", 10766: "연속극", 10767: "토크쇼", 10768: "전쟁·정치"
};

function PlatformCard({ item }) {
  const navigate = useNavigate();
  const [isWished, setIsWished] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("wishList") || "[]");
    return saved.some(wish => String(wish.id) === String(item?.id));
  });

  const handleWishClick = (e) => {
    e.stopPropagation(); // 💡 카드 클릭(상세페이지 이동) 방지

    const currentList = JSON.parse(localStorage.getItem("wishList") || "[]");
    if (isWished) {
      // 찜 삭제
      const updated = currentList.filter(wish => String(wish.id) !== String(item.id));
      localStorage.setItem("wishList", JSON.stringify(updated));
    } else {
      // 찜 추가
      const newItem = {
        id: item.id,
        type: item.first_air_date ? "tv" : "movie",
        title: item.title || item.name,
        poster: posterUrl,
        year: year,
        rating: item.vote_average
      };
      localStorage.setItem("wishList", JSON.stringify([newItem, ...currentList]));
    }
    setIsWished(!isWished); // 하트 색깔 반전
  };

  if (!item) return null;
  const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : " ";
  const year = (item.release_date || item.first_air_date || "").substring(0, 4);

  let genreText = "기타";
  if (item.genre_ids && item.genre_ids.length > 0) {
    const genreNames = item.genre_ids.map(id => genreMap[id]).filter(Boolean);
    genreText = genreNames.slice(0, 2).join(' | ');
    if (!genreText) genreText = "기타";
  }

  return (
    <div className="platformCard" onClick={() => navigate(`/detail/${item.first_air_date ? "tv" : "movie"}/${item.id}`, { state: { item } })}>
      <div className="cardImage" style={{ backgroundImage: `url(${posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="cardMeta">
        <div className="cardTitleSection">
          <h4 className="cardTitle">{item.title || item.name}</h4>
          <span className="cardGenre">{genreText}</span>
        </div>
      </div>
      <div className="cardRatingGroup">
        <span className="cardYear">{year}</span>
        <div className="cardRating">
          <button className={`cardHeart ${isWished ? "wished" : ""}`} onClick={handleWishClick}>
            {isWished ? "♥" : "♡"}
          </button>
          <span className="ratingScore">⭐{item.vote_average?.toFixed(1) || "0.0"}</span>
        </div>
      </div>
    </div>
  );
}

export default function Main() {
  // const [activeTab, setActiveTab] = useState("movie");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trendingWorks, setTrendingWorks] = useState([]);
  const [originalWorks, setOriginalWorks] = useState([]);
  const [CurrentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerLogo, setBannerLogo] = useState(null);
  const [isBannerExpanded, setIsBannerExpanded] = useState(false);

  const scrollRef = useRef(null);
  const scrollRef2 = useRef(null);

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchTrendingWorks = async () => {
      setLoading(true);
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&watch_region=KR&with_origin_country=KR&sort_by=popularity.desc`),
          fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&language=ko-KR&watch_region=KR&with_origin_country=KR&sort_by=popularity.desc&without_genres=10764,10767,10763,10766`)
        ]);
        const movieData = await movieRes.json();
        const tvData = await tvRes.json();
        const combinedTrending = [...(movieData.results || []), ...(tvData.results || [])]
          .sort((a, b) => b.popularity - a.popularity);
        setTrendingWorks(combinedTrending);
      } catch (error) {
        console.error("인기 데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOriginalWorks = async () => {
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&with_origin_country=KR&with_keywords=818|9715&sort_by=popularity.desc`),
          fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&language=ko-KR&with_origin_country=KR&with_keywords=818|9715&sort_by=popularity.desc&without_genres=10764,10767,10763,10766`)
        ]);
        const movieData = await movieRes.json();
        const tvData = await tvRes.json();
        const combinedOriginals = [...(movieData.results || []), ...(tvData.results || [])]
          .sort((a, b) => b.popularity - a.popularity);
        setOriginalWorks(combinedOriginals);
      } catch (error) {
        console.error("원작 기반 데이터를 불러오는데 실패했습니다.", error);
      }
    };

    fetchTrendingWorks();
    fetchOriginalWorks();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) =>
        prevIndex === originalWorks.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [originalWorks]);

  const currentBannerWork = originalWorks[CurrentBannerIndex];
  useEffect(() => {
    setIsBannerExpanded(false); // 배너가 다음 슬라이드로 넘어가면 글을 다시 접습니다.
  }, [CurrentBannerIndex]);

  //원작 정보 보기 버튼 클릭 시 상세페이지로 이동
  const handleGoToDetail = () => {
    if (!currentBannerWork) return;
    const mediaType = currentBannerWork.first_air_date ? "tv" : "movie";
    navigate(`/detail/${mediaType}/${currentBannerWork.id}`, { state: { item: currentBannerWork } });
  };

  useEffect(() => {
    const fetchLogo = async () => {
      if (!currentBannerWork) return;
      setBannerLogo(null);
      try {
        let mediaType = currentBannerWork.media_type;
        if (!mediaType) {
          mediaType = currentBannerWork.first_air_date ? 'tv' : 'movie';
        }
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${currentBannerWork.id}/images?api_key=${TMDB_KEY}&include_image_language=ko,null`);
        const data = await response.json();
        if (data.logos && data.logos.length > 0) {
          setBannerLogo(data.logos[0].file_path);
        }
      } catch (error) {
        console.log("로고 데이터를 가져오는데 실패했습니다.", error);
      }
    };
    fetchLogo();
  }, [currentBannerWork]);

  return (
    <div className="frame mainWrapper">
      <Nav />

      {originalWorks.length > 0 && currentBannerWork && (
        <div className="bannerSection"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${currentBannerWork.backdrop_path})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="bannerOverlay"></div>
          <div className="bannerContent">
            <div className="bannerTitleSection">
              {bannerLogo ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${bannerLogo}`}
                  alt="작품 타이틀 로고"
                  className="bannerLogo"
                />
              ) : (
                <h2 className="bannerTitle">{currentBannerWork.title || currentBannerWork.name}</h2>
              )}
            </div>
            {currentBannerWork.overview && (
              <p className="bannerDescrip">
                {isBannerExpanded
                  ? currentBannerWork.overview : currentBannerWork.overview.length > 70
                  ? currentBannerWork.overview.slice(0, 70) + "..." : currentBannerWork.overview}
              </p>
            )}
            <div className="bannerBtn">
              <button className="btn btnDetail" onClick={() => setIsBannerExpanded(!isBannerExpanded)}>
                {isBannerExpanded ? "접기 ▴" : "자세히 보기 ▾"}
              </button>
              <button className="btn btnInfo" onClick={handleGoToDetail}>원작정보 보기</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">데이터를 불러오는 중입니다...🍿</div>
      ) : (
        <>
          <section className="scrollSection">
            <div className="sectionHeader" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="sectionTitle">실시간 인기 작품</h3>
            </div>
            <div className="sliderWrapper">
              <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef)}> &lt; </button>
              <div className="platformScroll" ref={scrollRef}>
                {trendingWorks.map((item) => (
                  <PlatformCard key={item.id} item={item} />
                ))}
              </div>
              <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef)}> &gt; </button>
            </div>
          </section>

          <section className="scrollSection" style={{ marginTop: '50px' }}>
            <div className="sectionHeader" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="sectionTitle">원작을 찢고 나온 작품들</h3>
            </div>
            <div className="sliderWrapper">
              <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef2)}> &lt; </button>
              <div className="platformScroll" ref={scrollRef2}>
                {originalWorks.map((item) => (
                  <PlatformCard key={item.id} item={item} />
                ))}
              </div>
              <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef2)}> &gt; </button>
            </div>
          </section>
        </>
      )}
      <Footer />
    </div>
  );
}