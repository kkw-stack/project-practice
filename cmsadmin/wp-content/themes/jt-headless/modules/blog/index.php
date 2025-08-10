<?php
/*
 * Name       : BLOG
 * namespace  : blog
 * File       : /modules/blog/index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) BLOG 프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


 /**
 * blog Size 추가
 */
add_image_size( 'jt_thumbnail_blog', 328, 200, array( 'center', 'top' ) );
add_image_size( 'jt_main_blog_list', 660, 402, array( 'center', 'top' ) );
add_image_size( 'jt_blog_list', 452, 276, array( 'center', 'top' ) );


/**
 * BLOG 프로그램 실행
 */
$jt_blog = new Jt_blog();

/**
 * Jt_blog Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_blog extends Jt_Module{

    public function __construct() {
        parent::__construct( array(
            'namespace'     => 'blog',
            'name'          => '뭉치고 블로그',
            'slug'          => '뭉치고-블로그',
            'support'       => array( 'title', 'editor', 'excerpt', 'jt_download', 'thumbnail' ),
            'support_cat'   => false,
            'pageid'        => 435,
        ) );
    }


    public function create_post_type() {
        $name    = $this->_name;
        $menu    = $this->_menu;
        $slug    = $this->_slug;
        $support = $this->_support;

        $labels  = array(
            'name'               => $name,
            'singular_name'      => $name,
            'add_new'            => '새 블로그 글 등록',
            'add_new_item'       => '새 블로그 글 등록',
            'edit_item'          => $name . ' 수정',
            'new_item'           => '새 블로그',
            'all_items'          => '모든 ' . $name,
            'view_item'          => $name . ' 보기',
            'search_items'       => '검색',
            'not_found'          => $name . ' 없음',
            'not_found_in_trash' => '휴지통에 ' . $name . ' 없음',
            'parent_item_colon'  => '',
            'menu_name'          => $menu
        );

        register_post_type(
            $this->_namespace,
            array(
                'labels'        => $labels,
                'public'        => true,
                'show_ui'       => true,
                'query_var'     => true,
                'show_in_rest'  => true,
                'has_archive'   => false,
                'rewrite'       => array( 'slug' => $slug ),
                'supports'      => $support
            )
        );

        add_rewrite_rule('^'.$slug.'/page/([0-9]+)','index.php?pagename='.$slug.'&paged=$matches[1]', 'top');
        flush_rewrite_rules();
    }
}