import React from 'react';
import ReactDOMServer from "react-dom/server"
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

import queryString from 'query-string';

import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { useShopDetail, useShopDetailPreview } from 'lib/swr';
import { WPURL, queryStringOptions, objectToFormData, cookies, getDateFormat, useDevice, animateInView, jtAlert } from 'lib/utils';

import { allCategory } from 'lib/ethan'

import MapMini from 'components/ui/MapMini/MapMini';
import Tabs from 'components/ui/Tabs/Tabs';
import Character from 'components/ui/Character/Character';
import ButtonFab  from 'components/ui/ButtonFab/ButtonFab';
import Share from 'components/ui/Share/Share';
import Accordion from 'components/ui/Accordion/Accordion';
import ReviewList from 'components/layout/Review/List';
import Divider from 'components/ui/Divider/Divider';
import Header from 'components/ui/Header/Header';
import Slideshow from 'components/ui/Slideshow/Slideshow';
import HomeButton from 'components/ui/HomeButton/HomeButton';
import NotFound from 'components/layout/NotFound/NotFound';
import Loading from 'components/ui/Loading/Loading';
import Button from 'components/ui/Button/Button';
import ButtonMenu  from 'components/ui/ButtonMenu/ButtonMenu';

import ListItem from 'components/ui/ListItem/ListItem';

