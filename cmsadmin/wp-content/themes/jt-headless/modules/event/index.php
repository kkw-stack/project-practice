<?php
/*
 * Name       : EVENT
 * namespace  : event
 * File       : /modules/event/index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) EVENT 프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


 /**
 * event Size 추가
 */
add_image_size( 'jt_thumbnail_event', 468, 175, array( 'center', 'top' ) );
add_image_size( 'jt_main_event_slide', 720, 304, array( 'center', 'top' ) );
add_image_size( 'jt_event_list', 656, 246, array( 'center', 'top' ) );
add_image_size( 'jt_main_slide2x', 1000, 430, array( 'center', 'top' ) );
add_image_size( 'jt_main_slide', 500, 215, array( 'center', 'top' ) );

/**
 * EVENT 프로그램 실행
 */
$jt_event = new Jt_event();

/**
 * Jt_event Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_event extends Jt_Module{

    public function __construct() {
        // parent::__construct( 'event', '게시판', '게시판', '게시판',array('title', 'editor', 'excerpt', 'jt_download'), false, '1.0.0', 90 );
        parent::__construct( array(
            'namespace'     => 'event',
            'name'          => '이벤트',
            'support'       => array( 'title', 'editor', 'excerpt', 'jt_download', 'thumbnail' ),
            'support_cat'   => false,
            'pageid'        => 336,
        ) );
    }


    protected function _get_post_data( $post_id = 0, $is_single = false ) {
        $post_id = intVal( $post_id );
        $post = get_post( $post_id );
        $result = null;

        if ( ! empty( $post ) ) {
            if ( $this->_rest_config[ 'list_own' ] && $post->post_author != get_current_user_id() ) return null;

            $result = array(
                'id'            => intVal( $post->ID ),
                'slug'          => $post->post_name,
                'permalink'     => str_replace( home_url(), '', get_permalink( $post ) ),
                'status'        => $post->post_status,
                'is_sticky'     => is_sticky( $post->ID ),
                'author'        => intVal( $post->post_author ),
                'title'         => $post->post_title,
                'thumbnail'     => ( has_post_thumbnail( $post->ID ) ? get_the_post_thumbnail_url( $post ) : '' ),
                'attachment'    => array(),
                'start_date'    => get_field( 'event_date_start', $post->ID ),
                'end_date'      => get_field( 'event_date_end', $post->ID ),
                'date'          => $post->post_date,
            );

            if ( in_array( 'jt_download', $this->_support ) ) {
                $jt_download = get_post_meta( $post->ID, 'jt_download', true );

                if ( is_array( $jt_download ) && ! empty( $jt_download ) ) {
                    foreach ( $jt_download as $item ) {
                        $result['attachment'][] = $this->jt_download_get_info( $item );
                    }
                }

                $result['tmp'] = $jt_download;
            }

            if ( $is_single ) {
                $result['content'] = apply_filters( 'the_content', get_post_field( 'post_content', $post->ID ) );
                $result['excerpt'] = $post->post_excerpt;
                $result['meta'] = get_fields( $post->ID );
                $result['list'] = ( $this->_pageid ? str_replace( home_url(), '', get_permalink( $this->_pageid ) ) : '' );

                $prev = $this->_get_adjacent_post( $post->ID, false, '', false );
                $next = $this->_get_adjacent_post( $post->ID, false, '', true );

                if ( $prev ) {
                    $result[ 'prev' ] = array(
                        'id'    => $prev->ID,
                        'title' => get_the_title( $prev->ID ),
                        'slug'  => $prev->post_name,
                        'url'   => rest_url( sprintf( '%s/modules/%s/%d', $this->_rest_config['base'], $this->_namespace, $prev->ID ) )
                    );
                }

                if ( $next ) {
                    $result[ 'next' ] = array(
                        'id'    => $next->ID,
                        'title' => get_the_title( $next->ID ),
                        'slug'  => $next->post_name,
                        'url'   => rest_url( sprintf( '%s/modules/%s/%d', $this->_rest_config['base'], $this->_namespace, $next->ID ) )
                    );
                }
            }
        }

        return $result;
    }
}