import { useNavigate, useLocation } from "react-router-dom";
import "./Navi.css";
import ribumi_logo from "../imgs/ribumi_logo.svg";

export default function Nav({ className }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="header">
      <div className="logo-header">
        <img alt="Ribumi Logo" src={ribumi_logo} />
      </div>
      

      <div className="nav-menu">
        <div className={`nav-item ${location.pathname === "/" ? "nav-active" : ""}`} onClick={() => navigate("/")}>홈</div>
        <div className={`nav-item ${location.pathname === "/main" ? "nav-active" : ""}`} onClick={() => navigate("/main")}>통합장르</div>
        <div className="nav-item">도서장르</div>
        <div className="nav-item">내 페이지</div>
      </div>
    </div>
  );
}