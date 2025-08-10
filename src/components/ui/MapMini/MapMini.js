import React, { Component } from 'react';

import { kakaoMapLoader } from 'lib/utils';
import { debounce } from 'lib/utils';

import ClipBoard from 'components/ui/ClipBoard/ClipBoard';
import CopyIcon from 'components/ui/CopyIcon/CopyIcon';

import style from './MapMini.module.css';

export default function MapMini( props ) {
    const mapRef = React.createRef();
    const [ kakaoMapUrl, setKakaoMapUrl ] = React.useState( `https://map.kakao.com/link/map/${ props.addr },${ props.lat },${ props.lng }` );
    const [ isMapLoad ,setIsMapLoad ] = React.useState(false);

    let map = null;

    const mapOffset =  -0.00028;
    const mapLat =  props.lat - mapOffset;
    const mapLng =  props.lng;

    const initKakao = container => {

        const kakao = window.kakao;

        kakao.maps.load( () => {
            // init map

            const centerPosition = new kakao.maps.LatLng( mapLat, mapLng );
            const centerPositionNoOffset = new kakao.maps.LatLng( props.lat, props.lng ); // use in map link
            const options = {
                center: centerPosition,
                level: 4,
                tileAnimation: false,
                draggable: false,
                scrollwheel: false,
                disableDoubleClick: false,
                disableDoubleClickZoom: false
            };
            map = new kakao.maps.Map( container, options );
            map.setCopyrightPosition(kakao.maps.CopyrightPosition.BOTTOMLEFT, true);

            const imageSrc = '/images/map/shop-map-marker.svg';
            const imageSize = new kakao.maps.Size(47, 31);
            //const imageOption = {offset: new kakao.maps.Point(27, 69)};

            const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
            const markerPosition = new kakao.maps.LatLng(props.lat, props.lng );

            let marker = new kakao.maps.Marker({
                position: markerPosition,
                image: markerImage
            });
            marker.setMap(map);

            // map url
            setKakaoMapUrl( `https://map.kakao.com/?urlX=${ centerPositionNoOffset.toCoords().La }&urlY=${ centerPositionNoOffset.toCoords().Ma }&name=${ encodeURIComponent(props.title) }&level=4` );
        } );
    }

    //Init callback
    React.useEffect( () => {
        if ( mapRef?.current && mapRef.current !== null ) {
            const container = mapRef.current;
            kakaoMapLoader( {
                libraries: 'services',
            }, () => {
                if(!isMapLoad){
                    initKakao( container );
                    setIsMapLoad(true);
                }
            } );
        }
    },[]);

    // Resize callback
    React.useEffect(() => {
        const debouncedHandleResize = debounce(function() {
            if(map != null){
                const centerPosition = new kakao.maps.LatLng( mapLat, mapLng );

                map.setCenter(centerPosition);
                map.relayout();
            }
        }, 50);

       window.addEventListener('resize', debouncedHandleResize)

        return () => {
            window.removeEventListener('resize', debouncedHandleResize)
        }
    },[]);

    return (
        <div className={ style.container }>
            <a href={kakaoMapUrl} target="_blank" className={ style.link }>
                <div className={ style.location_map }>
                    <div id="minimap" ref={ mapRef } className={ style.location_map_inner }></div>
                </div>
            </a>
            <ClipBoard text={props.addr} >
            <div className={ style.address } >
                <span className={ style.address_text }>{ props.addr }</span>
                <CopyIcon />
            </div>
            </ClipBoard>
        </div>
    );
}
