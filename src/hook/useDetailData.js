import { useEffect, useState } from "react";
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const ALADIN_KEY = import.meta.env.VITE_ALADIN_KEY;
const KOPIS_KEY = import.meta.env.VITE_KOPIS_KEY;

const keywordMap = {
    "선재 업고 튀어": { keyword: "내일의 으뜸", exact: false },
    "내일의 으뜸": { keyword: "선재 업고 튀어", exact: false },
    "유미의 세포들": { keyword: "유미의 세포들", exact: false },
    "핑거스미스": { keyword: "아가씨", exact: false },
    "아가씨": { keyword: "핑거스미스", exact: false },
    "무빙": { keyword: "무빙", exact: true },
    "이제 곧 죽습니다": { keyword: "이재 곧 죽습니다", exact: false },
    "이재, 곧 죽습니다": { keyword: "이제 곧 죽습니다", exact: false },
    "군체": { keyword: "인사이드 더 플레이: 군체 [서울 신대방]", exact: false },
    "참교육": { keyword: "참교육", exact: true },
    "원더풀스": { keyword: "원더풀스", exact: true },
    "멋진 신세계": { keyword: "멋진 신세계", exact: true },
};

const normalize = (str) =>
    str?.trim().toLowerCase().replace(/[,·\s]+/g, " ") ?? "";

async function fetchTmdbDetail(itemId, mediaType) {
    const [detailRes, creditsRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${mediaType}/${itemId}?api_key=${TMDB_KEY}&language=ko-KR`),
        fetch(`https://api.themoviedb.org/3/${mediaType}/${itemId}/credits?api_key=${TMDB_KEY}&language=ko-KR`),
    ]);

    const detailData = await detailRes.json();
    const creditsData = await creditsRes.json();
    const director = creditsData.crew?.find(p => p.job === "Director" || p.job === "Executive Producer")?.name || "";
    const writer = creditsData.crew?.find(p => ["Writer", "Screenplay", "Original Story", "Author"].includes(p.job) || p.department === "Writing")?.name || "";
    const cast = creditsData.cast?.slice(0, 4).map(p => p.name).join(", ") || "";

    return {
        id: String(itemId), _type: mediaType,
        title: detailData.title || detailData.name,
        poster: detailData.poster_path ? `https://image.tmdb.org/t/p/w500${detailData.poster_path}` : null,
        genre: detailData.genres?.map(g => g.name).join(" · ") || "",
        releaseDate: detailData.release_date || detailData.first_air_date || "",
        overview: detailData.overview || "",
        rating: detailData.vote_average ? detailData.vote_average.toFixed(1) : "0.0",
        voteCount: detailData.vote_count?.toLocaleString() || "0",
        director, writer, cast,
    };
}

