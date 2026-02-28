import { useNavigate } from "react-router-dom";
import "./Navi.css";
import ribumi_logo from "../imgs/ribumi_logo.svg";

export default function Nav({ className }) {
  const navigate = useNavigate();

  return (
    <div className="header">
        <div className="logo-header">
        <div className="logo-header-inner">
          <img alt="Ribumi Logo" src={ribumi_logo} />
        </div>
      </div>
      
      {/* 메뉴 영역 */}
      <div className="nav-menu">
        <div className="nav-item" onClick={() => navigate("/")}>홈</div>
        <div className="nav-item" onClick={() => navigate("/main")}>통합장르</div>
        <div className="nav-item">도서장르</div>
        <div className="nav-item">내 페이지</div>
      </div>
    </div>
  );
}