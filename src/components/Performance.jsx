import { useEffect, useState, useRef } from "react";
import "./Main.css"; // 공통 스타일
import "./Book.css";
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
    <div className="platformCard" style={{ flexShrink: 0 }} onClick={goToDetail}>
      <div 
        className="cardImage" 
        style={{ backgroundImage: `url(${imgUrl})` }}
      ></div>
      <div className="cardMeta" style={{ marginTop: '10px' }}>
        <div className="cardTitleSection">
          <h4 className="cardTitle" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {perf.title}
          </h4>
        </div>
        <span className="cardGenre">{perf.genre} | {perf.place}</span>
      </div>    
      <div className="cardRatingGroup" style={{ marginTop: '4px' }}>
        <span className="cardYear" style={{ fontSize: '11px' }}>
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

  // 🌟 일반 공연 데이터 가져오기 (이 함수 하나로 모든 섹션을 처리합니다)
  const fetchKopisData = async (stdate, eddate, shcate = "", cpage = 1, rows = 15) => {
    const categoryParam = shcate ? `&shcate=${shcate}` : "";
    // 프록시 설정에 맞춘 정확한 URL (/kopis)
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

 const fetchBoxOffice = async () => {
  const url = `/kopis/openApi/restful/boxoffice?service=${KOPIS_KEY}&ststype=month&shcate=&stdate=20260216&eddate=20260316`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const boxofNodes = xmlDoc.querySelectorAll("boxof");  // ✅ boxof
    
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
      const todayStr = formatString(today);
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = formatString(nextMonth);

      // 1. 상영중인 최신 공연 (기간: 오늘~다음달, 장르: 전체)
      fetchKopisData(todayStr, nextMonthStr, "", 1, 15).then(res => setNewPerfs(res));
      
      // 2. 주목할 만한 인기 공연
      fetchBoxOffice().then(res => setPopularPerfs(res));
      
      // 3. 무한 스크롤 배너 (기간: 오늘~다음달, 장르: 뮤지컬(GGGA), 20개 넉넉히)
      fetchKopisData(todayStr, nextMonthStr, "", 1, 20).then(res => {
        if (res && res.length > 0) setBannerPerfs(res);
        setLoading(false); // 마지막 배너 데이터까지 오면 로딩 끝
      });
    };

    loadPerformances();
  }, []);

  const handleScrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  const handleScrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="frame mainWrapper">
      <Nav/>

      {/* 배너 섹션 */}
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
            <section className="scrollSection" style={{ marginTop: '50px' }}>
              <h3 className="sectionTitle">이번 주 예매 TOP 공연</h3>
              <div className="sliderWrapper">
                <button className="sliderBtn leftBtn" onClick={() => handleScrollLeft(scrollRef2)}> &lt; </button>
                <div className="platformScroll" ref={scrollRef2}>
                  {popularPerfs.map((perf, idx) => ( <PerformanceCard key={perf.id || idx} perf={perf} /> ))}
                </div>
                <button className="sliderBtn rightBtn" onClick={() => handleScrollRight(scrollRef2)}> &gt; </button>
              </div>  
            </section>

            {/* 최신 공연 섹션 */}
            <section className="scrollSection">
              <h3 className="sectionTitle">상영중인 최신 공연</h3>
              <div className="sliderWrapper">
                <button className="sliderBtn leftBtn" onClick={() => handleScrollLeft(scrollRef1)}> &lt; </button>
                <div className="platformScroll" ref={scrollRef1}>
                  {newPerfs.map((perf, idx) => ( <PerformanceCard key={perf.id || idx} perf={perf}/> ))}
                </div>
                <button className="sliderBtn rightBtn" onClick={() => handleScrollRight(scrollRef1)}> &gt; </button>
              </div>  
            </section>
          </>  
      )}  
      <Footer />
    </div>  
  );
}