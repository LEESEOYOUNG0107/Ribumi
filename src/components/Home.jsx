import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import WavesBackground from "./WaveBackground";
import ribumi_logo from "../imgs/ribumi_logo.svg";
import main_logo from "../imgs/logo.png";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

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
      // 소설(818)이나 만화(9715) 원작 키워드를 가진 인기 영화와 드라마를 가져오기
      const [movieRes, tvRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&sort_by=popularity.desc&with_original_language=ko&with_keywords=818|9715`),
        fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&language=ko-KR&sort_by=popularity.desc&with_original_language=ko&with_keywords=818|9715`),
      ]);

      const movieData = await movieRes.json();
      const tvData = await tvRes.json();

      const combined = [...(movieData.results || []), ...(tvData.results || [])]
        .filter((item) => item.poster_path) // 포스터가 있는 작품만
        .sort((a,b) => b.popularity - a.popularity) // 인기순으로 내림차순 정렬
        .slice(0, 6) // 상위 6개 작품만

      const results = combined.map((item) => ({
        id: item.id,
        title: item.title || item.name,
        thumbnail: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        contents: item.overview,
        authors: ["원작 기반 콘텐츠"],
        mediaType: item.title ? "MOVIE" : "TV", // title 속성이 있으면 영화, 없으면 TV
        vote_average: item.vote_average,
      }));

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
      <WavesBackground />

      {/* Header */}
      <div className="header">
        <div className="logo-header">
          <div className="logo-header-inner">
            <img alt="Ribumi Logo" src={ribumi_logo} />
          </div>
        </div>
        <Nav className="nav-menu" />
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
          <img alt="Main Logo" src={main_logo} />
        </div>
      </div>

      {/* Popular Works Section */}
      <div className="popular-works-section">
        {/* 사진처럼 좌우로 나누기 위한 wrapper 추가 */}
        <div className="popular-works-container"> 
            
          {/* 왼쪽: 타이틀 & 설명 */}
          <div className="works-title-text">
            <div className="works-title-heading">
              <p>
                지금 가장 인기있는 <br/>
                원작 기반
                <span className="highlight"> 2차 창작물</span>
              </p>
            </div>
            <div className="works-title-subtitle">
              <p>
                2023년 - 2024년에 출시 및 개봉되었던 인기있는 작품들입니다. <br/>
                이 작품들은 원작을 기반으로 한 2차 창작물로 대중들에게 큰 인기를 얻었습니다.
              </p>
            </div>
          </div>

          {/* 오른쪽: 포스터 그리드 */}
          <div className="works-grid-wrapper">
            {loading ? (
              <div className="works-loading">
                <div className="loading-spinner"></div>
                  <p>불러오는 중...</p>
                </div>
            ) : (
              <div className="works-poster-grid">
                {popularWorks.map((work, index) => (
                  <div
                    key={work.id}
                    className={`poster-card card-type-${index % 4}`} // 타입을 4가지로 세분화
                    onClick={() => handleWorkClick(work)}
                  >
                    <div className="poster-img-wrap">
                      <img src={work.thumbnail} alt={work.title} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>    
      </div>
    </div>    
  );
}