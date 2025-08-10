import React from 'react';
import fetch from 'node-fetch';
import axios from 'axios';
import Head from 'next/head';

import { AppContext } from 'lib/context';
import { useMain } from 'lib/swr';
import { WPURL, setLocalStorageData } from 'lib/utils';

import Divider from 'components/ui/Divider/Divider';
import MainSlideshow from 'components/ui/Slideshow/Slideshow';
import NoticeSlideshow from 'components/layout/Main/NoticeSlideshow/NoticeSlideshow';
import CategoryMenu from 'components/layout/Main/CategoryMenu/CategoryMenu';
import SearchSection from 'components/layout/Main/SearchSection/SearchSection';
import BlogSection from 'components/layout/Main/BlogSection/BlogSection';
import BannerSection from 'components/layout/Main/BannerSection/BannerSection';
import BoardSection from 'components/layout/Main/BoardSection/BoardSection';
import FaqSection from 'components/layout/Main/FaqSection/FaqSection';

import Header from 'components/ui/Header/Header';

export default function App( props ) {
    const { data } = useMain( props.data );
    const { location } = React.useContext( AppContext );
    const [ noShadow, setNoShadow] = React.useState (true);
    const { slide, notice, category, blog, board, faq } = data;
    const mainContainerRef = React.createRef();

    React.useEffect( () => {
        const observerOptions = {
            root: null,
            threshold: 0,
            rootMargin: `0px 0px -100% 0px`
        };

        const observer = new IntersectionObserver(entries => {
            if(entries){
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setNoShadow(false);
                    }else{
                        setNoShadow(true);
                    }
                });
            }
        }, observerOptions);

        observer.observe(mainContainerRef.current);

        return () => {
            observer.disconnect();
        }
    }, [] );

    if (location.name === "뭉치고") {
        setLocalStorageData( 'jt-mcg-location', {"area":43,"areaSlug":"%ec%84%9c%ec%9a%b8","lat":false,"lng":false,"name":"서울 전체"} );
    }

    return (
        <>
            { ( faq.length > 0 ) && <Head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: `
                {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        ${ faq.map( item => (
                            JSON.stringify({
                                "@type": "Question",
                                "name": item.question,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": item.answer
                                }
                            })
                        ) ) }
                    ]
                }
                `}}></script>
            </Head> }
            <Header useMenu useLocation useNoShadow={noShadow} title={ location.name } />
            <main className="view">
                <div ref={ mainContainerRef } >
                    { ( slide !== null ) && ( <MainSlideshow posts={ slide } allBtnUrl="/이벤트/" />  ) }
                    { ( notice !== null ) && ( <NoticeSlideshow posts={ notice } /> ) }
                    <CategoryMenu posts={ category } />
                    <SearchSection />
                    { ( blog !== null ) && ( <BlogSection posts={ blog } /> ) }
                    <Divider />
                    <BannerSection />
                    <Divider />
                    { ( faq.length > 0 ) && ( <FaqSection posts={ faq } /> ) }
                    <Divider />
                    { ( board !== null ) && ( <BoardSection posts={ board } /> ) }
                </div>
            </main>
        </>
    );
}

export async function getServerSideProps() {
    // const data = await (await axios.get(`https://moongchigo.com/cmsadmin/wp-json/jt/v1/components/main`, { redirect: 'follow' } )).data;
    const data = await fetch(`${ WPURL }/components/main`).then(res => res.json());

    return {
        props: { data: data ?? null }
    }
}
