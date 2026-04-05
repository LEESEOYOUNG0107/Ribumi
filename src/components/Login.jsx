import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ribumi_logo from "../imgs/logo2.png";
import "./Login.css";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("profiles") // users 테이블 사용
      .select("*")
      .eq("id", id.trim())
      .eq("password", pw); // 나중에 해싱 적용 필요

    if (error) {
      console.error("로그인 조회 에러:", error);
      alert("서버 조회 실패");
      return;
    }

    if (data && data.length > 0) {
      alert("로그인 성공!");
      // 로그인 세션 처리 (예: localStorage, Context 등)
      navigate("/main");
    } else {
      alert("아이디 또는 비밀번호가 틀립니다.");
    }
  };

  return (
    <div className="authWrapper">
      {/* 배경 그라디언트 */}
      <div className="authBg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1920"
          height="742"
          viewBox="0 0 1920 742"
          fill="none"
        >
          <g filter="url(#filter0_f_306_5056)">
            <path
              d="M334.763 248.695C145.545 266.812 -58 144.237 -58 144.237V742H1978L1978 157.731C1978 157.731 1740.35 441.92 1496.07 412.13C1270.8 384.659 1180.27 98.5914 949.388 81.2615C718.511 63.9315 523.982 230.578 334.763 248.695Z"
              fill="url(#paint0_linear_306_5056)"
              fillOpacity="0.82"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_306_5056"
              x="-138"
              y="0"
              width="2196"
              height="822"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              {" "}
              {/* ✅ color-interpolation-filters → colorInterpolationFilters */}
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="40"
                result="effect1_foregroundBlur_306_5056"
              />
            </filter>
            <linearGradient
              id="paint0_linear_306_5056"
              x1="953.056"
              y1="89.6251"
              x2="953.056"
              y2="741.999"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1E2A78" />
              <stop offset="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 로그인 카드 */}
      <div className="authCard">
        <img src={ribumi_logo} alt="ribumi" className="authLogo" />

        {/* 입력 필드 */}
        <div className="authInputGroup">
          <input
            type="text"
            placeholder="아이디 입력"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="authInput"
          />
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="authInput"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* 로그인 버튼 */}
        <button className="authBtn" onClick={handleLogin}>
          {" "}
          로그인{" "}
        </button>

        {/* 하단 링크 */}
        <div className="authLinks">
          <span className="authLink" onClick={() => navigate("/main")}>
            {" "}
            돌려보기{" "}
          </span>
          <span className="authDivider">|</span>
          <span className="authLink" onClick={() => navigate("/signup")}>
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}
