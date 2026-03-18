import { useState } from "react";
import axios from "axios";
import Nav from "./Navi";
import Footer from "./Footer";

export default function Login(){
    const [loginData, setLoginData] = useState({userId: "", password: ""});
    

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.post("/auth/login", loginData);
            //localStorage.setItem("token", res.data.token);
            alert("로그인 성공!");
            nav("/"); // 메인 페이지로 이동
        } catch (err) {
            alert("아이디 또는 비밀번호가 틀렸습니다.");
        }
    }
    return(
        <div className="frame mainWrapper">
            <Nav/>
            <h2 className="mb-4 text-center">로그인</h2>
            
            <Footer />
        </div>
    );
}