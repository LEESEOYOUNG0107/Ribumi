import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useRef } from "react"; 
import Navi from "./components/Navi";
import Book from "./components/Book"; 
import MyRecords from "./components/MyRecords";
import Home from "./components/Home";
import Main from "./components/Main";
import Performance from "./components/Performance";
import Search from "./components/Search";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Detail from "./components/Detail";
import MyPage from "./components/Mypage";
// import "./App.css";

export default function App() {
  const location = useLocation();
  
  // 도서, 영화, 드라마, 공연 기록을 모두 담는 통합 상태
  const [records, setRecords] = useState([]);
  const idRef = useRef(0);

  const isHome = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  return (
    //<AuthProvider> {/* 로그인 유저 정보를 앱 전체에 공유 */}
      <div className="App">
        <Navi />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} /> 
          <Route path="/book" element={<Book/>} />
          <Route path="/performance" element={<Performance/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/search" element={<Search/>}/>
          <Route path="/detail/:type/:id" element={<Detail />} />

          {/* 내가 쓴 모든 기록(도서+영상+공연) 리스트 */}
          {/*<Route path="/myrecords" element={<MyRecords records={records} />} /> */}
        </Routes>
      </div>
    //</AuthProvider>
  );
}