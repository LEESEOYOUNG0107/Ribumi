import "./Footer.css";
import ribumi_logo from "../imgs/ribumi_logo.svg";

export default function Footer() {
  return (
    <div className="footer-container">
      <hr/>
      <img src={ribumi_logo} alt="Ribumi Logo" />
      <div className="footer-links">
        <a href="https://www.e-mirim.hs.kr/main.do">학교정보공개</a>|
        <a href="">작성자저작권정보</a>|
        <a href="">개인정보처리방침</a>
      </div>
      
      <div className="footer-contact">
        <span>개발자: 이서영 E-mail: s2446@e-mirim.hs.kr</span> | <span>디자이너: 김설애 E-mail: d2402@e-mirim.hs.kr</span>
      </div>
            
      <div className="footer-address"> 서울특별시 관악구 호암로 546 미림마이스터고등학교 </div>        
    </div>
  );
}