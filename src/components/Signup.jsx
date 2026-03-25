import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import "./Signup.css";

export default function Signup() {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();

    const handleSignup = () => {
        console.log("회원가입 시도:", id, pw, pwConfirm, nickname);
    };

    return (
        <div className="authWrapper">
            {/* 배경 그라디언트 */}
            <div className="authBg">
                <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="742" viewBox="0 0 1920 742" fill="none">
                    <g filter="url(#filter0_f_306_5056)">
                        <path d="M334.763 248.695C145.545 266.812 -58 144.237 -58 144.237V742H1978L1978 157.731C1978 157.731 1740.35 441.92 1496.07 412.13C1270.8 384.659 1180.27 98.5914 949.388 81.2615C718.511 63.9315 523.982 230.578 334.763 248.695Z"
                            fill="url(#paint0_linear_306_5056)"
                            fillOpacity="0.82" />
                    </g>
                    <defs>
                        <filter id="filter0_f_306_5056" x="-138" y="0" width="2196" height="822" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">  {/* ✅ color-interpolation-filters → colorInterpolationFilters */}
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur_306_5056" />
                        </filter>
                        <linearGradient id="paint0_linear_306_5056" x1="953.056" y1="89.6251" x2="953.056" y2="741.999" gradientUnits="userSpaceOnUse">
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
                    <p className="signupDesc">영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.</p>
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
                    <span className="authLink" onClick={() => navigate("/main")}>돌려보기</span>
                    <span className="authDivider">|</span>
                    <span className="authLink" onClick={() => navigate("/login")}>로그인</span>
                </div>
            </div>
        </div>
    );
}