<?php
if (!isset($_SERVER['REMOTE_ADDR']) || !in_array($_SERVER['REMOTE_ADDR'], array('59.20.140.229', '3.36.21.243'))) {
    http_response_code(404);
    exit;
}

require_once $_SERVER[ 'DOCUMENT_ROOT' ] . '/cmsadmin/wp-load.php';

global $wpdb;

$is_forced = ( isset( $_REQUEST['forced'] ) && $_REQUEST['forced'] === '201' );

if ( intVal( date_i18n( 'H' ) )  === 11 || $is_forced ) {

    // 광고 시작 알림톡 발송 :: SJT_065406 광고 시작 알림 20210723
    $now = date_i18n( 'Y-m-d' );
    $post_ids = get_posts( array(
        'post_type'         => 'shop',
        'post_status'       => array( 'publish', 'pending', 'private' ),
        'posts_per_page'    => -1,
        'fields'            => 'ids',
        'meta_query'        => array(
                                array(
                                    'key'       => 'shop_ad_period_start',
                                    'compare'   => '=',
                                    'value'     => $now
                                )
                            )
    ) );

    if ( ! empty( $post_ids ) ) {
        foreach ( $post_ids as $post_id ) {

            $result = jt_send_kakao( $post_id, 'START', true ); // 알림톡 발송

            $wpdb->update( $wpdb->posts, array(
                'post_modified'     => date_i18n( 'Y-m-d H:i:s' ),
                'post_modified_gmt' => date( 'Y-m-d H:i:s' ),
                'post_status'       => 'publish'
            ), array( 'ID' => $post_id, ) );

            // wp_update_post( array(
            //     'ID'                => $post_id,
            //     'post_modified'     => date_i18n( 'Y-m-d H:i:s' ),
            //     'post_modified_gmt' => date( 'Y-m-d H:i:s' ),
            //     'post_status'       => 'publish'
            // ) );

            if ( $is_forced ) {
                if ( $result ) {
                    echo '<pre>광고 시작 알림톡 발송완료 :: '; print_r( $post_id ); echo '</pre>';
                } else {
                    echo '<pre>광고 시작 알림톡 발송 실패 :: '; print_r( $post_id ); echo '</pre>';
                }
            }
        }
    }

    // 광고 종료 처리 및 알림톡 발송 :: SJT_065409 광고 종료 20210723
    $now = date_i18n( 'Y-m-d' );
    $post_ids = get_posts( array(
        'post_type'         => 'shop',
        'post_status'       => 'publish',
        'fields'            => 'ids',
        'posts_per_page'    => -1,
        'meta_query'        => array(
                                array(
                                    'key'       => 'shop_ad_period_end',
                                    'compare'   => '<=',
                                    'value'     => $now
                                )
                            )
    ) );

    if ( ! empty( $post_ids ) ) {
        foreach ( $post_ids as $post_id ) {
            $result = jt_send_kakao( $post_id, 'END', true );

            $wpdb->update( $wpdb->posts, array(
                'post_modified'     => date_i18n( 'Y-m-d H:i:s' ),
                'post_modified_gmt' => date( 'Y-m-d H:i:s' ),
                'post_status'       => 'pending'
            ), array( 'ID' => $post_id, ) );

            // wp_update_post( array(
            //     'ID'                => $post_id,
            //     'post_modified'     => date_i18n( 'Y-m-d H:i:s' ),
            //     'post_modified_gmt' => date( 'Y-m-d H:i:s' ),
            //     'post_status'       => 'pending'
            // ) );

            if ( $is_forced ) {
                if ( $result ) {
                    echo '<pre>광고 종료 알림톡 발송완료 :: '; print_r( $post_id ); echo '</pre>';
                } else {
                    echo '<pre>광고 종료 알림톡 발송 실패 :: '; print_r( $post_id ); echo '</pre>';
                }
            }
        }
    }

    // 광고 종료 3일전 알림톡 발송 :: SJT_065407 광고 종료 D-day 20210723
    $interval = 3;
    $now = date( 'Y-m-d', strtotime( date_i18n( 'Y-m-d' ) . ' +' . $interval . ' days' ) );
    $post_ids = get_posts( array(
        'post_type'         => 'shop',
        'post_status'       => 'publish',
        'fields'            => 'ids',
        'posts_per_page'    => -1,
        'meta_query'        => array(
                                'relation'  => 'AND',
                                array(
                                    'key'       => 'shop_ad_period_end',
                                    'compare'   => '=',
                                    'value'     => $now
                                ),
                                array(
                                    'key'       => 'shop_ad_type',
                                    'compare'   => 'IN',
                                    'value'     => array( 'super', 'big' ),
                                ),
                            )
    ) );

    if ( ! empty( $post_ids ) ) {
        foreach ( $post_ids as $post_id ) {
            $result = jt_send_kakao( $post_id, 'DDAY', true );

            if ( $is_forced ) {
                if ( $result ) {
                    echo '<pre>광고 종료 DDay 알림톡 발송완료 :: '; print_r( $ceo_phone ); echo '</pre>';
                } else {
                    echo '<pre>광고 종료 DDay 알림톡 발송 실패 :: '; print_r( $ceo_phone ); echo '</pre>';
                }
            }
        }
    }

    // SiteMap Update
    // jt_update_sitemap();

    // 구글 수집 요청
    // file_get_contents( 'http://www.google.com/webmasters/sitemaps/ping?sitemap=' . $home_url . '/sitemap.xml' );
}
