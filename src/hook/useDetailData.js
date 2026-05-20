import { useEffect, useState } from "react";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;
const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

const keywordMap = {
    "내일의 으뜸": { keyword: "선재 업고 튀어", exact: false },
    "유미의 세포들": { keyword: "유미의 세포들", exact: false },
    "핑거스미스": { keyword: "아가씨", exact: true },
    "무빙": { keyword: "무빙", exact: true },
};

// ── 개별 상세 fetch 함수들 ──────────────────────────────────────────
async function fetchTmdbDetail(itemId, mediaType) {
    const res = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${itemId}?api_key=${TMDB_KEY}&language=ko-KR`); // TMDB의 압축된 응답을 방지하여 JSON 파싱 오류 해결

    const data = await res.json();
    console.log("TMDB 응답 상태:", res.status);
    console.log("TMDB 데이터:", data);
    return {
        id: String(itemId), _type: mediaType,
        title: data.title || data.name,
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        genre: data.genres?.map(g => g.name).join(" · ") || "",
        releaseDate: data.release_date || data.first_air_date || "",
        overview: data.overview || "",
        rating: data.vote_average ? data.vote_average.toFixed(1) : "0.0",
        voteCount: data.vote_count?.toLocaleString() || "0",
    };
}

async function fetchBookDetail(itemId) {
    const res = await fetch(
        `/aladin/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_KEY}&itemIdType=ISBN13&ItemId=${itemId}&output=js&Version=20131101&OptResult=description`
    );
    const data = await res.json();
    const book = data.item?.[0];
    if (!book) return null;
    return {
        id: String(itemId), _type: "book",
        title: book.title,
        poster: book.cover?.replace("/coversum/", "/cover500/") || null,
        genre: book.categoryName?.split(">")[1] || "도서",
        releaseDate: book.pubDate || "",
        overview: book.description || book.fullDescription || "",
        rating: book.customerReviewRank ? book.customerReviewRank.toFixed(1) : "0.0",
        voteCount: "0",
    };
}

async function fetchPerformanceDetail(itemId) {
    const res = await fetch(`/kopis/openApi/restful/pblprfr/${itemId}?service=${KOPIS_KEY}`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const db = xml.querySelector("db");
    if (!db) return null;
    return {
        id: String(itemId), _type: "performance",
        title: db.querySelector("prfnm")?.textContent || "",
        poster: db.querySelector("poster")?.textContent?.replace("http://", "https://") || null,
        genre: db.querySelector("genrenm")?.textContent || "공연",
        releaseDate: db.querySelector("prfpdfrom")?.textContent || "",
        overview: db.querySelector("sty")?.textContent || "상세 정보 없음",
        rating: "0.0", voteCount: "0",
    };
}

async function fetchMediaRelatedWorks(queryTitle, currentId, isExactMatch) {
    let results = [];
    try {
        const [tmdbRes, aladinRes, kopisRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(queryTitle)}&language=ko-KR`),
            fetch(`/aladin/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(queryTitle)}&QueryType=Keyword&MaxResults=5&start=1&SearchTarget=Book&output=js&Version=20131101`),
            fetch(`/kopis/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=20200101&eddate=20261231&cpage=1&rows=5&shprfnm=${encodeURIComponent(queryTitle)}`),
        ]);

        const tmdbData = await tmdbRes.json();
        if (tmdbData.results) {
            results = [...results, ...tmdbData.results
                .filter(r => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path)
                .map(r => ({
                    id: String(r.id), _type: r.media_type,
                    title: r.title || r.name,
                    poster: `https://image.tmdb.org/t/p/w500${r.poster_path}`,
                    genre: r.media_type === "movie" ? "연관 영화" : "연관 드라마",
                    releaseDate: r.release_date || r.first_air_date || "",
                }))];
        }

        const aladinData = await aladinRes.json();
        if (aladinData.item) {
            results = [...results, ...aladinData.item.map(b => ({
                id: String(b.isbn13 || b.itemId), _type: "book",
                title: b.title,
                poster: b.cover?.replace("/coversum/", "/cover500/") || null,
                genre: "원작/연관 도서",
                releaseDate: b.pubDate || "",
            }))];
        }

        const text = await kopisRes.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        results = [...results, ...Array.from(xml.querySelectorAll("db")).map(db => ({
            id: db.querySelector("mt20id")?.textContent, _type: "performance",
            title: db.querySelector("prfnm")?.textContent,
            poster: db.querySelector("poster")?.textContent?.replace("http://", "https://"),
            genre: "연관 공연",
            releaseDate: db.querySelector("prfpdfrom")?.textContent,
        }))];

    } catch (error) {
        console.error("관련 작품 교차 검색 중 오류:", error);
    }

    let finalResults = results.filter(item => String(item.id) !== String(currentId));
    if (isExactMatch) {
        finalResults = finalResults.filter(item => item.title === queryTitle);
    }
    return finalResults;
}

// ── 커스텀 훅 ────────────────────────────────────────────────────────
export default function useDetailData(type, id) {
    const [details, setDetails] = useState(null);
    const [relatedWorks, setRelatedWorks] = useState([]);
    const [loading, setLoading] = useState(true);


    console.log("TMDB KEY:", TMDB_KEY);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            window.scrollTo(0, 0);
            try {
                let mainItem = null;
                if (type === "movie" || type === "tv") mainItem = await fetchTmdbDetail(id, type);
                else if (type === "book") mainItem = await fetchBookDetail(id);
                else if (type === "performance") mainItem = await fetchPerformanceDetail(id);

                if (mainItem) {
                    setDetails(mainItem);

                    let cleanTitle = (mainItem.title || "")
                        .split(":")[0].split("-")[0]
                        .replace(/대본집|세트|양장본|포토에세이|특별판|[0-9]|권/g, "")
                        .trim();
                    let isExactMatch = false;

                    for (const [bookTitle, data] of Object.entries(keywordMap)) {
                        if (cleanTitle.includes(bookTitle)) {
                            cleanTitle = data.keyword;
                            isExactMatch = data.exact;
                            break;
                        }
                    }

                    const related = await fetchMediaRelatedWorks(cleanTitle, id, isExactMatch);
                    setRelatedWorks(related);
                }
            } catch (e) {
                console.error("데이터 로딩 실패", e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, type]);

    return { details, relatedWorks, loading };
}