import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "../components/Navi";
import Footer from "../components/Footer";
import DetailInfo from "../components/DetailInfo";
import ReviewSection from "../components/ReviewSection";
import ReviewModal from "../components/ReviewModal";
import useDetailData from "../hook/useDetailData";
import "../pages/Detail.css";
import write from "../imgs/write.svg";
import { supabase } from "../lib/supabase";

export default function Detail() {
  const userId = localStorage.getItem("userId");
  const { type, id } = useParams();
  const { details, relatedWorks, loading } = useDetailData(type, id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("review");

  const [allReviews, setAllReviews] = useState([]);
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase.from("reviews").select(`
    *,
    review_likes (
      user_id
    )
  `);

      if (!error) {
        const reviewsWithLikes = data.map((review) => ({
          ...review,
          likes: review.review_likes?.length || 0,
          isLiked: review.review_likes?.some((like) => like.user_id === userId),
        }));

        setAllReviews(reviewsWithLikes);
      }
    };
    fetchReviews();
  }, []);
  const [wishList, setWishList] = useState([]);
  useEffect(() => {
    const fetchWishlist = async () => {
      const { data, error } = await supabase.from("wishlist").select("*").eq("user_id", userId);
      if (!error) {
        setWishList(data || []);
      }
    };
    fetchWishlist();
  }, [userId]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);

  const currentUser = "나";
  const displayItems = details ? [details, ...relatedWorks] : [];
  const currentItem = displayItems[currentIndex];

  // ── 리뷰 헬퍼 ───────────────────────────────────────────────────
  const updateReviews = (updated) => {
    setAllReviews(updated);
  };

  const handleReviewSubmit = async () => {
    if (!currentItem) return;
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        title: currentItem.title,
        content: newReview,
        rating: newReviewRating,
        type: currentItem._type,
        date: new Date().toLocaleDateString(),
        user_id: userId,
        content_id: currentItem.id,
      })
      .select();
    if (error) {
      console.error(error);
      return;
    }
    setAllReviews([data[0], ...allReviews]);
    setIsReviewModalOpen(false);
    setNewReview("");
    setNewReviewRating(0);
  };

  const handleEditSave = (reviewId, newContent) => {
    if (!newContent.trim()) return alert("내용을 입력해주세요.");
    updateReviews(allReviews.map((r) => (r.id === reviewId ? { ...r, content: newContent } : r)));
  };

  const handleDeleteReview = async (reviewId) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) return;
    setAllReviews(allReviews.filter((r) => r.id !== reviewId));
  };

  const handleReplySubmit = (reviewId, replyText) => {
    if (!replyText.trim()) return alert("답글 내용을 입력해주세요.");
    const newReply = { id: Date.now(), user: currentUser, text: replyText, date: new Date().toLocaleDateString() };
    updateReviews(
      allReviews.map((r) =>
        r.id === reviewId ? { ...r, comments: r.comments + 1, replies: [...(r.replies || []), newReply] } : r,
      ),
    );
  };

  const handleLikeToggle = async (reviewId) => {
    // 내가 이미 좋아요 눌렀는지 확인
    const { data: existingLike } = await supabase
      .from("review_likes")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    // 이미 누른 경우 → 취소
    if (existingLike) {
      await supabase.from("review_likes").delete().eq("id", existingLike.id);

      setAllReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                likes: Math.max((r.likes || 0) - 1, 0),
                isLiked: false,
              }
            : r,
        ),
      );
    } else {
      // 안 누른 경우 → 추가
      await supabase.from("review_likes").insert({
        review_id: reviewId,
        user_id: userId,
      });

      setAllReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                likes: (r.likes || 0) + 1,
                isLiked: true,
              }
            : r,
        ),
      );
    }
  };

  const handleWishToggle = async (item) => {
    const isWished = wishList.some((w) => String(w.content_id) === String(item.id));

    if (isWished) {
      const { error } = await supabase.from("wishlist").delete().eq("user_id", userId).eq("content_id", item.id);

      if (error) {
        console.error(error);
        return;
      }
      setWishList(wishList.filter((w) => String(w.content_id) !== String(item.id)));
    } else {
      console.log("저장 genre:", item.genre);
      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          user_id: userId,
          content_id: item.id,
          title: item.title,
          poster: item.poster,
          type: item._type,

          genre: item.genre || null,
          rating: item.rating ? parseFloat(item.rating) : null,
          year: item.releaseDate ? item.releaseDate.substring(0, 4) : null,
        })
        .select();
      console.log("insert error:", error);
      if (error) {
        console.error(error);
        return;
      }
      setWishList([data[0], ...wishList]);
    }
  };

  if (loading)
    return (
      <div className="detailWrapper">
        <Nav />
        <div className="detailLoading">불러오는 중...🍿</div>
      </div>
    );
  if (!details)
    return (
      <div className="detailWrapper">
        <Nav />
        <div className="detailLoading">작품 정보를 찾을 수 없습니다.</div>
      </div>
    );

  return (
    <div className="detailWrapper">
      <Nav />

      <div className="superSliderContainer">
        <button
          className="slideNavBtn left"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
        >
          ❮
        </button>
        <button
          className="slideNavBtn right"
          onClick={() => setCurrentIndex((i) => i + 1)}
          disabled={currentIndex === displayItems.length - 1}
        >
          ❯
        </button>

        <div className="superSliderTrack" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {displayItems.map((item, index) => {
            const itemReviews = allReviews.filter((r) => String(r.content_id) === String(item.id));
            const isItemWished = wishList.some((w) => String(w.content_id) === String(item.id));

            return (
              <div key={item.id + index} className="superSlide">
                <DetailInfo
                  item={item}
                  isWished={isItemWished}
                  onWishToggle={handleWishToggle}
                  displayItems={displayItems}
                  currentIndex={currentIndex}
                  onSelect={(idx) => {
                    setCurrentIndex(idx);
                    setActiveTab("review");
                  }}
                />

                <div className="detailTabWrapper">
                  <button
                    className={`detailTab ${activeTab === "review" ? "active" : ""}`}
                    onClick={() => setActiveTab("review")}
                  >
                    리뷰보기
                  </button>
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
        onClose={() => {
          setIsReviewModalOpen(false);
          setNewReview("");
          setNewReviewRating(0);
        }}
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
