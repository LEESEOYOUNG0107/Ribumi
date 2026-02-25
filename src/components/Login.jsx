import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login(){
    const [loginData, setLoginData] = useState({userId: "", password: ""});
    const nav = useNavigate();

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
        <div>
            <h2 className="mb-4 text-center">로그인</h2>
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <input type="text" placeholder="아이디" onChange={(e) => setLoginData({...loginData, userId: e.target.value})} />
                </div>

                <div className="mb-3">
                    <input type="password" placeholder="비밀번호" onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
                </div>

                <button type="submit" className="btn btn-success w-100">로그인</button>
            </form>
        </div>
    );
}