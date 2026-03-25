import { useEffect, useState, useRef } from "react";
import "./Main.css"; 
import "./Book.css";
import "./Performance.css";
import Nav from "./Navi";
import Footer from "./Footer";

const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

function PerformanceCard({ item }) {
  if (!item) return null;
  const imgUrl = item.poster || "https://placehold.co/180x250?text=No+Image";

  const goToDetail = () => {
    console.log("이동할 공연 ID:", item.id);
  };

  return (
    <div className="platformCard" onClick={goToDetail}>
      <div 
        className="cardImage" 
        style={{ backgroundImage: `url(${imgUrl})` }}
      ></div>
      <div className="cardMeta">
        <div className="cardTitleSection">
          <h4 className="cardTitle">{item.title}</h4> 
        </div>
        <div 
          className="cardGenre"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}
        >
          {item.genre} {item.place ? `| ${item.place}` : ''}
        </div>
        <span className="heart">♡</span>
      </div>    
    </div>
  );
}

export default function PerformancePage() { 
  const [newPerfs, setNewPerfs] = useState([]);
  const [popularPerfs, setPopularPerfs] = useState([]);
  const [bannerPerfs, setBannerPerfs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

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

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="frame mainWrapper">
      <Nav/>

      {!loading && bannerPerfs.length > 0 && (
        <section className="BannerSection">
          <div className="bannerTrackWrapper">
            <div className="bannerTrack">
              {[...bannerPerfs, ...bannerPerfs].map((item, idx) => (
                <div className="bannerItem" key={idx} onClick={() => console.log(item.id)}>
                  <img 
                    src={item.poster} 
                    alt={item.title} 
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
          <section className="scrollSection">
            <h3 className="sectionTitle">이번 주 예매 TOP 공연</h3>
            <div className="sliderWrapper">
              <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef2)}> &lt; </button>
              <div className="platformScroll" ref={scrollRef2}>
                {popularPerfs.map((item, idx) => ( <PerformanceCard key={item.id || idx} item={item} /> ))}
              </div>
              <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef2)}> &gt; </button>
            </div>  
          </section>

          <section className="scrollSection" style={{ marginTop: '50px' }}>
            <h3 className="sectionTitle">상영중인 최신 공연</h3>
            <div className="sliderWrapper">
              <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef1)}> &lt; </button>
              <div className="platformScroll" ref={scrollRef1}>
                {newPerfs.map((item, idx) => ( <PerformanceCard key={item.id || idx} item={item}/> ))}
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