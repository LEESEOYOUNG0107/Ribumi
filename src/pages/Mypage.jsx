import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Navi";
import Footer from "../components/Footer";
import "./Mypage.css";
import profileImg from "../imgs/profile.png";

// const DUMMY_REVIEWS = [
//   {
//     id: 1, type: "book", title: "채식주의자", date: "2026.02.25", rating: 4,
//     content: "역시 원작소설이네요. 재밌게 잘 봤습니다. 역시 원작소설이네요. 재밌게 잘 봤습니다. 역시 원작소설이네요. 재밌게 잘 봤습니다.",
//   },
//   {
//     id: 2, type: "movie", title: "전지적 독자 시점", date: "2026.02.25", rating: 4,
//     content: "역시 원작소설이네요. 재밌게 잘 봤습니다. 역시 원작소설이네요. 재밌게 잘 봤습니다.",
//   },
// ];

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ color: "#FFD700", fontSize: size }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

export default function MyPage() {
  const navigate = useNavigate();
  const [reviewTab, setReviewTab] = useState("book");
  
  // 1. 초기값 설정: 로컬 스토리지에서 꺼내오기
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("myReviews");
    // 저장된 게 있으면 그걸 쓰고, 없으면 더미데이터를 기본값으로 보여줍니다.
    return saved ? JSON.parse(saved) : "작성한 리뷰가 없습니다.";
  });// "book" | "media"

  const filteredReviews = reviewTab === "book"
    ? reviews.filter(r => r.type === "book")
    : reviews.filter(r => r.type !== "book");

  // 2. 삭제 기능 동기화
  const handleDeleteReview = (id) => {
    if (window.confirm("리뷰를 삭제하시겠습니까?")) {
      const updatedReviews = reviews.filter(r => String(r.id) !== String(id));
      setReviews(updatedReviews);
      localStorage.setItem("myReviews", JSON.stringify(updatedReviews)); // 💡 삭제 후 로컬스토리지도 업데이트!
    }
  };

  const [wished, setWished] = useState(() => {
    const savedWished = localStorage.getItem("wishList");
    return savedWished ? JSON.parse(savedWished) : [];
  });

  const handleRemoveWish = (id) => { // 👈 여기는 id로 받고 있습니다.
    const updatedWishes = wished.filter(item => String(item.id) !== String(id));
      // 화면 업데이트
      setWished(updatedWishes);
      // 로컬 스토리지도 같이 업데이트(동기화)
      localStorage.setItem("wishList", JSON.stringify(updatedWishes));
  };

  return (
    <div className="mypageWrapper">
      <Nav />

      <div className="mypageContainer">

        {/* ── 프로필 ── */}
        <div className="mypageProfile">
          <div className="mypageAvatar">
            <div className="avatarCircle"><img src={profileImg} alt="profile" /></div>
            <span className="mypageUsername">홍길동님</span>
          </div>
          <div className="mypageStats">
            <div className="statItem">
              <span className="statLabel">찜</span>
              <span className="statNum">{wished.length}</span>
            </div>
            <div className="statItem">
              <span className="statLabel">리뷰</span>
              <span className="statNum">{reviews.length}</span>
            </div>
          </div>
        </div>

        {/* ── 찜한 작품 ──  더미데이터 사용중이라 데이터 정확하게 안 나옴*/}
        <section className="mypageSection">
          <h3 className="mypageSectionTitle">찜한 작품</h3>
          {wished.length === 0 ? (
            <p className="mypageEmpty">찜한 작품이 없습니다.</p>
          ) : (
            <div className="wishedGrid">
              {wished.map(item => (
                <div key={item.id} className="wishedCard" onClick={() => navigate(`/detail/${item.type}/${item.id}`)}>
                  <div
                    className="wishedPoster"
                    style={{ backgroundImage: item.poster ? `url(${item.poster})` : "none" }}
                  >
                    {!item.poster && <span className="wishedNoImg">No Image</span>}
                    <button
                      className="wishedRemoveBtn"
                      onClick={(e) => { e.stopPropagation(); handleRemoveWish(item.id); }}
                    >♥</button>
                  </div>
                  <div className="wishedMeta">
                    <span className="wishedTitle">{item.title}</span>
                    <span className="wishedInfo">{item.year} · ⭐{item.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 내가 쓴 리뷰 ── */}
        <section className="mypageSection">
          <h3 className="mypageSectionTitle">내가 쓴 리뷰 보기</h3>

          {/* 탭 */}
          <div className="reviewTabRow">
            <button
              className={`reviewTabBtn ${reviewTab === "book" ? "active" : ""}`}
              onClick={() => setReviewTab("book")}
            >도서</button>
            <button
              className={`reviewTabBtn ${reviewTab === "media" ? "active" : ""}`}
              onClick={() => setReviewTab("media")}
            >미디어 및 공연</button>
          </div>

          {filteredReviews.length === 0 ? (
            <p className="mypageEmpty">작성한 리뷰가 없습니다.</p>
          ) : (
            filteredReviews.map(review => (
              <div key={review.id} className="mypageReviewCard">
                <div className="mypageReviewHeader">
                  <div className="mypageReviewLeft">
                    <span className="mypageReviewType">{review.type === "book" ? "도서" : review.type === "movie" ? "영화" : "드라마"}</span>
                    <span className="mypageReviewTitle">{review.title}</span>
                    <span className="mypageReviewDate">{review.date}</span>
                  </div>
                  <div className="mypageReviewRight">
                    <StarRating rating={review.rating} />
                    <span className="mypageReviewRatingNum"> / {review.rating * 2}.0점</span>
                  </div>
                </div>
                <p className="mypageReviewContent">{review.content}</p>
                <div className="mypageReviewFooter">
                  <button className="mypageReviewBtn">수정하기</button>
                  <button className="mypageReviewBtn delete" onClick={() => handleDeleteReview(review.id)}>삭제하기</button>
                </div>
              </div>
            ))
          )}
        </section>

      </div>

      <Footer />
    </div>
  );
}