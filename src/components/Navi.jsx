import { useNavigate, useLocation } from "react-router-dom";
import "./Navi.css";
import ribumi_logo from "../imgs/ribumi_logo.svg";
import searchIcon from "../imgs/search_icon.svg";

export default function Nav({ className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/login";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="header">
      <div className="logo-header">
        <img alt="Ribumi Logo" src={ribumi_logo} />
      </div>

      {!isAuthPage && <>
        <div className="nav-menu">
          <div className={`nav-item ${location.pathname === "/" ? "nav-active" : ""}`} onClick={() => navigate("/")}>홈</div>
          <div className={`nav-item ${location.pathname === "/main" ? "nav-active" : ""}`} onClick={() => navigate("/main")}>통합장르</div>
          <div className={`nav-item ${location.pathname === "/book" ? "nav-active" : ""}`} onClick={() => navigate("/book")}>도서장르</div>
          <div className={`nav-item ${location.pathname === "/performance" ? "nav-active" : ""}`} onClick={() => navigate("/performance")}>공연장르</div>      
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          {!isHome &&
            <div className="searchContainer">
              <img src={searchIcon} className="searchIcon" alt="검색"/>
              <input type="text" placeholder="     제목, 장르, 지은이 검색" className="searchBox"/>
            </div>
          }  
          <aside className="sideBar">
            <ul>
              <li>
                <span>🤹</span>
                <ul>
                  <li className={`nav-item ${location.pathname === "/mypage" ? "nav-active" : ""}`} onClick={() => navigate("/mypage")}>내 페이지</li>
                  <li className={`nav-item ${location.pathname === "/login" ? "nav-active" : ""}`} onClick={() => navigate("/login")}>로그인</li>
                </ul>
              </li>
            </ul>
          </aside>
        </div>
      </>}
    </div>
  );
}