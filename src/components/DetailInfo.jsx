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

  return (
    <>
      {/* 관련 작품 썸네일 바 작품이 2개 이상일 때만 표시 */}
      {displayItems.length > 1 && (
        <div className="relatedWorksBar" style={{ marginTop: "90px" }}>
          {displayItems.map((item, index) => (
            <div
              key={item.id + index}
              className={`relatedThumb ${currentIndex === index ? "active" : ""}`}
              onClick={() => onSelect(index)}
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

      {/* 상세 정보 레이아웃 항상 표시 */}
      <div className="detailLayout">
        <div className="detailInfo">
          <div className="detailTopMeta">
            {item._type === "book" ? (
              <>
                <div className="important">
                  {item.extra?.author && <span>{item.extra.author}</span>}
                </div>
                <div className="detailExtraInfo">
                  {item.extra?.publisher && <div>{item.extra.publisher}</div>}
                  {item.releaseDate && <div>{item.releaseDate}</div>}
                </div>
              </>
            ) : (
              <>
                <div className="important">
                  {item.director && <span>{item.director}</span>}|
                  {item.cast && <span>{item.cast}</span>}
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
          <div className="detailTopMeta">{item.genre && <span>{item.genre}</span>}</div>
          <h1 className="detailMainTitle">{item.title}</h1>
          <div className="detailSliderSection">
            <div className="sliderMain">
              <img src={item.poster || "https://placehold.co/220x330?text=No+Image"} alt={item.title} />
            </div>
          </div>
        </div>
      </div>
    </>



  );
}