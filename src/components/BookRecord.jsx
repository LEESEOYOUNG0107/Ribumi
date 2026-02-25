import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
//import "./BookDetail.css";

export default function BookRecord({onCreateRecord}) {
    const location = useLocation();
    const nav = useNavigate();
    
    // BookSearch에서 넘겨준 책 정보 받기
    const book = location.state?.book;

    // 입력 상태 관리
    const [content, setContent] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // 오늘 날짜 기본값

    if (!book) {
        return <div>책 정보를 찾을 수 없습니다.</div>;
    }

    const onSubmit = () => {
        if (content === "") {
            alert("내용을 입력해주세요!");
            return;
        }

        console.log("기록 저장:", {
            title: book.title,
            date: date,
            content: content
        });
        onCreateRecord(book.thumbnail, book.title, date, content);
        alert("기록이 저장되었습니다!");
        nav("/myrecords"); // 저장 후 목록으로 이동
    };

    return (
        <div className="BookDetail">
            <h2>📖 독서 기록 쓰기</h2>
            <div>
                <img src={book.thumbnail} alt={book.title} />
                <div>
                    <h3>{book.title}</h3>
                    <p>저자: {book.authors.join(", ")}</p>
                </div>
            </div>
            <hr/>
            <div>
                <div>
                    <label>읽은 날짜: </label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                    />
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="책을 읽고 느낀 점을 자유롭게 적어주세요..."
                />
                <button onClick={onSubmit}>기록 저장하기</button>
            </div>
        </div>
    );
}