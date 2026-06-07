import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Navi";
import Footer from "../components/Footer";
import "./Mypage.css";
import profileImg from "../imgs/profile.png";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;
const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ color: "#FFD700", fontSize: size }}>
    {"★".repeat(Math.round(rating))}
    {"☆".repeat(5 - Math.round(rating))}
  </span>
);


// ── 추천 카드 컴포넌트 ──
function RecommendCard({ item }) {
  const navigate = useNavigate();
  return (
    <div
      className="recCard"
      onClick={() => navigate(`/detail/${item._type}/${item.id}`)}
    >
      <div className="recPoster">
        {item.poster ? (
          <img src={item.poster} alt={item.title} />
        ) : (
          <div className="recNoPoster">No Image</div>
        )}
      </div>
      <div className="recMeta">
        <span className="recTitle">{item.title}</span>
        {item.releaseDate && (
          <span className="recYear">{item.releaseDate.slice(0, 4)}</span>
        )}
      </div>
    </div>
  );
}

export default function MyPage() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [reviewTab, setReviewTab] = useState("book");
  const [reviews, setReviews] = useState([]);
  const [wished, setWished] = useState([]);

  // ── 추천 관련 state ──
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  // 추천 근거: 찜 목록에서 집계된 상위 장르 목록 (표시용)
  const [topGenres, setTopGenres] = useState([]);

  const filteredReviews =
    reviewTab === "book"
      ? reviews.filter((r) => r.type === "book")
      : reviews.filter((r) => r.type !== "book");

  // ── 리뷰 fetch ──
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", userId);
      if (!error) setReviews(data || []);
    };
    fetchReviews();
  }, []);

  // ── 찜 fetch ──
  useEffect(() => {
    const fetchWishlist = async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", userId);
      if (!error) setWished(data || []);
    };
    fetchWishlist();
  }, []);

  // ── 찜 목록이 로드되면 추천 fetch ──
  useEffect(() => {
    if (wished.length === 0) return;
    fetchRecommendations(wished);
  }, [wished]);

  // ── 추천 로직: 찜 목록의 장르를 집계해서 상위 장르로 추천 ──
  const fetchRecommendations = async (wishlist) => {
    setRecLoading(true);

    // ── 1단계: 찜 목록 전체에서 장르 빈도 집계 ──
    // wishlist 각 항목의 genre 컬럼은 "스릴러", "액션|범죄", "로맨스" 등 문자열로 저장 가정
    const genreCount = {};
    wishlist.forEach((w) => {
      if (!w.genre) return;
      // "|", "/", "·", "," 구분자로 분리해서 각 장르를 개별 카운트
      w.genre.split(/[|/·,]/).map((g) => g.trim()).filter(Boolean).forEach((g) => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
    });

    // 빈도 내림차순 정렬 → 상위 2개 장르 선택
    const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
    const top2 = sorted.slice(0, 2).map(([genre]) => genre);
    setTopGenres(top2);

    // 장르 정보가 전혀 없으면 중단
    if (top2.length === 0) {
      setRecommendations([]);
      setRecLoading(false);
      return;
    }

    // ── TMDB 장르명 → ID 매핑 ──
    const TMDB_GENRE_MAP = {
      "액션": 28, "모험": 12, "애니메이션": 16, "코미디": 35, "범죄": 80,
      "다큐멘터리": 99, "드라마": 18, "가족": 10751, "판타지": 14, "역사": 36,
      "공포": 27, "음악": 10402, "미스터리": 9648, "로맨스": 10749, "SF": 878,
      "스릴러": 53, "전쟁": 10752, "서부": 37,
      "액션·모험": 10759, "SF·판타지": 10765,
    };

    // ── KOPIS 장르명 → 코드 매핑 ──
    const KOPIS_GENRE_MAP = {
      "뮤지컬": "GGGA", "연극": "GGGA", "클래식": "CCCA", "오페라": "CCCA",
      "무용": "BBBC", "콘서트": "CCCD", "서커스": "EEEB", "마술": "EEEB",
    };

    // ── 2단계: 상위 장르로 각 API 병렬 호출 ──
    const genreQuery = top2.join(" "); // Aladin/KOPIS용 키워드
    const tmdbGenreIds = top2
      .map((g) => TMDB_GENRE_MAP[g])
      .filter(Boolean)
      .join(",");
    const kopisGenreCode = top2.map((g) => KOPIS_GENRE_MAP[g]).find(Boolean) || "";

    const wishedIds = new Set(wishlist.map((w) => String(w.content_id)));
    const hasType = (type) => wishlist.some((w) => w.type === type);

    // 영화 (TMDB discover, 장르 ID 기반)
    const fetchMovieByGenre = async () => {
      if (!hasType("movie") || !tmdbGenreIds) return [];
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=ko-KR&with_origin_country=KR&sort_by=popularity.desc&with_genres=${tmdbGenreIds}`
        );
        const data = await res.json();
        return (data.results || [])
          .filter((r) => r.poster_path && !wishedIds.has(String(r.id)))
          .slice(0, 4)
          .map((r) => ({
            id: String(r.id), _type: "movie",
            title: r.title,
            poster: `https://image.tmdb.org/t/p/w300${r.poster_path}`,
            releaseDate: r.release_date || "",
          }));
      } catch { return []; }
    };

    // 드라마 (TMDB discover, 장르 ID 기반)
    const fetchTvByGenre = async () => {
      if (!hasType("tv") || !tmdbGenreIds) return [];
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&language=ko-KR&with_origin_country=KR&sort_by=popularity.desc&with_genres=${tmdbGenreIds}`
        );
        const data = await res.json();
        return (data.results || [])
          .filter((r) => r.poster_path && !wishedIds.has(String(r.id)))
          .slice(0, 4)
          .map((r) => ({
            id: String(r.id), _type: "tv",
            title: r.name,
            poster: `https://image.tmdb.org/t/p/w300${r.poster_path}`,
            releaseDate: r.first_air_date || "",
          }));
      } catch { return []; }
    };

    // 도서 (Aladin 장르 키워드 검색)
    const fetchBookByGenre = async () => {
      if (!hasType("book")) return [];
      try {
        const res = await fetch(
          `/aladin/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(genreQuery)}&QueryType=Keyword&MaxResults=8&start=1&SearchTarget=Book&output=js&Version=20131101`
        );
        const data = await res.json();
        return (data.item || [])
          .filter((b) => !wishedIds.has(String(b.isbn13)))
          .slice(0, 4)
          .map((b) => ({
            id: String(b.isbn13), _type: "book",
            title: b.title,
            poster: b.cover?.replace("/coversum/", "/cover500/") || null,
            releaseDate: b.pubDate || "",
          }));
      } catch { return []; }
    };

    // 공연 (KOPIS 장르코드 or 키워드 검색)
    const fetchPerfByGenre = async () => {
      if (!hasType("performance")) return [];
      try {
        const today = new Date();
        const after6mo = new Date();
        after6mo.setMonth(today.getMonth() + 6);
        const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");

        const categoryParam = kopisGenreCode ? `&shcate=${kopisGenreCode}` : "";
        const res = await fetch(
          `/kopis/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=${fmt(today)}&eddate=${fmt(after6mo)}&cpage=1&rows=8${categoryParam}&shprfnm=${encodeURIComponent(top2[0] || "")}`
        );
        const text = await res.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        return Array.from(xml.querySelectorAll("db"))
          .filter((node) => !wishedIds.has(node.querySelector("mt20id")?.textContent))
          .slice(0, 4)
          .map((node) => ({
            id: node.querySelector("mt20id")?.textContent || "",
            _type: "performance",
            title: node.querySelector("prfnm")?.textContent || "",
            poster: node.querySelector("poster")?.textContent?.replace("http://", "https://") || null,
            releaseDate: node.querySelector("prfpdfrom")?.textContent || "",
          }));
      } catch { return []; }
    };

    try {
      const [movieItems, tvItems, bookItems, perfItems] = await Promise.all([
        fetchMovieByGenre(),
        fetchTvByGenre(),
        fetchBookByGenre(),
        fetchPerfByGenre(),
      ]);

      const merged = [...movieItems, ...tvItems, ...bookItems, ...perfItems];

      // id+타입 기준 중복 제거
      const unique = merged.filter(
        (item, idx, arr) =>
          item.id &&
          arr.findIndex((x) => x.id === item.id && x._type === item._type) === idx
      );

      setRecommendations(unique.slice(0, 12));
    } catch (err) {
      console.error("추천 데이터 로딩 실패:", err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleRemoveWish = async (id) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (!error) setWished(wished.filter((item) => item.id !== id));
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("리뷰를 삭제하시겠습니까?")) {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (!error) setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="mypageWrapper">
      <Nav />

      <div className="mypageContainer">
        {/* ── 프로필 ── */}
        <div className="mypageProfile">
          <div className="mypageAvatar">
            <div className="avatarCircle">
              <img src={profileImg} alt="profile" />
            </div>
            <span className="mypageUsername">{userId}님</span>
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

        {/* ── 찜한 작품 ── */}
        <section className="mypageSection">
          <h3 className="mypageSectionTitle">찜한 작품</h3>
          {wished.length === 0 ? (
            <p className="mypageEmpty">찜한 작품이 없습니다.</p>
          ) : (
            <div className="wishedGrid">
              {wished.map((item) => (
                <div
                  key={item.id}
                  className="wishedCard"
                  onClick={() =>
                    navigate(`/detail/${item.type}/${item.content_id}`)
                  }
                >
                  <div
                    className="wishedPoster"
                    style={{
                      backgroundImage: item.poster
                        ? `url(${item.poster})`
                        : "none",
                    }}
                  >
                    {!item.poster && (
                      <span className="wishedNoImg">No Image</span>
                    )}
                    <button
                      className="wishedRemoveBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWish(item.id);
                      }}
                    >
                      ♥
                    </button>
                  </div>
                  <div className="wishedMeta">
                    <span className="wishedTitle">{item.title}</span>
                    <span className="wishedInfo">
                      {item.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 찜 기반 추천 섹션 ── */}
        {wished.length > 0 && (
          <section className="mypageSection">
            <div className="recSectionHeader">
              <h3 className="mypageSectionTitle recSectionTitle"> 취향 저격 추천작 </h3>
              <div className="recBadgeRow">
                {topGenres.map((g) => (
                  <span key={g} className="recTypePill">{g}</span>
                ))}
                {topGenres.length > 0 && (
                  <span className="recBadgeDesc">장르 기반 추천</span>
                )}
              </div>
            </div>

            {recLoading ? (
              <div className="recLoadingRow">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="recSkeletonCard">
                    <div className="recSkeletonPoster" />
                    <div className="recSkeletonLine" />
                    <div className="recSkeletonLineShort" />
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <p className="mypageEmpty">추천 작품을 불러오지 못했습니다.</p>
            ) : (
              <>
                <div className="recGrid">
                  {recommendations.map((item) => (
                    <RecommendCard key={item.id + item._type} item={item} />
                  ))}
                </div>
                {/* 백엔드 연동 후 이 버튼이 API 재호출로 이어집니다 */}
                <button
                  className="recRefreshBtn"
                  onClick={() => fetchRecommendations(wished)}
                >
                  ↻ 다른 추천 보기
                </button>
              </>
            )}
          </section>
        )}

        {/* ── 내가 쓴 리뷰 ── */}
        <section className="mypageSection">
          <h3 className="mypageSectionTitle">내가 쓴 리뷰 보기</h3>
          <div className="reviewTabRow">
            <button
              className={`reviewTabBtn ${reviewTab === "book" ? "active" : ""}`}
              onClick={() => setReviewTab("book")}
            >
              도서
            </button>
            <button
              className={`reviewTabBtn ${reviewTab === "media" ? "active" : ""}`}
              onClick={() => setReviewTab("media")}
            >
              미디어 및 공연
            </button>
          </div>

          {filteredReviews.length === 0 ? (
            <p className="mypageEmpty">작성한 리뷰가 없습니다.</p>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="mypageReviewCard">
                <div className="mypageReviewHeader">
                  <div className="mypageReviewLeft">
                    <span className="mypageReviewType">
                      {review.type === "book"
                        ? "도서"
                        : review.type === "movie"
                        ? "영화"
                        : "드라마"}
                    </span>
                    <span className="mypageReviewTitle">{review.title}</span>
                    <span className="mypageReviewDate">{review.date}</span>
                  </div>
                  <div className="mypageReviewRight">
                    <StarRating rating={review.rating} />
                    <span className="mypageReviewRatingNum">
                      {" "}
                      / {review.rating * 2}.0점
                    </span>
                  </div>
                </div>
                <p className="mypageReviewContent">{review.content}</p>
                <div className="mypageReviewFooter">
                  <button className="mypageReviewBtn">수정하기</button>
                  <button
                    className="mypageReviewBtn delete"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    삭제하기
                  </button>
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