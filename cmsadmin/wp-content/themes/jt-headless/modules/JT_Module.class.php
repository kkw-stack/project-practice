<?php defined( 'ABSPATH' ) or die( 'Nothing to see here.' ); // Security (disable direct access).

/**
 * Name       : STUDIO JT 모듈 CLASS
 * namespace  : module
 * File       : /modules/module-class.php
 * Author     : STUDIO-JT (Nico, 201)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * CLASS SUMMARY:
 *
 * 01) construct
 * 02) enqueue_style_script
 * 03) enqueue_style_script
 * 04) create_post_type
 * 05) the_list
 * 06) search_form
 * 07) search_title
 * 08) search_content
 * 09) list_shortcode
 * 10) last_posts
 * 11) single_templates
 * 12) pass obj tosingle.php
 * 13) pagination
 * 14) track_post_views
 * 15) post_views
 * 16) enable_sticky
 * 17) attachments
 * 18) front_form
 *
 */


/**
 * Class Jt_Module
 *
 * @author STUDIO-JT (Nico) <nico@studio-jt.co.kr>, STUDIO-JT (201) <201@studio-jt.co.kr>
 * @access public
 * @version 1.0.0
 */
class Jt_Module{

    public $_namespace;
    public $_name;
    public $_menu;
    public $_slug;
    public $_support;
    public $_version;
    public $_pageid;
    public $_thumbnail_list;
    public $_gutenberg;

    public $_rest_config;

