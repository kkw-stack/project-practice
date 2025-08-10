import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { cookies, WPURL, objectToFormData, getDateFormat, useDevice, kakaoApiKey, debounce, jtAlert } from 'lib/utils';

import Avatar from 'components/ui/Avatar/Avatar';
import Logo from 'components/ui/Logo/Logo';
import Button from 'components/ui/Button/Button';
import Icon from 'components/ui/Icon/Icon';
import Header from 'components/ui/Header/Header';
import JTForm from 'components/ui/Forms';
import Divider from 'components/ui/Divider/Divider';
import LinksCloud from 'components/ui/LinksCloud/LinksCloud';

import style from './Menu.module.css';

export default function Menu( props ) {
    const router = useRouter();

    const { user, mutateUser, loading, showMenu, setShowMenu, googlebot } = React.useContext( AppContext );
    const [ dimensions, setDimensions ] = React.useState( {  height: 0, width: 0 } );
    const [ userShop, setUserShop ] = React.useState( user !== false ? ( user.shop || [] ) : [] );
    const [ isComponentloaded, setIsComponentloaded ] = React.useState(false);
    const [ previousPath, setPreviousPath ] = React.useState('');
    const isHome = router.pathname === '/'; // if use "const { isHome } = useAppContext();" cause link category not working if loggin and disable browser cache on

    // now data
    const { menuNowData } = props;

    // Ref
    const gnbContainerRef = React.useRef(null);
    const [hasRetinaClass, setHasRetinaClass] = useState(false);
    useEffect(() => {
        const htmlClass = document.documentElement.className;
        const hasRetina = htmlClass.includes('retina');
        setHasRetinaClass(hasRetina);
      }, []);
    // Event handler
    const toggleShopStatus = ( { target: { checked: value } }, shop_idx ) => {
        if ( user !== false && value !== userShop?.[ shop_idx ]?.is_ready ) {
            const newShop = userShop.map( ( item, idx ) => ( idx === shop_idx ? { ...item, is_ready: value } : item ) );
            setUserShop( newShop );

            fetch( `${ WPURL }/modules/shop/status/toggle`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: objectToFormData( { shop_id: user.shop[ shop_idx ].shop_id, status: ( value === true ? 'Y' : 'N' ) } ),
            } ).then( () => mutateUser( { ...user, shop: newShop } ) );
        }
    }

    const toggleAllShopStatus = ( { target: { checked: value } } ) => {
        if ( user !== false ) {
            const newShop = userShop.map( item => ( { ...item, is_ready: value } ) );
            setUserShop( newShop );

            fetch( `${ WPURL }/modules/shop/status/toggleAll`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: objectToFormData( { status: value ? 'Y' : 'N' } ),
            } ).then( () => mutateUser( { ...user, shop: newShop } ) );
        }
    }

    const handleBannerClick = (e) => {
        e.preventDefault();

        if ('share' in navigator) {
            navigator.share( {
                title: '뭉치고 | 1등 힐링정보 플랫폼',
                url: process.env.DOMAIN,
            } );
        } else if ( window?.navigator?.clipboard ) {
            window.navigator.clipboard.writeText( process.env.DOMAIN ).then( () => jtAlert( '뭉치고 URL을 복사했습니다' ) );
        } else {
            jtAlert('브라우저가 공유 API를 지원하지 않습니다.'); // Todo change this
        }
    }

    const handleCloseClick = (e) => {
        e.preventDefault();
        if( history?.state?.menu === 'open'){
            history.back(); 
        }
        setShowMenu(false);
    }

    const handleLinkClick = (link) => {
        // Force close menu if click on link that is the current page
        if (link === router.pathname) {
            setShowMenu(false);
        }
    }

    // Footer banner position
    // Toggle footer banner css positioning on resize
    React.useEffect(() => {
        setDimensions({
            height: window.innerHeight,
            width: window.innerWidth
        });

        const handleResize = () => {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth
            });
        }

        const handleLoad = () => {
            setIsComponentloaded(true);
        }
        
        setIsComponentloaded(true);

        window.addEventListener('resize', handleResize);
        window.addEventListener('DOMContentLoaded', handleLoad); 

        mutateUser();

        return () => { 
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('DOMContentLoaded', handleLoad);
        }
    },[]);

    // Prevent body to scroll but Keep scroll position
    React.useEffect(()=>{
        
        let scrollY = 0;
        
        if(showMenu){
            document.body.style.top = `-${window.scrollY}px`;
            document.body.classList.add('menu_open');  
            setPreviousPath(router?.pathname); 
        }else{
            scrollY = document.body.style.top;
            document.body.style.top = '';
            document.body.classList.remove('menu_open');
            if(previousPath === router?.pathname){
                const scrollPosY = parseInt(scrollY)* -1;
                window.scrollTo(0, scrollPosY);
            }else{
                window.scrollTo(0, 0);
            }
        }

        // Close with browser back button 
        // [NICO] use native popstate instead of nextjs router.beforePopState because not work as except
        const handleBackButton = (e) => {            
            if(e.state != null && e.state.menu == 'open'){
                setShowMenu(true);
            }else{
                setShowMenu(false);
            }
        }
        window.addEventListener('popstate', handleBackButton)

        return () => {
            window.removeEventListener('popstate', handleBackButton)
        }

    }, [ showMenu ]);

    // Force close menu on path change
    React.useEffect(() => { 
        setShowMenu(false); 
        return () => {
            setPreviousPath(router?.pathname);
        }
    }, [ router?.pathname ]);

    // Set user show
    React.useEffect( () => {
        if ( user !== false ) {
            setUserShop( user.shop || [] );
        } else {
            setUserShop( [] );
        }
    }, [ user ] );

    if ( user === false && loading === true ) {
        return null;
    }

    // Render
    return (
        <div className={ `${isComponentloaded ? 'menu_is_loaded' : ''} ${ props?.largeScreenOnly ? 'large_screen_menu': '' } ${showMenu ? 'show_menu' : ''} ${ googlebot ? 'is_googlebot' : '' } small_menu_wrap` }>
            <div id="small_menu_container" className={ `scroll_area small_menu_container ${ ( user !== false && (user?.shop || []).length > 1 ? 'has_multishop' : '' ) } `}>
                { ( dimensions.width >= 1024 || dimensions.width === 0 ) && (
                    <a href={`${process.env.DOMAIN}/`} className="large_screen_logo"><Logo /></a>
                )}
                <div ref={gnbContainerRef} className="gnb_scroll_box">
                    <Header title="" noTitleTag={ ( dimensions.width >= 1024 || dimensions.width === 0 ) ? true : !isHome} useClose smallScreenOnly onCloseClick={handleCloseClick}>
                        { ( user !== false ) && (
                            <Link href="/member/profile" as="/내-정보-수정/">
                                <a className="member_setting" onClick={() => handleLinkClick('/member/profile')}>
                                    <span className="sr_only">환경설정</span>
                                </a>
                            </Link>
                        ) }
                    </Header>

                    <Link href="/">
                        <a className="desktop_left_logo">
                            <span className="sr_only">뭉치GO</span>
                        </a>
                    </Link>

                    { ( user !== false ) ? (
                        <>
                        <div className="gnb_member_box">
                            <div className="gnb_member_info">
                                <i className="member_character"><Avatar type={ user.avatar } size="medium" /></i>
                                <p>
                                    <b>{ user.nickname }</b>님,
                                    <span>오늘은 어디가 뭉치셨나요?</span>
                                </p>
                                { ( dimensions.width >= 1024 || dimensions.width === 0 ) && (
                                    <Link href="/member/profile" as="/내-정보-수정/">
                                        <a className="member_setting" onClick={() => handleLinkClick('/member/profile')}>
                                            <span className="sr_only">환경설정</span>
                                        </a>
                                    </Link>
                                ) }
                            </div>
                        </div>

                        { ( user.shop.length > 0 ) && (
                            <div className="multi_shop_wrap">
                                { ( user.shop.length > 1 ) && (
                                    <div className="multi_shop_total">
                                        <p>총 샵 { user.shop.length }개</p>
                                        <div className="multi_shop_total_check">
                                            <span>전체 영업임시중지</span>
                                            <JTForm.TrueFalse
                                                type="toggle"
                                                toggleSize="xl"
                                                hideLabel
                                                checked={
                                                    userShop.filter( item => item.is_ready === true && ! ( item.dday === '광고대기' || item.dday === '광고종료' ) ).length === userShop.filter( item => ! ( item.dday === '광고대기' || item.dday === '광고종료' ) ).length
                                                }
                                                onClick={ toggleAllShopStatus }
                                            />
                                        </div>
                                    </div>
                                ) }

                                <div className="multi_shop_list">
                                    { user.shop.map( ( item, shop_idx ) => (
                                        <div className={ `multi_shop_item ${ item.class }` } key={ item.shop_id }>
                                            <div className="expiration_date_box">
                                                <p>
                                                    <b>
                                                        <Link href={ { pathname: '/shop/[slug]', query: { slug: decodeURI( item.slug ) } } } as={ `/샵/${ decodeURI( item.slug ) }` }>
                                                            <a dangerouslySetInnerHTML={ { __html: item.title } } />
                                                        </Link>
                                                    </b>
                                                    <span>{ item.type }</span>
                                                </p>

                                                <div className="expiration_date_info">
                                                    <span className={ `d_day ${ item.dday.startsWith( 'D' ) ? '' : 'd_day_no_icon' }` }>{ item.dday }</span>

                                                    <time dateTime={ item.end }>
                                                        종료일 { getDateFormat( item.end, 'YYYY.MM.DD' ) }. 11am
                                                    </time>
                                                </div>
                                            </div>

                                            { ( item.dday.startsWith( 'D' ) ) && (
                                                <div className="preparing_box">
                                                    <span>영업임시중지</span>
                                                    <JTForm.TrueFalse hideLabel type="toggle" checked={ userShop?.[ shop_idx ]?.is_ready } onClick={ event => toggleShopStatus( event, shop_idx ) } />
                                                </div>
                                            ) }
                                        </div>
                                    ) ) }
                                </div>
                                <p className="help_link">
                                    사장님, 도움이 필요하신가요?
                                    (<a href="https://pf.kakao.com/_xnxhxfHT" target="_blank" rel="noopener noreferrer">바로가기</a>)
                                </p>
                            </div>
                        ) }
                        </>
                    ) : (
                        <div className="gnb_login_box inner_wrap">
                            { hasRetinaClass ? <figure className='gnb_login_box_retina'><img src={ require( './images/gnb-login-bg@2x-1.png' ) }  alt="" /></figure> : <figure><img src={ require( './images/gnb-login-bg-1.png' ) }  alt="" /></figure> }
                            <b>연인, 가족과 힐링하고 싶을 때 </b>
                            <p>스웨디시, 왁싱, <br/><span>마사지 받으러 가자~</span></p>
                            <Link href="/member/login" as="/로그인/">
                                <Button seamless={( dimensions.width >= 1024 || dimensions.width === 0 ) ? false : true} onClick={() => handleLinkClick('/member/login')}>로그인</Button>
                            </Link>
                            
                        </div>
                    ) }

                    <nav className="menu_container">
                        <ul className="gnb_my_menu">
                            <li className="gnb_point gnb_preparing">
                                <div>
                                    <figure><Icon useImgTag type="won_stroke" /></figure>
                                    <span>포인트</span>
                                </div>
                            </li>
                            <li className="gnb_coupon gnb_preparing">
                                <div>
                                    <figure><Icon useImgTag type="coupon" /></figure>
                                    <span>쿠폰함</span>
                                </div>
                            </li>
                            <li className="gnb_wish">
                                <Link href="/zzimlist" as="/찜한샵" activeClassName="active">
                                    <a className={ ( router.pathname.startsWith( '/zzimlist' ) ? 'active' : '' ) } onClick={() => handleLinkClick('/zzimlist')} rel="nofollow">
                                        <figure><Icon useImgTag type="heart_stroke" /></figure>
                                        <span>찜한샵</span>
                                    </a>
                                </Link>
                            </li>
                            <li className="gnb_review">
                                <Link href="/review" as="/후기관리">
                                    <a className={ ( router.pathname === '/review' ? 'active' : '' ) } onClick={() => handleLinkClick('/review')} rel="nofollow">
                                        <figure><Icon useImgTag type="speech" /></figure>
                                        <span>후기관리</span>
                                    </a>
                                </Link>
                            </li>
                        </ul>

                        <div className='menu_divider'><Divider /></div>
                    
                        <div className="menu_now">
                            <h2 className="menu_now_title">뭉치고 NOW</h2>
                            <LinksCloud data={ menuNowData } num={6} />
                        </div>

                        <div className='menu_divider'><Divider /></div>

                    </nav>
                    <Link href="/partnership" as="/제휴문의">
                        <a className="gnb_banner gnb_banner_inquiry" rel="nofollow">
                            <div className="gnb_banner_inner">
                                <b>제휴문의</b>
                                <p>우리샵에 맞는 광고를 <span>시작해보세요.</span></p>
                                <figure className={style.gnb_banner_image}>
                                    <img src={ require( './images/gnb-banner-inquiry.svg' ) } />
                                </figure>
                            </div>
                        </a>
                    </Link>
                    <button className="gnb_banner" onClick={ handleBannerClick }>
                        <div className="gnb_banner_inner">
                            <b>다양한 샵 알리기</b>
                            <p>스웨디시, 아로마 등 <span>건전한 정보 공유</span></p>
                            <figure className={style.gnb_banner_image}>
                                <img src="/images/layout/gnb-banner-character.svg" alt="" />
                            </figure>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}