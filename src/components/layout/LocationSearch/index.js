import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import queryString from 'query-string';

import { AppContext } from 'lib/context';
import { getLocalStorageData, setLocalStorageData, kakaoMapLoader, queryStringOptions, useDevice, jtAlert, delLocalStorageData } from 'lib/utils';
import { useArea } from 'lib/swr';

import Loading from 'components/ui/Loading/Loading';
import Header from 'components/ui/Header/Header';
import Tabs from 'components/ui/Tabs/Tabs';
import Button from 'components/ui/Button/Button';
import Search from 'components/ui/Search/Search';
import DeletableItem from 'components/ui/DeletableItem/DeletableItem';
import ButtonCta from 'components/ui/ButtonCta/ButtonCta';
import MapFinder from 'components/ui/MapFinder/MapFinder';
import Character from 'components/ui/Character/Character';
import OverflowScroller from 'components/ui/OverflowScroller/OverflowScroller';
import Vh from 'components/ui/Vh/Vh';

import style from './location.module.css';

export default function LocationSearch( props ) {

    const { isHome, location, setLocation, showLocation, setShowLocation, searching, setSearching } = React.useContext( AppContext );
    const router = useRouter();
    const [ searchQuery, setSearchQuery ] = React.useState( queryString.parse( router.asPath.split( '?' ).pop(), queryStringOptions ) );
    const { data: area, mutate: mutateArea } = useArea( [] );
    const [ currentArea, setCurrentArea ] = React.useState( parseInt( area?.[0]?.id ) ? parseInt( area[0].id ) : 0 );
    const [ searchLocations, setSearchLocations ] = React.useState( getLocalStorageData( 'jt-mcg-locations' ) || [] );
    const [ search, setSearch ] = React.useState( searchQuery?.search || '' );
    const [ searchResult, setSearchResult ] = React.useState( false );
    const [ mapLocation, setMapLocation ] = React.useState( {
        lat: ( parseFloat( location.lat ) ? parseFloat( location.lat ) : 37.49826342262116 ),
        lng: ( parseFloat( location.lng ) ? parseFloat( location.lng ) : 127.0278391925548 ),
        name: ( parseFloat( location.lat ) && parseFloat( location.lng ) ? location.name : '' ),
        lastName: ( parseFloat( location.lat ) && parseFloat( location.lng ) ? location.lastName : '' ),
    } );
    const [ current, hash ] = decodeURI( router.asPath ).split( '#' );
    const [ mapRendered, setMapRendered ] = React.useState( Date.now() );

    const [ resultRender, setResultRender ] = React.useState( Date.now() );

    const [ loaded, setLoaded ] = React.useState( false );
    
    const [ previousPath, setPreviousPath ] = React.useState('');

    const device = useDevice();

    const setLocationContext = ( { area, areaSlug, lat, lng, name, lastName = '' } ) => {
        const result = {
            area: ( parseInt( area ) ? parseInt( area ) : false ),
            areaSlug: ( parseInt( area ) ? areaSlug : '' ),
            lat: ( parseFloat( lat ) ? parseFloat( lat ) : false ),
            lng: ( parseFloat( lng ) ? parseFloat( lng ) : false ),
            name: name,
            lastName: lastName
        }

        const storage = getLocalStorageData('jt-mcg-location');

        setSearchLocations(
            [ result ].concat(
                searchLocations.filter( item => JSON.stringify( item ) !== JSON.stringify( result ) )
            )
        );

        // 지역기반 - 지역코드 존재 && 지역슬러그 === 지역쿼리
        // 위치기반 - 저장된 위치 === 새로운 위치 && 위치쿼리 === 새로운 위치
        if( ( area && decodeURI( areaSlug ) === decodeURI( router.query?.area ) ) || ( ( JSON.stringify( storage ) === JSON.stringify( result ) ) && ( parseFloat(router.query?.lat) === parseFloat(result.lat) && parseFloat(router.query?.lng) === parseFloat(result.lng) ) ) ) {

            // 지역기반이면서 지역코드가 다른경우에만 새로운 위치설정
            if( area && ( parseInt(area) !== parseInt(storage.area) ) ){
                delLocalStorageData( 'jt-mcg-location' );
                setLocation( result );
            }

            setShowLocation( false );
            setSearching( false );
        } else {
            delLocalStorageData( 'jt-mcg-location' );
            setLocation( result );

            if( !isHome ){
                setSearching( true );
            } else {
                setShowLocation( false );
            }
        }

        setSearchResult( false );

        // router.push('/');
    }

    const setCurrentLocation = event => {
        event.preventDefault();

        if ( navigator.geolocation ) {
            kakaoMapLoader( { libraries: 'services' }, () => {
                const kakao = window.kakao;

                kakao.maps.load( () => {
                    navigator.geolocation.getCurrentPosition( (position) => {
                        const lat = position.coords.latitude; // 위도
                        const lng = position.coords.longitude; // 경도
                        const geocoder = new kakao.maps.services.Geocoder();

                        geocoder.coord2Address( lng, lat, ( result, status ) => {
                            if ( status === kakao.maps.services.Status.OK ) {
                                const { region_1depth_name, region_2depth_name, region_3depth_name } = result[0].address;

                                setLocationContext( {
                                    lat: lat,
                                    lng: lng,
                                    name: [ region_1depth_name, region_2depth_name, region_3depth_name ].filter( item => ( item ? item : '' ) ).join( ' ' ),
                                    lastName: [ region_1depth_name, region_2depth_name, region_3depth_name ].filter( item => ( item && item ) ).pop(),
                                } );
                            }
                        } );
                    },  ( err ) => {
                        jtAlert( '내 주변을 찾으려면\n위치서비스를 켜주세요' );
                    }, {} );
                } );
            } );
        } else {
            jtAlert( '이 브라우저에서는 Geolocation이 지원되지 않습니다' );
        }

        return false;
    }

    const searchLocation = keyword => {
        if ( keyword ) {
            setSearch( keyword );
        } else {
            // jtAlert( '검색어를 입력하세요' );
        }
    }

    const handleSearchResult = ( event, data ) => {
        event.preventDefault();

        setLocationContext( data );

        return false;
    }

    const removeLocation = ( event, data ) => {
        event.preventDefault();

        setSearchLocations(
            searchLocations.filter( item => JSON.stringify( item ) !== JSON.stringify( data ) )
        );

        return false;
    }

    const removeAllLocation = event => {
        event.preventDefault();

        setSearchLocations( [] );

        return false;
    }

    const handleParentArea = ( event, data ) => {
        event.preventDefault();

        setCurrentArea( parseInt( data ) );

        return false;
    }

    const handleArea = ( event, data ) => {
        event.preventDefault();

        const parent = area.find( item => parseInt( item.id ) === parseInt( currentArea ) );
        const name = (data === parent ? `${data.name} 전체` : `${parent.name} ${data.name}`);
        setLocationContext( { area: parseInt( data.id ), areaSlug: data.slug, name: name } );

        return false;
    }

    const handleMapLocation = ( lat, lng, name, lastName ) => {
        setMapLocation( { lat: lat, lng: lng, name: name, lastName: lastName } )
    }

    const handleMapCurrentLocation = event => {
        event.preventDefault();

        setLocationContext( mapLocation );

        return false;
    }

    const handleClose = (e) => {
        e.preventDefault();
        if( history?.state?.location === 'open'){
            history.back(); 
        }
        setShowLocation( false );
    }

    const handleChange = ( tab ) => {
        if( tab === '지도' ){
            setMapRendered( Date.now() );
        }
    }

    // Prevent body to scroll but Keep scroll position
    React.useEffect(() => {
        
        let scrollY = 0;
        
        if( showLocation ){
            document.body.style.top = `-${window.scrollY}px`;
            document.body.classList.add('location_open');  
            setPreviousPath(router?.pathname); 
        } else {
            scrollY = document.body.style.top;
            document.body.style.top = '';
            document.body.classList.remove('location_open');
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
            if(e.state != null && e.state.location == 'open'){
                setShowLocation(true);
            }else{
                setShowLocation(false);
            }
        }
        window.addEventListener('popstate', handleBackButton)

        return () => {
            window.removeEventListener('popstate', handleBackButton)
        }

    }, [ showLocation ]);

    React.useEffect( () => {
        if ( search !== '' ) {
            kakaoMapLoader( { libraries: 'services' }, () => {
                const tmpSearchResult = [];
                const kakao = window.kakao;
                kakao.maps.load( () => {
                    const places = new kakao.maps.services.Places();
                    places.keywordSearch( search, ( result, status, pagination ) => {
                        if ( status === kakao.maps.services.Status.OK ) {
                            for ( let item of result ) {
                                tmpSearchResult.push( {
                                    name: item.place_name,
                                    lat: item.y,
                                    lng: item.x,
                                    address: ( item?.road_address_name ? item.road_address_name : item.address_name ),
                                } );
                            }

                            if ( pagination.hasNextPage ) {
                                pagination.nextPage();
                            } else {
                                setSearchResult( tmpSearchResult );
                            }
                        } else {
                            setSearchResult( [] );
                        }
                    } );
                } );

                // if ( decodeURI( router.asPath ) !== `/위치설정?search=${ search }` ) {
                //     router.push( { pathname: '/location', query: { search: search } }, `/위치설정?search=${ search }`, { shallow: true } );
                // }
            } );
        } else {
            setSearchResult( false );
        }
    }, [ search ] );

    React.useEffect( () => {
        setResultRender( Date.now() );
    }, [ searchResult ] );

    React.useEffect( () => {
        if ( currentArea === 0 && area?.[0]?.id ) {
            setCurrentArea( parseInt( area[0].id ) );
        }
    }, [ area ] );

    React.useEffect( () => {
        setLocalStorageData( 'jt-mcg-locations', searchLocations.filter( ( item, idx ) => idx < 10 ) );
    }, [ searchLocations ] );

    React.useEffect( () => {
        setSearchQuery( queryString.parse( router.asPath.split( '?' ).pop(), queryStringOptions ) );
        setShowLocation( false );
        setSearching( false );
    }, [ router.asPath ] );

    React.useEffect( () => {
        if ( searchQuery?.search !== search ) {
            setSearch( searchQuery?.search || '' );
        }
    }, [ searchQuery] );

    // hash 방식 제거
    // React.useEffect( () => {
    //     if ( hash === '지도' ) {
    //         setMapRendered( Date.now() );
    //     }
    // }, [ hash ] );

    React.useEffect( () => {
        if ( search !== '' ) {
            searchLocation( search );
        }
        mutateArea();
        setLoaded( true );
    }, [] );

    return (
        <div className={ `screen_location ${ style.container } ${ showLocation ? style.show : '' }` }>
            { searching ? <Loading full /> :
                <>
                { ( searchResult !== false ) ? (
                    <Header fixed useNoShadow closeRight useClose onCloseClick={handleClose} centerMode noTitleTag title="위치설정" />
                ) : (
                    <Header fixed closeRight useClose onCloseClick={handleClose} centerMode noTitleTag title="위치설정" />
                ) }

                { ( searchResult !== false ) && (
                    <div className="view">
                        <div className={style.result_list_search_container}>
                            <Search seamless value={ search } placeholder="장소, 지하철, 건물명을 입력하세요" onSubmitHandle={ searchLocation } />
                        </div>
                        <div className={ style.result_list_container } key={ resultRender }>
                            { searchResult.length > 0 ? (
                                <ul className={ `inner_wrap scroll_area ${style.result_list}` }>
                                    { searchResult.map( ( item, idx ) => (
                                        <li key={ idx }>
                                            <Link href="/">
                                                <a onClick={ e => handleSearchResult( e, item ) }>
                                                    <b>{ item.name }</b>
                                                    <p>{ item.address }</p>
                                                </a>
                                            </Link>
                                        </li>
                                    ) ) }
                                </ul>
                            ) : (
                                <Character useMarginTop type="no_result_07" text="검색결과가 없습니다" />
                            ) }
                        </div>

                    </div>
                ) }

                { ( searchResult === false ) && (
                    <div className={`view scroll_area ${style.view}`}>
                        <Tabs seamless usePush={ false } onChange={ handleChange }>
                            <div label="최근">
                                <div className={ style.last }>
                                    <div className={ style.last_inner }>
                                        <div className={ style.last_form }>
                                            <div className={ `inner_wrap ${style.last_form_inner}` }>
                                                <Search  placeholder="장소, 지하철, 건물명을 입력하세요" onSubmitHandle={ searchLocation } />
                                                <div className={style.last_set_location_button}>
                                                    <Button icon="location" iconRight iconSize={21} href="#map_tab_wrap" className={ style.last_current } onClick={ setCurrentLocation }>
                                                        <span>내 주변 샵 찾기</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        { ( () => {
                                            if ( loaded ) {
                                                if ( searchLocations.length > 0 ) {
                                                    return (
                                                        <div className={ style.last_history }>
                                                            <p className={style.last_history_header}>
                                                                최근 기록
                                                                <button onClick={ removeAllLocation } type="button" className={ style.last_delete_all }>전체삭제</button>
                                                            </p>

                                                            <ul className={ `inner_wrap ${style.last_history_list}` }>
                                                                { searchLocations.map( ( item, idx ) => (
                                                                    <DeletableItem
                                                                        key={ idx}
                                                                        text={ item.name }
                                                                        handleClick={ e => handleSearchResult( e, item ) }
                                                                        handleDelete={ e => removeLocation( e, item ) }
                                                                    />
                                                                ) ) }
                                                            </ul>
                                                        </div>
                                                    );
                                                } else if ( location.area === false && location.lat === false && location.lng === false ) {
                                                    return (
                                                        <div>
                                                            <Character useMarginTop type="gogo" text="위치를 설정해주세요" />
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div className={ style.last_history }>
                                                            <p className={ style.last_history_header }>
                                                                최근 기록
                                                            </p>
                                                            <Character useMarginTop type="no_result_01" text="기록내역이 없습니다" />
                                                        </div>
                                                    );
                                                }
                                            }
                                        } )() }
                                    </div>
                                </div>
                            </div>
                            <div label="지역별">
                                { area.length === 0 ? (
                                    <Loading />
                                ) : (
                                    <>
                                    <div className={ style.area_container }>
                                        <div className={ style.area_primary }>
                                            <OverflowScroller offset={{sm:117,lg:135}} className="scroll_area">
                                                <ul className={ style.area_primary_list }>
                                                    { area.map( ( item ) => (
                                                        <li key={ item.id } className={ ( parseInt( item.id ) === parseInt( currentArea ) ? style.area_active : '' ) }>
                                                            <Link href="#">
                                                                <a onClick={ event => handleParentArea( event, item.id ) }>
                                                                    <span>{ item.name }</span>
                                                                </a>
                                                            </Link>
                                                        </li>
                                                    ) ) }
                                                </ul>
                                            </OverflowScroller>
                                        </div>

                                        <div key={ currentArea } className={style.area_secondary}>
                                            <OverflowScroller offset={{sm:117,lg:135}} className="scroll_area">
                                                { area.filter( areaItem => parseInt( areaItem.id ) === parseInt( currentArea ) ).map( item => (
                                                    <ul key={ item.id }>
                                                        <li key={item.id}>
                                                            <Link href="#">
                                                                <a onClick={event => handleArea(event, item)}>
                                                                    <span>{item.name} 전체</span>
                                                                    {(!parseInt(item.count)) && (
                                                                        <span className={style.area_empty}><i className="sr_only">텅~</i></span>
                                                                    )}
                                                                </a>
                                                            </Link>
                                                        </li>
                                                        { item.child.map( ( child ) => {
                                                            return (
                                                                <li key={ child.id }>
                                                                    <Link href="#">
                                                                        <a onClick={ event => handleArea( event, child ) }>
                                                                            <span>{ child.name }</span>
                                                                            { ( ! parseInt( child.count ) ) && (
                                                                                <span className={ style.area_empty }><i className="sr_only">텅~</i></span>
                                                                            ) }
                                                                        </a>
                                                                    </Link>
                                                                </li>
                                                            )
                                                        } ) }
                                                    </ul>
                                                ) ) }
                                            </OverflowScroller>
                                        </div>
                                    </div>
                                    </>
                                ) }
                            </div>
                            <div label="지도" key={ mapRendered }>
                                <OverflowScroller offset={{sm:117+70,lg:135+70}}>
                                    <MapFinder searchLocation={ mapLocation } setLocation={ handleMapLocation } />
                                </OverflowScroller>
                                <ButtonCta onClick={ handleMapCurrentLocation }>이 주변 샵 찾기</ButtonCta>
                            </div>
                        </Tabs>
                    </div>
                ) }
                </>
            }
            
        </div>
    );
}
