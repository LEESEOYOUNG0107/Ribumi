export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  rating,
  setRating,
  content,
  setContent
}) {
  if (!isOpen) return null;

  return (
    <div className="reviewModalOverlay" onClick={onClose}>
      <div className="reviewModal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">리뷰 작성</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{ fontSize: 24, cursor: "pointer", color: star <= Math.round(rating) ? "#FFD700" : "#444" }}
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