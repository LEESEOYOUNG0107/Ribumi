import { useEffect, useState, useRef } from "react";
import "./Main.css"; 
import "./Book.css";
import "./Performance.css";
import Nav from "./Navi";
import Footer from "./Footer";

const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

// ─── 개별 공연 카드 컴포넌트 ───
function PerformanceCard({ perf }) {
  if (!perf) return null;
  const imgUrl = perf.poster || "https://placehold.co/180x250?text=No+Image";

  const goToDetail = () => {
    console.log("이동할 공연 ID:", perf.id);
    // window.location.href = `/performance/${perf.id}`;
  };

  return (
    // Main.css의 platformCard 속성을 그대로 사용하여 규격 통일
    <div className="platformCard" onClick={goToDetail}>
      <div 
        className="cardImage" 
        style={{ backgroundImage: `url(${imgUrl})` }}
      ></div>
      
      <div className="cardMeta">
        <div className="cardTitleSection">
          {/* 🌟 2. 제목이 너무 길면 한 줄로 고정하고 '...' 처리 */}
          <h4 className="cardTitle"> {perf.title} </h4>
        </div>
        
        {/* 장르와 장소도 길어질 경우를 대비해 '...' 처리 */}
        <span 
          className="cardGenre"
          style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            width: '100%',
            display: 'block' 
          }}
        >
          {perf.genre} {perf.place ? `| ${perf.place}` : ''}
        </span>
      </div>    
      
      <div className="cardRatingGroup">
        <span className="cardYear">
          {perf.startDate} ~ {perf.endDate}
        </span>
      </div>
    </div>
  );
}

// ─── 메인 공연 페이지 컴포넌트 ───
export default function PerformancePage() { 
  const [newPerfs, setNewPerfs] = useState([]);
  const [popularPerfs, setPopularPerfs] = useState([]);
  const [bannerPerfs, setBannerPerfs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  // KOPIS 일반 공연 데이터
  const fetchKopisData = async (stdate, eddate, shcate = "", cpage = 1, rows = 15) => {
    const categoryParam = shcate ? `&shcate=${shcate}` : "";
    const url = `/kopis/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=${stdate}&eddate=${eddate}&cpage=${cpage}&rows=${rows}${categoryParam}`;
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const dbNodes = xmlDoc.querySelectorAll("db");
      
      return Array.from(dbNodes).map(node => ({
        id: node.querySelector("mt20id")?.textContent,
        title: node.querySelector("prfnm")?.textContent,
        poster: node.querySelector("poster")?.textContent,
        genre: node.querySelector("genrenm")?.textContent,
        startDate: node.querySelector("prfpdfrom")?.textContent,
        endDate: node.querySelector("prfpdto")?.textContent,
        place: node.querySelector("fcltynm")?.textContent,
      }));
    } catch (error) {
      console.error("KOPIS 일반 데이터 실패", error);
      return [];
    }
  };

  // KOPIS 박스오피스 데이터
  const fetchBoxOffice = async () => {
    const url = `/kopis/openApi/restful/boxoffice?service=${KOPIS_KEY}&ststype=month&shcate=&stdate=20260216&eddate=20260316`;
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const boxofNodes = xmlDoc.querySelectorAll("boxof");  
      
      return Array.from(boxofNodes).map(node => ({
        id: node.querySelector("mt20id")?.textContent,
        title: node.querySelector("prfnm")?.textContent,
        poster: node.querySelector("poster")?.textContent?.replace("http://", "https://"),
        genre: node.querySelector("cate")?.textContent,
        rank: node.querySelector("rnum")?.textContent,
        place: node.querySelector("prfplcnm")?.textContent,
      }));
    } catch (error) {
      console.error("박스오피스 데이터 실패", error);
      return [];
    }
  };

  useEffect(() => {
    const loadPerformances = async () => {
      setLoading(true);
      
      const formatString = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const todayStr = formatString(today);
      const nextMonthStr = formatString(nextMonth);

      fetchKopisData(todayStr, nextMonthStr, "", 1, 15).then(res => setNewPerfs(res));
      fetchBoxOffice().then(res => setPopularPerfs(res));
      fetchKopisData(todayStr, nextMonthStr, "", 1, 20).then(res => {
        if (res && res.length > 0) setBannerPerfs(res);
        setLoading(false);
      });
    };

    loadPerformances();
  }, []);

  // 가로 스크롤 공통 함수 (Main.jsx와 동일한 로직)
  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="frame mainWrapper">
      <Nav/>

      {/* 배너 섹션 (Book.css의 스타일 재활용) */}
      {!loading && bannerPerfs.length > 0 && (
        <section className="BannerSection">
          <div className="bannerTrackWrapper">
            <div className="bannerTrack">
              {[...bannerPerfs, ...bannerPerfs].map((perf, idx) => (
                <div className="bannerItem" key={idx} onClick={() => console.log(perf.id)}>
                  <img 
                    src={perf.poster} 
                    alt={perf.title} 
                    className="bannerPosterImage" 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {loading ? (
        <div className="loading">공연 데이터를 불러오는 중입니다...🎫</div>
      ) : (
          <>
            {/* 인기 뮤지컬 섹션 */}
            <section className="scrollSection">
              <h3 className="sectionTitle">이번 주 예매 TOP 공연</h3>
              <div className="sliderWrapper">
                <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef2)}> &lt; </button>
                <div className="platformScroll" ref={scrollRef2}>
                  {popularPerfs.map((perf, idx) => ( <PerformanceCard key={perf.id || idx} perf={perf} /> ))}
                </div>
                <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef2)}> &gt; </button>
              </div>  
            </section>

            {/* 최신 공연 섹션 */}
            <section className="scrollSection" style={{ marginTop: '50px' }}>
              <h3 className="sectionTitle">상영중인 최신 공연</h3>
              <div className="sliderWrapper">
                <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef1)}> &lt; </button>
                <div className="platformScroll" ref={scrollRef1}>
                  {newPerfs.map((perf, idx) => ( <PerformanceCard key={perf.id || idx} perf={perf}/> ))}
                </div>
                <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef1)}> &gt; </button>
              </div>  
            </section>
          </>  
      )}  
      <Footer />
    </div>  
  );
}