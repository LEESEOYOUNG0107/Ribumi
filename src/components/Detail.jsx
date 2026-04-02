import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Nav from "./Navi";
import Footer from "./Footer";
import "./Detail.css";

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
  const location = useLocation();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [relatedWorks, setRelatedWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("review");
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const [newReview, setNewReview] = useState("");
  const [replyOpenId, setReplyOpenId] = useState(null); // 어떤 댓글의 답글창이 열려있는지 (댓글ID)
  const [replyText, setReplyText] = useState("");
  const [isWished, setIsWished] = useState(false);

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

    const director = creditData.cast?.find(c => c.job === "Director")?.name || "";
    const cast = creditData.cast?.slice(0, 5).map(c => c.name).join(", ") || "";

    setDetails({
      _type: type,
      title: detailData.title || detailData.name,
      poster: detailData.poster_path ? `https://image.tmdb.org/t/p/w500${detailData.poster_path}` : null,
      backdrop: detailData.backdrop_path ? `https://image.tmdb.org/t/p/original${detailData.backdrop_path}` : null,
      genre: detailData.genres?.map(g => g.name).join(" · ") || "",
      releaseDate: detailData.release_date || detailData.first_air_date || "",
      overview: detailData.overview || "",
      rating: detailData.vote_average ? (detailData.vote_average / 2).toFixed(1) : "0.0",
      voteCount: detailData.vote_count?.toLocaleString() || "0",
      director,
      cast,
      extra: {
        runtime: detailData.runtime ? `${detailData.runtime}분` : detailData.episode_run_time?.[0] ? `${detailData.episode_run_time[0]}분/화` : "",
      }
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

    const author = book.author?.split("(지은이)")[0]?.trim() || "";
    const translator = book.author?.includes("(옮긴이)")
      ? book.author.split("(옮긴이)")[0].split(",").pop()?.trim()
      : "";

    setDetails({
      _type: "book",
      title: book.title,
      poster: book.cover?.replace("/coversum/", "/cover500/") || null,
      backdrop: null,
      genre: book.categoryName?.split(">").pop() || "",
      releaseDate: book.pubDate || "",
      overview: book.description || book.fullDescription || "",
      rating: book.customerReviewRank ? (book.customerReviewRank / 2).toFixed(1) : "0.0",
      voteCount: "",
      extra: {
        author,
        translator,
        publisher: book.publisher || "",
        isbn: book.isbn13,
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

    setDetails({
      _type: "performance",
      title: db.querySelector("prfnm")?.textContent || "",
      poster: db.querySelector("poster")?.textContent?.replace("http://", "https://") || null,
      backdrop: null,
      genre: db.querySelector("genrenm")?.textContent || "",
      releaseDate: db.querySelector("prfpdfrom")?.textContent || "",
      overview: db.querySelector("dtguidance")?.textContent || "",
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

  const handleSubmitReview = () => {
    if (!newReview.trim()) return alert("내용을 입력해주세요.");
    setReviews([...reviews, {
      id: Date.now(),
      user: "나",
      date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, "."),
      rating: 5,
      content: newReview,
      likes: 0,
      comments: 0,
    }]);
    setNewReview("");
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

      {/* ── 상단 정보 ── */}
      <div className="detailTop">
        <div className="detailTopMeta">
          <span>{
            details._type === "movie" ? "영화" :
            details._type === "tv" ? "드라마" :
            details._type === "book" ? "도서" : "공연"
          }</span>
          {details.genre && <span>{details.genre}</span>}
          {details.releaseDate && <span>{details.releaseDate}</span>}
          {details.extra?.runtime && <span>{details.extra.runtime}</span>}
          {details.extra?.publisher && <span>{details.extra.publisher}</span>}
          {details.extra?.place && <span>{details.extra.place}</span>}
          {details.extra?.translator && <span>옮긴이 | {details.extra.translator}</span>}
          {details.extra?.age && <span>{details.extra.age}</span>}
        </div>

        <h1 className="detailMainTitle">{details.title}</h1>

        <p className="detailSubInfo">
          {details._type === "movie" && details.director && `감독 | ${details.director}`}
          {details._type === "tv" && details.cast && `출연 | ${details.cast}`}
          {details._type === "book" && details.extra.author && `저자 | ${details.extra.author}`}
          {details._type === "performance" && details.extra.cast && `출연 | ${details.extra.cast}`}
        </p>

        <p className="detailTopOverview">
          {details.overview.length > 150 ? details.overview.slice(0, 150) + "..." : details.overview}
        </p>

        <button className={`detailWishBtn ${isWished ? "wished" : ""}`} onClick={() => setIsWished(!isWished)}>
          {isWished ? "♥ 찜 완료" : "♡ 찜하기"}
        </button>
      </div>

      {/* ── 포스터 슬라이더 + 관련 작품 ── */}
      <div className="detailSliderSection">
        <div className="detailSlider">

          {relatedWorks[0] && (
            <div className="sliderSide left" onClick={() => navigate(`/detail/${relatedWorks[0].type}/${relatedWorks[0].id}`, { state: { item: relatedWorks[0].item } })}>
              <img src={relatedWorks[0].poster} alt={relatedWorks[0].title} />
            </div>
          )}

          <div className="sliderMain">
            <img src={details.poster || "https://placehold.co/220x330?text=No+Image"} alt={details.title} />
            <div className="sliderRatingBox">
              <StarRating rating={parseFloat(details.rating)} size={22} />
              <span className="sliderRatingNum">{details.rating}</span>
              <span className="sliderRatingTotal">/ 5.0</span>
              {details.voteCount && <span className="sliderRatingCount">{details.voteCount}명</span>}
            </div>
            <div className="sliderDots">
              {[0,1,2].map(i => <span key={i} className={`sliderDot ${i === 1 ? "active" : ""}`} />)}
            </div>
          </div>

          {relatedWorks[1] && (
            <div className="sliderSide right" onClick={() => navigate(`/detail/${relatedWorks[1].type}/${relatedWorks[1].id}`, { state: { item: relatedWorks[1].item } })}>
              <img src={relatedWorks[1].poster} alt={relatedWorks[1].title} />
            </div>
          )}
        </div>

        <div className="detailRelated">
          {relatedWorks.slice(2, 4).map(work => (
            <div key={work.id} className="relatedItem" onClick={() => navigate(`/detail/${work.type}/${work.id}`, { state: { item: work.item } })}>
              <img src={work.poster} alt={work.title} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 탭 ── */}
      <div className="detailTabWrapper">
        <button className={`detailTab ${activeTab === "review" ? "active" : ""}`} onClick={() => setActiveTab("review")}>감상하기</button>
        <button className={`detailTab ${activeTab === "wish" ? "active" : ""}`} onClick={() => setActiveTab("wish")}>바라던 작품</button>
      </div>

      {/* ── 리뷰 탭 ── */}
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

              <p className="reviewContent">{review.content}</p>

              <div className="reviewFooter">
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="reviewActionBtn">수정</button>
                  <button
                    className="reviewActionBtn"
                    onClick={() => {
                      setReplyOpenId(replyOpenId === review.id ? null : review.id);
                      setReplyText("");
                    }}
                  >
                    답글
                  </button>
                </div>
                <div className="reviewReactions">
                  <span>♡ 좋아요 {review.likes}</span>
                  <span>💬 댓글 {review.comments}</span>
                </div>
              </div>

              {/* 답글 입력창 — 해당 댓글 아래에만 표시 */}
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
                      <button className="reviewSubmitBtn" onClick={() => { setReplyOpenId(null); setReplyText(""); }}>등록</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>
      )}

      {/* ── 바라던 작품 탭 ── */}
      {activeTab === "wish" && (
        <div className="detailReviewSection">
          <p style={{ color: "#aaa", textAlign: "center", padding: "60px 0" }}>바라던 작품 기능은 준비 중입니다.</p>
        </div>
      )}

      <Footer />
    </div>
  );
}