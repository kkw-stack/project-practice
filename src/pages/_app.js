import React from 'react';
import queryString from 'query-string';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { WPURL, queryStringOptions, getSessionStorageData, setSessionStorageData, delSessionStorageData } from 'lib/utils';

import fetch from 'node-fetch';
import { cache, SWRConfig } from 'swr';
import getAgent from '@egjs/agent';

import { AppContext, useAppContext } from 'lib/context';
import getHeader from 'lib/seo';

import 'swiper/swiper.min.css';
import 'swiper/components/pagination/pagination.min.css';

import 'public/css/Font.css';
import 'public/css/Reset.css';
import 'public/css/Var.css';
import 'public/css/Helper.css';
import 'public/css/Gutenberg.css';
import 'public/css/App.css';
import 'public/css/Blog.css';
import 'public/css/Company.css';
import 'public/css/Event.css';
import 'public/css/Inquiry.css';
import 'public/css/Member.css';
import 'public/css/Menu.css';
import 'public/css/Notice.css';
import 'public/css/Partnership.css';
import 'public/css/Privacy.css';
import 'public/css/Review.css';
import 'public/css/Search.css';
import 'public/css/Shop.css';
import 'public/css/Zzimlist.css';
import 'public/css/Ethan.css';
import 'public/css/Location.css';
import 'public/css/Sitemap.css';

import Loading from 'components/ui/Loading/Loading';
import Menu from 'components/layout/Menu/Menu';
import Sidebar from 'components/layout/Sidebar/Sidebar';
import Footer from 'components/layout/Footer/Footer';
import InstallPrompt from 'components/ui/InstallPrompt/InstallPrompt';
import LocationSearch from 'components/layout/LocationSearch';

