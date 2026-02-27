import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import ribumi_logo from "../imgs/ribumi_logo.svg";
import main_logo from "../imgs/logo.png";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

function Nav({ className }) {
  const navigate = useNavigate();
  
  return (
    <div className={className}>
      <div className="nav-item nav-active">홈</div>
      <div className="nav-item" onClick={() => navigate("/main")}>통합장르</div>
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
        .slice(0, 9) // 상위 6개 작품만

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
      <div className="main-background">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1920 822" fill="none" preserveAspectRatio="none">
          <g filter="url(#filter0_f_206_2168)">
            <path d="M354.763 248.695C165.545 266.812 -38 144.237 -38 144.237V742H1998L1998 157.731C1998 157.731 1760.35 441.92 1516.07 412.13C1290.8 384.659 1200.27 98.5914 969.388 81.2615C738.511 63.9315 543.982 230.578 354.763 248.695Z" fill="url(#paint0_linear_206_2168)" fillOpacity="0.82"/>
          </g>
          <defs>
            <filter id="filter0_f_206_2168" x="-118" y="0" width="2196" height="822" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur_206_2168"/>
            </filter>
            <linearGradient id="paint0_linear_206_2168" x1="973.056" y1="89.6251" x2="973.056" y2="741.999" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E2A78"/>
              <stop offset="1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
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
        <div className="popular-works-bg">
          <svg xmlns="http://www.w3.org/2000/svg" width="1619" height="1084" viewBox="0 0 1619 1084" fill="none">
              <g filter="url(#filter0_f_206_2166)">
                <path d="M271 87.8384C122.733 60.9599 -38 144.322 -38 144.322V1000.84H1536V479.517C1536 479.517 1489.77 277.273 1391.57 266.441C1293.36 255.608 1336.82 482.8 1226.62 519.522C1068.2 572.311 1076.27 227.889 924.208 210.856C772.146 193.822 732.237 426.039 580.767 404.14C389.623 376.505 419.267 114.717 271 87.8384Z" fill="url(#paint0_linear_206_2166)" fill-opacity="0.82"/>
                <path d="M271 87.8384C122.733 60.9599 -38 144.322 -38 144.322V1000.84H1536V479.517C1536 479.517 1489.77 277.273 1391.57 266.441C1293.36 255.608 1336.82 482.8 1226.62 519.522C1068.2 572.311 1076.27 227.889 924.208 210.856C772.146 193.822 732.237 426.039 580.767 404.14C389.623 376.505 419.267 114.717 271 87.8384Z" stroke="black"/>
              </g>
            <defs>
              <filter id="filter0_f_206_2166" x="-120.5" y="0" width="1739" height="1083.34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="41" result="effect1_foregroundBlur_206_2166"/>
              </filter>
              <linearGradient id="paint0_linear_206_2166" x1="749" y1="-24.1615" x2="749" y2="1000.84" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1E2A78"/>
                <stop offset="1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

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
                2023년 ~ 2024년에 출시 및 개봉되었던 인기있는 작품들입니다. <br/>
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
                    className={`poster-card card-type-${index % 9}`} // 타입을 9가지로 세분화
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
      <hr/>
      {/* footer */}
      <div className="footer-container">
        <img src={ribumi_logo} alt="Ribumi Logo" />
        <div className="footer-links">
          <a href="https://www.e-mirim.hs.kr/main.do">학교정보공개</a>|
          <a href="">작성자저작권정보</a>|
          <a href="">개인정보처리방침</a>
        </div>

        <div className="footer-contact">
          <span>개발자: 이서영 E-mail: s2446@e-mirim.hs.kr</span> | <span>디자이너: 김설애 E-mail: d2402@e-mirim.hs.kr</span>
        </div>
        
        <div className="footer-address">
          서울특별시 관악구 호암로 546 미림마이스터고등학교
        </div>
        
      </div>  
    </div>    
  );
}