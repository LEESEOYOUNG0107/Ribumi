import { useEffect, useState, useRef } from "react";
import "./Main.css";
import "./Book.css";
import Nav from "./Navi";
import Footer from "./Footer";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;

function BookCard({ book }) {
  if(!book) return null;
  let imgUrl = book.cover;
  if (imgUrl) {
    imgUrl = imgUrl.replace('/coversum/', '/cover500/');
  } else {
    imgUrl = "https://placehold.co/180x250?text=No+Image";
  }
  const year = book.pubDate ? book.pubDate.substring(0,4) : "";
  const authors = book.author ? book.author.split("(지은이)")[0].trim() : "작자 미상";

  // 나중에 상세페이지로 이동하기 위한 핸들러 틀
  const goToDetail = () => {
      console.log("이동할 도서 ISBN:", book.isbn13);
      // window.location.href = `/book/${book.isbn13}`;
  };
  
  return (
    <div className="platformCard" style={{ width: '180px', flexShrink: 0 }}>
      <div className="cardImage" style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="cardMeta">
        <div className="cardTitleSection">
          <h4 className="cardTitle">{book.title}</h4>
        </div>
        <span className="cardGenre" style={{ color: '#aaa', fontSize: '11px' }}>{authors}</span>
      </div>    
      <div className="cardRatingGroup">
        <span className="cardYear">{year}</span>
        <span style={{ color: '#fff', fontSize: '12px' }}>
          {book.priceSales ? `${book.priceSales.toLocaleString()}원` : "가격 미상"}
        </span>
      </div>
    </div>
  );
}

export default function Book() {
  const [newBooks, setNewBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [bannerBooks, setBannerBooks] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  // 검색 API
  const searchAladinBooks = async (keyword) => {
      const url = `/aladin/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(keyword)}&QueryType=Keyword&MaxResults=20&start=1&SearchTarget=Book&output=js&Version=20131101&Sort=Accuracy`;
      try {
          const response = await fetch(url);
          const data = await response.json();
          return data.item || [];
        } catch (error) {
          return [];
      }
  };

  const fetchAladinBooks = async (queryType) => {
    // output=js: JSON 응답, Version=20131101: 최신 데이터 형식
    const url = `/aladin/ttb/api/ItemList.aspx?ttbkey=${ALADIN_KEY}&QueryType=${queryType}&MaxResults=15&start=1&SearchTarget=Book&output=js&Version=20131101`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.item || []; // 알라딘은 'item' 배열에 데이터를 담아줌
    } catch (error) {
      console.error(`${queryType} 데이터를 불러오는데 실패했습니다.`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      // Promise.all을 쓰지 않고 개별적으로 호출하여 상태를 업데이트
      fetchAladinBooks("ItemNewSpecial").then(res => setNewBooks(res));
      fetchAladinBooks("Bestseller").then(res => setPopularBooks(res));
      searchAladinBooks("원작").then(res => {
        if (res && res.length > 0) setBannerBooks(res);
        setLoading(false); // 마지막 데이터가 오면 로딩 해제
      });
    };

    loadBooks();
  }, []);

  const currentBanner = bannerBooks[currentBannerIndex];
  // 배너 자동 전환 로직
  useEffect(() => {
    if (bannerBooks.length === 0) return;
    const timer = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev === bannerBooks.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerBooks]);

  // 가로 스크롤 함수
  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="frame mainWrapper">
      <Nav/>

      {/* Banner Section */}
      {!loading && currentBanner && (
        <section className="bookBannerSection">
    
          {/* 4개가 동시에 보이도록 하는 컨테이너 */}
          <div className="bannerTrackWrapper">
            <div className="bannerTrack">
              {[...bannerBooks, ...bannerBooks].map((book, idx) => (
                <div className="bannerItem" key={idx} onClick={() => console.log(book.isbn13)}>
                  <img 
                    src={book.cover.replace('/coversum/', '/cover500/')} 
                    alt={book.title} 
                    className="bannerPosterImage" 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {loading ? (
        <div className="loading">데이터를 불러오는 중입니다...🍿</div>
        ) : (
          <>
            <section className="scrollSection">
              <h3 className="sectionTitle">2026 최신작</h3>
              <div className="sliderWrapper">
                <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef1)}> &lt; </button>
                <div className="platformScroll" ref={scrollRef1} style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                  {newBooks.map((book, idx) => ( <BookCard key={book.isbn || idx} book={book}/> ))}
                </div>
                <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef1)}> &gt; </button>
              </div>  
            </section>

            {/* 2. 최근 인기 도서 섹션 */}
            <section className="scrollSection" style={{ marginTop: '50px' }}>
              <h3 className="sectionTitle">최근 인기 도서</h3>
              <div className="sliderWrapper">
                <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef2)}> &lt; </button>
                <div className="platformScroll" ref={scrollRef2} style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                  {popularBooks.map((book, idx) => ( <BookCard key={book.isbn || idx} book={book} /> ))}
                </div>
                <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef2)}> &gt; </button>
              </div>  
            </section>
          </>  
      )}  
      <Footer />
    </div>  
  );
}