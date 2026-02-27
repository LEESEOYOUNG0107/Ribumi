import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useRef } from "react"; 
import Navi from "./components/Navi";
import Search from "./components/Search"; // 새로 만든 통합 검색 컴포넌트
import BookRecord from "./components/BookRecord"; 
import MyRecords from "./components/MyRecords";
import Home from "./components/Home";
import Main from "./components/Main";
// import Login from "./components/Login";
import Detail from "./components/Detail";
// import "./App.css";

export default function App() {
  const location = useLocation();
  
  // 도서, 영화, 드라마, 공연 기록을 모두 담는 통합 상태
  const [records, setRecords] = useState([]);
  const idRef = useRef(0);

  // 새로운 기록을 저장하는 함수 (type 매개변수 추가: BOOK, MOVIE, TV, STAGE 등)
  const onCreateRecord = (thumbnail, title, date, content, type) => {
    const newRecord = {
      id: idRef.current++, // 고유 ID 부여
      thumbnail, // 포스터나 책 표지 이미지
      title, // 작품 제목 (도서명, 영화명 등)
      date: new Date(date).getTime(), // 날짜를 숫자로 변환하여 저장
      content, // 감상평 내용
      type, // 콘텐츠 종류 구분 필드 (중요!)
    };
    
    // 기존 기록 리스트의 맨 앞에 새 기록 추가
    setRecords([newRecord, ...records]);
    console.log("저장된 통합 기록:", [newRecord, ...records]);
  };

  // 홈페이지가 아닐 때만 Navi를 표시
  const isHome = location.pathname === "/";

  return (
    //<AuthProvider> {/* 로그인 유저 정보를 앱 전체에 공유 */}
      <div className="App">
        {!isHome && <Navi />} {/* 홈페이지가 아닐 때만 상단 메뉴바 표시 */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/main" element={<Main />} /> {/* 통합 장르 페이지 */}  
          {/* 통합 검색 페이지: 여기서 도서, 미디어, 공연을 한꺼번에 검색함 */}
          <Route path="/search" element={<Search />} />
          
          {/* 영화/드라마 상세 정보 페이지 */}
          <Route path="/detail/:type/:id" element={<Detail />} />
          
          {/* 기록 작성 페이지: Search에서 넘어온 정보로 리뷰 작성 */}
          <Route path="/bookrecord" element={<BookRecord onCreateRecord={onCreateRecord}/>} />
          
          {/* 내가 쓴 모든 기록(도서+영상+공연) 리스트 */}
          <Route path="/myrecords" element={<MyRecords records={records} />} />
        </Routes>
      </div>
    //</AuthProvider>
  );
}
