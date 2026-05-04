import { Routes, Route } from "react-router-dom";
import Navi from "./components/Navi";
import Book from "./pages/Book"; 
// import MyRecords from "./pages/MyRecords";
import Home from "./pages/Home";
import Main from "./pages/Main";
import Performance from "./pages/Performance";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Detail from "./pages/Detail";
import MyPage from  "./pages/Mypage";
// import "./App.css";

export default function App() {
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
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    //</AuthProvider>
  );
}