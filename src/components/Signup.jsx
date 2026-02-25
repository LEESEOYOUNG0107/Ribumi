import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup(){
    const [formData, setFormData] = useState({
        userId: "",
        password: "",
        userName: "",
    });
    const nav = useNavigate();

    const handleChange = (e) => { // 입력값이 바뀔 때마다 상태 업데이트
        setFormData({
            ...formData, [e.target.name]: e.target.value,
        });
    };

    const handleSingup = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.post("/auth/users", formData);
            if(res.status === 200){
                alert("회원가입 성공! 로그인해 주세요.");
                nav("/login");
            }
        }catch(err){
            console.error("회원가입 실패: ", err);
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return(
        <div>
            <div className="container mt-5" style={{ maxWidth: "400px" }}>
                <h2 className="mb-4 text-center">회원가입</h2>
                <form onSubmit={handleSignup}>
                    <div className="mb-3">
                        <label className="form-label">아이디</label>
                        <input type="text" name="userId" className="form-control" onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">비밀번호</label>
                        <input type="password" name="password" className="form-control" onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">이름</label>
                        <input type="text" name="userName" className="form-control" onChange={handleChange} required />
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-100">가입하기</button>
                </form>
            </div>
        </div>
    );
}