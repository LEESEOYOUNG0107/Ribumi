import React, { useEffect, useState, useRef } from "react";
import "./Main.css";
import Nav from "./Navi";
import Footer from "./Footer";
import search_icon from "../imgs/search_icon.svg";
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const genreMap = {
  28: "액션",
  12: "어드벤처",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  36: "역사",
  27: "공포",
  10402: "음악",
  9648: "미스터리",
  10749: "로맨스",
  878: "SF",
  10770: "TV 영화",
  53: "스릴러",
  10752: "전쟁",
  37: "서부",
  // TV 전용 장르
  10759: "액션·모험",
  10762: "키즈",
  10763: "뉴스",
  10764: "리얼리티",
  10765: "SF·판타지",
  10766: "연속극",
  10767: "토크쇼",
  10768: "전쟁·정치"
};

export default function Main() {
  // 현재 선택된 탭을 기억하는 변수 (기본값을 'movie'로 설정)
  const [activeTab, setActiveTab] = useState("movie");
  const [loading, setLoading] = useState(false); 
  const [trendingWorks, setTrendingWorks] = useState([]); 
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchTrendingWorks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}&language=ko-KR`);
        const data = await res.json();
        setTrendingWorks(data.results || []);
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingWorks();
  }, []);

  // 가로 스크롤 컨트롤
  const handlePrev = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: "smooth" });
  };
  const handleNext = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: "smooth" });
  };

  const PlatformCard = ({ work, id }) => {
    if(!work) {
      return (
        <div className="platformCard" key={id}>
          <div className="cardImage" style={{backgroundColor: "#222"}}></div>
          <div className="cardMeta">
            <div className="cardTitleSection">
              <h4 className="cardTitle">준비 중</h4>
            </div>
          </div>
        </div>
      );  
    }
    
    const posterUrl = work.poster_path ? `https://image.tmdb.org/t/p/w500${work.poster_path}` : " ";
    const title = work.title || work.name;
    const year = (work.release_date || work.first_air_date || "").substring(0, 4);

    let genreText = "기타";
    // 작품에 장르 번호들이 들어있다면?
    if (work.genre_ids && work.genre_ids.length > 0) {
      // 1. 번호들을 우리가 만든 사전(genreMap)을 보고 한글 이름으로 바꿉니다.
      const genreNames = work.genre_ids.map(id => genreMap[id]).filter(Boolean);
      
      // 2. 장르가 너무 많으면 지저분하니, 앞에서부터 최대 2개만 잘라서(|) 기호로 묶어줍니다.
      genreText = genreNames.slice(0, 2).join(' | ');
      
      // 만약 배열이 비어있으면 다시 "기타"로 설정
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

return (
  <div className="frame mainWrapper">
    <Nav/>
    <div className="searchContainer">
      <img src={search_icon} className="search-icon"/>
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

    {/* 실시간 인기 작품 */}
    <section className="scrollSection">
      <div className="sectionHeader" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 className="sectionTitle">실시간 인기 작품</h3>
      </div>

      <div className="sliderWrapper">
        <div className="sliderBtn leftBtn" onClick={handlePrev}> &lt; </div>
        
        <div className="platformScroll" ref={scrollRef}>
          {/* 배열에서 현재 인덱스부터 6개를 잘라서 렌더링 */}
          {trendingWorks.map((work) => (
            <PlatformCard key={work.id} work={work} />
          ))}
        </div>
        <div className="sliderBtn rightBtn" onClick={handleNext}> &gt; </div>
      </div>  
    </section>

    

    {/* Indicator Dots */}
    {/* <div className="indicator-section">
      <span className="indicator-dot active"></span>
      <span className="indicator-dot"></span>
      <span className="indicator-dot"></span>
    </div> */}

    {/* Tab Section */}
    {/* <section className="tab-section">
      <div className="tab-buttons">
        {["영화", "소설", "웹툰", "드라마", "뮤지컬", "애니메이션"].map((tab) => (
          <button 
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <div className="grid-row">
          {[1, 2, 3, 4, 5, 6, 7].map((id) => <PlatformCard key={`row1-${id}`} id={`row1-${id}`} />)}
        </div>
        <div className="grid-row">
          {[8, 9, 10, 11, 12, 13, 14].map((id) => <PlatformCard key={`row2-${id}`} id={`row2-${id}`} />)}
        </div>
        <div className="grid-row">
          {[15, 16, 17, 18, 19, 20, 21].map((id) => <PlatformCard key={`row3-${id}`} id={`row3-${id}`} />)}
        </div>
      </div>
    </section> */}

    <Footer />
  </div>  
  );
}
