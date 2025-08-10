require("dotenv").config();

const express = require("express");
const next = require("next");
const compression = require("compression");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

// 뭉치고 azure 에서 UNABLE_TO_VERIFY_LEAF_SIGNATURE 오류를 위해 추가
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const jt_encodeURI = (url) => encodeURI(decodeURI(url));
const generateSitemapXML = (data) =>
    [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
        data.map((item) => `<url><loc>${encodeURI(item.url)}</loc><lastmod>${item.created}</lastmod></url>`).join(""),
        `</urlset>`,
    ].join("");

const shouldCompress = (req, res) => {
    if (req.headers["x-no-compression"]) {
        return false;
    }

    return compression.filter(req, res);
};

app.prepare()
    .then(() => {
        const server = express();

        server.use(compression({ filter: shouldCompress }));

        // url 뒤에 / 강제로 추가 없으면 / 추가하여 리다이렉트
        server.use((req, res, next) => {
            const testUrl = new RegExp(/\?[^]*]\//);
            if (req.url.includes(".")) {
                next();
            } else if (req.url.endsWith("/") || req.url.length === 0 || testUrl.test(req.url)) {
                next();
            } else {
                const [url, query] = req.url.split("?");
                if (url.endsWith("/") || url.length === 0 || testUrl.test(url)) {
                    next();
                } else {
                    res.redirect(301, `${url}/${query ? `?${query}` : ""}`);
                }
            }
        });

        server.get("/", (req, res) => {
            try {
                if (req.query.preview === "true" && parseInt(req.query.p) > 0) {
                    if (req.query.post_type === "notice") {
                        app.render(req, res, "/notice/[slug]", { slug: req.query.p, preview_id: req.query.p });
                    } else if (req.query.post_type === "blog") {
                        app.render(req, res, "/blog/[slug]", { slug: req.query.p, preview_id: req.query.p });
                    } else if (req.query.post_type === "event") {
                        app.render(req, res, "/event/[slug]", { slug: req.query.p, preview_id: req.query.p });
                    } else if (req.query.post_type === "shop") {
                        app.render(req, res, "/shop/[slug]", { slug: req.query.p, preview_id: req.query.p });
                    }
                } else {
                    app.render(req, res, "/", {});
                }
            } catch (e) {
                app.render(req, res, "/", {});
            }
        });

        // 모달로 리팩토링
        // server.get(jt_encodeURI("/my-뭉치고"), (req, res) => {
        //     app.render(req, res, "/menu", {});
        // });

        server.get(jt_encodeURI("/검색"), (req, res) => {
            app.render(req, res, "/search", { search: req.query.search });
        });

        server.get("/search", (req, res) => {
            return res.redirect(301, "/검색");
        });

        server.get(jt_encodeURI("/회사소개"), (req, res) => {
            app.render(req, res, "/company", {});
        });

        server.get("/company", (req, res) => {
            return res.redirect(301, "/회사소개");
        });

        server.get(jt_encodeURI("/이용약관"), (req, res) => {
            app.render(req, res, "/terms/usage", {});
        });

        server.get("/terms/usage", (req, res) => {
            return res.redirect(301, "/이용약관");
        });

        server.get(jt_encodeURI("/이용약관/seamless"), (req, res) => {
            app.render(req, res, "/terms/usage", {});
        });

        server.get(jt_encodeURI("/위치기반서비스-이용약관"), (req, res) => {
            app.render(req, res, "/terms/location", {});
        });

        server.get("/terms/location", (req, res) => {
            return res.redirect(301, "/위치기반서비스-이용약관");
        });

        server.get(jt_encodeURI("/위치기반시버스-이용약관/seamless"), (req, res) => {
            app.render(req, res, "/terms/location", {});
        });

        server.get(jt_encodeURI("/개인정보처리방침"), (req, res) => {
            app.render(req, res, "/terms/privacy", {});
        });

        server.get("/terms/privacy", (req, res) => {
            return res.redirect(301, "/개인정보처리방침");
        });

        server.get(jt_encodeURI("/개인정보처리방침/seamless"), (req, res) => {
            app.render(req, res, "/terms/privacy", {});
        });

        server.get(jt_encodeURI("/개인정보수집및이용"), (req, res) => {
            app.render(req, res, "/terms/personal", {});
        });

        server.get("/terms/personal", (req, res) => {
            return res.redirect(301, "/개인정보수집및이용");
        });

        server.get(jt_encodeURI("/개인정보수집및이용/seamless"), (req, res) => {
            app.render(req, res, "/terms/personal", {});
        });

        // 공지사항
        server.get(jt_encodeURI("/공지사항"), (req, res) => {
            app.render(req, res, "/notice", {});
        });

        server.get("/notice", (req, res) => {
            return res.redirect(301, req.originalUrl.replace("notice", "공지사항"));
        });

        server.get(jt_encodeURI("/공지사항/:slug"), (req, res) => {
            app.render(req, res, "/notice/[slug]", { ...req.params, ...req.query });
        });

        server.get("/notice/:slug", (req, res) => {
            return res.redirect(301, `/공지사항/${req.params.slug}`);
        });

        server.get(jt_encodeURI("/공지사항/:slug/amp"), (req, res) => {
            return res.redirect(
                301,
                req.originalUrl
                    .split("/")
                    .filter((item) => item !== "amp")
                    .join("/")
            );
            // app.render(req, res, "/notice/[slug]/amp", { slug: jt_encodeURI(req.params.slug) });
        });

        // 이벤트
        server.get(jt_encodeURI("/이벤트"), (req, res) => {
            app.render(req, res, "/event", {});
        });

        server.get("/event", (req, res) => {
            return res.redirect(301, "/이벤트");
        });

        server.get(jt_encodeURI("/이벤트/:slug"), (req, res) => {
            app.render(req, res, "/event/[slug]", { ...req.params, ...req.query });
        });

        server.get("/event/:slug", (req, res) => {
            return res.redirect(301, `/이벤트/${req.params.slug}`);
        });

        server.get(jt_encodeURI("/이벤트/:slug/amp"), (req, res) => {
            return res.redirect(
                301,
                req.originalUrl
                    .split("/")
                    .filter((item) => item !== "amp")
                    .join("/")
            );
            // app.render(req, res, "/event/[slug]/amp", { slug: jt_encodeURI(req.params.slug) });
        });

        // 블로그
        server.get(jt_encodeURI("/뭉치고-블로그"), (req, res) => {
            app.render(req, res, "/blog", {});
        });

        server.get("/blog", (req, res) => {
            return res.redirect(301, "/뭉치고-블로그");
        });

        server.get(jt_encodeURI("/뭉치고-블로그/:slug"), (req, res) => {
            app.render(req, res, "/blog/[slug]", { ...req.params, ...req.query });
        });

        server.get("/blog/:slug", (req, res) => {
            return res.redirect(301, `/뭉치고-블로그/${req.params.slug}`);
        });

        server.get(jt_encodeURI("/뭉치고-블로그/:slug/amp"), (req, res) => {
            return res.redirect(
                301,
                req.originalUrl
                    .split("/")
                    .filter((item) => item !== "amp")
                    .join("/")
            );
            // app.render(req, res, "/blog/[slug]/amp", { slug: jt_encodeURI(req.params.slug) });
        });

        // 1:1 문의
        server.get(jt_encodeURI("/문의하기"), (req, res) => {
            app.render(req, res, "/inquiry/form", { ...req.params, ...req.query });
        });

        server.get("/inquiry/form", (req, res) => {
            return res.redirect(301, "/문의하기");
        });

        server.get(jt_encodeURI("/나의-문의내역"), (req, res) => {
            app.render(req, res, "/inquiry/list", {});
        });

        server.get("/inquiry/list", (req, res) => {
            return res.redirect(301, "/나의-문의내역");
        });

        server.get(jt_encodeURI("/나의-문의내역/:slug"), (req, res) => {
            app.render(req, res, "/inquiry/[slug]", { ...req.params, ...req.query });
        });

        server.get("/inquiry/:slug", (req, res) => {
            return res.redirect(301, `/나의-문의내역/${req.params.slug}`);
        });

        // 제휴문의
        server.get(jt_encodeURI("/제휴문의"), (req, res) => {
            app.render(req, res, "/partnership", {});
        });

        server.get("/partnership", (req, res) => {
            return res.redirect(301, "/제휴문의");
        });

        server.get(jt_encodeURI("/제휴문의/계산기"), (req, res) => {
            app.render(req, res, "/partnership/calculator", {});
        });

        server.get("/partnership/calculator", (req, res) => {
            return res.redirect("/제휴문의/계산기");
        });

        server.get(jt_encodeURI("/제휴문의/신청"), (req, res) => {
            app.render(req, res, "/partnership/form", {});
        });

        server.get("/partnership/form", (req, res) => {
            return res.redirect("/제휴문의/신청");
        });

        server.get(jt_encodeURI("/입금안내/:slug"), (req, res) => {
            app.render(req, res, "/partnership/[slug]", { slug: jt_encodeURI(req.params.slug) });
        });

        server.get("/partnership/:slug", (req, res) => {
            return res.redirect(301, `/입금안내/${req.params.slug}`);
        });

        // 회원
        server.get(jt_encodeURI("/로그인"), (req, res) => {
            app.render(req, res, "/member/login", {});
        });

        server.get("/member/login", (req, res) => {
            return res.redirect("/로그인");
        });

        server.get(jt_encodeURI("/회원가입"), (req, res) => {
            app.render(req, res, "/member/regist", {});
        });

        server.get("/member/regist", (req, res) => {
            return res.redirect("/회원가입");
        });

        server.get(jt_encodeURI("/내-정보-수정"), (req, res) => {
            app.render(req, res, "/member/profile", {});
        });

        server.get("/member/profile", (req, res) => {
            return res.redirect("/내-정보-수정");
        });

        server.get(jt_encodeURI("/회원탈퇴"), (req, res) => {
            app.render(req, res, "/member/withdraw", {});
        });

        server.get("/member/withdraw", (req, res) => {
            return res.redirect("/회원탈퇴");
        });

        // 샵
        server.get(jt_encodeURI("/찜한샵"), (req, res) => {
            app.render(req, res, "/zzimlist", {});
        });

        server.get("/zzimlist", (req, res) => {
            return res.redirect("/찜한샵");
        });

        server.get(jt_encodeURI("/지역기반/:area"), (req, res) => {
            app.render(req, res, "/shoplist/area/[area]/[category]", { ...req.params, ...req.query });
        });

        server.get("/shoplist/area/:area", (req, res) => {
            return res.redirect(301, `/지역기반/${req.params.area}`);
        });

        // 2023-03-24 샵 카테고리 변경으로 인해 리다이렉트 추가
        server.get(jt_encodeURI("/지역기반/:area/1인샵-스웨디시"), (req, res) => {
            return res.redirect(301, `/지역기반/${req.params.area}/스웨디시`);
        });

        server.get(jt_encodeURI("/지역기반/:area/1인샵-왁싱"), (req, res) => {
            return res.redirect(301, `/지역기반/${req.params.area}/왁싱`);
        });

        server.get(jt_encodeURI("/지역기반/:area/1인샵-에스테틱"), (req, res) => {
            return res.redirect(301, `/지역기반/${req.params.area}/에스테틱`);
        });

        server.get(jt_encodeURI("/지역기반/:area/:category"), (req, res) => {
            app.render(req, res, "/shoplist/area/[area]/[category]", { ...req.params, ...req.query });
        });

        server.get("/shoplist/area/:area/:category", (req, res) => {
            return res.redirect(301, `/지역기반/${req.params.area}/${req.params.category}`);
        });

        server.get(jt_encodeURI("/위치기반"), (req, res) => {
            app.render(req, res, "/shoplist/location/[category]", { ...req.params, ...req.query });
        });

        server.get("/shoplist/location", (req, res) => {
            return res.redirect(301, "/위치기반");
        });

        server.get(jt_encodeURI("/위치기반/:category"), (req, res) => {
            app.render(req, res, "/shoplist/location/[category]", { ...req.params, ...req.query });
        });

        server.get("/shoplist/location/:category", (req, res) => {
            return res.redirect(301, `/위치기반/${req.params.category}`);
        });

        server.get(jt_encodeURI("/샵/:slug"), (req, res) => {
            app.render(req, res, "/shop/[slug]", { ...req.params, ...req.query });
        });

        server.get("/shop/:slug", (req, res) => {
            return res.redirect(301, `/샵/${req.params.slug}`);
        });

        server.get(jt_encodeURI("/샵/:slug/amp"), (req, res) => {
            return res.redirect(
                301,
                req.originalUrl
                    .split("/")
                    .filter((item) => item !== "amp")
                    .join("/")
            );
            // app.render(req, res, "/shop/[slug]/amp", { ...req.params, ...req.query });
        });

        server.get(jt_encodeURI("/샵/:slug/정보-수정요청"), (req, res) => {
            app.render(req, res, "/shop/[slug]/modify", { slug: jt_encodeURI(req.params.slug) });
        });

        server.get("/shop/:slug/modify", (req, res) => {
            return res.redirect(301, `/샵/${req.params.slug}/정보-수정요청`);
        });

        server.get(jt_encodeURI("/샵/:slug/후기작성"), (req, res) => {
            app.render(req, res, "/shop/[slug]/review", { slug: jt_encodeURI(req.params.slug) });
        });

        server.get("/shop/:slug/review", (req, res) => {
            return res.redirect(301, `/샵/${req.params.slug}/후기작성`);
        });

        server.get(jt_encodeURI("/샵/:slug/후기수정/:id"), (req, res) => {
            app.render(req, res, "/shop/[slug]/review/[id]", { slug: jt_encodeURI(req.params.slug), id: req.params.id });
        });

        server.get("/shop/:slug/review/:id", (req, res) => {
            return res.redirect(301, `/샵/${req.params.slug}/후기수정/${req.params.id}`);
        });

        server.get(jt_encodeURI("/샵/:slug/모두보기"), (req, res) => {
            app.render(req, res, "/shop/[slug]/image", { slug: jt_encodeURI(req.params.slug) });
        });

        server.get("/shop/:slug/image", (req, res) => {
            return res.redirect(301, `/샵/${req.params.slug}/모두보기`);
        });

        // 후기
        server.get(jt_encodeURI("/후기관리"), (req, res) => {
            app.render(req, res, "/review", {});
        });

        server.get("/review", (req, res) => {
            return res.redirect(301, "/후기관리");
        });

        server.get(jt_encodeURI("/후기관리/:id"), (req, res) => {
            app.render(req, res, "/review/modify/[id]", { id: parseInt(req.params.id) });
        });

        server.get("/review/modify/:id", (req, res) => {
            return res.redirect(301, `/후기관리/${req.params.id}`);
        });

        server.get(jt_encodeURI("/사용자-후기-모아보기/:author"), (req, res) => {
            app.render(req, res, "/review/[author]", { author: jt_encodeURI(req.params.author) });
        });

        server.get("/review/:author", (req, res) => {
            return res.redirect(301, `/사용자-후기-모아보기/${req.params.author}`);
        });

        // next.js pages 구조와 같을 경우 필요없어서 주석으로 보관
        // server.get(jt_encodeURI("/sitemap/:category"), (req, res) => {
        //     app.render(req, res, "/sitemap/[category]", { ...req.params, ...req.query });
        // });

        server.get("/sitemap/:category", (req, res) => {
            return res.redirect(301, `/sitemap/area/${req.params.category}`);
        });

        server.get("/sitemap.xml", async (req, res) => {
            try {
                const data = await fetch(`${process.env.DOMAIN}/cmsadmin/wp-json/jt/v1/components/sitemap/base`).then((res) => res.json());

                if (Array.isArray(data) && data.length > 0) {
                    res.setHeader("Content-type", "text/xml; charset=utf-8");
                    res.send(
                        [
                            '<?xml version="1.0" encoding="UTF-8"?>',
                            '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                            data.map((item) => `<sitemap><loc>${item}</loc></sitemap>`).join(""),
                            "</sitemapindex>",
                        ].join("")
                    );
                }

                throw new Error();
            } catch (e) {
                res.status(404).end();
            }
        });

        server.get("/sitemap-location-:category.xml", async (req, res) => {
            try {
                const data = await fetch(`${process.env.DOMAIN}/cmsadmin/wp-json/jt/v1/components/sitemap?type=location&category=${req.params.category}`).then((res) => res.json());

                if (Array.isArray(data)) {
                    res.setHeader("Content-type", "text/xml; charset=utf-8");
                    res.send(generateSitemapXML(data));
                }
                throw new Error();
            } catch (e) {
                res.status(404).end();
            }
        });

        server.get("/sitemap-metro-:category.xml", async (req, res) => {
            try {
                const data = await fetch(`${process.env.DOMAIN}/cmsadmin/wp-json/jt/v1/components/sitemap?type=metro&category=${req.params.category}`).then((res) => res.json());

                if (Array.isArray(data) && data.length > 0) {
                    res.setHeader("Content-type", "text/xml; charset=utf-8");
                    res.send(generateSitemapXML(data));
                }

                throw new Error();
            } catch (e) {
                res.status(404).end();
            }
        });

        server.get("/sitemap-:slug.xml", async (req, res) => {
            try {
                const data = await fetch(`${process.env.DOMAIN}/cmsadmin/wp-json/jt/v1/components/sitemap?type=${req.params.slug}`).then((res) => res.json());

                if (Array.isArray(data) && data.length > 0) {
                    res.setHeader("Content-type", "text/xml; charset=utf-8");
                    res.send(generateSitemapXML(data));
                }
                throw new Error();
            } catch (e) {
                res.status(404).end();
            }
        });

        server.all("*", (req, res) => handle(req, res));

        server.listen(port, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
        });
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    });
