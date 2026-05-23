import { useState } from "react";
import likesImg from "../imgs/likes.svg";
import replyImg from "../imgs/reply.svg";

import "./ReviewSection.css";

const StarRating = ({ rating, size = 16 }) => (
  <span style={{ color: "#FFD700", fontSize: size }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

export default function ReviewSection({
  itemReviews,
  onEditSave,
  onDelete,
  onReplySubmit,
  onLikeToggle
}) {
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
  };

  const handleSaveEdit = (reviewId) => {
    onEditSave(reviewId, editContent);
    setEditingReviewId(null);
  };

  const handleReplyClick = (reviewId) => {
    setReplyOpenId(replyOpenId === reviewId ? null : reviewId);
    setReplyText("");
  };

  const handleSaveReply = (reviewId) => {
    onReplySubmit(reviewId, replyText);
    setReplyOpenId(null);
    setReplyText("");
  };

  return (
    <div className="detailReviewSection">
      {itemReviews.map((review) => (
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
            </div>
          </div>

          {editingReviewId === review.id ? (
            <div style={{ margin: "10px 0" }}>
              <textarea className="reviewFormInput" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
              <div className="reviewFormBtns" style={{ justifyContent: "flex-end", marginTop: "10px" }}>
                <button className="reviewCancelBtn" onClick={() => setEditingReviewId(null)}>취소</button>
                <button className="reviewSubmitBtn" onClick={() => handleSaveEdit(review.id)}>수정 완료</button>
              </div>
            </div>
          ) : (
            <>
              <p className="reviewContent">{review.content}</p>
              <div className="reviewFooter">
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="reviewActionBtn" onClick={() => handleEditClick(review)}>수정</button>
                  <button className="reviewActionBtn" onClick={() => onDelete(review.id)}>삭제</button>
                  <button className="reviewActionBtn" onClick={() => handleReplyClick(review.id)}>답글</button>
                </div>
                <div className="reviewReactions">
                  <img src={likesImg} alt="likes" style={{ width: 16, cursor: "pointer" }} onClick={() => onLikeToggle(review.id)} />
                  <span>좋아요 {review.likes}</span>
                  <img src={replyImg} alt="reply" style={{ width: 16 }} />
                  <span>답글 {review.comments}</span>
                </div>
              </div>

              {review.replies && review.replies.length > 0 && (
                <div className="repliesList" style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#111", borderRadius: "6px", border: "1px solid #222" }}>
                  {review.replies.map((reply) => (
                    <div key={reply.id} style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px", borderBottom: "1px solid #222", paddingBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#ddd" }}>{reply.user}</span>
                        <span style={{ fontSize: "10px", color: "#666" }}>{reply.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#aaa", lineHeight: "1.5" }}>{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {replyOpenId === review.id && (
                <div className="replyForm">
                  <textarea className="reviewFormInput" placeholder="답글을 입력해주세요..." value={replyText} onChange={(e) => setReplyText(e.target.value)} maxLength={500} />
                  <div className="reviewFormBottom">
                    <span className="reviewFormCount">{replyText.length}/500</span>
                    <div className="reviewFormBtns">
                      <button className="reviewCancelBtn" onClick={() => setReplyOpenId(null)}>취소</button>
                      <button className="reviewSubmitBtn" onClick={() => handleSaveReply(review.id)}>등록</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}

    </div>
  );
}