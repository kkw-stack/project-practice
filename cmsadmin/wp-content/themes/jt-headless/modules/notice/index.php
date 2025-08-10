<?php
/*
 * Name       : NOTICE
 * namespace  : notice
 * File       : /modules/notice/index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) NOTICE 프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */



/**
 * NOTICE 프로그램 실행
 */
$jt_notice = new Jt_notice();

/**
 * Jt_notice Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_notice extends Jt_Module{

    public function __construct() {
        // parent::__construct( 'notice', '게시판', '게시판', '게시판',array('title', 'editor', 'excerpt', 'jt_download'), false, '1.0.0', 90 );

        parent::__construct( array(
            'namespace'     => 'notice',
            'name'          => '공지사항',
            'support'       => array( 'title', 'editor', 'excerpt', 'thumbnail', 'jt_download' ),
            'support_cat'   => false,
            'pageid'        => 330,
        ) );
    }
}