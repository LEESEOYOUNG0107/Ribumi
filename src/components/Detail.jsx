import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "./Navi";
import Footer from "./Footer";
import "./Detail.css";
import likesImg from "../imgs/likes.svg";
import replyImg from "../imgs/reply.svg";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;
const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

const DUMMY_REVIEWS = [
  { id: 1, user: "김리뷰", date: "2026.02.25", rating: 4, content: "원작 소설을 정말 잘 살린 작품입니다. 나름 원작 팬으로서 스토리 전개가 마음에 들었고, 배우들의 연기도 훌륭했습니다. 특히 감정선이 잘 표현되어 있어서 중간중간 눈물이 났어요.", likes: 2, comments: 1 },
  { id: 2, user: "박감상", date: "2026.02.25", rating: 4, content: "처음엔 기대 반 걱정 반으로 봤습니다. 사실 원작보다 더 잘 만든 부분도 있어서 좋았습니다. 영상미가 특히 뛰어나고 OST도 훌륭했어요. 다만 원작의 일부 장면이 삭제되어 아쉬움이 남습니다.", likes: 2, comments: 1 },
  { id: 3, user: "이별점", date: "2026.02.25", rating: 3, content: "전반적으로 볼만한 작품입니다. 원작을 읽지 않아도 충분히 즐길 수 있는 구성이에요. 다만 중반부 전개가 다소 느리게 느껴져서 집중력이 흐트러지는 순간이 있었습니다.", likes: 2, comments: 1 },
];

