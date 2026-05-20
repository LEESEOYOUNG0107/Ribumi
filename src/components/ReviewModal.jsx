import './ReviewModal.css';

export default function ReviewModal({
  isOpen, onClose, onSubmit, rating, setRating, content, setContent, currentItem,
}) {
  if (!isOpen || !currentItem) return null;

  const typeLabel = (t) =>
    ({ movie: "영화", tv: "드라마", book: "도서", performance: "공연" }[t] || t);

  return (
    <div className="reviewModalOverlay" onClick={onClose}>
      <div className="reviewModal" onClick={(e) => e.stopPropagation()}>
        {/* ── 작품 정보 헤더 ── */}
        <div className="modalItemHeader">
          <h3 className="modalTitle">리뷰 작성</h3>
          {currentItem.genre && (
            <span className="modalGenre">{currentItem.genre}</span>
          )}

          <h3 className="modalItemTitle">{currentItem.title}</h3>
          <span className="modalTypeBadge">{typeLabel(currentItem._type)}</span>
          <img
            src={currentItem.poster || "https://placehold.co/100x148?text=No+Image"}
            alt={currentItem.title}
            className="modalPoster"
          />
        </div>

        {/* ── 리뷰 작성 ── */}


        <div className="modalStarRow">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`modalStar ${star <= Math.round(rating) ? "active" : ""}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          className="reviewModalInput"
          placeholder="이 작품에 대한 감상을 자유롭게 남겨주세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
        />
        <div style={{ fontSize: 11, color: "#444", textAlign: "right" }}>{content.length}/500</div>

        <div className="reviewModalBtns">
          <button className="reviewCancelBtn" onClick={onClose}>취소</button>
          <button className="reviewSubmitBtn" onClick={onSubmit}>등록</button>
        </div>
      </div>
    </div>
  );
}