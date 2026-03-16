import { useNavigate, useLocation } from "react-router-dom";
import "./Navi.css";
import ribumi_logo from "../imgs/ribumi_logo.svg";
import searchIcon from "../imgs/search_icon.svg";

export default function Nav({ className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="header">
      <div className="logo-header">
        <img alt="Ribumi Logo" src={ribumi_logo} />
      </div>

      <div className="nav-menu">
        <div className={`nav-item ${location.pathname === "/" ? "nav-active" : ""}`} onClick={() => navigate("/")}>홈</div>
        <div className={`nav-item ${location.pathname === "/main" ? "nav-active" : ""}`} onClick={() => navigate("/main")}>통합장르</div>
        <div className={`nav-item ${location.pathname === "/book" ? "nav-active" : ""}`} onClick={() => navigate("/book")}>도서장르</div>
        <div className={`nav-item ${location.pathname === "/performace" ? "nav-active" : ""}`} onClick={() => navigate("/performance")}>공연장르</div>
        <div className="nav-item">내 페이지</div>
      </div>

      {!isHome &&
        <div className="searchContainer">
          <img src={searchIcon} className="searchIcon" alt="검색"/>
          <input type="text" placeholder="  제목, 장르, 지은이 검색" className="searchBox"/>
        </div>
      }  
    </div>
  );
}