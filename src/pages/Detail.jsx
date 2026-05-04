import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "../components/Navi";
import Footer from "../components/Footer";
import DetailInfo from "../components/DetailInfo";
import ReviewSection from "../components/ReviewSection";
import ReviewModal from "../components/ReviewModal";
import "../pages/Detail.css";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;
const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

export default function Detail() {
  const { type, id } = useParams();

  const [details, setDetails] = useState(null);
  const [relatedWorks, setRelatedWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("review");

  const [allReviews, setAllReviews] = useState(() => JSON.parse(localStorage.getItem("myReviews") || "[]"));
  const [wishList, setWishList] = useState(() => JSON.parse(localStorage.getItem("wishList") || "[]"));

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);

  const currentUser = "나";
  const displayItems = details ? [details, ...relatedWorks] : [];
  const currentItem = displayItems[currentIndex];

  // --- 💡 장르 교차 검색 (크로스 미디어) 함수 업데이트 버전 ---
  const fetchMediaRelatedWorks = async (queryTitle, currentId, isExactMatch) => {
    let results = [];

    try {
      // 4개의 API를 동시에 호출해서 속도를 높입니다 (Promise.all 사용)
      const [tmdbRes, aladinRes, kopisRes] = await Promise.all([
        // 1. 영상 검색 (영화 & 드라마 통합)
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(queryTitle)}&language=ko-KR`),

        // 2. 도서 검색 (여기가 핵심! QueryType=Keyword 로 변경)
        fetch(`/aladin/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(queryTitle)}&QueryType=Keyword&MaxResults=5&start=1&SearchTarget=Book&output=js&Version=20131101`),

        // 3. 공연 검색
        fetch(`/kopis/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=20200101&eddate=20261231&cpage=1&rows=5&shprfnm=${encodeURIComponent(queryTitle)}`)
      ]);

      // --- [결과 처리: 영상] ---
      const tmdbData = await tmdbRes.json();
      if (tmdbData.results) {
        const tmdbItems = tmdbData.results
          .filter(r => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path)
          .map(r => ({
            id: String(r.id),
            _type: r.media_type,
            title: r.title || r.name,
            poster: `https://image.tmdb.org/t/p/w500${r.poster_path}`,
            genre: r.media_type === "movie" ? "연관 영화" : "연관 드라마",
            releaseDate: r.release_date || r.first_air_date || ""
          }));
        results = [...results, ...tmdbItems];
      }

      // --- [결과 처리: 도서] ---
      const aladinData = await aladinRes.json();
      if (aladinData.item) {
        const bookItems = aladinData.item.map(b => ({
          id: String(b.isbn13 || b.itemId),
          _type: "book",
          title: b.title,
          poster: b.cover?.replace("/coversum/", "/cover500/") || null,
          genre: "원작/연관 도서",
          releaseDate: b.pubDate || ""
        }));
        results = [...results, ...bookItems];
      }

      // --- [결과 처리: 공연] ---
      const text = await kopisRes.text();
      const xml = new DOMParser().parseFromString(text, "text/xml");
      const perfItems = Array.from(xml.querySelectorAll("db")).map(db => ({
        id: db.querySelector("mt20id")?.textContent,
        _type: "performance",
        title: db.querySelector("prfnm")?.textContent,
        poster: db.querySelector("poster")?.textContent?.replace("http://", "https://"),
        genre: "연관 공연",
        releaseDate: db.querySelector("prfpdfrom")?.textContent
      }));
      results = [...results, ...perfItems];

    } catch (error) {
      console.error("관련 작품 교차 검색 중 오류:", error);
    }

    // 자기 자신은 무조건 제외
    let finalResults = results.filter(item => String(item.id) !== String(currentId));

    // 아가씨처럼 흔한 제목일 때 엄격하게(exact) 필터링
    if (isExactMatch) {
      finalResults = finalResults.filter(item => item.title === queryTitle);
    }

    return finalResults; // 함수 끝!
  };

  const keywordMap = {
    "내일의 으뜸": { keyword: "선재 업고 튀어", exact: false },
    "유미의 세포들": { keyword: "유미의 세포들", exact: false },
    "핑거스미스": { keyword: "아가씨", exact: true },
    "무빙" : { keyword: "무빙", exact: true },
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        let mainItem = null;

        // 1. 메인 작품 상세 정보 가져오기
        if (type === "movie" || type === "tv") mainItem = await fetchTmdbDetail(id, type);
        else if (type === "book") mainItem = await fetchBookDetail(id);
        else if (type === "performance") mainItem = await fetchPerformanceDetail(id);

        if (mainItem) {
          setDetails(mainItem);

          const titleText = mainItem.title || mainItem.name || mainItem.prfnm || "";
          // 제목에서 부제나 특수기호를 날리고 핵심 단어만 검색하도록 정제 
          let cleanTitle = titleText.split(":")[0].split("-")[0].replace(/대본집|세트|양장본|포토에세이|특별판|[0-9]|권/g, "").trim();
          /* 이런 단어들이 포함되어 있으면 공백으로 바꾸고, 공백 지워버리기(trim()으로*/

          let isExactMatch = false;
          for (const [bookTitle, data] of Object.entries(keywordMap)) {
            if (cleanTitle.includes(bookTitle)) {
              cleanTitle = data.keyword;
              isExactMatch = data.exact;
              break;
            }
          } 
          
          const crossMediaWorks = await fetchMediaRelatedWorks(cleanTitle, id, isExactMatch);
          setRelatedWorks(crossMediaWorks);
        }  
      } catch (e) {
        console.error("데이터 로딩 실패", e);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
    setCurrentIndex(0);
  }, [id, type]);

  // --- 개별 상세 정보 Fetch 함수들 ---
  const fetchTmdbDetail = async (itemId, mediaType) => {
    const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${itemId}?api_key=${TMDB_KEY}&language=ko-KR`);
    const data = await res.json();
    return {
      id: String(itemId), _type: mediaType,
      title: data.title || data.name,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      genre: data.genres?.map(g => g.name).join(" · ") || "",
      releaseDate: data.release_date || data.first_air_date || "",
      overview: data.overview || "",
      rating: data.vote_average ? data.vote_average.toFixed(1) : "0.0",
      voteCount: data.vote_count?.toLocaleString() || "0",
    };
  };

  const fetchBookDetail = async (itemId) => {
    const res = await fetch(`/aladin/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_KEY}&itemIdType=ISBN13&ItemId=${itemId}&output=js&Version=20131101&OptResult=description`);
    const data = await res.json();
    const book = data.item?.[0];
    if (!book) return null;
    return {
      id: String(itemId), _type: "book",
      title: book.title,
      poster: book.cover?.replace("/coversum/", "/cover500/") || null,
      genre: book.categoryName?.split(">")[1] || "도서",
      releaseDate: book.pubDate || "",
      overview: book.description || book.fullDescription || "",
      rating: book.customerReviewRank ? book.customerReviewRank.toFixed(1) : "0.0",
      voteCount: "0"
    };
  };

  const fetchPerformanceDetail = async (itemId) => {
    const res = await fetch(`/kopis/openApi/restful/pblprfr/${itemId}?service=${KOPIS_KEY}`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const db = xml.querySelector("db");
    if (!db) return null;
    return {
      id: String(itemId), _type: "performance",
      title: db.querySelector("prfnm")?.textContent || "",
      poster: db.querySelector("poster")?.textContent?.replace("http://", "https://") || null,
      genre: db.querySelector("genrenm")?.textContent || "공연",
      releaseDate: db.querySelector("prfpdfrom")?.textContent || "",
      overview: db.querySelector("sty")?.textContent || "상세 정보 없음",
      rating: "0.0", voteCount: "0"
    };
  };

  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleNext = () => { if (currentIndex < displayItems.length - 1) setCurrentIndex(currentIndex + 1); };

  // --- 리뷰 액션 핸들러들 ---
  const updateReviews = (newReviews) => {
    setAllReviews(newReviews);
    localStorage.setItem("myReviews", JSON.stringify(newReviews));
  };

  const handleReviewSubmit = () => {
    if (!currentItem) return;
    const reviewItem = {
      id: Date.now(), targetId: currentItem.id, type: currentItem._type,
      title: currentItem.title, date: new Date().toLocaleDateString(),
      rating: newReviewRating, content: newReview, user: currentUser,
      likes: 0, comments: 0, replies: []
    };
    updateReviews([reviewItem, ...allReviews]);
    setIsReviewModalOpen(false);
    setNewReview("");
    setNewReviewRating(0);
  };

  const handleEditSave = (reviewId, newContent) => {
    if (!newContent.trim()) return alert("내용을 입력해주세요.");
    updateReviews(allReviews.map(r => r.id === reviewId ? { ...r, content: newContent } : r));
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("리뷰를 삭제하시겠습니까?")) {
      updateReviews(allReviews.filter(r => r.id !== reviewId));
    }
  };

  const handleReplySubmit = (reviewId, replyText) => {
    if (!replyText.trim()) return alert("답글 내용을 입력해주세요.");
    const newReply = { id: Date.now(), user: currentUser, text: replyText, date: new Date().toLocaleDateString() };
    updateReviews(allReviews.map(r => r.id === reviewId ? { ...r, comments: r.comments + 1, replies: [...(r.replies || []), newReply] } : r));
  };

  const handleLikeToggle = (reviewId) => {
    updateReviews(allReviews.map(r => r.id === reviewId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r));
  };

  const handleWishToggle = (item) => {
    const isWished = wishList.some(w => w.id === item.id);
    let updatedWishList;
    if (!isWished) {
      updatedWishList = [{ id: item.id, type: item._type, title: item.title, poster: item.poster }, ...wishList];
    } else {
      updatedWishList = wishList.filter(w => w.id !== item.id);
    }
    setWishList(updatedWishList);
    localStorage.setItem("wishList", JSON.stringify(updatedWishList));
  };

  if (loading) return <div className="detailWrapper"><Nav /><div className="detailLoading">불러오는 중...🍿</div></div>;
  if (!details) return <div className="detailWrapper"><Nav /><div className="detailLoading">작품 정보를 찾을 수 없습니다.</div></div>;

  const typeLabel = (t) => ({ movie: "영화", tv: "드라마", book: "도서", performance: "공연" }[t] || t);

  return (
    <div className="detailWrapper">
      <Nav />

      {/* 관련 작품 썸네일 가로 바 */}
      {displayItems.length > 1 && (
        <div className="relatedWorksBar" style={{ marginTop: "90px" }}>
          {displayItems.map((item, index) => (
            <div
              key={item.id + index}
              className={`relatedThumb ${currentIndex === index ? "active" : ""}`}
              onClick={() => { setCurrentIndex(index); setActiveTab("review"); }}
            >
              <img
                src={item.poster || "https://placehold.co/72x104?text=No"}
                alt={item.title}
              />
              <span className="relatedThumbLabel">{item.title}</span>
              <span className="relatedThumbType">{typeLabel(item._type)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="superSliderContainer">
        <button className="slideNavBtn left" onClick={handlePrev} disabled={currentIndex === 0}>❮</button>
        <button className="slideNavBtn right" onClick={handleNext} disabled={currentIndex === displayItems.length - 1}>❯</button>

        <div className="superSliderTrack" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {displayItems.map((item, index) => {
            const itemReviews = allReviews.filter(r => String(r.targetId) === String(item.id));
            const isItemWished = wishList.some(w => String(w.id) === String(item.id));

            return (
              <div key={item.id + index} className="superSlide">
                {/* 1. 분리된 정보 컴포넌트 */}
                <DetailInfo item={item} isWished={isItemWished} onWishToggle={handleWishToggle} />

                <div className="detailTabWrapper">
                  <button className={`detailTab ${activeTab === "review" ? "active" : ""}`} onClick={() => setActiveTab("review")}>감상하기</button>
                  <button className={`detailTab ${activeTab === "wish" ? "active" : ""}`} onClick={() => setActiveTab("wish")}>바라던 작품</button>
                </div>

                {/* 2. 분리된 리뷰 컴포넌트 */}
                {activeTab === "review" && (
                  <ReviewSection
                    itemReviews={itemReviews}
                    onOpenModal={() => setIsReviewModalOpen(true)}
                    onEditSave={handleEditSave}
                    onDelete={handleDeleteReview}
                    onReplySubmit={handleReplySubmit}
                    onLikeToggle={handleLikeToggle}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 분리된 모달 컴포넌트 */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => { setIsReviewModalOpen(false); setNewReview(""); setNewReviewRating(0); }}
        onSubmit={handleReviewSubmit}
        rating={newReviewRating}
        setRating={setNewReviewRating}
        content={newReview}
        setContent={setNewReview}
      />
      <Footer />
    </div>
  );
}