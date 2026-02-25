import { Link, useNavigate } from "react-router-dom";
export default function Navi(){
    const nav = useNavigate();
    return(
        <>
        <div>
            <Link to={"/search"}>[책 검색]</Link>
            <Link to={"/myrecords"}>[내 기록]</Link>
        </div>
        </>
    );
}