    /**
     * Constructor.
     *
     * @author STUDIO-JT (Nico,201)
     * @since 1.0.0
     * @access public
     *
     * @param array $params Parameters
     */
    public function __construct( $params = array() ) {
        $this->_namespace = ( isset( $params['namespace'] ) && ! empty( $params['namespace'] ) ? $params['namespace'] : '' );
        $this->_name = ( isset( $params['name'] ) && ! empty( $params['name'] ) ? $params['name'] : $this->_namespace );
        $this->_menu = ( isset( $params['menu'] ) && ! empty( $params['menu'] ) ? $params['menu'] : $this->_name );
        $this->_slug = ( isset( $params['slug'] ) && ! empty( $params['slug'] ) ? $params['slug'] : $this->_name );
        $this->_support = ( isset( $params['support'] ) && ! empty( $params['support'] ) ? $params['support'] : array( 'title', 'editor', 'excerpt', 'thumbnail' ) );
        $this->_support_cat = ( isset( $params['support_cat'] ) && ! empty( $params['support_cat'] ) ? $params['support_cat'] : false );
        $this->_version = ( isset( $params['version'] ) && ! empty( $params['version'] ) ? $params['version'] : '1.0.0' );
        $this->_pageid = ( isset( $params['pageid'] ) && ! empty( $params['pageid'] ) ? $params['pageid'] : null );
        $this->_thumbnail_list = ( isset( $params['thumbnail_list'] ) && ! empty( $params['thumbnail_list'] ) ? $params['thumbnail_list'] : false );
        $this->_gutenberg = ! ( isset( $params['gutenberg'] ) && $params['gutenberg'] === false );

        $this->_rest_config = array(
            'use'           => ( ! isset( $params['rest_config']['use'] ) || $params['rest_config']['use'] !== false ),
            'base'          => ( isset( $params['rest_config']['base'] ) && $params['rest_config']['base'] ? $params['rest_config']['base'] : ( defined( 'JT_REST_BASE' ) ? JT_REST_BASE : 'jt/v1' ) ),
            'config'        => ( isset( $params['rest_config']['config'] ) && $params['rest_config']['config'] === true ),
            'use_id'        => ( isset( $params['rest_config']['user_id'] ) && $params['rest_config']['user_id'] === true ),
            'list'          => ( ! isset( $params['rest_config']['list'] ) || $params['rest_config']['list'] !== false ),
            'list_own'      => ( isset( $params['rest_config']['list_own'] ) && $params['rest_config']['list_own'] === true ),
            'single'        => ( ! isset( $params['rest_config']['single'] ) || $params['rest_config']['single'] !== false ),
            'single_own'    => ( isset( $params['rest_config']['single_own'] ) && $params['rest_config']['single_own'] === true ),
            'create'        => ( isset( $params['rest_config']['create'] ) && $params['rest_config']['create'] === true ),
            'update'        => ( isset( $params['rest_config']['update'] ) && $params['rest_config']['update'] === true ),
            'delete'        => ( isset( $params['rest_config']['delete'] ) && $params['rest_config']['delete'] === true ),
            'guest'         => ( isset( $params['rest_config']['guest'] ) && $params['rest_config']['guest'] === true ),
        );

        // ACTIONS
        if ( isset( $this->_namespace ) && ! empty( $this->_namespace ) ) {
            add_action( 'init', array( $this, 'create_post_type' ) );
            add_action( 'wp_head', array( $this, 'track_post_views' ) );
            add_action( 'post_submitbox_misc_actions', array( $this,'enable_sticky' ) );
            add_action( 'add_meta_boxes', array( $this, 'jt_download_add_meta_boxes' ) );
            add_action( 'save_post', array( $this, 'jt_download_save_post' ) );


            // FILTERS
            add_filter( 'posts_search', array( $this, 'search_title' ), 10, 2 );
            add_filter( 'posts_search', array( $this, 'search_content' ), 10, 2 );
            add_filter( 'posts_orderby', array( $this, 'orderby_sticky_first' ), 10, 2 );

            // OPTIONS Category
            if ( $this->_support_cat === true ) {
                add_action( 'init', array( $this, 'create_taxonomy' ) );

                // 관리자 뷰 카테고리 필터 추가
                add_action( 'restrict_manage_posts', array( $this, 'admin_filter_category_selector' ) );
                add_action( 'admin_head', array( $this, 'admin_category_style' ) );
            }

            if ( $this->_thumbnail_list ) {
                add_action( 'admin_head', array( $this, 'admin_thumb_style' ) );
                add_filter( 'manage_' . $this->_namespace . '_posts_columns', array( $this, 'admin_thumb_columns' ) );
                add_action( 'manage_' . $this->_namespace . '_posts_custom_column', array( $this, 'admin_thumb_column_value' ), 10, 2 );
            }

            add_filter( 'use_block_editor_for_post_type', array( $this, 'disable_gutenberg' ), 10, 2 );

            // REST API
            if ( $this->_rest_config['use'] ) {
                add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );
            }
        }
    }


    /**
     * Register post type.
     *
     * @author STUDIO-JT (Nico)
     * @since 1.0.0
     * @access public
     *
     * @uses register_post_type().
     */
    public function create_post_type() {

        $name = $this->_name;
        $menu = $this->_menu;
        $slug = $this->_slug;
        $support = $this->_support;

        $labels = array(
            'name'               => $name,
            'singular_name'      => $name,
            'add_new'            => '새 ' . $name . ' 등록',
            'add_new_item'       => '새  '. $name . ' 등록',
            'edit_item'          => $name . ' 수정',
            'new_item'           => '새 ' . $name,
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

        add_rewrite_rule( '^' . $slug . '/page/([0-9]+)', 'index.php?pagename=' . $slug . '&paged=$matches[1]', 'top' );
        flush_rewrite_rules();
    } // END create_post_type


    /**
     * Register taxonomy
     *
     * @author STUDIO-JT (Nico)
     * @since 1.0.0
     * @access public
     *
     * @uses register_taxonomy().
     */
     public function create_taxonomy() {
        $namespace = $this->_namespace;
        $name = $this->_name;

        register_taxonomy(
            $namespace . '_categories',
            $namespace,
            array(
                'hierarchical'      => true,
                'label'             => $name . ' 분류',
                'query_var'         => true,
                'show_in_rest'      => true,
                'rewrite'           => array( 'slug' => $name . '-분류' ),
                'show_admin_column' => true,
            )
        );
    }



    public function admin_category_style() {
        ?>
        <style>
            .column-taxonomy-<?php echo $this->_namespace; ?>_categories { width: 15%; }
        </style>
        <?php
    }


    /**
     * Add Category Selector For Admin List View Filter
     *
     * @author STUDIO-JT ( 201 )
     * @since 1.0.0
     * @access public
     *
     * @param array $columns
     */
    public function admin_filter_category_selector() {
        $post_type = esc_attr( isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post' );
        $namespace = $this->_namespace;
        $category = $namespace . '_categories';

        if ( $post_type == $namespace ) {
            $jt_cat = urldecode( isset( $_REQUEST[ $category ] ) ? $_REQUEST[ $category ] : '' );
            $terms = get_terms( array( 'taxonomy' => $category, 'hide_empty' => false ) );
            ?>
            <select name="<?php echo $category; ?>">
                <option value="">모든 분류</option>
                <?php foreach ( $terms as $term ) : ?>
                    <option value="<?php echo urldecode( $term->slug ); ?>" <?php selected( $jt_cat, urldecode( $term->slug ) ); ?>><?php echo $term->name; ?></option>
                <?php endforeach; ?>
            </select>
            <?php
        }
    }


    /**
     * Search title filter.
     *
     * @author STUDIO-JT (Nico)
     * @since 1.0.0
     * @access public
     */
    public function search_title( $search, $loop ) {
        global $wpdb;

        if ( $search_term = $loop->get( 'search_title' ) ) {
            $search .= $wpdb->prepare( " AND {$wpdb->posts}.post_title LIKE %s ", '%' . esc_sql( $wpdb->esc_like( $search_term ) ) . '%' );

            if ( ! is_user_logged_in() ) {
                $search .= " AND {$wpdb->posts}.post_password = '' ";
            }
        }

        return $search;
    }


    /**
     * Search content filter.
     *
     * @author STUDIO-JT (Nico)
     * @since 1.0.0
     * @access public
     */
    public function search_content( $search, $loop ) {
        global $wpdb;

        if ( $search_term = $loop->get( 'search_content' ) ) {
            $search .= $wpdb->prepare( " AND {$wpdb->posts}.post_content LIKE %s ", '%' . esc_sql( $wpdb->esc_like( $search_term ) ) . '%' );

            if ( ! is_user_logged_in() ) {
                $search .= " AND {$wpdb->posts}.post_password = '' ";
            }
        }

        return $search;
    }


    /**
     * Order By Sticky Posts First
     *
     * @author STUDIO-JT (201)
     * @since 1.0.0
     * @access public
     */
    public function orderby_sticky_first( $orderby_statement, $wp_query ) {
        if ( $wp_query->get( 'post_type' ) == $this->_namespace ) {
            global $wpdb;

            $sticky_posts = get_option( 'sticky_posts' );

            if ( count( $sticky_posts ) > 0 ) {
                $str_sticky_posts = is_array( $sticky_posts ) ? implode( ',', $sticky_posts ) : $sticky_posts;
                $str_order = " CASE WHEN {$wpdb->posts}.ID IN ( {$str_sticky_posts} ) THEN 0 ELSE 1 END ASC ";
                $res_order = ( $orderby_statement ? $str_order . ',' . $orderby_statement : $str_order );

                return $res_order;
            }
        }

        return $orderby_statement;
    }


    /**
     * Run the jt_set_post_views function on each single post
     *
     * Be sure to set remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0); keep view accurate (no prefeching)
     *
     * @author STUDIO-JT (Nico)
     * @since 1.0.0
     * @access public
     *
     * @uses is_singular
     * @uses get_the_ID
     * @uses get_post_meta
     * @uses delete_post_meta
     * @uses add_post_meta
     * @uses update_post_meta
     *
     */
    public function track_post_views () {
        $type = $this->_namespace;

        if ( is_singular( $type ) ) {
            $post_id = get_the_ID();
            $count_key = 'jt_post_views_count';
            $count = get_post_meta( $post_id, $count_key, true );

            if ( $count == '' ) {
                $count = 0;
                delete_post_meta( $post_id, $count_key );
                add_post_meta( $post_id, $count_key, '0' );
            } else {
                $count++;
                update_post_meta( $post_id, $count_key, $count );
            }
        }
    }


    /**
     * Display the number of view of the current page
     *
     * @author STUDIO-JT (Nico)
     * @since 1.0.0
     * @access public
     *
     * @uses get_the_ID()
     * @uses get_post_meta()
     * @uses update_post_meta()
     *
     * @param int $post_id The id of the post you want to retrieve the number of view, Default the current post id
     */
    public function post_views( $post_id = null ) {
        $post_id = ( empty( $post_id ) ? get_the_ID() : $post_id );
        $count_key = 'jt_post_views_count';
        $count = get_post_meta( $post_id, $count_key, true );

        if ( empty( $count ) && $count !== 0 ) {
            update_post_meta( $post_id, $count_key, 0 );
            $count = 0;
        }

        return number_format( $count );
    }


    /**
     * Enable sticky(공지) for custom post type
     *
     * @author STUDIO-JT (Nico)
     * @since 1.0.0
     * @access public
     */
    public function enable_sticky( $post ) {
        if ( $post->post_type === $this->_namespace ) {
            ?>
            <div style="padding: 5px 0 15px 0">
                <span id="sticky-span" style="margin-left:12px;">
                    <input id="sticky" name="sticky" type="checkbox" value="sticky" <?php checked( is_sticky( $post->ID ), true ); ?> />
                    <label for="sticky" class="selectit">공지</label>
                </span>
            </div>
            <?php
        }
    }


    /**
     * Hook save post for jt_download.
     *
     *
     * @author STUDIO-JT (201)
     * @since 1.0.0
     * @access public
     *
     * @uses get_post_type().
     * @uses update_post_meta().
     *
     * @param int $post_id Post ID.
     *
     */
    public function jt_download_save_post( $post_id ) {
        $post_type = get_post_type( $post_id );

        if ( $post_type == $this->_namespace && in_array( 'jt_download', $this->_support ) ) {
            $jt_download = array();

            if ( isset( $_POST['jt_download'] ) && count( $_POST['jt_download'] ) > 0 ) {
                if ( is_array( $_POST['jt_download'] ) && count( $_POST['jt_download'] ) > 0 ) {
                    foreach ( $_POST['jt_download'] as $jt_download_item ) {
                        if ( intVal( $jt_download_item ) > 0 ) {
                            $jt_download[] = intVal( $jt_download_item );
                        }
                    } unset( $jt_download_item );
                }
            }

            update_post_meta( $post_id, 'jt_download', $jt_download );
        }
    }


    /**
     * Get attachment info With Attachment ID
     *
     *
     * @author STUDIO-JT (201)
     * @since 1.0.0
     * @access private
     *
     * @uses get_attached_file().
     * @uses wp_get_attachment_url().
     * @uses get_post_time().
     * @uses wp_get_attachment_image_src().
     *
     * @param int $attachment_id Attachment ID.
     *
     * @return object Return Attachment File Object
     *
     */
    protected function jt_download_get_info( $attachment_id ) {
        $full_path = get_attached_file( $attachment_id );

        if ( file_exists( $full_path ) ) {
            $path = pathinfo( $full_path );
            $thumb_src = wp_get_attachment_image_src( $attachment_id, 'thumbnail', true );
            $arr_res = array(
                'file_url'     => wp_get_attachment_url( $attachment_id ),
                'full_path'    => $full_path,
                'file_name'    => $path['basename'],
                'file_size'    => filesize( $full_path ),
                'uploaded'     => get_post_time( 'U', true, $attachment_id ),
                'icon'         => $thumb_src[ 0 ],
                'download_url' => ( file_exists( ABSPATH . '/d.php' ) ? '/d.php?post_id=' . get_the_ID() . '&attachment_id=' . $attachment_id : wp_get_attachment_url( $attachment_id ) )
            );

            return ( object ) $arr_res;
        } else {
            return null;
        }
    }


    /**
     * Add Metabox For JT Attachment
     *
     *
     * @author STUDIO-JT (201)
     * @since 1.0.0
     * @access private
     *
     * @uses add_meta_box().
     *
     */
    public function jt_download_add_meta_boxes() {
        if ( in_array( 'jt_download', $this->_support ) ) {
            // add_meta_box( string $id, string $title, callable $callback, string|array|WP_Screen $screen = null, string $context = 'advanced', string $priority = 'default', array $callback_args = null )
            add_meta_box( 'jt_custom_attachement', '첨부파일', array( $this, 'jt_download_add_meta_boxes_callback' ), $this->_namespace );
        }
    }


    /**
     * Display attachment meta box
     *
     *
     * @author STUDIO-JT (201)
     * @since 1.0.0
     * @access private
     *
     * @uses wp_enqueue_script().
     * @uses wp_enqueue_media().
     * @uses get_post_meta().
     * @uses get_the_ID().
     *
     */
    public function jt_download_add_meta_boxes_callback() {
        // Call WP Media Upload API
        wp_enqueue_script( 'media-upload' );
        wp_enqueue_media();

        $jt_download = get_post_meta( get_the_ID(), 'jt_download', true );
        ?>
        <ul class="jt_download_list">
            <?php if ( count( $jt_download ) > 0 ) : ?>
                <?php foreach ( $jt_download as $attachment_id ) : $jt_download_item = $this->jt_download_get_info( $attachment_id ); ?>
                    <li class="jt_download_item">
                        <div class="attachment-info">
                            <input type="hidden" name="jt_download[]" value="<?php echo $attachment_id; ?>" />
                            <div class="thumbnail thumbnail-application">
                                <img src="/wp-includes/images/media/default.png" class="icon" draggable="false" alt="">
                            </div>
                            <div class="details">
                                <div class="filename"><a href="<?php echo $jt_download_item->download_url; ?>" target="_blank"><?php echo $jt_download_item->file_name; ?></a></div>
                                <div class="uploaded"><?php echo date( 'Y년 n월 j일', $jt_download_item->uploaded ); ?></div>
                                <div class="file-size"><?php echo sprintf( '%.02f MB', $jt_download_item->file_size / 1024 / 1024 ); ?></div>
                            </div>
                            <div class="attachment-button" style="position:relative;">
                                <button type="button" class="media-modal-close jt_download_select_item" style="width:20px;height:20px;right:35px;">
                                    <span class="dashicons dashicons-edit"></span>
                                </button>
                                <button type="button" class="media-modal-close jt_download_del_item" style="width:20px;height:20px;right:15px;">
                                    <span class="dashicons dashicons-no"></span>
                                </button>
                            </div>
                        </div>
                        <div class="attachment-add" style="border-bottom:1px solid #ddd;padding-bottom:11px;display:none;">
                            <button class="button jt_download_select_item">첨부파일 선택</button>
                            <button class="button jt_download_del_item">삭제</button>
                        </div>
                    </li>
                <?php endforeach; unset( $item, $jt_download_item ); ?>
            <?php endif; ?>
        </ul>
        <p style="text-align:right;">
            <button class="button jt_download_add_item">새 첨부파일 추가</button>
        </p>

       <script>
        jQuery( function ( $ ) {
            $( 'button.jt_download_select_item' ).off( 'click' ).on( 'click', jt_download_select_item_action );
            $( 'button.jt_download_add_item' ).off( 'click' ).on( 'click', jt_download_add_item_action );
            $( 'button.jt_download_del_item' ).off( 'click' ).on( 'click', jt_download_del_item_action );

            function jt_download_select_item_action() {
                var $button = $( this );

                if ( ! $button.is( 'button.jt_download_select_item' ) ) {
                    return false;
                }

                // Create the media frame.
                var file_frame = wp.media.frames.file_frame = wp.media( {
                    title    : '첨부파일 선택',
                    button   : { text: 'Select' },
                    multiple : false // Set to true to allow multiple files to be selected
                } );

                // When an image is selected, run a callback.
                file_frame.on( 'select', function () {
                    // We set multiple to false so only get one image from the uploader
                    var attachment = file_frame.state().get( 'selection' ).first().toJSON();
                    var $jt_download_item = $button.parents( 'li.jt_download_item:first' );

                    $( 'div.thumbnail img', $jt_download_item ).attr( 'src', '/wp-includes/images/media/default.png' );
                    $( 'input[name="jt_download[]"]', $jt_download_item ).val( attachment.id );
                    $( 'div.filename a', $jt_download_item ).attr( 'href', attachment.url );
                    $( 'div.filename a', $jt_download_item ).text( attachment.filename );
                    $( 'div.uploaded', $jt_download_item ).text( attachment.dateFormatted );
                    $( 'div.file-size', $jt_download_item ).text( ( attachment.filesizeInBytes / 1024 / 1024 ).toFixed( 2 ) + ' MB' );

                    $( 'div.attachment-add', $jt_download_item ).hide();
                    $( 'div.attachment-info', $jt_download_item ).show();
                } );

                // Finally, open the modal
                file_frame.open();
                return false;
            }

            function jt_download_add_item_action() {
                var $this = $( this );

                if ( ! $this.is( 'button.jt_download_add_item' ) ) {
                    return false;
                }

                var $list = $( 'ul.jt_download_list' );
                var $jt_download_item = jt_download_item_create();

                $list.append( $jt_download_item );

                return false;
            }

            function jt_download_del_item_action() {
                var $this = $( this );

                if ( ! $this.is( 'button.jt_download_del_item' ) ) {
                    return false;
                }

                var $jt_download_item = $this.parents( 'li.jt_download_item:first' );
                $jt_download_item.fadeOut( 'slow', function () { $( this ).remove(); } );

                return false;
            }

            function jt_download_item_create() {
                var $jt_download_item = $( '<li />', { class: 'jt_download_item' } );
                var $thumbnail = $( '<div />', {
                    class : 'thumbnail thumbnail-application',
                    html  : [ $( '<img />', { src: '/wp-includes/images/media/default.png', class: 'icon', alt: '' } ) ]
                } );
                var $details = $( '<div />', {
                    class : 'details',
                    html  : [
                        $( '<div />', { class: 'filename', html: [ $( '<a />', { target: '_blank' } ) ] } ),
                        $( '<div />', { class: 'uploaded' } ),
                        $( '<div />', { class: 'file-size' } )
                    ]
                } );
                var $attachment_button = $( '<div />', {
                    class : 'attachment-button',
                    style : 'position:relative;',
                    html  : [
                        $( '<button />', {
                            type  : 'button',
                            class : 'media-modal-close jt_download_select_item',
                            style : 'width:20px;height:20px;right:35px;',
                            html  : [ $( '<span />', { class: 'dashicons dashicons-edit' } ) ]
                        } ),
                        $( '<button />', {
                            type  : 'button',
                            class : 'media-modal-close jt_download_del_item',
                            style : 'width:20px;height:20px;right:15px;',
                            html  : [ $( '<span />', { class: 'dashicons dashicons-no' } ) ]
                        } )
                    ]
                } );

                $( '<div />', {
                    class : 'attachment-info',
                    style : 'display:none;',
                    html  : [
                        $( '<input />', { type: 'hidden', name: 'jt_download[]' } ),
                        $thumbnail,
                        $details,
                        $attachment_button
                    ]
                } ).appendTo( $jt_download_item );

                $( '<div />', {
                    class : 'attachment-add',
                    style : 'border-bottom:1px solid #ddd;padding-bottom:11px;',
                    html  : [
                        $( '<button />', {
                            class : 'button jt_download_select_item',
                            text  : '첨부파일 선택'
                        } ),
                        $( '<button />', {
                            class : 'button jt_download_del_item',
                            text  : '삭제'
                        } ),
                    ]
                } ).appendTo( $jt_download_item );

                $( 'button.jt_download_select_item', $jt_download_item ).off( 'click' ).on( 'click', jt_download_select_item_action );
                $( 'button.jt_download_del_item', $jt_download_item ).off( 'click' ).on( 'click', jt_download_del_item_action );

                return $jt_download_item;
            }
        } );
       </script>
        <?php
    }


    public function admin_thumb_style( $hook ) {
        ?>
        <style>
            .column-jt_admin_thumb { width: 150px; }
        </style>
        <?php
    }


    public function admin_thumb_columns( $columns ) {
        $new_columns = array();

        foreach ( $columns as $key => $value ) {
            $new_columns[ $key ] = $value;
            $new_columns['jt_admin_thumb'] = '썸네일';
        }

        return $new_columns;
    }


    public function admin_thumb_column_value( $column_name, $post_id ) {
        if ( $column_name == 'jt_admin_thumb' ) {
            if ( has_post_thumbnail( $post_id ) ) {
                $thumb = wp_get_attachment_image_src( get_post_thumbnail_id( $post_id ), 'thumbnail' );
                $thumb = $thumb[ 0 ];

                printf( '<img src="%s" alt="%s" />', $thumb, get_the_title( $post_id ) );
            } else {
                echo '<span>-</span>';
            }
        }
    }


    public function disable_gutenberg( $current_status, $post_type ) {
        if ( $this->_namespace == $post_type ) {
            return $this->_gutenberg;
        }

        return $current_status;
    }


    public function rest_api_init() {
        if ( $this->_rest_config['list'] ) {
            register_rest_route(
                $this->_rest_config['base'],
                '/modules/' . $this->_namespace . '/list',
                array(
                    array(
                        'methods'               => WP_REST_Server::READABLE,
                        'callback'              => array( $this, 'get_list' ),
                        'permission_callback'   => '__return_true',
                    ),
                )
            );
        }

        if ( $this->_rest_config['create'] ) {
            register_rest_route(
                $this->_rest_config['base'],
                '/modules/' . $this->_namespace . '/add',
                array(
                    array(
                        'methods'               => WP_REST_Server::CREATABLE,
                        'callback'              => array( $this, 'add_item' ),
                        'permission_callback'   => '__return_true',
                    )
                )
            );
        }

        if ( $this->_rest_config['config'] ) {
            register_rest_route(
                $this->_rest_config['base'],
                '/modules/' . $this->_namespace . '/config',
                array(
                    array(
                        'methods'               => WP_REST_Server::READABLE,
                        'callback'              => array( $this, 'get_config' ),
                        'permission_callback'   => '__return_true',
                    ),
                )
            );
        }

        if ( $this->_rest_config['single'] ) {
            if ( $this->_rest_config['use_id'] ) {
                register_rest_route(
                    $this->_rest_config['base'],
                    '/modules/' . $this->_namespace . '/get/(?P<id>[\d]+)',
                    array(
                        array(
                            'methods'               => WP_REST_Server::READABLE,
                            'callback'              => array( $this, 'get_item' ),
                            'permission_callback'   => '__return_true',
                        ),
                    )
                );
            } else {
                register_rest_route(
                    $this->_rest_config['base'],
                    '/modules/' . $this->_namespace . '/get/(?P<slug>(.*)+)',
                    array(
                        array(
                            'methods'               => WP_REST_Server::READABLE,
                            'callback'              => array( $this, 'get_item' ),
                            'permission_callback'   => '__return_true',
                        ),
                    )
                );
            }

            register_rest_route(
                $this->_rest_config['base'],
                '/modules/' . $this->_namespace . '/preview/(?P<id>[\d]+)',
                array(
                    array(
                        'methods'               => WP_REST_Server::READABLE,
                        'callback'              => array( $this, 'get_preview' ),
                        'permission_callback'   => '__return_true',
                    ),
                )
            );
        }

        if ( $this->_rest_config['update'] ) {
            if ( $this->_rest_config['use_id'] ) {
                register_rest_route(
                    $this->_rest_config['base'],
                    '/modules/' . $this->_namespace . '/update/(?P<id>[\d]+)',
                    array(
                        array(
                            'methods'               => WP_REST_Server::EDITABLE,
                            'callback'              => array( $this, 'update_item' ),
                            'permission_callback'   => '__return_true',
                        ),
                    )
                );
            } else {
                register_rest_route(
                    $this->_rest_config['base'],
                    '/modules/' . $this->_namespace . '/update/(?P<slug>(.*)+)',
                    array(
                        array(
                            'methods'               => WP_REST_Server::EDITABLE,
                            'callback'              => array( $this, 'update_item' ),
                            'permission_callback'   => '__return_true',
                        ),
                    )
                );
            }
        }

        if ( $this->_rest_config['delete'] ) {
            if ( $this->_rest_config['use_id'] ) {
                register_rest_route(
                    $this->_rest_config['base'],
                    '/modules/' . $this->_namespace . '/delete/(?P<id>[\d]+)',
                    array(
                        array(
                            'methods'               => WP_REST_Server::DELETABLE,
                            'callback'              => array( $this, 'delete_item' ),
                            'permission_callback'   => '__return_true',
                        )
                    )
                );
            } else {
                register_rest_route(
                    $this->_rest_config['base'],
                    '/modules/' . $this->_namespace . '/delete/(?P<slug>(.*)+)',
                    array(
                        array(
                            'methods'               => WP_REST_Server::DELETABLE,
                            'callback'              => array( $this, 'delete_item' ),
                            'permission_callback'   => '__return_true',
                        )
                    )
                );
            }
        }
    }

    public function get_list( WP_REST_Request $request ) {
        $args = array(
            'post_type'         => $this->_namespace,
            'post_status'       => 'publish',
            'paged'             => max( intVal( $request->get_param( 'paged' ) ), 1 ),
            'posts_per_page'    => intVal( intVal( $request->get_param( 'rpp' ) ) > 0 ? $request->get_param( 'rpp' ) : get_option( 'posts_per_page' ) ),
            'fields'            => 'ids',
        );

        if ( $this->_rest_config[ 'list_own' ] ) {
            if ( is_user_logged_in() ) {
                $args['author'] = get_current_user_id();
            } else {
                $args['post__in'] = array( 0 );
            }
        }

        if ( ! empty( $request->get_param( 'cate' ) ) ) {
            $args['tax_query'] = array( array(
                'taxonomy'  => $this->_namespace . '_categories',
                'field'     => 'slug',
                'terms'     => esc_attr( $request->get_param( 'cate' ) )
            ) );
        }

        if ( ! empty( $request->get_param( 'search' ) ) ) {
            $search = esc_attr( $reqeust->get_param( 'search' ) );

            switch ( $request->get_param( 'type' ) ) {
                case 'title': $args['search_title'] = $search; break;
                case 'content': $args['search_content'] = $search; break;
                default: $args['s'] = $search;
            }
        }

        if ( ! empty( $request->get_param( 'latest' ) ) && intVal( $request->get_param( 'latest' ) ) > 0 ) {
            $args['posts_per_page'] = intVal( $request->get_param( 'latest' ) );
            $args['paged'] = 1;
        }

        $query = new WP_Query;
        $query_result = $query->query( $args );
        $posts = array();

        foreach ( $query_result as $post_id ) {
            $posts[] = $this->_get_post_data( $post_id );
        }

        $result = array(
            'total_posts'   => intVal( $query->found_posts ),
            'total_pages'   => intVal( $query->max_num_pages ),
            'posts'         => $posts,
        );

        if ( $args['paged'] > 1 || $result['total_pages'] > $args['paged'] ) {
            $base_url = add_query_arg(
                urlencode_deep( $request->get_query_params() ),
                rest_url( sprintf( '%s/modules/%s', $this->_rest_config['base'], $this->_namespace ) )
            );
            $result['pagination'] = array( 'current' => $base_url );

            if ( $args['paged'] > 1 ) {
                $result['pagination']['prev'] = add_query_arg( 'paged', ( $args['paged'] - 1 > 1 ? $args['paged'] - 1 : 1 ), $base_url );
            }

            if ( $result['total_pages'] > $args['paged'] + 1 ) {
                $result['pagination']['next'] = add_query_arg( 'paged', ( $args['paged'] + 1 > $result['total_pages'] ? $result['total_pages'] : $args['paged'] + 1 ), $base_url );
            }
        }

        return new WP_REST_Response( $result, 200 );
    }


    public function get_item( WP_REST_Request $request ) {
        $post_id = $this->_get_post_id_from_request( $request );

        if ( ! $this->_rest_config['single_own'] || get_current_user_id() == get_post_field( 'post_author', $post_id ) || current_user_can( 'administrator' ) ) {

            $post = $this->_get_post_data( $post_id, true, intVal( $request->get_param( 'preview_id' ) ) );

            if ( ! empty( $post ) ) {
                return new WP_REST_Response( $post, 200 );
            }
        }

        return new WP_Error( 'empty', '데이터가 없습니다.', array( 'status' => 404 ) );
    }


    public function get_preview( WP_REST_Request $request ) {
        $post_id = intVal( $request->get_param( 'id' ) );

        if ( get_post_status( $post_id ) === 'publish' ) {
            $tmp_posts = get_posts( array(
                'post_type'         => 'revision',
                'post_status'       => 'any',
                'post_parent'       => intVal( $request->get_param( 'id' ) ),
                'sort_column'       => 'ID',
                'sort_order'        => 'desc',
                'posts_per_page'    => 1,
                'fields'            => 'ids',
            ) );
            if ( ! empty( $tmp_posts ) ) {
                $post_id = $tmp_posts[0];
            }
        }

        $post = $this->_get_post_data( $post_id, true );

        if ( ! empty( $post ) && current_user_can( 'administrator' ) ) {
            return new WP_REST_Response( $post, 200 );
        }

        return new WP_Error( 'empty', '데이터가 없습니다.', array( 'status' => 404 ) );
    }


    public function add_item( WP_REST_Request $request ) {
        if ( $this->_rest_config['guest'] || get_current_user_id() > 0 ) {
            $inputs = apply_filters( 'jt_modules_add_item_' . $this->_namespace, $request->get_param( 'jt_' . $this->_namespace ) );

            $inputs['post_type'] = $this->_namespace;

            $res = wp_insert_post( $inputs );

            if ( ! is_wp_error( $res ) ) {
                return new WP_REST_Response( $this->_get_post_data( $res, true ) );
            }

            return new WP_Error( 'error', '수정 중 오류가 발생했습니다.', array( 'status' => 404 ) );
        }
    }


    public function update_item( WP_REST_Request $request ) {
        if ( $this->_rest_config['guest'] || get_current_user_id() > 0 ) {
            $post_id = $this->_get_post_id_from_request( $request );
            $post = $this->_get_post_data( $post_id );

            if ( current_user_can( 'administrator' ) || get_current_user_id() == $post['author'] ) {
                $inputs = apply_filters( 'jt_modules_update_item_' . $this->_namespace, $request->get_param( 'jt_' . $this->_namespace ) );

                $inputs['ID'] = $post['id'];
                $inputs['post_type'] = $this->_namespace;

                $res = wp_update_post( $inputs );

                if ( ! is_wp_error( $res ) ) {
                    return new WP_REST_Response( $this->_get_post_data( $res, true ) );
                }

                return new WP_Error( 'error', '수정 중 오류가 발생했습니다.', array( 'status' => 404 ) );
            }
        }
    }


    public function delete_item( WP_REST_Request $request ) {
        if ( $this->_rest_config['guest'] || get_current_user_id() > 0 ) {
            $post_id = $this->_get_post_id_from_request( $request );
            $post = $this->_get_post_data( $post_id );

            if ( get_current_user_id() == $post['author'] || current_user_can( 'administrator' ) ) {
                $res = wp_trash_post( $post['id'] );

                if ( ! $res ) {
                    return new WP_REST_Response( $res, 200 );
                }

                return new WP_Error( 'error', '삭제 중 오류가 발생했습니다.', array( 'status' => 404 ) );
            }
        }
    }


    public function get_config( WP_REST_Request $request ) {
        return new WP_REST_Response( array(), 200 );
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
                'excerpt'       => get_the_excerpt( $post ),
                'thumbnail'     => ( has_post_thumbnail( $post->ID ) ? get_the_post_thumbnail_url( $post ) : '' ),
                'attachment'    => array(),
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
                $result['meta'] = get_fields( $post->ID );
                $result['list'] = ( $this->_pageid ? str_replace( home_url(), '', get_permalink( $this->_pageid ) ) : '' );
                $result['content'] = apply_filters( 'the_content', get_post_field( 'post_content', $post->ID ) );

                if ( isset( $_REQUEST['amp'] ) && $_REQUEST['amp'] === 'true' ) {
                    if ( class_exists( 'AMP_Content_Sanitizer' ) && method_exists( 'AMP_Content_Sanitizer', 'sanitize' ) && function_exists( 'amp_get_content_sanitizers' ) ) {
                        $result['content'] = AMP_Content_Sanitizer::sanitize( $result['content'], amp_get_content_sanitizers() );
                    }
                }


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


    protected function _get_post_id_from_request( $request ) {
        if ( $this->_rest_config['use_id'] && $request->get_param( 'id' ) ) {
            $find = get_post( intVal( $request->get_param( 'id' ) ) );

            if ( $find ) {
                return $find->ID;
            }
        } else if ( $request->get_param( 'slug' ) ) {
            $find = get_page_by_path( esc_attr( $request->get_param( 'slug' ) ), OBJECT, $this->_namespace );

            if ( $find ) {
                return $find->ID;
            }
        }

        return null;
    }


    protected function _get_adjacent_post( $post_id, $in_same_term = false, $excluded_terms = '', $previous = true ) {
        global $wpdb;

        $post = get_post( $post_id );
        $taxonomy = $this->_namespace . '_categories';

        $join = '';
        $where = '';
        $adjacent = $previous ? 'previous' : 'next';

        if ( ! $post ) {
            return null;
        }

        if ( taxonomy_exists( $taxonomy ) ) {
            if ( ! empty( $excluded_terms ) && ! is_array( $excluded_terms ) ) {
                if ( false !== strpos( $excluded_terms, ' and ' ) ) {
                    _deprecated_argument(
                        __FUNCTION__,
                        '3.3.0',
                        sprintf(
                            __( 'Use commas instead of %s to separate excluded terms.' ),
                            "'and'"
                        )
                    );

                    $excluded_terms = explode( ' and ', $excluded_terms );
                } else {
                    $excluded_terms = explode( ',', $excluded_terms );
                }

                $excluded_terms = array_map( 'intval', $excluded_terms );
            }

            $excluded_terms = apply_filters( "get_{$adjacent}_post_excluded_terms", $excluded_terms );

            if ( $in_same_term || ! empty( $excluded_terms ) ) {
                if ( $in_same_term ) {
                    $join   .= " INNER JOIN {$wpdb->term_relationships} AS tr ON p.ID = tr.object_id INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id";
                    $where  .= $wpdb->prepare( 'AND tt.taxonomy = %s', $taxonomy );

                    if ( ! is_object_in_taxonomy( $post->post_type, $taxonomy ) ) {
                        return '';
                    }

                    $term_array = wp_get_object_terms( $post->ID, $taxonomy, array( 'fields' => 'ids' ) );

                    // Remove any exclusions from the term array to include.
                    $term_array = array_diff( $term_array, (array) $excluded_terms );
                    $term_array = array_map( 'intval', $term_array );

                    if ( ! $term_array || is_wp_error( $term_array ) ) {
                        return '';
                    }

                    $where .= ' AND tt.term_id IN (' . implode( ',', $term_array ) . ')';
                }

                if ( ! empty( $excluded_terms ) ) {
                    $where  .= " AND p.ID NOT IN (
                                SELECT tr.object_id
                                FROM {$wpdb->term_relationships} tr
                                    LEFT JOIN {$wpdb->term_taxonomy} tt ON (tr.term_taxonomy_id = tt.term_taxonomy_id)
                                WHERE
                                    tt.term_id IN ( " . implode( ',', array_map( 'intval', $excluded_terms ) ) . " )
                            )";
                }
            }
        }

        // 'post_status' clause depends on the current user.
        if ( is_user_logged_in() ) {
            $user_id = get_current_user_id();
            $post_type_object = get_post_type_object( $post->post_type );

            if ( empty( $post_type_object ) ) {
                $post_type_cap = $post->post_type;
                $read_private_cap = 'read_private_' . $post_type_cap . 's';
            } else {
                $read_private_cap = $post_type_object->cap->read_private_posts;
            }

            $private_states = get_post_stati( array( 'private' => true ) );
            $where          .= " AND ( p.post_status = 'publish'";

            foreach ( (array) $private_states as $state ) {
                if ( current_user_can( $read_private_cap ) ) {
                    $where .= $wpdb->prepare( ' OR p.post_status = %s', $state );
                } else {
                    $where .= $wpdb->prepare( ' OR (p.post_author = %d AND p.post_status = %s)', $user_id, $state );
                }
            }

            $where .= ' )';
        } else {
            $where .= " AND p.post_status = 'publish'";
        }

        $op = $previous ? '<' : '>';
        $order = $previous ? 'DESC' : 'ASC';
        $join = apply_filters( "get_{$adjacent}_post_join", $join, $in_same_term, $excluded_terms, $taxonomy, $post );
        $where = apply_filters(
            "get_{$adjacent}_post_where",
            $wpdb->prepare( "WHERE p.post_date $op %s AND p.post_type = %s {$where}", $post->post_date, $post->post_type ),
            $in_same_term,
            $excluded_terms,
            $taxonomy,
            $post
        );
        $sort = apply_filters( "get_{$adjacent}_post_sort", "ORDER BY p.post_date {$order} LIMIT 1", $post, $order );

        $query = " SELECT p.ID FROM {$wpdb->posts} AS p {$join} {$where} {$sort} ";
        $query_key = 'adjacent_post_' . md5( $query );
        $result = wp_cache_get( $query_key, 'counts' );

        if ( false !== $result ) {
            if ( $result ) {
                $result = get_post( $result );
            }

            return $result;
        }

        $result = $wpdb->get_var( $query );
        if ( null === $result ) {
            $result = '';
        }

        wp_cache_set( $query_key, $result, 'counts' );

        if ( $result ) {
            $result = get_post( $result );
        }

        return $result;
    }


    protected function _upload_file( $file, $allowed_extension = array( 'jpg', 'png', 'jpeg', 'gif' ), $size = 15 ) {
        try {
            $wp_upload = wp_upload_dir();
            $path_info = pathinfo( $file['name'] );
            $new_mime = mime_content_type( $file['tmp_name'] );
            $extension = strtolower( isset( $path_info['extension'] ) ? $path_info['extension'] : '' );
            $new_path = $wp_upload['path'] . '/' . $path_info['filename'] . '.' . $extension;
            $new_name = str_replace( home_url(), '', $wp_upload['url'] ) . '/' . $path_info['filename'] . '.' . $extension;
            $maxSize = $size * 1024 * 1024;
            $file_cnt = 0;

            if ( is_array( $allowed_extension ) && in_array( $extension, $allowed_extension ) && $maxSize > $file['size'] ) {
                while ( file_exists( $new_path ) ) {
                    $file_cnt++;
                    $new_name = sprintf( '%s/%s-%d.%s', str_replace( home_url(), '', $wp_upload['url'] ), $path_info['filename'], $file_cnt, $extension );
                    $new_path = sprintf( '%s/%s-%d.%s', $wp_upload['path'], $path_info['filename'], $file_cnt, $extension );
                }

                if ( move_uploaded_file( $file['tmp_name'], $new_path ) ) {
                    return str_replace( '/cmsadmin', '', $new_name );
                }
            } else {
                return new WP_Error(
                    'image_not_valid',
                    sprintf( '%dMB 이하, %s 형식의 파일만 등록 가능합니다', $size, implode( ', ', array_map( 'strtoupper', $allowed_extension ) ) ),
                    array( 'status' => 200 )
                );
            }
        } catch ( Exception $e ) {
            return new WP_Error( 'error', '사진을 올리는 중 오류가 발생했습니다', array( 'status' => 200 ) );
        }
    }


    // esc_attr 확장 함수( 배열 및 오브젝트 지원 )
    protected function _esc_attr( $var ) {
        if ( is_string( $var ) || is_numeric( $var ) ) {
            return esc_attr( $var );
        } elseif ( empty( $var ) ) {
            return $var;
        } else {
            foreach ( $var as &$item ) {
                $item = self::_esc_attr( $item );
            }

            return $var;
        }
    }


    // script console.log 대응 함수
    protected function _console( $var, $var_name = '' ) {
        echo '<script>console.log( ' . ( ! empty( $var_name ) ? '"' . $var_name . '", ' : '' ) . json_encode( $var ) . ' );</script>';
    }


    // print_r, var_dump 확장 함수
    protected function _debug( $var, $var_name = '', $show_type = false ) {
        echo '<pre>' . ( ! empty( $var_name ) ? $var_name . ' :: ' : '' );

        if ( $show_type ) {
            var_dump( $var );
        } else {
            print_r( $var );
        }

        echo '</pre>';
    }


    // User IP
    private function _ip() {
        $ip = '';

        if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) && filter_var( $_SERVER['HTTP_X_FORWARDED_FOR'], FILTER_VALIDATE_IP ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif ( ! empty( $_SERVER['HTTP_X_SUCURI_CLIENTIP'] ) && filter_var( $_SERVER['HTTP_X_SUCURI_CLIENTIP'], FILTER_VALIDATE_IP ) ) {
            $ip = $_SERVER['HTTP_X_SUCURI_CLIENTIP'];
        } elseif ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }

        $ip = preg_replace( '/^(\d+\.\d+\.\d+\.\d+):\d+$/', '\1', $ip );
        return $ip;
    }


} // END CLASS