export default function ShopDetail( props ) {
    const { user, location, setShowLocation, googlebot } = React.useContext( AppContext );
    const searchLocation = {
        lat: ( parseFloat( props?.location?.lat ) > 0 ? props.location.lat : ( parseFloat( location?.lat ) > 0 ? location.lat : 0 ) ),
        lng: ( parseFloat( props?.location?.lng ) > 0 ? props.location.lng : ( parseFloat( location?.lng ) > 0 ? location.lng : 0 ) ),
        ...( parseInt( props?.query?.preview_id ) > 0 ? { preview_id: props.query.preview_id } : {} )
    };

    const { data, mutate } = (
        parseInt( props?.query?.preview_id ) > 0 ?
        useShopDetailPreview( props.query.preview_id, searchLocation, props.data ) :
        useShopDetail( props.data.slug, searchLocation, props.data )
    );

    const router = useRouter();
    const slides = data.basic?.gallery.map( slide => ( { image: slide, name: data.title, alt: `${data.area.join(' ')} ${data.category.join(' ')} ${data.title} 실내 사진입니다.`.replace(/  +/g, ' ') } ) );
    const device = useDevice();

    const [ endInit, setEndInit ] = React.useState( false );
    const [ isMobile, setIsMobile ] = React.useState( false );

    const shopInfoRef = React.createRef();
    // const hasGallery = data.basic?.gallery?.length > 0 && data.type !== 'basic' ? true : false;
    const hasGallery = data.basic?.gallery?.length > 0 ? true : false;

    const toggleZzim = async event => {
        event.preventDefault();

        if ( user === false ) {
            window.open( '/로그인/?popup', '_blank', 'height=667,width=375' );
            // router.push( { pathname: '/member/login', query: { redirect: router.asPath } }, `/로그인/?redirect=${ router.asPath }` );
        } else if ( user !== false && ( user.shop || [] ).find( item => parseInt( item.shop_id ) === parseInt( data.id ) ) ) {
            jtAlert( '클린 시스템이 작동 중입니다\n뭉치고 사장님 고객센터로 연락바랍니다' );
        } else {
            const response = await fetch( `${ WPURL }/modules/shop/zzim/toggle`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: objectToFormData( { shop_id: data.id } ),
            } ).then( res => res.json() );

            mutate( {
                ...data,
                basic: {
                    ...data.basic,
                    zzim: response,
                }
            } );
        }

        return false;
    }

    const handleSmsClickDesktop = (e) => {
        if(device.isDesktop()){
            e.preventDefault();
            jtAlert(`${data.basic.sms.phone} \n모바일 이용 시 바로 연결됩니다`);
        }
    }

    const checkAuth = ( event ) => {
        if ( user !== false && user.shop.find( item => parseInt( item.shop_id ) === parseInt( data.id ) ) ) {
            event.preventDefault();

            jtAlert( '클린 시스템이 작동 중입니다\n뭉치고 사장님 고객센터로 연락바랍니다' );

            return false;
        }
    }

    const handleLocation = () => {
        setShowLocation( true );
    }

    const modify_request_btn = (
        <Link href={ { pathname: '/shop/[slug]/modify', query: { slug: data.slug } } } as={ `/샵/${ decodeURI( data.slug ) }/정보-수정요청` }>
            <a className="shop_modify_header_request_btn" onClick={ checkAuth }><span className="sr_only">정보 수정요청</span></a>
        </Link>
    );

    const redirectGallery = () => {
        router.push(
            { pathname: '/shop/[slug]/image', query: { slug: decodeURI( data.slug ), ...location } },
            ( data.slug ? `/샵/${ decodeURI( data.slug ) }/모두보기` : '#' )
        );
    }

    React.useEffect( () => {
        mutate();
    }, [ user ] );

    React.useEffect( () => {
        setEndInit( true );

        const device = useDevice();
        setIsMobile( device.isMobile() );

        if ( shopInfoRef?.current ) {
            animateInView( shopInfoRef.current, '-100%', false );
        }
    }, [] );

    return (
        <>
        <Head>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: `
            {
                "@context": "https://schema.org/",
                "@type": "healthandbeautybusiness",
                "@id": "LocalBusiness",
                "name": "${data.title}",
                "url": "${decodeURI(data.permalink)}",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "${data.basic.map.address.split(' ').filter((_, idx) => idx > 0).join(' ')}",
                    "addressLocality": "${data.basic.map.address.split(' ')[0]}",
                    "addressRegion": "대한민국",
                    "postalCode": ""
                },
                "telephone": "${data.basic.sms.phone}",
                "openingHours": ["${data.basic.opening.split('\n').join('","')}"],
                "image": "${data.thumbnail}",
                "additionalType": "",
                "priceRange": "${data.basic.price}",
                "hasMenu": "",
                "hasMap": "",
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "${data.basic.map.lat}",
                    "longitude": "${data.basic.map.lng}"
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "${data.basic.review.rank}",
                    "reviewCount": "${data.basic.review.cnt}"
                }
            }
            `}}></script>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: `
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [{
                    "@type": "Question",
                    "name": "${data.title}의 위치는 어디 인가요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "${data.basic.desc} 거리입니다."
                    }}, {
                    "@type": "Question",
                    "name": "${data.title} 영업시간은 언제인가요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "${data.title}의 휴무일은 ${data.basic.holiday}이며 영업시간은 다음과 같습니다. ${data.basic.opening}"
                    }}, {
                    "@type": "Question",
                    "name": "${data.title}에서 제공 하는 코스는 어떤게 있나요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "${data.title}에서 제공하는 코스는 다음과 같습니다.
                        ${data.tabs.menu.course.map(course => (
                            ReactDOMServer.renderToStaticMarkup(<>
                                <p>{course.title}</p>
                                <ul>
                                    {course.list.map(item => <li>{item.title}</li>)}
                                </ul>
                            </>)
                        )).join('')}"
                    }
                }]
            }
            `}}></script>
        </Head>
        { ( data?.code === 'empty' ) && (
            <NotFound />
        ) }

        { ( data?.code !== 'empty' ) && (
            <>
            <div className={`${ hasGallery ? 'shop_detail_sticky_header' : ''}`}>
                <Header useHome title={data.title} useNoTitle={!hasGallery} noTitleTag>
                    <div className="no_gallery_title header_sticky_title h4">{data.title}</div>
                    {modify_request_btn}
                </Header>
            </div>

            <div className={`shop_detail_container ${ endInit ? 'shop_is_loaded' : ''} ${ !hasGallery? 'has_no_gallery' : ''} ${ data.basic?.is_ready === true ? 'shop_not_available' : '' } ${ googlebot ? 'is_googlebot' : '' }`}>
                { ( hasGallery ) && (
                    <div className="shop_visual_wrap">
                        <ButtonMenu invert />
                        <HomeButton home invert />
                        <div className="shop_modify_header_request_btn_invert shop_modify_header_request_btn_has_gallery">{modify_request_btn}</div>
                        <Slideshow size="large" posts={slides} onAllBtnClick={ redirectGallery } />
                    </div>
                ) }

                { ( data.basic?.is_ready === true ) && (
                    <div className="shop_preparing_banner">
                        <span>앗! 지금은 준비 중이에요</span>
                    </div>
                ) }

                <div ref={ shopInfoRef } data-target=".shop_detail_sticky_header, .no_gallery_title" className={`shop_detail_content ${data.basic?.sms?.phone && data.basic?.sms?.use ? 'shop_has_phone' : ''}`}>
                    <div className="shop_detail_header">
                        <div className="shop_detail_header_inner">
                            <h1 className="shop_title">{ data.title }</h1>
                            <ul className="shop_score_distance">
                                <li className="shop_score">
                                    <span>
                                        <b>{ data.basic?.review?.rank }</b>
                                        <i>({ data.basic?.review?.cnt })</i>
                                    </span>
                                </li>

                                { ( data.basic?.distance ) && (
                                    <li className="shop_distance">
                                        <span>{ data.basic.distance }</span>
                                    </li>
                                ) }
                            </ul>

                            <p className="shop_location_desc">{ data.basic?.desc }</p>

                            { ( ! data.basic?.map?.is_home ) && (
                                <MapMini title={ data.title } lat={ data.basic?.map?.lat } lng={ data.basic?.map?.lng } addr={ data.basic?.map?.address } />
                            ) }

                            <div className="shop_info">
                                <table className="shop_info_table">
                                    <caption></caption>
                                    <tbody>
                                        { ( data.basic?.price ) && (
                                        <tr className="shop_price">
                                            <th scope="row"><p className="title">최소금액</p></th>
                                            <td><span>{ data.basic.price }</span></td>
                                        </tr>
                                        ) }
                                        { ( data.basic?.opening ) && (
                                        <tr className="shop_time">
                                            <th scope="row"><p className="title">영업시간</p></th>
                                            <td><div dangerouslySetInnerHTML={ { __html: data.basic.opening } }></div></td>
                                        </tr>
                                        ) }
                                        { ( data.basic?.holiday ) && (
                                        <tr className="shop_holiday">
                                            <th scope="row"><p className="title">휴무일</p></th>
                                            <td><span>{ data.basic.holiday }</span></td>
                                        </tr>
                                        ) }
                                        {(data?.category) && (
                                            <tr className="shop_type">
                                                <th scope="row"><p className="title">종류</p></th>
                                                <td>{data.category.join(', ')}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* <ul className="shop_info">
                                { ( data.basic?.price ) && (
                                    <li className="shop_price">
                                        <p className="title">최소금액</p>
                                        <span>{ data.basic.price }</span>
                                    </li>
                                ) }

                                { ( data.basic?.opening ) && (
                                    <li className="shop_time">
                                        <p className="title">영업시간</p>
                                        <div dangerouslySetInnerHTML={ { __html: data.basic.opening } }></div>
                                    </li>
                                ) }

                                { ( data.basic?.holiday ) && (
                                    <li className="shop_holiday">
                                        <p className="title">휴무일</p>
                                        <span>{ data.basic.holiday }</span>
                                    </li>
                                ) }
                            </ul> */}

                            <ul className="shop_util">
                                { ( data.basic?.sms?.use && data.basic?.sms?.phone ) && (
                                    <li className="shop_contact_text">
                                        <a href={ `sms:${ data.basic?.sms?.phone };?&body=${ data.basic?.sms?.msg }` } onClick={ handleSmsClickDesktop } className="btn_contact_sms">
                                            <span>문자</span>
                                        </a>
                                    </li>
                                ) }

                                <li className={ 'shop_zzim ' + ( data.basic?.zzim?.is_zzim ? 'active' : '' ) }>
                                    <Link href="#">
                                        <a onClick={ toggleZzim }>
                                            <span>찜 { data.basic?.zzim?.count }</span>
                                        </a>
                                    </Link>
                                </li>
                                <li className="shop_share">
                                    <Share useDrawing />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <Divider />
                    <Tabs sticky useHash rememberScroll usePush={ device.isDesktop()}>
                        <div label="샵 정보">
                            { ( ( data.type === 'super' || data.type === 'big' || 1) && data.tabs.menu.info ) && (
                                <div className="shop_intro_box">
                                    <b className="shop_intro_title">안내 및 혜택</b>
                                    <div dangerouslySetInnerHTML={ { __html: data.tabs.menu.info } }></div>
                                </div>
                            ) }

                            {/* // 삽 소개 삭제 :: 20221025_수정사항
                            <div  className="shop_intro_box">
                                <b  className="shop_intro_title">샵 소개</b>
                                <div dangerouslySetInnerHTML={ { __html: ( data.tabs?.info?.intro ? data.tabs.info.intro : '내용이 없습니다' ) } }></div>
                            </div> */}

                            <div  className="shop_intro_box">
                                <b  className="shop_intro_title">관리사님 소개</b>
                                { ( data.tabs?.info?.member_intro ) && (
                                    <div dangerouslySetInnerHTML={ { __html: data.tabs?.info?.member_intro } }></div>
                                ) }

                                { ( ( data.tabs?.info?.member || '' ).length > 0 ) && (
                                    <ul  className="shop_manager_box">
                                        { ( data.tabs.info.member.replace( /(\r\n|\n|\r)/gm, '' ).split( '<br />' ).filter( item => ( item || '' ).length > 0 ).map( ( item, idx ) => (
                                            <li key={ idx }>{ ( item || '' ).trim() }</li>
                                        ) ) ) }
                                    </ul>
                                ) }

                                { ( ! data.tabs?.info?.member_intro && ! data?.tabs?.info?.member ) && (
                                    <div>내용이 없습니다</div>
                                ) }
                            </div>

                            { ( data.tabs?.menu?.keywords ) && (
                                <div className="shop_intro_box">
                                    <b className="shop_intro_title">#우리샵은이래요</b>
                                    <ul className="shop_theme">
                                        { data.tabs.menu.keywords.map( ( item, idx ) => <li key={ idx }><span>{ item }</span></li> ) }
                                    </ul>
                                </div>
                            ) }

                            { // 위치 정보 삭제 :: 20221025_수정사항
                            /* <div  className="shop_intro_box">
                                <b  className="shop_intro_title">위치 정보</b>
                                <ul  className="shop_info_bullet_type">
                                    <li><b>광고지역</b><span>{ ( data.tabs?.info?.location ? data.tabs.info.location : '내용이 없습니다' ) }</span></li>
                                </ul>
                            </div> */}

                            { ( ( data?.tabs?.menu?.course || [] ).filter( item => item.title.length > 0 ).length > 0 ) ? (
                                <div className="course_guide">
                                    <div className="course_guide_title">
                                        <b>코스 안내~예요</b>
                                        <div className="character_img"><p></p></div>
                                    </div>
                                    <div className="course_accordion">
                                        { data.tabs.menu.course.filter( item => item.title.length > 0 ).map( ( course, course_idx ) => (
                                            <Accordion key={ course_idx }>
                                                <Accordion.Item type="title">
                                                    <h2>{ course.title }</h2>
                                                    { ( course.content ) && ( <div dangerouslySetInnerHTML={ { __html: course.content } }></div> ) }
                                                </Accordion.Item>
                                                <Accordion.Item type="content">
                                                    { ( course.list || [] ).map( ( item, item_idx ) => (
                                                        <div className="course_item" key={ item_idx }>
                                                            <p className="course_name">
                                                                <b>{ item.title }</b>
                                                                { ( item.label ) && ( <span className="mark_main">대표</span> ) }
                                                            </p>

                                                            { ( item.content ) && ( <div className="course_desc" dangerouslySetInnerHTML={ { __html: item.content } }></div> ) }

                                                            {item?.timetable.length > 0 &&
                                                            <ul>
                                                                { ( item?.timetable || [] ).map( ( time, time_idx ) => ( <li key={ time_idx }>{ time.content }</li> ) ) }
                                                            </ul>
                                                            }
                                                        </div>
                                                    ) ) }
                                                </Accordion.Item>
                                            </Accordion>
                                        ) )}
                                    </div>
                                </div>
                            ) : (
                                <div className="course_no_data">
                                    <Character type="no_menu" text="코스는 전화로 물어보세요" />
                                </div>
                            ) }
                            <Divider />
                            <div  className="shop_intro_box">
                                <b  className="shop_intro_title">사업자 정보</b>
                                <ul  className="shop_info_bullet_type">
                                    <li>
                                        <b>상호명</b>
                                        <span>{ data.tabs?.info?.company?.name }</span>
                                    </li>
                                    <li>
                                        <b>사업자등록번호</b>
                                        <span>{ data.tabs?.info?.company?.code }</span>
                                    </li>
                                </ul>
                            </div>

                            { ( data.tabs?.menu?.notice || data.tabs?.menu?.moong ) && (
                                <div className="shop_request">
                                    { ( data.tabs.menu.notice ) && (
                                    <div className="shop_request_box">
                                        <b>부탁말씀</b>
                                        <ul>
                                            { data.tabs.menu.notice.map( ( { item }, idx ) => (
                                                <li key={ idx }>{ item }</li>
                                            ) ) }
                                        </ul>
                                    </div>
                                    ) }

                                    { ( data.tabs.menu.moong ) && (
                                        <ul className="shop_request_notice">
                                            { data.tabs.menu.moong.map( ( { item }, idx ) => (
                                                <li key={ idx }>{ item }</li>
                                            ) ) }
                                        </ul>
                                    ) }
                                    {
                                    /*
                                    <Link href={ { pathname: '/shop/[slug]/modify', query: { slug: data.slug } } } as={ `/샵/${ decodeURI( data.slug ) }/정보수정요청` }>
                                        <a className="btn_shop_modify" onClick={ checkAuth }>
                                            <span>정보 수정요청</span>
                                        </a>
                                    </Link>
                                    */
                                    }
                                </div>
                            ) }
                        </div>

                        <div label="후기" title={`후기 ${ data.basic?.review?.cnt }개`}>
                            {(data.tabs?.review?.event) && (
                                <>
                                <div className="shop_review_header">
                                    <div className="shop_review_header_inner">
                                        <div className="notice_by_owner">
                                            <div className="notice_by_owner_header">
                                                <span className="notice_title">후기 이벤트</span>
                                                <span className="notice_date">{ getDateFormat( data.modified, 'YYYY년 M월 D일' ) }</span>
                                            </div>
                                            { data.tabs.review.notice && (
                                                <div dangerouslySetInnerHTML={ { __html: data.tabs.review.notice } }></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Divider />
                                </>
                            )}

                            <ReviewList type="shop" noDataMaxHeight={400} shop={ { id: data.id, name: data.title, slug: data.slug } } />
                        </div>
                    </Tabs>

                    <div className="shop_accordion_wrap">
                        <Accordion>
                            <Accordion.Item type="title">
                                <h2>{data.title}<div className="h2-span"> 주변의 다른 샵</div></h2>
                            </Accordion.Item>
                            <Accordion.Item type="content">
                                <ul>
                                    {props.shopsUniqueByKey.map(item => <ListItem key={`${item.type}-${item.id}`} data={item} isMobile={isMobile} isDetailpage={true} />)}
                                </ul>
                            </Accordion.Item>
                        </Accordion>

                        <Accordion>
                            <Accordion.Item type="title">
                                <h2>{data.title}<div className="h2-span">에서 제공하는 서비스</div></h2>
                            </Accordion.Item>
                            <Accordion.Item type="content">
                                <div className="shop_accordion_content single_content">
                                    <ul className="ul-2-column mb-0">
                                        {data.category.map(cate => (
                                            <li key={cate}>
                                                <Link href={`/지역기반/${data.area[0]}/${cate.replace(' ', '-')}`}>{`${data.area[0]} ${cate}`}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Accordion.Item>
                        </Accordion>

                        <Accordion>
                            <Accordion.Item type="title">
                                <h2>자주 묻는 질문과 답변</h2>
                            </Accordion.Item>
                            <Accordion.Item type="content">
                                <div className="shop_accordion_content single_content">
                                    <h6>{data.title}의 위치는 어디 인가요?</h6>
                                    <p>{data.basic.desc} 거리입니다.</p>
                                    <h6>{data.title}은 어떻게 평가 되나요?</h6>
                                    <p>{data.title}은 별 {data.basic.review.rank}개입니다.</p>
                                    <h6>{data.title} 영업시간은 언제인가요?</h6>
                                    <p>{data.title}의 휴무일은 {data.basic.holiday}이며 <br />영업시간은 다음과 같습니다.<br />

                                    <span dangerouslySetInnerHTML={ { __html: data.basic.opening } }></span></p>

                                    <h6>{data.title}에서 제공 하는 코스는 어떤게 있나요?</h6>
                                    <p>{data.title}에서 제공하는 코스는 다음과 같습니다.</p>

                                    {data.tabs.menu.course.map(course => (
                                        <div key={course.title}>
                                            <p className='bold fz-t3'>{course.title}</p>
                                            <ul className='-mt-1'>
                                                {course.list.map(item => (
                                                    <li key={item.title}>{item.title}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}

                                    {data.category.map(cate => (
                                        <div key={cate}>
                                            <h6>{data.title} 주변에는 어떤 {cate} 샵이 더 있나요?</h6>
                                            <p>{data.title} 주변 {cate} 샵:</p>
                                            <ul className='ul-with-dot'>
                                                {props.closestShops.filter(shop => shop.cateId === cate).map(shop => (
                                                    <li key={shop.id}>
                                                        <Link href={shop.permalink}>{shop.title}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className='single-p-anchor -mt-half'>
                                                <Link href={`/지역기반/${data.area.join('-').replaceAll(' ', '-')}/${cate.replace(' ', '-')}`}><a>뭉치고에서 {data.title} 주변 {cate} 샵 모두 보기</a></Link>
                                            </p>
                                        </div>
                                    ))}


                                    {/* <h6>각 코스는 어떤 차이가 있나요?</h6>
                                    <p>상세히 작성된 코스 내용이 있다면 참고해주시고 코스에 대한 설명이 부족하다면 각각의 샵에 문의 부탁드립니다. 뭉치고는 등록된 샵에서 제공하는 서비스 및 코스에 대해 관여하지 않습니다.</p>
                                    <h6>가격은 어느정도 인가요?</h6>
                                    <p>뷰티 및 관리 비용은 시간 및 서비스, 관리사님의 경력에 따라 비용 차이가 크게납니다. 받고자 코스나 사용되는 재료, 관리사의 경력을 참고하세요. 근처 업체 대비 각 코스의 비용과 서비스에 대한 후기를 참고하셔서 합리적이고 즐거운 시간 보내세요</p>
                                    <h6>샵에서 전화를 안받는다면?</h6>
                                    <p>뭉치고는 샵이 폐업하는 것에 대해 정보를 꾸준히 관리하기 때문에 전화번호가 없거나 연락을 받지 않는다면 갑작스러운 휴무일이거나 시간이 모두 예약되었을 가능성이 큽니다. 근처의 다른 샵을 찾아보시고 이용해주세요</p>
                                    <h6>관리사님에 대한 정보가 궁금하다면?</h6>
                                    <p>관리사님 소개를 확인해주시고 해당 정보가 비어있다면 업체에 직접 연락하여 관리사님에 대한 정보를 요청해주세요. 뭉치고는 등록된 정보 이외에 샵에 대한 정보를 제공하지 않습니다. 좋은 관리사를 만나 즐거운 시간 보내세요</p> */}
                                </div>
                            </Accordion.Item>
                        </Accordion>

                        <Accordion>
                            <Accordion.Item type="title">
                                <h2>{data.area.join(' ')}<div className="h2-span">에서 인기 있는 샵 찾기</div></h2>
                            </Accordion.Item>
                            <Accordion.Item type="content">
                                <div className="shop_accordion_content single_content">
                                    <ul className="ul-2-column mb-0">
                                        {allCategory.map(cate => (
                                            <li key={cate}>
                                                <Link href={`/지역기반/${data.area.join('-').replaceAll(' ', '-')}/${cate}`}>{`${data.area[1]} ${cate.replace('-', ' ')} 샵 찾기`}</Link>
                                                {/* <Link href={`/지역기반/${data.area[0]}/${cate}`}>{cate.replace('-', ' ')}</Link> */}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Accordion.Item>
                        </Accordion>
                    </div>

                    { (data.basic?.sms?.phone && data.basic?.is_ready === false)  &&
                        <ButtonFab href={`tel:${data.basic.sms.phone}`} withSpacer text="전화걸기" type="phone" onClick={ handleSmsClickDesktop } />
                    }
                </div>
            </div>

            <div className='goToSearchButtonWrap'>
                <div>
                    <a onClick={handleLocation}>
                        <Button icon="location" iconRight iconSize={21}>뭉치고에서 내 주변 샵 찾기</Button>
                    </a>
                </div>
            </div>
            </>
        ) }
        </>
    );
}

export const getServerSideProps = async ( { query } ) => {
    if ( query?.slug ) {
        const location = {
            lat: ( parseFloat( query?.lat ) > 0 ? parseFloat( query.lat ) : '' ),
            lng: ( parseFloat( query?.lng ) > 0 ? parseFloat( query.lng ) : '' ),
            name: ( query?.name ? query.name : '' ),
        };

        const strQuery = (
            parseFloat( query?.lat ) > 0 && parseFloat( query?.lng ) > 0 ?
            queryString.stringify( { lat: query.lat, lng: query.lng }, queryStringOptions ) :
            ''
        );

        const data = (
            parseInt( query?.preview_id ) > 0 ?
            {} :
            await fetch( `${ `${ WPURL }/modules/shop/get/${ encodeURI( decodeURI( query.slug ) ) }` }${ strQuery ? `?${ strQuery }` : '' }` ).then( res => res.json() )
        );

        if ( parseInt( query?.preview_id ) > 0 || data.status === 'publish' ) {
            let closestShops = [];

            const closestShopByCate = data?.category?.map(async cate => {
                let editedList = await fetch( `${ WPURL }/modules/shop/list?rpp=6&category=${ encodeURI( decodeURI( cate.replace(' ', '-') ) )}&lat=${data.basic.map.lat}&lng=${data.basic.map.lng}` ).then( res => res.json() )
                editedList = editedList.posts.filter(item => item.id !== data.id).map(item => ({...item, cateId: cate}))
                return editedList
            }) || []

            await Promise.all(closestShopByCate)
            .then(arr => {
                arr.map(item => {
                    item.map(shop => closestShops.push(shop))
                })
            })

            const key = 'id'

            const shopsUniqueByKey = [...new Map(closestShops.map(item => [item[key], item])).values()]

            const seoData = (
                parseInt( query?.preview_id ) > 0 ?
                {} :
                {
                    title: `${ data.title } - ${ data.category.join( ', ' ) } - 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: `${data.title} - ${data.basic.desc} - ${ data.category.join( ', ' ) } - 뭉치고에서 ${data.title} 후기를 확인해보세요!`.replace( /\s\s+/g, ' '),
                    ...( data?.thumbnail ? { image: data.thumbnail } : {} ),
                }
            );

            if ( ! data?.code || parseInt( query?.preview_id ) > 0 ) {
                return { props: {
                    data, location, seoData, query, shopsUniqueByKey, closestShops
                } };
            }
        }
    }
    return { notFound: true };
}
