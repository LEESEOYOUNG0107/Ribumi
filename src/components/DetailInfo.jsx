import { useState } from "react";   // Detail 페이지에서 작품의 상세 정보를 보여주는 컴포넌트입니다.

const StarRating = ({ rating, size = 16 }) => (
  <span style={{ color: "#FFD700", fontSize: size }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

const typeLabel = (t) =>
  ({ movie: "영화", tv: "드라마", book: "도서", performance: "공연" }[t] || t);


export default function DetailInfo({ item, isWished, onWishToggle, displayItems, currentIndex, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 현재 포스터 + 이후 작품들만 표시 (이전은 숨김)
  const visibleItems = displayItems.slice(currentIndex);
  return (
    <>
      {/* 상세 정보 레이아웃 */}
      <div className="detailLayout">
        <div className="detailInfo">
          <div className="detailTopMeta">
            {item._type === "book" ? (
              <>
                <div className="important">
                  {item.extra?.author && <span>{item.extra.author}</span>}
                </div>
                <div className="detailExtraInfo">
                  {item.extra?.publisher && <div>출판사: {item.extra.publisher}</div>}
                  {item.releaseDate && <div>{item.releaseDate} 출간</div>}
                </div>
              </>
            ) : (
              <>
                <div className="important">
                  {item.director && <span>크리에이터  {item.director}</span>} 
                  {item.cast && <span>출연 {item.cast}</span>}
                </div>
                <div>{item.releaseDate && <span>{item.releaseDate.slice(0, 4)}년</span>}</div>
              </>
            )}
          </div>

          <div className="overviewContainer">
            <p className={`detailTopOverview ${isExpanded ? "expanded" : ""}`}>
              {item.overview || "상세 정보가 제공되지 않습니다."}
            </p>
            {item.overview && item.overview.length > 130 && (
              <button className="overviewMoreBtn" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? "닫기 ▴" : "더보기 ▾"}
              </button>
            )}
          </div>

          <div className="rating_wish_box">
            <div className="RatingBox">
              <span className="RatingNum">{item.rating}</span>
              <StarRating rating={parseFloat(item.rating) / 2} size={22} />
              <span className="sliderRatingCount">{item.voteCount}명</span>
            </div>
            <button className={`wishBtn ${isWished ? "wished" : ""}`} onClick={() => onWishToggle(item)}>
              ♥
            </button>
          </div>
        </div>

        <div className="detailRight">
          <div className="detailGenreTitle">
            <div className="detailTopMeta">{item.genre && <span>{item.genre}</span>}</div>
            <h1 className="detailMainTitle">{item.title}</h1>
          </div>

          {/* 포스터 슬라이더: 현재 + 다음 2개 */}
          <div className="posterSliderViewport">
            <div className="posterSliderTrack">
              {visibleItems.map((work, i) => {
                const globalIndex = currentIndex + i;
                const isCurrent = i === 0;
                const isSecondNext = i === 2;
                return (
                  <div
                    key={work.id + globalIndex}
                    className={`posterSlideItem ${isCurrent ? "current" : isSecondNext ? "next2" : "next1"}`}
                    onClick={() => !isCurrent && onSelect(globalIndex)}
                  >
                    <img
                      src={work.poster || "https://placehold.co/260x390?text=No+Image"}
                      alt={work.title}
                    />
                    {isCurrent && (
                      <span className="posterTypeBadge">{typeLabel(work._type)}</span>
                    )}
                    {!isCurrent && (
                      <div className="posterNextOverlay">
                        <span className="posterNextLabel">{typeLabel(work._type)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 인디케이터 dots — 전체 작품 수만큼, 현재 위치 표시 */}
          {displayItems.length > 1 && (
            <div className="posterDots">
              {displayItems.map((_, i) => (
                <button
                  key={i}
                  className={`posterDot ${i === currentIndex ? "active" : ""}`}
                  onClick={() => onSelect(i)}
                  aria-label={`${i + 1}번째 작품`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}