export default function Moongchigo( { Component, pageProps, menuNowData, googlebot } ) {

    const { loading, location, user, mutateUser, setLocation, showMenu, setShowMenu, showLocation, setShowLocation, isHome, isLocation, setIsLocation, searching, setSearching } = useAppContext();
    const router = useRouter();
    const [ isPopup, setIsPopup ] = React.useState( false );
    const gaTrackingID = 'G-DTTKW44V7W';

    React.useEffect( () => {
        setIsPopup( (
            decodeURI(router?.asPath) === '/이용약관/seamless' ||
            decodeURI(router?.asPath) === '/개인정보처리방침/seamless' ||
            decodeURI(router?.asPath) === '/개인정보수집및이용/seamless'
        ) );

        /*
        const historyBackHandler = () => {
            const agent = getAgent();
            if ( agent?.browser?.name === 'safari' && agent?.browser?.webview === false && agent?.isMobile === true ) {
                router.reload();
            }
        }

        window.addEventListener( 'popstate', historyBackHandler );

        return () => {
            window.removeEventListener( 'popstate', historyBackHandler );
        }
        */
    }, [ router.asPath ] );

    React.useEffect( () => {

        // Detect popup view
        setIsPopup( (
            decodeURI(router?.asPath) === '/이용약관/seamless' ||
            decodeURI(router?.asPath) === '/개인정보처리방침/seamless' ||
            decodeURI(router?.asPath) === '/개인정보수집및이용/seamless'
        ) );

        // Register service worker
        if("serviceWorker" in navigator) {
            window.addEventListener("load", function () {
                navigator.serviceWorker.register("/sw-v17.js").then(
                    function (registration) {
                        console.log("Service Worker registration successful with scope: ", registration.scope);
                    },
                    function (err) {
                        console.log("Service Worker registration failed: ", err);
                    }
                );
            });
        }

        // Disable mobile native pwa install prompt everywhere
        window.addEventListener('beforeinstallprompt', (e) =>  {
            e.preventDefault();
        });

        window.sessionStorage.clear();

    }, [] );

    React.useEffect( () => {
        if( !user ) {
            cache.cache.clear();
        }
    }, [ user ] );

    React.useEffect(() => {
        if( isLocation ){
            setIsLocation( false );
            if( isHome || ( router.pathname === '/shop/[slug]' ) ) {
                router.push('/');
            } else {
                if ( router?.query?.category ) {
                    const newArea = (location.areaSlug ? decodeURI(location.areaSlug) : false);

                    const newLocation = {
                        lat: location.lat,
                        lng: location.lng,
                        name: location.name
                    }
                    if( location.area && (newArea !== router.query.area) ){

                        const newQuery = { ...queryString.parse( ( router.asPath.split( '?' ).length > 1 ? router.asPath.split( '?' ).pop().split('#')[0] : '' ), queryStringOptions ), area: newArea, category: router.query.category };

                        if ( typeof newQuery.filter === 'string' ) {
                            newQuery.filter = [ newQuery.filter ];
                        }

                        const strQuery = queryString.stringify( { order: newQuery.order, filter: newQuery.filter }, queryStringOptions );
                        const newUrl = encodeURI( `/지역기반/${ decodeURI( newQuery.area ) }/${ decodeURI( newQuery.category ) }` ) + ( strQuery ? `?${ strQuery }` : '' );

                        router.push(
                            { pathname: '/shoplist/area/[area]/[category]', query: newQuery },
                            newUrl,
                            { shallow: true }
                        );
                    } else if ( !location.area ) {

                        const newQuery = { ...queryString.parse(( router.asPath.split( '?' ).length > 1 ? router.asPath.split( '?' ).pop().split('#')[0] : '' ), queryStringOptions ), area: newArea, category: router.query.category, lat: newLocation.lat, lng: newLocation.lng, name: newLocation.name };

                        if ( typeof newQuery.filter === 'string' ) {
                            newQuery.filter = [ newQuery.filter ];
                        }

                        const strQuery = queryString.stringify( { order: newQuery.order, filter: newQuery.filter, ...newLocation }, queryStringOptions );
                        const newUrl = encodeURI( `/위치기반/${ decodeURI( newQuery?.category ) }` ) + ( strQuery ? `?${ strQuery }` : '' );

                        router.push(
                            { pathname: '/shoplist/location/[category]', query: newQuery },
                            newUrl,
                            { shallow: true }
                        );
                    }
                }
            }
        }
    }, [ isLocation ]);

    React.useEffect(() => {
        if (!'scrollRestoration' in window.history) return;

        let shouldSaveScroll = true;

        function handleStart(){

            if ( !shouldSaveScroll ) return;

            window.history.scrollRestoration = 'manual';

            setSessionStorageData(
                `__next_scroll_${window.history.state.idx}`,
                { ...getSessionStorageData(`__next_scroll_${window.history.state.idx}`), x: window.pageXOffset, y: window.pageYOffset }
            );

        };

        function handleComplete(){
            const scrollItem = getSessionStorageData(`__next_scroll_${window.history.state.idx}`);
    
            if( scrollItem ){
                const { x, y } = scrollItem;

                window.scrollTo( x, y );
                delSessionStorageData(`__next_scroll_${window.history.state.idx}`);
            } else {
                window.scrollTo( 0, 0 );
            }

            window.history.scrollRestoration = 'auto';
        }

        router.beforePopState(( { url, as, options } ) => {
            if( router.asPath !== as ){
                router.push( decodeURI(url), as, options );
            }
            shouldSaveScroll = false;
            return false;
        });
    
        router.events.on( 'routeChangeStart', handleStart );
        router.events.on( 'routeChangeComplete', handleComplete );

        return () => {
            router.events.off( 'routeChangeStart', handleStart );
            router.events.off( 'routeChangeComplete', handleComplete );
        }
    }, [ router ]);

    const blockRobot = [
        '/shop/[slug]/modify'
    ].indexOf(router.pathname) >= 0;

    return (
        <>
        <Head>
            {/* Set robot meta */}
            { ( process.env.NODE_ENV !== 'production' || process.env.DOMAIN !== 'https://moongchigo.com' || blockRobot ) && (
                <meta name="robots" content="noindex" />
            ) }

            <meta property="og:locale" content="ko_KR" />

            <link rel="manifest" href="/manifest.json" />

            <meta name="format-detection" content="telephone=no" />
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-title" content="뭉치고" />

            <link rel="icon" href="/images/favicon/favicon-32-1.png" sizes="32x32" />
            <link rel="icon" href="/images/favicon/favicon-192-2.png" sizes="192x192" />
            <link rel="apple-touch-icon" href="/images/favicon/home-icon-180.png" />
            <meta name="msapplication-TileImage" content="/images/favicon/home-icon-270.png" />
            <meta name="theme-color" content="#ffffff" />

            <link href={ require( 'public/images/splashscreens/iphone5-splash.png' ) } media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/iphone6-splash.png' ) } media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/iphoneplus-splash.png' ) } media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/iphonex-splash.png' ) } media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/iphonexr-splash.png' ) } media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/iphonexsmax-splash.png' ) } media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/ipad-splash.png' ) } media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/ipadpro1-splash.png' ) } media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/ipadpro3-splash.png' ) } media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
            <link href={ require( 'public/images/splashscreens/ipadpro2-splash.png' ) } media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />

            {/* 크로스 브라우징 필수 - Run browser-selector.js before everthing else */}
            <script src="/js/jt-browser-selector.min.js"></script>

            { ( router.pathname === '/partnership/form' ) && (
                <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
            ) }

            <meta name="naver-site-verification" content="cccad7486b6892d0f18ef9a2162a68b594e4c854" />
            <meta name="google-site-verification" content="vxEPMrDgxc8tJrzvQr6AyO68DTK6Oc82NtrClCzY4zM" />

            { ( process.env.NODE_ENV === 'production' && process.env.DOMAIN === 'https://dev-projectm.studio-jt.co.kr' ) && (
                <>
                {/* Clarity */}
                <script dangerouslySetInnerHTML={{__html:`
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, 'clarity', 'script', 'gtb0azr3rr');
                ` }} />
                </>
            ) }

            { ( process.env.NODE_ENV === 'production' && process.env.DOMAIN === 'https://moongchigo.com' ) && (
                <>
                {/* Google Analytics */}
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingID}`} />
                <script dangerouslySetInnerHTML={{__html:`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaTrackingID}', { page_path: window.location.pathname });
                ` }} />


                {/* <!-- Google Tag Manager --> */}
                <script dangerouslySetInnerHTML={{ __html:`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-NZT2HFD');
                `}} />
                {/* <!-- End Google Tag Manager --> */}
                </>
            ) }

            {/* 네이버 연관 채널 설정 */}
            { ( router.pathname === '/' ) && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
                {
                    "@context": "http://schema.org",
                    "@type": "Organization",
                    "name": "뭉치고",
                    "description": "뭉치고에서 최고의 스웨디시, 1인샵, 왁싱, 로미로미, 홈타이, 타이마사지, 중국마사지, 스포츠마사지, 아로마 마사지, 에스테틱 등에 대한 사용자 후기 및 추천을 받아보세요.",
                    "url": "https://moongchigo.com",
                    "logo": "https://moongchigo.com/images/og/google_logo_v2.jpg",
                    "slogan": "오늘은 어디가 뭉치셨나요? 뭉치면 가자, 뭉치고 GO!",
                    "sameAs": [
                        "https://www.instagram.com/moongchigo.official",
                        "https://twitter.com/moongchigo_team",
                        "https://www.facebook.com/moongchigo.official",
                        "https://www.youtube.com/channel/UCPs0YlhvdD0dbuvXESkguEA",
                        "https://www.linkedin.com/company/moongchigo"
                    ],
                    "brand":{
                        "@type":"Brand",
                        "name":"moongchigo"
                    }
                }
                ` }} />
            ) }
        </Head>

        { getHeader( pageProps?.seoData ) }

        <div id="root" className={`${ isPopup ? 'is_popup' : '' }`}>
            <SWRConfig value={ { fetcher: fetch, onError: err => console.error( err ) } }>
                <AppContext.Provider value={ { isHome, location, user, loading, mutateUser, setLocation, showMenu, setShowMenu, showLocation, setShowLocation, searching, setSearching, googlebot } }>
                    <div className="App">
                        { ( loading !== false ) && (
                            <Loading />
                        ) }

                        { ( loading === false && isPopup ) && (
                            <Component { ...pageProps } />
                        ) }

                        { ( loading === false && ! isPopup ) && (
                            <>
                            <Menu largeScreenOnly menuNowData={menuNowData}  />
                            <Sidebar />
                            <LocationSearch />
                            <Component { ...pageProps } />
                            <Footer />
                            {(router.pathname === '/') && (
                                <InstallPrompt />
                            )}
                            </>
                        ) }
                    </div>
                </AppContext.Provider>
            </SWRConfig>
        </div>
        </>
    );
}

Moongchigo.getInitialProps = async ( AppContext ) => { // AppContext
    // 뭉치고NOW SSR 처리
    const menuNowData = await fetch( `${ WPURL }/components/sidebar/now` ).then( res => res.json() );
    const userAgent = AppContext?.ctx?.req?.headers['user-agent'] || '';
    const googlebot = ( userAgent.toLowerCase().indexOf('googlebot') > -1 );
    
    return {
        menuNowData,
        googlebot
     }
}
