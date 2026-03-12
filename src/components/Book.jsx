import { useEffect, useState, useRef } from "react";
import "./Main.css";
import Nav from "./Navi";
import Footer from "./Footer";
import search_icon from "../imgs/search_icon.svg";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const KAKAO_KEY = import.meta.env.VITE_KAKAO_API_KEY;

function BookCard({ book }) {
    if(!book) return null;
    const imgUrl = book.thumbnail ? book.thumbnail : "https://via.placeholder.com/180x250?text=No+Image";
    const year = book.datetime ? book.datetime.substring(0,4) : "";
    const authors = book.authors && book.authors.length > 0 ? book.authors.join(", ") : "작자 미상";

  return (
    <div className="platformCard" style={{ width: '180px', flexShrink: 0 }}>
      <div className="cardImage" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="cardMeta">
        <div className="cardTitleSection">
          {/* 책 제목이 너무 길면 자르기 */}
          <h4 className="cardTitle">{book.title.length > 12 ? book.title.slice(0, 12) + "..." : book.title}</h4>
        </div>
        <span className="cardGenre" style={{ color: '#aaa', fontSize: '11px' }}>{authors}</span>
      </div>    
      <div className="cardRatingGroup">
        <span className="cardYear">{year}</span>
        <span style={{ color: '#fff', fontSize: '12px' }}>{book.price ? `${book.price.toLocaleString()}원` : "가격 미상"}</span>
      </div>
    </div>
  );
}

export default function Book() {
    const [newBooks, setNewBooks] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef1 = useRef(null);
    const scrollRef2 = useRef(null);

    const fetchKakaoBooks = async (query, sort = "accuracy") => {
    try {
      const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${query}&sort=${sort}&size=15`, {
        method: "GET",
        headers: {
          // 🌟 카카오 API는 헤더에 Authorization을 꼭 이렇게 넣어야 합니다!
          Authorization: `KakaoAK ${KAKAO_KEY}`
        }
      });
      const data = await response.json();
      return data.documents; // 카카오는 results 대신 documents 배열에 담아줍니다.
    } catch (error) {
      console.error("도서 데이터를 불러오는데 실패했습니다.", error);
      return [];
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try{
        const newReleases = await fetchKakaoBooks("소설", "latest"); // 1. 2025 최신작 
        setNewBooks(newReleases);

        const populars = await fetchKakaoBooks("베스트셀러", "accuracy"); // 2. 최근 인기 도서 (베스트셀러 키워드로 검색)
        setPopularBooks(populars);
      } finally{
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

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
        <div className="searchContainer">
            <img src={search_icon} className="search-icon" alt="검색"/>
            <input type="text" placeholder="  제목, 장르, 지은이 검색" className="search-box"/>
        </div>

        {/* Banner Section */}
        <div style={{ marginTop: '100px' }}></div> {/*베너!!! */}
      
      
    
      
        {loading ? (
            <div className="loading">데이터를 불러오는 중입니다...🍿</div>
        ) : (
            <>
                <section className="scrollSection">
                    <h3 className="sectionTitle">2025 최신작</h3>
                    <div className="sliderWrapper">
                        <button className="sliderBtn leftBtn" onClick={() => scrollLeft(scrollRef1)}> &lt; </button>
                        <div className="platformScroll" ref={scrollRef1} style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                            {newBooks.map((book, idx) => (
                                <BookCard key={book.isbn || idx} book={book} />
                            ))}
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
                        {popularBooks.map((book, idx) => (
                        <BookCard key={book.isbn || idx} book={book} />
                        ))}
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