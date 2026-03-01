import React, { useEffect, useState, useRef } from "react";
import "./Main.css";
import Nav from "./Navi";
import Footer from "./Footer";
import search_icon from "../imgs/search_icon.svg";

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

function PlatformCard({ work }) {
  if (!work) return null;
  const posterUrl = work.poster_path ? `https://image.tmdb.org/t/p/w500${work.poster_path}` : " ";
  const year = (work.release_date || work.first_air_date || "").substring(0, 4);

  let genreText = "기타";
  if (work.genre_ids && work.genre_ids.length > 0) {
    const genreNames = work.genre_ids.map(id => genreMap[id]).filter(Boolean);
    genreText = genreNames.slice(0, 2).join(' | ');
    if (!genreText) genreText = "기타";
  }

  return (
    <div className="platformCard">
      <div className="cardImage" style={{ backgroundImage: `url(${posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="cardMeta">
        <div className="cardTitleSection">
          <h4 className="cardTitle">{work.title || work.name}</h4>
          <span className="cardGenre">{genreText}</span>
        </div>
      </div>    
      <div className="cardRatingGroup">
        <span className="cardYear">{year}</span>
        <div className="cardRating">
          <span className="heart">♡</span>
          <span className="star">★</span>
          <span className="ratingScore">{work.vote_average?.toFixed(1) || "0.0"}</span>
        </div>
      </div>
    </div>
  );
}

export default function Main() {
  const [activeTab, setActiveTab] = useState("movie");
  const [loading, setLoading] = useState(false); 
  const [trendingWorks, setTrendingWorks] = useState([]); 
  const [originalWorks, setOriginalWorks] = useState([]); 
  
  const scrollRef = useRef(null);
  const scrollRef2 = useRef(null);

  useEffect(() => {
    // 첫 번째 줄: 실시간 인기 작품 (기존과 동일)
    const fetchTrendingWorks = async () => {
      setLoading(true);
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&region=KR&sort_by=popularity.desc`),
          fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&language=ko-KR&with_origin_country=KR&sort_by=popularity.desc`)
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

    // 웹툰/소설 원작 작품 가져오기
    const fetchOriginalWorks = async () => {
      try {
        // with_keywords=818|9715 를 추가해서 소설(818)이나 만화(9715) 원작인 한국 작품만 가져옵니다!
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&with_origin_country=KR&with_keywords=818|9715&sort_by=popularity.desc`),
          fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&language=ko-KR&with_origin_country=KR&with_keywords=818|9715&sort_by=popularity.desc`)
        ]);

        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        //  두 데이터를 합치고 인기순으로 줄 세우기
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

  // 가로 스크롤 함수
  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="frame mainWrapper">
      <Nav/>
      <div className="searchContainer">
        <img src={search_icon} className="search-icon" alt="검색"/>
        <input type="text" placeholder="  제목, 장르, 지은이 검색" className="search-box"/>
      </div>

      {/* Banner Section */}
      <div className="banner-section">
        <div className="banner-content">배너 내용</div>
          <div className="banner-title-image"></div>
          <div className="banner-buttons">
            <button className="btn btn-white">자세히 보기</button>
            <button className="btn btn-gray">원작 정보보기</button>
          </div>
      </div>

      {/* 1. 실시간 인기 작품 */}
      <section className="scrollSection">
        <div className="sectionHeader" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="sectionTitle">실시간 인기 작품</h3>
        </div>

        <div className="sliderWrapper">
          <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef)}> &lt; </button>
          <div className="platformScroll" ref={scrollRef}>
            {trendingWorks.map((work) => (
              <PlatformCard key={work.id} work={work} />
            ))}
          </div>
          <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef)}> &gt; </button>
        </div>  
      </section>

      {/* 2. 원작을 찢고 나온 작품들 */}
      <section className="scrollSection" style={{ marginTop: '50px' }}>
        <div className="sectionHeader" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="sectionTitle">원작을 찢고 나온 작품들</h3>
        </div>

        <div className="sliderWrapper">
          <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef2)}> &lt; </button>
          <div className="platformScroll" ref={scrollRef2}>
            {originalWorks.map((work) => (
              <PlatformCard key={work.id} work={work} />
            ))}
          </div>
          <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef2)}> &gt; </button>
        </div>
      </section>

      <Footer />
    </div>  
  );
}