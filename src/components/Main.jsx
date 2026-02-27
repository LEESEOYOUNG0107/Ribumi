import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import ribumi_logo from "../imgs/ribumi_logo.svg";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

export default function Main() {
  const navigate = useNavigate();
  const [sections, setSections] = useState({
    popMovie2025: [],
    recentBook: [],
    storyUniverse: [],
    movie: [],
    novel: [],
    webtoon: [],
    drama: [],
    musical: [],
    animation: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("movie");

  useEffect(() => {
    fetchAllWorks();
  }, []);

  const fetchAllWorks = async () => {
    setLoading(true);
    try {
      // 2025 가장 인기있었던 영화
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&sort_by=popularity.desc&primary_release_year=2024&page=1`
      );
      const movieData = await movieRes.json();
      const movieWorks = processWorks(movieData);

      // 최근인기 도서 (TV로 대체)
      const bookRes = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&language=ko-KR&sort_by=popularity.desc&page=1`
      );
      const bookData = await bookRes.json();
      const bookWorks = processWorks(bookData, "TV");

      // 유명한 스토리 유니버스 (인기순)
      const universeRes = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&sort_by=popularity.desc&page=2`
      );
      const universeData = await universeRes.json();
      const universeWorks = processWorks(universeData);

      setSections(prev => ({
        ...prev,
        popMovie2025: movieWorks,
        recentBook: bookWorks,
        storyUniverse: universeWorks,
        movie: movieWorks,
        novel: bookWorks,
        webtoon: movieWorks,
        drama: bookWorks,
        musical: universeWorks,
        animation: universeWorks,
      }));
    } catch (err) {
      console.error("작품 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const processWorks = (data, type = "MOVIE") => {
    return data.results
      .filter(item => item.poster_path)
      .slice(0, 7)
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        thumbnail: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        mediaType: type,
      }));
  };

  const handleWorkClick = (work) => {
    navigate(`/detail/${work.mediaType}/${work.id}`, {
      state: { book: work, type: work.mediaType },
    });
  };

  return (
    <div className="main-wrapper">
      {/* Navigation */}
      <nav className="header-nav">
        <div className="nav-left">
          <div className="logo">
            <h1>ribumi</h1>
          </div>
          <div className="nav-menu">
            <div className="nav-item" onClick={() => navigate("/")}>홈</div>
            <div className="nav-item">통합장르</div>
            <div className="nav-item">도서장르</div>
            <div className="nav-item nav-active">문화 콘텐츠</div>
            <div className="nav-item">내 페이지</div>
          </div>
        </div>
        <div className="search-box">
          <input type="text" placeholder="제목, 장르, 지은이 검색" />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </nav>

      {/* Main Banner */}
      <div className="banner-section">
        <div className="banner-image">
          <div className="banner-overlay"></div>
        </div>
        <div className="banner-content">
          <div className="banner-title">
            <h2>여의 편지</h2>
          </div>
          <p className="banner-description">
            말없이 전해진 한 통의 편지가, 외로웠던 소녀의 하루를 조금씩 바꿔 놓는다.<br />
            설렘과 위로가 교차하는 순간, 잊고 있던 첫 감정이 다시 피어난다.
          </p>
          <div className="banner-buttons">
            <button className="btn btn-primary">자세히 보기</button>
            <button className="btn btn-secondary">원작 정보보기</button>
          </div>
        </div>
      </div>

      {/* Indicator */}
      <div className="indicator-section">
        <div className="indicator-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* Section 1: 2025 Most Popular Movies */}
      <section className="content-section">
        <h3 className="section-title">2025 가장 인기있었던 영화</h3>
        <div className="horizontal-scroll">
          {sections.popMovie2025.length > 0 ? (
            sections.popMovie2025.map((work) => (
              <div
                key={work.id}
                className="scroll-item"
                onClick={() => handleWorkClick(work)}
              >
                <img src={work.thumbnail} alt={work.title} />
              </div>
            ))
          ) : (
            <div className="loading">로딩 중...</div>
          )}
        </div>
      </section>

      {/* Section 2: Recent Popular Books */}
      <section className="content-section">
        <h3 className="section-title">최근인기 도서</h3>
        <div className="horizontal-scroll">
          {sections.recentBook.length > 0 ? (
            sections.recentBook.map((work) => (
              <div
                key={work.id}
                className="scroll-item"
                onClick={() => handleWorkClick(work)}
              >
                <img src={work.thumbnail} alt={work.title} />
              </div>
            ))
          ) : (
            <div className="loading">로딩 중...</div>
          )}
        </div>
      </section>

      {/* Section 3: Famous Story Universe */}
      <section className="content-section">
        <h3 className="section-title">유명한 스토리 유니버스</h3>
        <div className="horizontal-scroll">
          {sections.storyUniverse.length > 0 ? (
            sections.storyUniverse.map((work) => (
              <div
                key={work.id}
                className="scroll-item"
                onClick={() => handleWorkClick(work)}
              >
                <img src={work.thumbnail} alt={work.title} />
              </div>
            ))
          ) : (
            <div className="loading">로딩 중...</div>
          )}
        </div>
      </section>

      {/* Tabbed Section */}
      <section className="tabbed-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "movie" ? "active" : ""}`}
            onClick={() => setActiveTab("movie")}
          >
            영화
          </button>
          <button
            className={`tab ${activeTab === "novel" ? "active" : ""}`}
            onClick={() => setActiveTab("novel")}
          >
            소설
          </button>
          <button
            className={`tab ${activeTab === "webtoon" ? "active" : ""}`}
            onClick={() => setActiveTab("webtoon")}
          >
            웹툰
          </button>
          <button
            className={`tab ${activeTab === "drama" ? "active" : ""}`}
            onClick={() => setActiveTab("drama")}
          >
            드라마
          </button>
          <button
            className={`tab ${activeTab === "musical" ? "active" : ""}`}
            onClick={() => setActiveTab("musical")}
          >
            뮤지컬
          </button>
          <button
            className={`tab ${activeTab === "animation" ? "active" : ""}`}
            onClick={() => setActiveTab("animation")}
          >
            애니메이션
          </button>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            <div className="grid-container">
              {sections[activeTab]?.map((work, index) => (
                <div
                  key={work.id}
                  className={`grid-item ${index < 7 ? '' : 'row-2'}`}
                  onClick={() => handleWorkClick(work)}
                >
                  <img src={work.thumbnail} alt={work.title} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">ribumi</div>
        <div className="footer-links">
          <a href="https://www.e-mirim.hs.kr/main.do">학교정보공개</a>
          <span className="divider">|</span>
          <a href="">작성자저작권정보</a>
          <span className="divider">|</span>
          <a href="">개인정보처리방침</a>
        </div>
        <div className="footer-contact">
          <span>개발자: 이서영 E-mail: s2446@e-mirim.hs.kr</span>
          <span className="divider">|</span>
          <span>디자이너: 김설애 E-mail: d2402@e-mirim.hs.kr</span>
        </div>
        <div className="footer-address">서울특별시 관악구 호암로 546 · 미림마이스터고등학교</div>
      </footer>
    </div>
  );
}
