import { useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "../components/Navi";
import Footer from "../components/Footer";
import DetailInfo from "../components/DetailInfo";
import ReviewSection from "../components/ReviewSection";
import ReviewModal from "../components/ReviewModal";
import useDetailData from "../hook/useDetailData";
import "../pages/Detail.css";
import write from "../imgs/write.svg";

export default function Detail() {
  const { type, id } = useParams();
  const { details, relatedWorks, loading } = useDetailData(type, id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("review");

  const [allReviews, setAllReviews] = useState(() =>
    JSON.parse(localStorage.getItem("myReviews") || "[]")
  );
  const [wishList, setWishList] = useState(() =>
    JSON.parse(localStorage.getItem("wishList") || "[]")
  );

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);

  const currentUser = "나";
  const displayItems = details ? [details, ...relatedWorks] : [];
  const currentItem = displayItems[currentIndex];

  // ── 리뷰 헬퍼 ───────────────────────────────────────────────────
  const updateReviews = (updated) => {
    setAllReviews(updated);
    localStorage.setItem("myReviews", JSON.stringify(updated));
  };

  const handleReviewSubmit = () => {
    if (!currentItem) return;
    updateReviews([
      {
        id: Date.now(), targetId: currentItem.id, type: currentItem._type,
        title: currentItem.title, date: new Date().toLocaleDateString(),
        rating: newReviewRating, content: newReview, user: currentUser,
        likes: 0, comments: 0, replies: [],
      },
      ...allReviews,
    ]);
    setIsReviewModalOpen(false);
    setNewReview("");
    setNewReviewRating(0);
  };

  const handleEditSave = (reviewId, newContent) => {
    if (!newContent.trim()) return alert("내용을 입력해주세요.");
    updateReviews(allReviews.map(r => r.id === reviewId ? { ...r, content: newContent } : r));
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("리뷰를 삭제하시겠습니까?"))
      updateReviews(allReviews.filter(r => r.id !== reviewId));
  };

  const handleReplySubmit = (reviewId, replyText) => {
    if (!replyText.trim()) return alert("답글 내용을 입력해주세요.");
    const newReply = { id: Date.now(), user: currentUser, text: replyText, date: new Date().toLocaleDateString() };
    updateReviews(allReviews.map(r =>
      r.id === reviewId ? { ...r, comments: r.comments + 1, replies: [...(r.replies || []), newReply] } : r
    ));
  };

  const handleLikeToggle = (reviewId) => {
    updateReviews(allReviews.map(r =>
      r.id === reviewId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r
    ));
  };

  const handleWishToggle = (item) => {
    const isWished = wishList.some(w => w.id === item.id);
    const updated = isWished
      ? wishList.filter(w => w.id !== item.id)
      : [{ id: item.id, type: item._type, title: item.title, poster: item.poster }, ...wishList];
    setWishList(updated);
    localStorage.setItem("wishList", JSON.stringify(updated));
  };

  // ── 로딩 / 에러 ─────────────────────────────────────────────────
  if (loading) return <div className="detailWrapper"><Nav /><div className="detailLoading">불러오는 중...🍿</div></div>;
  if (!details) return <div className="detailWrapper"><Nav /><div className="detailLoading">작품 정보를 찾을 수 없습니다.</div></div>;

  // ── 렌더 ─────────────────────────────────────────────────────────
  return (
    <div className="detailWrapper">
      <Nav />

      <div className="superSliderContainer">
        <button className="slideNavBtn left" onClick={() => setCurrentIndex(i => i - 1)} disabled={currentIndex === 0}>❮</button>
        <button className="slideNavBtn right" onClick={() => setCurrentIndex(i => i + 1)} disabled={currentIndex === displayItems.length - 1}>❯</button>

        <div className="superSliderTrack" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {displayItems.map((item, index) => {
            const itemReviews = allReviews.filter(r => String(r.targetId) === String(item.id));
            const isItemWished = wishList.some(w => String(w.id) === String(item.id));

            return (
              <div key={item.id + index} className="superSlide">
                <DetailInfo item={item} isWished={isItemWished} onWishToggle={handleWishToggle} displayItems={displayItems} currentIndex={currentIndex} onSelect={(idx) => { setCurrentIndex(idx); setActiveTab("review"); }} />

                <div className="detailTabWrapper">
                  <button className={`detailTab ${activeTab === "review" ? "active" : ""}`} onClick={() => setActiveTab("review")}>감상하기</button>
                </div>

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

      <button className="writeReviewBtn" onClick={() => setIsReviewModalOpen(true)}>
        <img src={write} alt="write" className="writeReviewIcon" /> 리뷰쓰기
      </button>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => { setIsReviewModalOpen(false); setNewReview(""); setNewReviewRating(0); }}
        onSubmit={handleReviewSubmit}
        rating={newReviewRating}
        setRating={setNewReviewRating}
        content={newReview}
        setContent={setNewReview}
        currentItem={currentItem}
      />
      <Footer />
    </div>
  );
}