import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const ribumi_logo = "../imgs/ribumi_logo.svg";
const imgGroup = "http://localhost:3845/assets/f040023227fdb278efaedb99d7c1b44e670378e6.svg";
const imgGroup1 = "http://localhost:3845/assets/7617691c4fad12d55614662d1ef48a4e351f24d5.svg";
const imgVector3 = "http://localhost:3845/assets/83021656ba7ea8667c16bb6267865027f8f7004c.svg";
const imgVector1 = "http://localhost:3845/assets/5737a9415455ff570327f3a18be9aa3562a74de8.svg";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

// 원작 기반 2차 창작물로 유명한 작품들 (책→영화/드라마)
const POPULAR_ADAPTED_QUERIES = [
  { query: "듄", type: "MOVIE" },
  { query: "반지의 제왕", type: "MOVIE" },
  { query: "해리 포터", type: "MOVIE" },
  { query: "오펜하이머", type: "MOVIE" },
  { query: "나를 찾아봐", type: "TV" },
  { query: "나미야 잡화점의 기적", type: "MOVIE" },
  { query: "킹덤", type: "TV" },
  { query: "파친코", type: "TV" },
  { query: "이상한 변호사 우영우", type: "TV" },
];

function Nav({ className }) {
  return (
    <div className={className}>
      <div className="nav-item nav-active">홈</div>
      <div className="nav-item">통합장르</div>
      <div className="nav-item">도서장르</div>
      <div className="nav-item">내 페이지</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [popularWorks, setPopularWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularWorks();
  }, []);

  const fetchPopularWorks = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        POPULAR_ADAPTED_QUERIES.map(async ({ query, type }) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=ko-KR&query=${encodeURIComponent(query)}`
          );
          const data = await res.json();
          const item = data.results?.find(
            (r) => r.poster_path && (r.media_type === "movie" || r.media_type === "tv")
          );
          if (!item) return null;
          return {
            id: item.id,
            title: item.title || item.name,
            thumbnail: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            contents: item.overview,
            authors: ["미디어 콘텐츠"],
            mediaType: item.media_type === "movie" ? "MOVIE" : "TV",
            vote_average: item.vote_average,
          };
        })
      );
      setPopularWorks(results.filter(Boolean));
    } catch (err) {
      console.error("인기 작품 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkClick = (work) => {
    navigate(`/detail/${work.mediaType}/${work.id}`, {
      state: { book: work, type: work.mediaType },
    });
  };

  return (
    <div className="main-container">
      {/* Background Decorations */}
      <div className="bg-decoration bg-decoration-1">
        <img alt="" src={imgVector3} />
      </div>
      <div className="bg-decoration bg-decoration-2">
        <img alt="" src={imgVector1} />
      </div>

      {/* Header */}
      <div className="header">
        <div className="logo-header">
          <div className="logo-header-inner">
            <img alt="Ribumi Logo" src={ribumi_logo} />
          </div>
        </div>
        <Nav className="nav-menu" />
        <div className="search-box" onClick={() => navigate("/search")} style={{ cursor: "pointer" }}>
          <p className="search-placeholder">제목, 장르, 지은이 검색</p>
          <div className="search-icon">
            <div className="search-icon-inner">
              <img alt="" src={imgGroup} />
            </div>
          </div>
        </div>
      </div>

      {/* Description Text */}
      <div className="description-text">
        <p>Ribumi는 리뷰(Review)와 미디어(Media)를 결합한 단어로,</p>
        <p>해당 콘텐츠의 원작 도서 또는 각색된 콘텐츠 정보를 함께 제공하고,</p>
        <p>책과 미디어 및 공연 콘텐츠에 대한 감상 기록과 리뷰를 남길 수 있는 웹 플랫폼입니다.</p>
      </div>

      {/* Logo Section */}
      <div className="logo-main-wrapper">
        <div className="logo-main">
          <img alt="" src={imgGroup1} />
        </div>
      </div>

      {/* Popular Works Section */}
      <div className="popular-works-section">
        {/* Title */}
        <div className="works-title-text">
          <div className="works-title-heading">
            <p>지금 가장 인기있는</p>
            <p>
              <span>원작 기반 </span>
              <span className="highlight">2차 창작물</span>
            </p>
          </div>
          <div className="works-title-subtitle">
            <p>원작 소설·만화를 기반으로 제작되어 대중들에게 큰 사랑을 받은 작품들입니다.</p>
          </div>
        </div>

        {/* Posters Grid */}
        {loading ? (
          <div className="works-loading">
            <div className="loading-spinner"></div>
            <p>인기 작품을 불러오는 중...</p>
          </div>
        ) : (
          <div className="works-poster-grid">
            {popularWorks.map((work, index) => (
              <div
                key={work.id}
                className={`poster-card poster-card--${index % 3 === 1 ? "tall" : "normal"}`}
                onClick={() => handleWorkClick(work)}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="poster-img-wrap">
                  <img src={work.thumbnail} alt={work.title} />
                  <div className="poster-overlay">
                    <span className="poster-type-badge">
                      {work.mediaType === "MOVIE" ? "🎬 영화" : "📺 드라마"}
                    </span>
                    <p className="poster-title">{work.title}</p>
                    <p className="poster-rating">⭐ {work.vote_average?.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}