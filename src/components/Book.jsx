import { useEffect, useState, useRef } from "react";
import "./Book.css";
import Nav from "./Navi";
import Footer from "./Footer";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;

function BookCard({ item }) {
  if(!item) return null;
  let imgUrl = item.cover;
  if (imgUrl) {
    imgUrl = imgUrl.replace('/coversum/', '/cover500/');
  } else {
    imgUrl = "https://placehold.co/180x250?text=No+Image";
  }
  const year = item.pubDate ? item.pubDate.substring(0,4) : "";
  const authors = item.author ? item.author.split("(지은이)")[0].trim() : "작자 미상";

  const goToDetail = () => {
      console.log("이동할 도서 ISBN:", item.isbn13);
  };
  
  return (
    <div className="platformCard" style={{ width: '180px', flexShrink: 0 }}>
      <div className="cardImage" style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="cardMeta">
        <span className="cardTitle">{item.title}</span>
        <div className="authGenre">
          <span className="cardGenre">{authors}</span>
          <span className="cardGenre">{item.categoryName ? item.categoryName.split('>').pop() : ""}</span>
        </div>
      </div>    
      <div className="cardRatingGroup">
        <span className="cardYear">{year}</span>
        <div className="cardRating">
          <span className="heart">♡</span>
          <span className="ratingScore">⭐{item.customerReviewRank ? (item.customerReviewRank / 2).toFixed(1) : "0.0"}</span>
        </div>
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
    const url = `/aladin/ttb/api/ItemList.aspx?ttbkey=${ALADIN_KEY}&QueryType=${queryType}&MaxResults=15&start=1&SearchTarget=Book&output=js&Version=20131101`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.item || [];
    } catch (error) {
      console.error(`${queryType} 데이터를 불러오는데 실패했습니다.`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      fetchAladinBooks("ItemNewSpecial").then(res => setNewBooks(res));
      fetchAladinBooks("Bestseller").then(res => setPopularBooks(res));
      searchAladinBooks("원작").then(res => {
        if (res && res.length > 0) setBannerBooks(res);
        setLoading(false);
      });
    };
    loadBooks();
  }, []);

  const currentBanner = bannerBooks[currentBannerIndex];
  useEffect(() => {
    if (bannerBooks.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev === bannerBooks.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerBooks]);

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth, behavior: "smooth" });
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="frame mainWrapper">
      <Nav/>

      {!loading && currentBanner && (
        <section className="BannerSection">
          <div className="bannerTrackWrapper">
            <div className="bannerTrack">
              {[...bannerBooks, ...bannerBooks].map((item, idx) => (
                <div className="bannerItem" key={idx} onClick={() => console.log(item.isbn13)}>
                  <img 
                    src={item.cover.replace('/coversum/', '/cover500/')} 
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
        <div className="loading">데이터를 불러오는 중입니다...🍿</div>
      ) : (
        <>
          <section className="scrollSection">
            <h3 className="sectionTitle">2026 최신작</h3>
            <div className="sliderWrapper">
              <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef1)}> &lt; </button>
              <div className="platformScroll" ref={scrollRef1} style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                {newBooks.map((item, idx) => ( <BookCard key={item.isbn || idx} item={item}/> ))}
              </div>
              <button className="sliderBtn rightBtn" onClick={() => scrollRight(scrollRef1)}> &gt; </button>
            </div>  
          </section>

          <section className="scrollSection" style={{ marginTop: '50px' }}>
            <h3 className="sectionTitle">최근 인기 도서</h3>
            <div className="sliderWrapper">
              <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef2)}> &lt; </button>
              <div className="platformScroll" ref={scrollRef2} style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                {popularBooks.map((item, idx) => ( <BookCard key={item.isbn || idx} item={item} /> ))}
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