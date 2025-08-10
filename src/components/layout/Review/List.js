import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useReviewList } from 'lib/swr';
import { AppContext } from 'lib/context';
import { WPURL, cookies, useOnScreen, jtAlert, jtConfirm } from 'lib/utils';

import HeaderList from 'components/ui/HeaderList/HeaderList';
import Avatar from 'components/ui/Avatar/Avatar';
import Character from 'components/ui/Character/Character';
import Loading from 'components/ui/Loading/Loading';
import Rating from 'components/ui/Rating/Rating';
import ModalImage from 'components/ui/ModalImage/ModalImage';
import Form from 'components/ui/Forms';
import Tooltip from 'components/ui/Tooltip/Tooltip';
import Status from 'components/ui/Status/Status';

export default function ReviewList( props ) {
    const router = useRouter();
    const { user } = React.useContext( AppContext );
    const [ searchData, setSearchData ] = React.useState( {
        shop_id: ( parseInt( props?.shop?.id ) ? parseInt( props.shop.id ) : 0 ),
        author: parseInt( props?.author?.user_id ? props.author.user_id : 0 ),
        filter: [],
        order: 'date',
        called: Date.now(),
    } );

    const scrollRef = React.createRef();
    const { data, size, setSize, mutate } = useReviewList( searchData );

    const posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const total_posts = parseInt( Array.isArray( data ) && data?.[0]?.total_posts ? data[0].total_posts : ( data?.total_posts ? data.total_posts : 0 ) );
    const total_pages = parseInt( Array.isArray( data ) && data?.[0]?.total_pages ? data[0].total_pages : ( data?.total_pages ? data.total_pages : 0 ) );
    const total_wait = parseInt( Array.isArray( data ) && data?.[0]?.total_wait ? data[0].total_wait : ( data?.total_wait ? data.total_wait : 0 ) );
    const isVisible = useOnScreen( scrollRef, [ posts ] );

    const [ current, hash = '' ] = decodeURI( router.asPath ).split( '#' );
    const [ showModal, setShowModal ] = React.useState( false );

    const handleOrder = ( event, value ) => {
        event.preventDefault();

        setSearchData( {
            ...searchData,
            order: value,
        } );

        return false;
    }

    const handleFilter = ( { value } ) => {
        if ( ( value === true && searchData.filter.indexOf( 'photo' ) < 0 ) || ( value === false && searchData.filter.indexOf( 'photo' ) >= 0 ) ) {
            setSearchData( {
                ...searchData,
                filter: searchData.filter.filter( item => item !== 'photo' ).concat( value === true ? ['photo'] : [] ),
            } );
        }
    }

    const removeReivew = async ( event, review ) => {
        event.preventDefault();

        if ( await jtConfirm( '후기를 정말 삭제하시겠습니까?' ) === true ) {
            const result = await fetch( `${ WPURL }/modules/review/delete/${ review }`, { method: 'POST', headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) } } ).then( res => res.json() );

            mutate();
            if ( result?.message ) {
                jtAlert( result.message );
            } else {
                jtAlert( '후기 삭제 중 오류가 발생했습니다' );
            }
        }

        return false;
    }

    const checkAuth = async ( event ) => {
        event.preventDefault();

        if ( user !== false && user.shop.find( item => parseInt( item.shop_id ) === parseInt( props?.shop.id ) ) ) {
            jtAlert( '클린 시스템이 작동 중입니다\n뭉치고 사장님 고객센터로 연락바랍니다' );
        } else if ( user !== false ) {
            const result = await fetch( `${ WPURL }/modules/review/can?shop_id=${ props?.shop.id }`, {
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) }
            } ).then( res => res.json() );

            if ( ! result?.success ) {
                jtAlert( result?.message || '오류가 발생했습니다' );
            } else {
                router.push(
                    { pathname: '/shop/[slug]/review', query: { slug: props?.shop.slug } },
                    `/샵/${ props?.shop.slug }/후기작성`
                );
            }
        } else {
            router.push(
                { pathname: '/shop/[slug]/review', query: { slug: props?.shop.slug } },
                `/샵/${ props?.shop.slug }/후기작성`
            );
        }

        return false;
    }

    const handleModalClose = event => {
        router.back();

        // if ( router.pathname === '/shop/[slug]' ) {
        //     router.push( { pathname: router.route, query: router.query }, `${ current }#후기` );
        // } else {
        //     router.push( { pathname: router.route, query: router.query }, `${ current }` );
        // }
    }

    const closeTooltip = () => {
        cookies.set('hide_info_tooltip','1',{ 'max-age': 2147483647 })
    }
    const showTooltip = (parseInt(cookies.get('hide_info_tooltip'))) ?  false : true;


    React.useEffect( () => {
        if ( showModal !== false ) {
            const target = posts.find( item => ( item?.files || [] ).find( file => file.path === showModal ) );

            if ( target?.id ) {
                if ( router.pathname === '/shop/[slug]' ) {
                    router.push( { pathname: router.route, query: router.query }, `${ current }#후기-크게보기-${ target?.id }` );
                } else {
                    router.push( { pathname: router.route, query: router.query }, `${ current }#크게보기-${ target?.id }` );
                }
            }
        }
    }, [ showModal ] );

    React.useEffect( () => {
        if ( hash.split( '-' ).indexOf( '크게보기' ) >= 0 && showModal === false ) {
            const target = posts.find( item => item.id === hash.split( '-' ).pop() )?.files?.[0]?.path;

            if ( target ) {
                setShowModal( target );
                return;
            } else {
                setSize( size + 1 );
            }
        }
        setShowModal( false );
    }, [ hash ] );

    React.useEffect( () => {
        if ( isVisible ) {
            setSize( size + 1 );
        }
    }, [ isVisible ] );

    React.useEffect( () => {
        if ( hash.split( '-' ).indexOf( '크게보기' ) >= 0 && posts.find( item => item.id.toString() === hash.split( '-' ).pop() )?.files?.[0]?.path ) {
            setShowModal( posts.find( item => item.id.toString() === hash.split( '-' ).pop() ).files[0].path );
        }
    }, [ posts ] );

    if ( ! data ) {
        return (
            <Loading />
        );
    }

    return (
        <div className="shop_review_list_wrap">
            { ( props?.type === 'shop' ) && (
                <div className="shop_review_list_inner_wrap inner_wrap">
                    <Link href={ { pathname: '/shop/[slug]/review', query: { slug: props?.shop.slug } } } as={ `/샵/${ props?.shop.slug }/후기작성` }>
                        <a className="jt_btn_basic jt_type_02 btn_review_write login" onClick={ checkAuth }><span>후기를 남겨주세요</span></a>
                    </Link>

                    <p className="shop_review_num">총 { total_posts - total_wait }개의 후기</p>

                    <div className="shop_review_option">
                        <div className="shop_review_option_photo_only">
                            <Form.TrueFalse label="사진후기만" hideLabel value="photo" checked={ searchData.filter.indexOf( 'photo' ) >= 0 } onChange={ handleFilter } />
                        </div>
                        <ul>
                            <li className={ ( searchData.order === 'date' ? 'active' : '' ) }>
                                <Link href="#">
                                    <a className="review_sort" onClick={ e => handleOrder( e, 'date' ) }>최신순</a>
                                </Link>
                            </li>
                            <li className={ ( searchData.order === 'rankup' ? 'active' : '' ) }>
                                <Link href="#">
                                    <a className="review_sort" onClick={ e => handleOrder( e, 'rankup' ) }>별점높은순</a>
                                </Link>
                            </li>
                            <li className={ ( searchData.order === 'rankdown' ? 'active' : '' ) }>
                                <Link href="#">
                                    <a className="review_sort" onClick={ e => handleOrder( e, 'rankdown' ) }>별점낮은순</a>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            ) }

            { ( props?.type === 'author' ) && (
                <div className="review_user_info">
                    <Avatar type={ props.author.avatar } size="medium" />
                    <b>{ props.author.nickname }</b>
                    <span>작성한 후기 { total_posts }</span>
                </div>
            ) }

            { ( data && total_posts > 0 && props?.type === 'user' ) && (
                <HeaderList
                    title={`총 ${ total_posts }개`}
                    tooltip="이미 공개된 후기거나, 작성 후 48시간이 지난 후기, 또는 차단된 후기는 수정할 수 없습니다"
                />
            ) }

            { ( ! data ) && (
                <Loading />
            ) }

            { ( total_posts > 0 ) && (
                <div className="shop_review_list inner_wrap">
                    <div className="shop_review_list_inner">
                        { posts.map( ( item, index ) => (
                            <div key={ item.id } className={`shop_review_item ${(user !== false && item.author.user_id === user.user_id) ? 'shop_my_review_item' : ''}`}>
                                { ( props?.type === 'shop' ) && (
                                    <div className="shop_review_item_avatar">
                                        <Avatar type={ item.author.avatar } />
                                    </div>
                                ) }

                                <div className="shop_review_item_content">
                                    { ( props?.type === 'shop' ) ? (
                                        <div className="user_name_wrap">
                                            { ( user !== false && item.author.user_id === user.user_id ) ? (
                                                <Link href="/review" as="/후기관리">
                                                    <a className="user_name"><span>{ item.author.nickname }</span></a>
                                                </Link>
                                            ) : (
                                                <div>
                                                    <Link href={ { pathname: '/review/[author]', query: { author: item.author.user_id } } } as={ `/사용자-후기-모아보기/${ item.author.user_id }` }>
                                                        <a className="user_name">
                                                            <span>{ item.author.nickname }</span>
                                                        </a>
                                                    </Link>
                                                    {index === 0 &&
                                                        <Tooltip className="user_name_tooltip" arrowPos="bottom" show={showTooltip} onClose={closeTooltip}>닉네임 클릭 시 사용자 후기 모아보기가 가능합니다</Tooltip>
                                                    }
                                                </div>
                                            ) }
                                        </div>
                                    ) : (
                                        <Link href={ { pathname: '/shop/[slug]', query: { slug: decodeURI( item.shop.slug ) } } } as={ `/샵/${ decodeURI( item.shop.slug ) }` }>
                                            <a className={`shop_name ${item.status==="Y" ? 'shop_name_full' : ''}`}>
                                                <h2 className="h3" dangerouslySetInnerHTML={ { __html: item.shop.title } } />
                                            </a>
                                        </Link>
                                    ) }

                                    { ( item.status === 'N' ) && (
                                        <Status active>후기 확인중</Status>
                                    ) }

                                    { ( item.status === 'B' ) && (
                                        <Status blocked>Blocked</Status>
                                    ) }

                                    <div className="review_util_wrap">
                                        <Rating stars={ item.score } />
                                        <span className="review_time">{ item.date_diff }</span>
                                    </div>

                                    { ( item.files || [] ).map( ( file, file_idx ) => (
                                        <div key={ file_idx } className="review_photo preview_photo_thumb">
                                            <figure className="jt_lazyload_wrap jt_lazy_img">
                                                <img
                                                    src={ item.thumbnail?.[ file_idx ]?.path ? item.thumbnail[ file_idx ].path : file.path }
                                                    alt={ file.name }
                                                    onClick={ () => setShowModal( file.path ) }
                                                />
                                            </figure>
                                        </div>
                                    ) ) }

                                    <p className="review_desc t2">
                                        { item.content.split( '\n' ).map( ( line, line_idx ) => (
                                            <span key={ line_idx }>{ line }<br /></span>
                                        ) ) }
                                    </p>

                                    { ( item.can_modify === true || ( user !== null && item.author.user_id === user.user_id ) ) && (
                                        <ul className="review_actions">
                                            { ( item.can_modify === true ) && (
                                                <li className="review_modify">
                                                    { ( props?.type !== 'shop' ) ? (
                                                        <Link href={ { pathname: '/review/modify/[id]', query: { id: item.id } } } as={ `/후기관리/${ item.id }` }>
                                                            <a><span>수정</span></a>
                                                        </Link>
                                                    ) : (
                                                        <Link href={ { pathname: '/shop/[slug]/review/[id]', query: { slug: encodeURI( item.shop.slug ), id: item.id } } } as={ `/샵/${ item.shop.slug }/후기수정/${ item.id }` }>
                                                            <a><span>수정</span></a>
                                                        </Link>
                                                    ) }
                                                </li>
                                            ) }
                                            <li className="review_delete">
                                                <button type="button" onClick={ e => removeReivew( e, item.id ) }>
                                                    <span>삭제</span>
                                                </button>
                                            </li>
                                        </ul>
                                    ) }
                                </div>
                            </div>
                        ) ) }
                    </div>

                    { ( size < total_pages ) && (
                        <div ref={ scrollRef } style={ { height: '1px' } } />
                    ) }

                    <ModalImage
                        show={ showModal !== false }
                        onCloseClick={ handleModalClose }
                        image={ showModal }
                    />
                </div>
            ) }

            { ( data && total_posts === 0 && searchData.filter.indexOf( 'photo' ) >= 0 ) && (
                <div className="shop_review_no_data">
                    <Character useMarginTop type="no_result_04" text="사진후기가 없어요" />
                </div>
            ) }

            { ( data && total_posts === 0 && searchData.filter.indexOf( 'photo' ) < 0 ) && (
                <div className="shop_review_no_data">
                    <Character useMarginTop type="no_result_04" text={props?.type === 'author' ? '등록된 후기가 없어요' : '첫 후기를 작성해주세요'} />
                </div>
            ) }
        </div>
    );
}