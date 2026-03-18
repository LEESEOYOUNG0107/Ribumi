import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useRef } from "react"; 
import Navi from "./components/Navi";
import Book from "./components/Book"; 
import MyRecords from "./components/MyRecords";
import Home from "./components/Home";
import Main from "./components/Main";
import Performance from "./components/Performance";
import Login from "./components/Login";
// import Login from "./components/Login";
import Detail from "./components/Detail";
// import "./App.css";

export default function App() {
  const location = useLocation();
  
  // 도서, 영화, 드라마, 공연 기록을 모두 담는 통합 상태
  const [records, setRecords] = useState([]);
  const idRef = useRef(0);

  // 홈페이지가 아닐 때만 Navi를 표시
  const isHome = location.pathname === "/";

  return (
    //<AuthProvider> {/* 로그인 유저 정보를 앱 전체에 공유 */}
      <div className="App">
        {!isHome && <Navi />} {/* 홈페이지가 아닐 때만 상단 메뉴바 표시 */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} /> {/* 통합 장르 페이지 */}  
          <Route path="/book" element={<Book/>} />
          <Route path="/performance" element={<Performance/>} />
          <Route path="/login" element={<Login />} />
          
          {/* 영화/드라마 상세 정보 페이지 */}
          {/*<Route path="/detail/:type/:id" element={<Detail />} />
          
          {/* 내가 쓴 모든 기록(도서+영상+공연) 리스트 */}
          {/*<Route path="/myrecords" element={<MyRecords records={records} />} /> */}
        </Routes>
      </div>
    //</AuthProvider>
  );
}
