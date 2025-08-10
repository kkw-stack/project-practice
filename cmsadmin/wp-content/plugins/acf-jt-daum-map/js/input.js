( function ( $ ) {

    function initialize_field( $field ) {

        var $map     = $( '.jt-map-wrapper', $field );
        var $default = $( '.acf-jt-daum-map', $field );

        var $addr    = $( '.input-address', $field );
        var $lat     = $( '.input-lat', $field );
        var $lng     = $( '.input-lng', $field );
        var $search  = $( 'input.search', $field );

        if ( typeof kakao !== 'undefined' && $map.length > 0 ) {

            var lat      = ( parseFloat( $lat.val() ) ? parseFloat( $lat.val() ) : parseFloat( $default.data( 'lat' ) ) );
            var lng      = ( parseFloat( $lng.val() ) ? parseFloat( $lng.val() ) : parseFloat( $default.data( 'lng' ) ) );

            var markerPosition = new kakao.maps.LatLng( lat, lng );

            // 지도 생성
            var map = new kakao.maps.Map( $map.get( 0 ), { center: markerPosition, level: $default.data( 'zoom' ) } );

            // 마커 생성
            var marker = new kakao.maps.Marker( { position: markerPosition } );

            // 마커 지도 위에 표시
            marker.setMap( map );

            // 마커 드래그 기능
            marker.setDraggable( true );

            // 지도 줌 컨트롤
            var zoomControl = new kakao.maps.ZoomControl();
            map.addControl( zoomControl, kakao.maps.ControlPosition.RIGHT );

            // 마커 드래그시 위도 경도
            kakao.maps.event.addListener( marker, 'dragend', function () {

                try {

                    var markerLocation = marker.getPosition();
                    var geocoder = new kakao.maps.services.Geocoder();

                    geocoder.coord2Address( markerLocation.getLng(), markerLocation.getLat(), function ( result, status ) {

                        if ( status === kakao.maps.services.Status.OK ) {

                            var addr = result[ 0 ].road_address ? result[ 0 ].road_address.address_name : result[ 0 ].address.address_name;

                            $addr.val( addr );
                            $search.val( addr );

                        }

                    } );

                    $lat.val( markerLocation.getLat() );
                    $lng.val( markerLocation.getLng() );

                } catch ( e ) {

                    console.log( e );

                }

            } );

            // 마커 클릭시 위도 경도
            kakao.maps.event.addListener( map, 'click', function ( mouseEvent ) {

                try {

                    var geocoder = new kakao.maps.services.Geocoder();
                    geocoder.coord2Address( mouseEvent.latLng.getLng(), mouseEvent.latLng.getLat(), function ( result, status ) {

                        if ( status === kakao.maps.services.Status.OK ) {

                            var addr = result[ 0 ].road_address ? result[ 0 ].road_address.address_name : result[ 0 ].address.address_name;

                            $addr.val( addr );
                            $search.val( addr );

                        }

                    } );

                    //마커 위치 이동
                    marker.setPosition( mouseEvent.latLng );

                    $lat.val( mouseEvent.latLng.getLat() );
                    $lng.val( mouseEvent.latLng.getLng() );

                } catch ( e ) {

                    console.log( e );

                }

            } );

            // 주소 검색
            $search.on( 'keydown', function ( e ) {

                if ( e.keyCode && e.keyCode == 13 ) {

                    search_addr();
                    return false;

                }

            } ).on( 'blur', function ( e ) {

                // search_addr();

            } );

            $( 'a[data-name=search]', $field ).on( 'click', function () {

                search_addr();

            } );

            $( 'a[data-name=clear]', $field ).on( 'click', function () {


                $search.val( '' );
                $addr.val( '' );
                $lat.val( '' );
                $lng.val( '' );

                var d_lat   = parseFloat( $default.data( 'lat' ) );
                var d_lng   = parseFloat( $default.data( 'lng' ) );

                var d_pos   = new kakao.maps.LatLng( d_lat, d_lng );

                marker.setPosition( d_pos );
                map.setCenter( d_pos );
                map.setLevel( $default.data( 'zoom' ) );

            } );

            function search_addr( forced ) {

                try {

                    /*
                    var places = new kakao.maps.services.Places();

                    places.keywordSearch( $search.val(), function ( result, status ) {

                        console.log( result );

                    } );
                    */

                    var geocoder = new kakao.maps.services.Geocoder();

                    // 주소로 좌표 검색
                    geocoder.addressSearch( $search.val(), function( result, status ) {

                        if ( status === kakao.maps.services.Status.OK ) {

                            var res  = result[ 0 ];
                            var addr = res.address_name;
                            var lat  = res.y;
                            var lng  = res.x;
                            var coords = new kakao.maps.LatLng( lat, lng );

                            // 검색주소 마커 표시
                            marker.setPosition( coords );

                            // 검색결과 지도 이동
                            map.setCenter( coords );

                            // 줌컨트롤 기본값으로 변경
                            map.setLevel( $default.data( 'zoom' ) );

                            $search.val( addr );
                            $addr.val( addr );
                            $lat.val( lat );
                            $lng.val( lng );

                        } else if ( ! forced ) {

                            alert( '해당 주소에 대한 검색 결과가 없습니다' );

                        }

                    } );

                } catch ( e ) {

                    // console.log( e );

                }


            }

            acf.addAction( 'show_field', function () {

                map.relayout();

            } );

        } else if ( typeof daum === 'undefined' ) {

            if ( $map.length > 0 ) {

                $map.html( '<p class="error">Error :: Set API Key Or Check Your API Settings <br />Use Filter :: <br /><code>add_filter( "acf_jt_daum_api_key", function () { return "YOUR-API-KEY"; } );</code></p>' );
                $map.css( { height: 'auto' } );

            } else {

                alert( 'Error :: Set API Key Or Check Your API Settings' );

            }

        }

    }


    if ( typeof acf.add_action !== 'undefined' ) {

        acf.add_action('ready_field/type=jt_daum_map', initialize_field);
        acf.add_action('append_field/type=jt_daum_map', initialize_field);

    } else {

        $( document ).on( 'acf/setup_fields', function ( e, postbox ) {

            $( postbox ).find( '.field[data-field_type="jt_daum_map"]' ).each( function () {

                initialize_field( $( this ) );

            } );

        } );

    }

} )( jQuery );