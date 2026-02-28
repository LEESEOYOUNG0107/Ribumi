import React, { useEffect, useState, useRef } from "react";
import "./Main.css";
import Nav from "./Navi";
import Footer from "./Footer";
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

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
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -600, behavior: "smooth" });
  };
  const handleNext = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 600, behavior: "smooth" });
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
    if (work.media_type === "movie") {
      genreText = work.genre_ids?.includes(16) ? "애니메이션" : "영화";
    } else if (work.media_type === "tv") {
      genreText = work.genre_ids?.includes(16) ? "애니메이션" : "드라마";
    }

    return (
      <div className="platformCard">
      <div className="cardImage" style={{ backgroundImage: `url(${posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="cardMeta">
        <div className="cardTitleSection">
        <h4 className="cardTitle">{work.title}</h4>
        <span className="cardGenre">{genreText}</span>
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
    </div>  
  );  
} 

return (
  <div className="frame main-wrapper">
    <Nav/>
    <input type="text" placeholder="제목, 장르, 지은이 검색 🔍" className="search-box"/>

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
      <div className="sectionHeader" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', marginBottom: '20px' }}>
        <h3 className="sectionTitle">실시간 인기 작품</h3>
        
        <div className="carouselControls">
          <button className="arrowBtn" onClick={handlePrev}> &lt; </button>
          <button className="arrowBtn" onClick={handleNext}> &gt; </button>
        </div>
      </div>
      
      <div className="platform-row" ref={scrollRef}>
        {/* 배열에서 현재 인덱스부터 6개를 잘라서 렌더링 */}
        {trendingWorks.map((work) => (
          <PlatformCard key={work.id} work={work} />
        ))}
      </div>
    </section>

     {/* Section 2: Recent Popular Books */}
    <section className="content-section section-offset">
      <h3 className="section-title">최근인기 도서</h3>
      <div className="platform-scroll">
        {[1, 2, 3, 4, 5, 6, 7].map((id) => <PlatformCard key={`row1-${id}`} id={`row1-${id}`} />)}
      </div>
    </section>

    {/* Section 3: Famous Story Universe */}
    <section className="content-section">
      <h3 className="section-title">유명한 스토리 유니버스</h3>
      <div className="platform-scroll">
        {[1, 2, 3, 4, 5, 6, 7].map((id) => <PlatformCard key={`row2-${id}`} id={`row2-${id}`} />)}
      </div>
    </section>

    {/* Indicator Dots */}
    <div className="indicator-section">
      <span className="indicator-dot active"></span>
      <span className="indicator-dot"></span>
      <span className="indicator-dot"></span>
    </div>

    {/* Tab Section */}
    <section className="tab-section">
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
    </section>

    {/* Navigation Arrows */}
    <div className="nav-arrow arrow-left">◀</div>
      <div className="nav-arrow arrow-right">▶</div>
      <Footer />
    </div>
  );
}
