import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

  // --- Detail.jsx 데이터 불러오기 로직 교체 ---

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
          
          // 2. 가져온 메인 작품의 '제목'을 이용해 타 장르 교차 검색 실행
          // 제목에서 부제나 특수기호를 날리고 핵심 단어만 검색하도록 정제 (정확도 향상)
          const cleanTitle = mainItem.title.split(":")[0].split("-")[0].trim();
          const crossMediaWorks = await fetchCrossMediaRelatedWorks(cleanTitle, type);
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

  // --- 💡 장르 교차 검색 (크로스 미디어) 함수 ---
  const fetchCrossMediaRelatedWorks = async (queryTitle, currentType) => {
    let results = [];

    try {
      // 1. 현재 타입이 영상이 아니면 -> TMDB 영상 검색
      if (currentType !== "movie" && currentType !== "tv") {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(queryTitle)}&language=ko-KR`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.results) {
          const tmdbItems = tmdbData.results
            .filter(r => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path)
            .slice(0, 2) // 최대 2개만 가져오기
            .map(r => ({
              id: String(r.id), _type: r.media_type,
              title: r.title || r.name,
              poster: `https://image.tmdb.org/t/p/w500${r.poster_path}`,
              genre: "관련 영상물", // 라벨링
              releaseDate: r.release_date || r.first_air_date || "",
              overview: r.overview || "상세 정보 없음",
              rating: r.vote_average ? r.vote_average.toFixed(1) : "0.0",
              voteCount: "0"
            }));
          results = [...results, ...tmdbItems];
        }
      }

      // 2. 현재 타입이 도서가 아니면 -> 알라딘 도서 검색 (ItemSearch API 사용)
      if (currentType !== "book") {
        const aladinRes = await fetch(`/aladin/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(queryTitle)}&QueryType=Title&MaxResults=2&start=1&SearchTarget=Book&output=js&Version=20131101`);
        const aladinData = await aladinRes.json();
        if (aladinData.item) {
          const bookItems = aladinData.item.map(b => ({
            id: String(b.isbn13 || b.itemId), _type: "book",
            title: b.title,
            poster: b.cover?.replace("/coversum/", "/cover500/") || null,
            genre: "원작/관련 도서", // 라벨링
            releaseDate: b.pubDate || "",
            overview: b.description || "상세 정보 없음",
            rating: "0.0", voteCount: "0"
          }));
          results = [...results, ...bookItems];
        }
      }

      // 3. 현재 타입이 공연이 아니면 -> KOPIS 공연 검색
      if (currentType !== "performance") {
        // KOPIS는 검색 기간이 필요하므로 넉넉하게 세팅
        const stdate = "20000101";
        const eddate = "20251231";
        const kopisRes = await fetch(`/kopis/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=${stdate}&eddate=${eddate}&cpage=1&rows=2&shprfnm=${encodeURIComponent(queryTitle)}`);
        const text = await kopisRes.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        const dbs = Array.from(xml.querySelectorAll("db"));
        
        const perfItems = dbs.map(db => ({
          id: db.querySelector("mt20id")?.textContent, _type: "performance",
          title: db.querySelector("prfnm")?.textContent,
          poster: db.querySelector("poster")?.textContent?.replace("http://", "https://"),
          genre: "원작/관련 공연", // 라벨링
          releaseDate: db.querySelector("prfpdfrom")?.textContent,
          overview: "관련 공연 작품입니다.",
          rating: "0.0", voteCount: "0"
        }));
        results = [...results, ...perfItems];
      }

    } catch (error) {
      console.error("관련 작품 교차 검색 중 오류:", error);
    }

    return results; // 합쳐진 관련 작품 배열 반환
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
    alert("리뷰가 등록되었습니다!");
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
      alert("찜한 작품에 추가되었습니다.");
    } else {
      updatedWishList = wishList.filter(w => w.id !== item.id);
    }
    setWishList(updatedWishList);
    localStorage.setItem("wishList", JSON.stringify(updatedWishList));
  };

  if (loading) return <div className="detailWrapper"><Nav /><div className="detailLoading">불러오는 중...🍿</div></div>;
  if (!details) return <div className="detailWrapper"><Nav /><div className="detailLoading">작품 정보를 찾을 수 없습니다.</div></div>;

  return (
    <div className="detailWrapper">
      <Nav />
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