import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import "./Signup.css";
import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";

export default function Signup() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    const trimmedId = id.trim();

    // 아이디 유효성 검사
    const idRegex = /^[a-zA-Z0-9]{5,}$/;
    if (!idRegex.test(trimmedId)) {
      alert("아이디는 영문 5자 이상이어야 합니다.");
      return;
    }

    // 비밀번호 유효성 검사
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!pwRegex.test(pw)) {
      alert("비밀번호는 최소 8자 이상이며, 영문과 숫자를 포함해야 합니다.");
      return;
    }

    // 비밀번호 확인
    if (pw !== pwConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 기존 아이디 중복 체크
    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", trimmedId);

    if (selectError) {
      alert("서버 조회 실패: " + selectError.message);
      return;
    }

    if (existing && existing.length > 0) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }

    // 비밀번호 해싱
    const hashedPw = bcrypt.hashSync(pw, 10);

    // 회원가입
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([{ id: trimmedId, password: hashedPw }]);

    if (insertError) {
      alert("회원가입 실패: " + insertError.message);
    } else {
      alert("회원가입 성공!");
      navigate("/login");
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

      {/* 회원가입 카드 */}
      <div className="authCard signup">
        {/* 아이디 */}
        <div className="signupField">
          <label className="signupLabel">아이디</label>
          <p className="signupDesc">영문 5자 이상의 아이디를 입력해주세요</p>
          <div className="authInputGroup">
            <input
              type="text"
              placeholder="아이디 입력"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="authInput"
            />
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="signupField">
          <label className="signupLabel">비밀번호</label>
          <p className="signupDesc">
            영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.
          </p>
          <div className="authInputGroup">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="authInput"
            />
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div className="signupField">
          <label className="signupLabel">비밀번호 확인</label>
          <div className="authInputGroup">
            <input
              type="password"
              placeholder="비밀번호 확인 입력"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              className="authInput"
            />
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <button className="authBtn" onClick={handleSignup}>
          회원가입
        </button>

        {/* 하단 링크 */}
        <div className="authLinks">
          <span className="authLink" onClick={() => navigate("/main")}>
            돌려보기
          </span>
          <span className="authDivider">|</span>
          <span className="authLink" onClick={() => navigate("/login")}>
            로그인
          </span>
        </div>
      </div>
    </div>
  );
}
