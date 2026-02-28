import React, { useState } from "react";
import "./Main.css";
import Nav from "./Navi";
import Footer from "./Footer";

export default function Main() {
  // 현재 선택된 탭을 기억하는 변수 (기본값을 'movie'로 설정)
  const [activeTab, setActiveTab] = useState("movie");
  const [loading, setLoading] = useState(false); 
  const [sections, setSections] = useState({
    movie: [], novel: [], webtoon: [], drama: [], musical: [], animation: []
  });

  const PlatformCard = ({ id }) => (
    <div className="platform-card">
      <div className="card-image"></div>
      <div className="card-meta">
        <div className="card-title-section">
          <h4 className="card-title">연의 편지</h4>
          <span className="card-genre">로맨스 | 애니</span>
        </div>
        <div className="card-rating-group">
          <span className="card-year">2024</span>
          <div className="card-rating">
            <span className="heart">♡</span>
            <span className="star">★</span>
            <span className="rating-score">8.49</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="frame">
      <Nav/>
      <input type="text" placeholder="제목, 장르, 지은이 검색 🔍" className="search-box"/>

      {/* Banner Section */}
      <div className="banner-section">
        <div className="banner-mask"></div>
        <div className="banner-content">
          <div className="banner-title-image"></div>
          <p className="banner-text">
            말없이 전해진 한 통의 편지가, 외로웠던 소녀의 하루를 조금씩 바꿔 놓는다.<br />
            설렘과 위로가 교차하는 순간, 잊고 있던 첫 감정이 다시 피어난다.
          </p>
          <div className="banner-buttons">
            <button className="btn btn-white">자세히 보기</button>
            <button className="btn btn-gray">원작 정보보기</button>
          </div>
        </div>
      </div>

      {/* Section 1: 2025 Most Popular Movies */}
      <section className="content-section">
        <h3 className="section-title">2025 가장 인기있었던 영화</h3>
        <div className="platform-scroll">
          {[1, 2, 3, 4, 5, 6, 7].map((id) => <PlatformCard id={id} />)}
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
            {[1, 2, 3, 4, 5, 6, 7].map((id) => <PlatformCard id={`row1-${id}`} />)}
          </div>
          <div className="grid-row">
            {[8, 9, 10, 11, 12, 13, 14].map((id) => <PlatformCard id={`row2-${id}`} />)}
          </div>
          <div className="grid-row">
            {[15, 16, 17, 18, 19, 20, 21].map((id) => <PlatformCard id={`row3-${id}`} />)}
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