async function fetchBookDetail(itemId) {
    const res = await fetch(
        `/aladin/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_KEY}&itemIdType=ISBN13&ItemId=${itemId}&output=js&Version=20131101&OptResult=description`
    );

    const data = await res.json();
    const book = data.item?.[0];
    if (!book) return null;

    const formattedAuthor = book.author
        ? book.author.replaceAll("(지은이)", "지음").replaceAll("(옮긴이)", "옮김") : "";

    return {
        id: String(itemId),
        _type: "book",
        title: book.title,
        poster: book.cover?.replace("/coversum/", "/cover500/") || null,
        genre: book.categoryName?.split(">")[1] || "도서",
        releaseDate: book.pubDate || "",
        overview: book.description || book.fullDescription || "",
        rating: book.customerReviewRank ? book.customerReviewRank.toFixed(1) : "0.0",
        voteCount: "0",
        extra: {
            author: formattedAuthor,
            publisher: book.publisher || ""
        }
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

async function fetchMediaRelatedWorks(queryTitle, currentId, mainItem) {
    let results = [];

    const mapped = keywordMap[queryTitle];
    const searchKeyword = mapped ? mapped.keyword : queryTitle;
    const exactMatch = mapped ? mapped.exact : false;

    const isMatch = (title) => {
        if (!exactMatch) return true;
        const cleanTitle = normalize(title);
        const cleanQuery = normalize(searchKeyword);

        if (cleanTitle === cleanQuery) return true;
        const regex = new RegExp(`^${cleanQuery}\\s+([0-9]|세트|시즌|파트|권|부|vol|part).*`, "i");
        return regex.test(cleanTitle);
    };

    try {
        const [tmdbRes, aladinRes, kopisRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(searchKeyword)}&language=ko-KR`),
            fetch(`/aladin/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_KEY}&Query=${encodeURIComponent(searchKeyword)}&QueryType=Keyword&MaxResults=5&start=1&SearchTarget=Book&output=js&Version=20131101`),
            fetch(`/kopis/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=20200101&eddate=20261231&cpage=1&rows=5&shprfnm=${encodeURIComponent(searchKeyword)}`),
        ]);

        const tmdbData = await tmdbRes.json();
        if (tmdbData.results) {
            results = [...results, ...tmdbData.results
                .filter(r =>
                    (r.media_type === "movie" || r.media_type === "tv") &&
                    r.poster_path &&
                    isMatch(r.title || r.name)
                )
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
            results = [...results, ...aladinData.item
                .filter(b => {
                    if (!isMatch(b.title)) return false;

                    if (exactMatch && mainItem) {
                        const combinedMainCreators = `${mainItem.extra?.author || ""} ${mainItem.writer || ""} ${mainItem.director || ""}`.toLowerCase();
                        const cleanBAuthor = (b.author || "").replace(/지음|옮김|\(지은이\)|\(옮긴이\)/g, "").toLowerCase();

                        if (normalize(b.title) === normalize(searchKeyword)) return true;

                        const names = cleanBAuthor.split(/[,\s·]+/).filter(n => n.length >= 2);
                        return names.some(name => combinedMainCreators.includes(name));
                    }
                    return true;
                })
                .map(b => ({
                    id: String(b.isbn13 || b.itemId), _type: "book",
                    title: b.title,
                    poster: b.cover?.replace("/coversum/", "/cover500/") || null,
                    genre: "원작/연관 도서",
                    releaseDate: b.pubDate || "",
                }))];
        }

        const text = await kopisRes.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        results = [...results, ...Array.from(xml.querySelectorAll("db"))
            .filter(db => isMatch(db.querySelector("prfnm")?.textContent))
            .map(db => ({
                id: db.querySelector("mt20id")?.textContent, _type: "performance",
                title: db.querySelector("prfnm")?.textContent,
                poster: db.querySelector("poster")?.textContent?.replace("http://", "https://"),
                genre: "연관 공연",
                releaseDate: db.querySelector("prfpdfrom")?.textContent,
            }))];
    } catch (error) {
        console.error("관련 작품 교차 검색 중 오류:", error);
    }

    return results.filter(item => String(item.id) !== String(currentId));
}

export default function useDetailData(type, id) {
    const [details, setDetails] = useState(null);
    const [relatedWorks, setRelatedWorks] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    const cleanTitle = (mainItem.title || "")
                        .split(":")[0].split("-")[0]
                        .replace(/대본집|세트|양장본|포토에세이|특별판|[0-9]|권/g, "").trim();

                    const related = await fetchMediaRelatedWorks(cleanTitle, id, mainItem);
                    const seen = new Set();
                    const deduped = related.filter(work => {
                        if (seen.has(work.id)) return false;
                        seen.add(work.id);
                        return true;
                    }).slice(0, 5);

                    // ✅ exact: true인 경우만 제작진 교차검증을 위해 상세 재조회
                    // exact: false이거나 keywordMap에 없는 작품은 교차검색 결과를 그대로 사용
                    const mapped = keywordMap[cleanTitle];
                    const exactMatch = mapped ? mapped.exact : false;

                    let finalRelated;

                    if (exactMatch) {
                        // exact: true → 상세 재조회 후 제작진 교차검증
                        const detailedRelated = await Promise.all(
                            deduped.map(async (work) => {
                                try {
                                    if (work._type === "movie" || work._type === "tv")
                                        return await fetchTmdbDetail(work.id, work._type);
                                    else if (work._type === "book")
                                        return await fetchBookDetail(work.id);
                                    else if (work._type === "performance")
                                        return await fetchPerformanceDetail(work.id);
                                } catch {
                                    return work;
                                }
                            })
                        );

                        const mainCreators = [
                            ...(mainItem.extra?.author ? mainItem.extra.author.replace(/지음|옮김|\(지은이\)|\(옮긴이\)/g, "").split(/[,\s·]+/) : []),
                            ...(mainItem.director ? mainItem.director.split(/[,\s·]+/) : []),
                            ...(mainItem.writer ? mainItem.writer.split(/[,\s·]+/) : [])
                        ].filter(Boolean).map(n => n.toLowerCase().trim());

                        finalRelated = detailedRelated.filter(Boolean).filter(work => {
                            if (normalize(work.title) === normalize(cleanTitle)) return true;

                            const workCreators = [
                                ...(work.extra?.author ? work.extra.author.replace(/지음|옮김|\(지은이\)|\(옮긴이\)/g, "").split(/[,\s·]+/) : []),
                                ...(work.director ? work.director.split(/[,\s·]+/) : []),
                                ...(work.writer ? work.writer.split(/[,\s·]+/) : [])
                            ].filter(Boolean).map(n => n.toLowerCase().trim());

                            return mainCreators.some(name =>
                                workCreators.some(wName => wName.includes(name) || name.includes(wName))
                            );
                        });
                    } else {
                        // exact: false 또는 keywordMap에 없는 작품 → 재조회 없이 바로 사용
                        finalRelated = deduped;
                    }

                    setRelatedWorks(finalRelated);
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