const StarRating = ({ rating, size = 16 }) => (
  <span style={{ color: "#FFD700", fontSize: size }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

export default function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [relatedWorks, setRelatedWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("review");
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const [newReview, setNewReview] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const currentUser = "나";

  const handleReviewSubmit = () => {
    if (!newReview.trim()) return alert("내용을 입력해주세요.");
    setReviews([{
      id: Date.now(),
      user: currentUser,
      date: new Date().toLocaleDateString().replace(/\. $/, ""),
      rating: newReviewRating,  // ← 별점 반영
      content: newReview,
      likes: 0,
      comments: 0,
      isLiked: false,
    }, ...reviews]);
    setNewReview("");
    setNewReviewRating(0);      // ← 별점 초기화
    setIsReviewModalOpen(false);
  };

  const handleEditSave = (id) => {
    if (!editContent.trim()) return alert("내용을 입력해주세요.");
    setReviews(reviews.map(r => r.id === id ? { ...r, content: editContent } : r));
    setEditingReviewId(null);
  };

  const handleReplySubmit = (id) => {
    if (!replyText.trim()) return alert("답글 내용을 입력해주세요.");

    // 1. 방금 내가 쓴 답글 데이터를 하나의 객체로 만듭니다.
    const newReply = {
      id: Date.now(),
      user: currentUser, // "나"
      text: replyText,   // 내가 입력한 텍스트
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).replace(/\. /g, '.').replace(/\.$/, '')
    };

    // 2. 답글 갯수(comments)를 1 올리고, replies 배열에 방금 쓴 내용을 추가합니다.
    setReviews(reviews.map(r =>
      r.id === id
        ? {
          ...r,
          comments: r.comments + 1,
          replies: [...(r.replies || []), newReply] // 👈 핵심: 기존 답글 뒤에 새 내용 붙이기
        }
        : r
    ));

    setReplyOpenId(null);
    setReplyText("");
  };

  const handleDeleteReview = (id) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const handleLikeToggle = (id) => { //댓글 좋아요 함수
    setReviews(reviews.map(r => {
      if (r.id !== id) return r;
      return { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 };
    }));
  };

  const handleWishToggle = async () => {
    setIsWished(!isWished);
    const currentWishList = JSON.parse(localStorage.getItem("wishList") || "[]");

    if (!isWished) {
      const isAlreadyExist = currentWishList.some(item => item.id === id);
      if (!isAlreadyExist) {
        const newWishItem = {
          id: id,
          type: type,
          title: details.title,
          poster: details.poster,
          year: details.year || "2024",
          rating: details.rating || 0
        };
        localStorage.setItem("wishList", JSON.stringify([newWishItem, ...currentWishList]));
        alert("찜한 작품에 추가되었습니다.");
      }
    } else {
      const updatedWishList = currentWishList.filter(item => item.id !== id);
      localStorage.setItem("wishList", JSON.stringify(updatedWishList));
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        if (type === "movie" || type === "tv") await fetchTmdbDetail();
        else if (type === "book") await fetchBookDetail();
        else if (type === "performance") await fetchPerformanceDetail();
      } catch (e) {
        console.error("상세 정보 로딩 실패", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, type]);

  const fetchTmdbDetail = async () => {
    const mediaType = type === "movie" ? "movie" : "tv";
    const [detailRes, creditRes, relatedRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${TMDB_KEY}&language=ko-KR`),
      fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${TMDB_KEY}&language=ko-KR`),
      fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/similar?api_key=${TMDB_KEY}&language=ko-KR`),
    ]);
    const detailData = await detailRes.json();
    const creditData = await creditRes.json();
    const relatedData = await relatedRes.json();

    const director = creditData.crew?.find(c => c.job === "Director")?.name || "";
    const cast = creditData.cast?.slice(0, 5).map(c => c.name).join(", ") || "";

    setDetails({
      _type: type,
      title: detailData.title || detailData.name,
      poster: detailData.poster_path ? `https://image.tmdb.org/t/p/w500${detailData.poster_path}` : null,
      backdrop: detailData.backdrop_path ? `https://image.tmdb.org/t/p/original${detailData.backdrop_path}` : null,
      genre: detailData.genres?.map(g => g.name).join(" · ") || "",
      releaseDate: detailData.release_date || detailData.first_air_date || "",
      overview: detailData.overview || "",
      rating: detailData.vote_average ? detailData.vote_average.toFixed(1) : "0.0",
      voteCount: detailData.vote_count?.toLocaleString() || "0",
      director,
      cast,
    });

    setRelatedWorks(
      relatedData.results?.filter(r => r.poster_path).slice(0, 4).map(r => ({
        id: r.id,
        title: r.title || r.name,
        poster: `https://image.tmdb.org/t/p/w300${r.poster_path}`,
        type: r.first_air_date ? "tv" : "movie",
        item: r,
      })) || []
    );
  };

  const fetchBookDetail = async () => {
    const res = await fetch(
      `/aladin/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_KEY}&itemIdType=ISBN13&ItemId=${id}&output=js&Version=20131101&OptResult=description`
    );
    const data = await res.json();
    const book = data.item?.[0];
    if (!book) return;

    const categoryArray = book.categoryName?.split(">") || [];
    const displayGenre = categoryArray.length > 1 ? categoryArray[2] : categoryArray[0] || "미분류";

    setDetails({
      _type: "book",
      title: book.title,
      poster: book.cover?.replace("/coversum/", "/cover500/") || null,
      backdrop: null,
      genre: displayGenre,
      releaseDate: `${book.pubDate || ""} 출간`,
      overview: book.description || book.fullDescription || "",
      rating: book.customerReviewRank ? book.customerReviewRank.toFixed(1) : "0.0",
      voteCount: "",
      extra: {
        author: `${book.author?.split("(지은이)")[0]?.trim() || ""} 지음`,
        translator: book.author?.includes("(옮긴이)") ? book.author.split("(옮긴이)")[0].split(",").pop()?.trim() : "",
        publisher: `출판사: ${book.publisher || ""}`,
        isbn: `ISBN: ${book.isbn13}`,
        price: book.priceSales ? `${book.priceSales.toLocaleString()}원` : "",
      }
    });
  };

  const fetchPerformanceDetail = async () => {
    const res = await fetch(`/kopis/openApi/restful/pblprfr/${id}?service=${KOPIS_KEY}`);
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const db = xml.querySelector("db");
    if (!db) return;

    const guidance = db.querySelector("dtguidance")?.textContent || "안내 정보 없음";
    const story = db.querySelector("sty")?.textContent || "줄거리 정보 없음";

    setDetails({
      _type: "performance",
      title: db.querySelector("prfnm")?.textContent || "",
      poster: db.querySelector("poster")?.textContent?.replace("http://", "https://") || null,
      backdrop: null,
      genre: db.querySelector("genrenm")?.textContent || "",
      releaseDate: db.querySelector("prfpdfrom")?.textContent || "",
      overview: `${guidance}\n\n${story}`,
      rating: "0.0",
      voteCount: "",
      extra: {
        place: db.querySelector("fcltynm")?.textContent || "",
        startDate: db.querySelector("prfpdfrom")?.textContent || "",
        endDate: db.querySelector("prfpdto")?.textContent || "",
        cast: db.querySelector("prfcast")?.textContent || "",
        runtime: db.querySelector("prfruntime")?.textContent || "",
        age: db.querySelector("prfage")?.textContent || "",
      }
    });
  };

  if (loading) return (
    <div className="detailWrapper">
      <Nav />
      <div className="detailLoading">불러오는 중...🍿</div>
    </div>
  );

  if (!details) return (
    <div className="detailWrapper">
      <Nav />
      <div className="detailLoading">작품 정보를 찾을 수 없습니다.</div>
    </div>
  );

  return (
    <div className="detailWrapper">
      <Nav />

      <div className="detailLayout">

        {/* 왼쪽: 기본 설명 */}
        <div className="detailInfo">
          <div className="detailTopMeta">

            {/* 영화, 드라마 */}
            {(details._type === "movie" || details._type === "tv") && (
              <>
                <div className="important">
                  {details.director && <span>{details.director}</span>}
                  {details.cast && <span>{details.cast}</span>}
                </div>
                <div>
                  {details.releaseDate && <span>{details.releaseDate.slice(0, 4)}년</span>}
                </div>
              </>
            )}

            {/* 도서 */}
            {details._type === "book" && (
              <>
                <div className="important">
                  {details.extra?.author && <span>{details.extra.author}</span>}
                  {details.extra?.translator && <span>{details.extra.translator} 옮김</span>}
                </div>
                <div className="detailExtraInfo">
                  {details.extra?.publisher && <div>{details.extra.publisher}</div>}
                  {details.releaseDate && <div>{details.releaseDate}</div>}
                  {details.extra?.price && <span>{details.extra.price}</span>}
                  {details.extra?.isbn && <span>{details.extra.isbn}</span>}
                </div>
              </>
            )}

            {/* 공연 */}
            {details._type === "performance" && (
              <>
                <div className="important">
                  {details.extra?.startDate && <span>{details.extra.startDate} ~ {details.extra.endDate}</span>}
                </div>
                <div className="detailExtraInfo">
                  {details.extra?.place && <div>{details.extra.place}</div>}
                </div>
                <div className="detailExtraInfo">
                  {details.extra?.runtime && <span>{details.extra.runtime}</span>}
                  {details.extra?.age && <span>{details.extra.age}</span>}
                </div>
                {details.extra?.cast && <div className="detailExtraInfo">{details.extra.cast}</div>}
              </>
            )}
          </div>

          {/* 줄거리 */}
          <div className="overviewContainer">
            <p className={`detailTopOverview ${isExpanded ? "expanded" : ""}`}>
              {details.overview || "상세 정보가 제공되지 않습니다."}
            </p>
            {details.overview && details.overview.length > 100 && (
              <button className="overviewMoreBtn" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? "닫기 ▴" : "더보기 ▾"}
              </button>
            )}
          </div>

          <div className="RatingBox">
            <span className="RatingNum">{details.rating}</span>
            <StarRating rating={parseFloat(details.rating) / 2} size={22} />
            <span className="sliderRatingCount">{details.voteCount}명</span>
          </div>
        </div>

        {/* 오른쪽: 장르 + 제목 + 포스터 */}
        <div className="detailRight">
          <div className="detailTopMeta">
            {details.genre && <span>{details.genre}</span>}
          </div>
          <h1 className="detailMainTitle">{details.title}</h1>

          <div className="detailSliderSection">
            <div className="detailSlider">
              <div className="sliderMain">
                <img src={details.poster || "https://placehold.co/220x330?text=No+Image"} alt={details.title} />
                <button className={`detailWishBtn ${isWished ? "wished" : ""}`} onClick={handleWishToggle}>
                  ♥
                </button>
                <div className="sliderDots">
                  {[0, 1, 2].map(i => <span key={i} className={`sliderDot ${i === 1 ? "active" : ""}`} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 탭 */}
      <div className="detailTabWrapper">
        <button className={`detailTab ${activeTab === "review" ? "active" : ""}`} onClick={() => setActiveTab("review")}>감상하기</button>
        <button className={`detailTab ${activeTab === "wish" ? "active" : ""}`} onClick={() => setActiveTab("wish")}>바라던 작품</button>
      </div>

      {/* 리뷰 탭 */}
      {activeTab === "review" && (
        <div className="detailReviewSection">
          {reviews.map(review => (
            <div key={review.id} className="reviewCard">
              <div className="reviewHeader">
                <div className="reviewUser">
                  <div className="reviewAvatar">{review.user[0]}</div>
                  <div>
                    <span className="reviewUserName">{review.user}</span>
                    <span className="reviewDate">{review.date}</span>
                  </div>
                </div>
                <div className="reviewRating">
                  <StarRating rating={review.rating} size={14} />
                  <span className="reviewRatingNum">{review.rating}.0 / 5.0</span>
                </div>
              </div>

              {editingReviewId === review.id ? (
                <div style={{ margin: "10px 0" }}>
                  <textarea
                    className="reviewFormInput"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="reviewFormBtns" style={{ justifyContent: "flex-end", marginTop: "10px" }}>
                    <button className="reviewCancelBtn" onClick={() => setEditingReviewId(null)}>취소</button>
                    <button className="reviewSubmitBtn" onClick={() => handleEditSave(review.id)}>수정 완료</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="reviewContent">{review.content}</p>
                  <div className="reviewFooter">
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="reviewActionBtn" onClick={() => { setEditingReviewId(review.id); setEditContent(review.content); }}>수정</button>
                      <button className="reviewActionBtn" onClick={() => handleDeleteReview(review.id)}>삭제</button>
                      <button className="reviewActionBtn" onClick={() => { setReplyOpenId(replyOpenId === review.id ? null : review.id); setReplyText(""); }}>답글</button>
                    </div>
                    <div className="reviewReactions">
                      <img src={likesImg} alt="likes" style={{ width: 16, cursor: "pointer" }} onClick={() => handleLikeToggle(review.id)} />
                      <span>좋아요 {review.likes}</span>
                      <img src={replyImg} alt="reply" style={{ width: 16 }} />
                      <span>답글 {review.comments}</span>
                    </div>
                  </div>

                  {review.replies && review.replies.length > 0 && (
                    <div className="repliesList" style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#111", borderRadius: "6px", border: "1px solid #222" }}>

                      {/* 저장된 답글들을 하나씩 꺼내서 화면에 그립니다 */}
                      {review.replies.map(reply => (
                        <div key={reply.id} style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px", borderBottom: "1px solid #222", paddingBottom: "8px" }}>

                          {/* 답글 작성자 이름과 날짜 */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#ddd" }}>{reply.user}</span>
                            <span style={{ fontSize: "10px", color: "#666" }}>{reply.date}</span>
                          </div>

                          {/* 답글 내용 */}
                          <p style={{ margin: 0, fontSize: "12px", color: "#aaa", lineHeight: "1.5" }}>
                            {reply.text}
                          </p>

                        </div>
                      ))}

                    </div>
                  )}

                  {replyOpenId === review.id && (
                    <div className="replyForm">
                      <textarea
                        className="reviewFormInput"
                        placeholder="답글을 입력해주세요..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        maxLength={500}
                      />
                      <div className="reviewFormBottom">
                        <span className="reviewFormCount">{replyText.length}/500</span>
                        <div className="reviewFormBtns">
                          <button className="reviewCancelBtn" onClick={() => { setReplyOpenId(null); setReplyText(""); }}>취소</button>
                          <button className="reviewSubmitBtn" onClick={() => handleReplySubmit(review.id)}>등록</button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="reviewForm">
            <button className="writeReviewBtn" onClick={() => setIsReviewModalOpen(true)}>
              + 리뷰 작성
            </button>
          </div>
        </div>
      )}

      {/* 바라던 작품 탭 */}
      {activeTab === "wish" && (
        <div className="detailReviewSection">
          <p style={{ color: "#aaa", textAlign: "center", padding: "60px 0" }}>바라던 작품 기능은 준비 중입니다.</p>
        </div>
      )}

      {/* 리뷰 작성 팝업 */}
      {isReviewModalOpen && (
        <div className="reviewModalOverlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="reviewModal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">리뷰 작성</h3>

            {/* 별점 선택 */}
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{ fontSize: 24, cursor: "pointer", color: star <= Math.round(newReviewRating) ? "#FFD700" : "#444" }}
                  onClick={() => setNewReviewRating(star)}
                >★</span>
              ))}
            </div>

            <textarea
              className="reviewModalInput"
              placeholder="이 작품에 대한 감상을 자유롭게 남겨주세요..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              maxLength={500}
            />
            <div style={{ fontSize: 11, color: "#444", textAlign: "right" }}>{newReview.length}/500</div>

            <div className="reviewModalBtns">
              <button className="reviewCancelBtn" onClick={() => { setIsReviewModalOpen(false); setNewReview(""); }}>취소</button>
              <button className="reviewSubmitBtn" onClick={handleReviewSubmit}>등록</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}