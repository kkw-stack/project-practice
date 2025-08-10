import React, { Component } from 'react';

import { kakaoMapLoader, jtAlert } from 'lib/utils';

import style from './MapFinder.module.css';

export default class Map extends Component {

    constructor( props ) {
        super( props );

        this.map = {};
    }

    componentDidMount = () => {
        kakaoMapLoader( {
            libraries: 'services',
        }, this.initKakao );
    }

    initKakao = () => {
        const kakao = window.kakao;
        const { lat, lng } = this.props.searchLocation;

        kakao.maps.load( () => {
            const mapContainer = document.getElementById( 'map' ); // 지도를 표시할 div
            const mapOption = {
                center: new kakao.maps.LatLng( lat, lng ), // 지도의 중심좌표
                level: 4, // 지도의 확대 레벨
            };

            this.map = new kakao.maps.Map( mapContainer, mapOption ); // 지도를 생성합니다

            const imageSrc = require('./images/map-marker.svg'); // 마커이미지의 주소입니다
            const imageSize = new kakao.maps.Size( 29, 46 ); // 마커이미지의 크기입니다
            const imageOption = { offset: new kakao.maps.Point( 14, 46 ) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

            // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
            const markerImage = new kakao.maps.MarkerImage( imageSrc, imageSize, imageOption );
            const markerPosition  = new kakao.maps.LatLng( lat, lng );

            // 마커를 생성합니다
            const marker = new kakao.maps.Marker( {
                position: markerPosition,
                image: markerImage // 마커이미지 설정
            } );

            kakao.maps.event.addListener( this.map, 'tilesloaded', () => {
                // 마커의 위치를 지도중심으로 설정합니다
                marker.setPosition( this.map.getCenter() );
                marker.setMap( this.map );

                // Force 주소 표시 on load
                kakao.maps.event.trigger( this.map, 'center_changed' );
            } );

            kakao.maps.event.addListener( this.map, 'center_changed', () => {
                const position = this.map.getCenter();
                marker.setPosition( position );

                // 주소-좌표 변환 객체를 생성합니다
                const geocoder = new kakao.maps.services.Geocoder();

                //var geocoder = new kakao.maps.services.Geocoder();
                geocoder.coord2Address( position.getLng(), position.getLat(), ( result, status ) => {
                    if ( status === kakao.maps.services.Status.OK ) {
                        try {
                            const { region_1depth_name, region_2depth_name, region_3depth_name } = result[0].address;

                            this.props.setLocation(
                                position.getLat(),
                                position.getLng(),
                                [ region_1depth_name, region_2depth_name, region_3depth_name ].filter( item => ( item ? item : '' ) ).join( ' ' ),
                                [ region_1depth_name, region_2depth_name, region_3depth_name ].filter( item => ( item && item ) ).pop()
                            );
                        } catch ( e ) {
                            console.log( e );
                        }
                    }
                } );
            } );
        } );
    }

    getCurrentLocation = ( event ) => {
        event.preventDefault();

        // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
        if ( navigator.geolocation ) {
            const locationOptions = {};
            const kakao = window.kakao;

            // GeoLocation을 이용해서 접속 위치를 얻어옵니다
            navigator.geolocation.getCurrentPosition( (position) => {
                const lat = position.coords.latitude; // 위도
                const lon = position.coords.longitude; // 경도
                const locPosition = new kakao.maps.LatLng( lat, lon ) // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다

                this.map.setCenter( locPosition ); // 마커를 표시합니다
            },  ( err ) => {
                jtAlert( '내 주변을 찾으려면\n위치서비스를 켜주세요' );
            }, locationOptions );
        } else { // HTML5의 GeoLocation을 사용할 수 없을때 내용을 설정합니다
            jtAlert( '이 브라우저에서는 Geolocation이 지원되지 않습니다' );
        }

        return false;
    }

    render = () => {
        return (
            <div className={ style.container }>
                <div id="map" className={ style.map }></div>
                <div className={ style.desc }><p>지도를 움직여 위치를 설정하세요</p></div>
                <div className={ style.address }><p>{ this.props.searchLocation.name }</p></div>
                <button onClick={ this.getCurrentLocation } className={ style.current }>
                    <span className="sr_only">현재위치로 이동</span>
                </button>
            </div>
        );
    }

}