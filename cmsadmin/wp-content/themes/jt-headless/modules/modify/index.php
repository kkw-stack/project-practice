<?php
/*
 * Name       : Modify
 * namespace  : modify
 * File       : /modules/modify/index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) Modify 프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


/**
 * Modify 프로그램 실행
 */
$jt_modify = new Jt_modify();

/**
 * Jt_modify Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_modify extends Jt_Module{

    public function __construct() {
        // parent::__construct( 'event', '게시판', '게시판', '게시판',array('title', 'editor', 'excerpt', 'jt_download'), false, '1.0.0', 90 );

        parent::__construct( array(
            'namespace'     => 'modify',
            'name'          => '정보 수정요청',
            'slug'          => '정보-수정요청',
            'support'       => array( 'title' ),
            'support_cat'   => true,
            'gutenberg'     => false,
            'rest_config'   => array(
                                'config'    => true,
                                'list'      => false,
                                'create'    => true,
                            ),
        ) );

        add_action( 'init', array( $this, 'acf_options' ) );

        add_action( 'admin_footer', array( $this, 'disable_acf_data_script' ) );

        add_action( 'restrict_manage_posts', array( $this, 'admin_filter_status_selector' ) );
        add_filter( 'views_edit-' . $this->_namespace, array( $this, 'views_edit_status' ) );
        add_filter( 'pre_get_posts', array( $this, 'admin_filter_status_action' ) );

        add_action( 'admin_head', array( $this, 'admin_column_style' ) );
        add_filter( 'manage_' . $this->_namespace . '_posts_columns', array( $this, 'admin_columns' ) );
        add_action( 'manage_' . $this->_namespace . '_posts_custom_column', array( $this, 'admin_column_value' ), 10, 2 );

        add_action( 'do_meta_boxes', array( $this, 'remove_seo_meta_box' ) );
        add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
        add_action( 'wp_ajax_modify_admin_action', array( $this, 'admin_ajax_action' ) );
    }


    public function add_meta_boxes() {
        add_meta_box( 'modify_status_selector', '상태', array( $this, 'status_meta_box' ), $this->_namespace, 'side' );
    }


    public function status_meta_box( $post ) {
        $status = get_field( 'jt_status', $post );
        ?>
        <div class="acf-field">
            <div class="acf-input jt_manage_status">
                <button type="button" class="button <?php echo ( $status != '처리완료' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $post->ID; ?>" data-status="처리중">
                    <span>처리중</span>
                </button>
                <button type="button" class="button <?php echo ( $status == '처리완료' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $post->ID; ?>" data-status="처리완료">
                    <span>처리완료</span>
                </button>
            </div>
        </div>
        <script>
            jQuery( function ( $ ) {
                $( '.jt_manage_status button' ).on( 'click', function ( e ) {
                    e.preventDefault();

                    var $this = $( this );
                    var uid = $this.data( 'uid' );
                    var status = $this.data( 'status' );

                    if ( $this.hasClass( 'button-primary' ) ) return false;

                    if ( [ '처리중', '처리완료' ].indexOf( status ) < 0 ) {
                        alert( '잘못된 접근입니다' );
                        return false;
                    }

                    $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'modify_admin_action', uid: uid, status: status }, function ( res ) {
                        if ( res.success && status === '처리중' ) {
                            alert( '처리중으로 변경했습니다' );
                        } else if ( res.success && status === '처리완료' ) {
                            alert( '처리를 완료했습니다' );
                        } else {
                            alert( '오류가 발생했습니다' );
                        }

                        location.reload();
                        return false;
                    } );

                    return false;
                } );
            } );
        </script>
        <?php
    }


    public function admin_ajax_action() {
        if (
            isset( $_POST[ 'uid' ] ) && intVal( $_POST[ 'uid' ] ) > 0 &&
            isset( $_POST['status'] ) && in_array( $_POST['status'], array( '처리중', '처리완료' ) )
        ) {
            $res = update_field( 'jt_status', $_POST['status'], $_POST['uid'] );

            if ( $res ) wp_send_json_success();
            else wp_send_json_error();

            exit;
        }

        wp_send_json_error( '잘못된 접근입니다' );
        exit;
    }


    public function acf_options() {
        if ( function_exists( 'acf_add_options_sub_page' ) ) {
            acf_add_options_sub_page( array(
                'page_title'    => $this->_name . ' 설정',
                'menu_title'    => $this->_name . ' 설정',
                'menu_slug'     => $this->_namespace . '-config',
                'parent_slug'   => 'edit.php?post_type=' . $this->_namespace,
                'capability'    => 'edit_posts'
            ) );
        }
    }


    public  function disable_acf_data_script() {
        if ( get_post_type() === $this->_namespace ) {
            $field = get_field_object( 'modify_data' );

            if ( isset( $field['sub_fields'] ) && ! empty( $field['sub_fields'] ) ) {
                foreach ( $field['sub_fields'] as $sub_field ) {
                    if ( $sub_field['name'] != 'status' ) {
                        $field_key = 'acf[' . implode( '][', array( $field['key'], $sub_field['key'] ) ) . ']';
                        $str_button = '';

                        if ( $sub_field['name'] == 'shop' ) {
                            $str_button = sprintf(
                                '<div class="acf-input-append" style="min-height:28px;height:28px;"><a href="%s" style="color:#444;text-decoration:none;" target="_blank"><span>샵 관리</span></a></div>',
                                admin_url( 'post.php?action=edit&post=' . get_field( 'modify_data_shop' ) )
                            );
                        }

                        if ( $sub_field['name'] == 'user' ) {
                            $str_button = sprintf(
                                '<div class="acf-input-append" style="min-height:28px;height:28px;"><a href="%s" style="color:#444;text-decoration:none;" target="_blank"><span>프로필</span></a></div>',
                                admin_url( 'user-edit.php?user_id=' . get_field( 'modify_data_user' ) )
                            );
                        }
                        ?>
                        <script>
                        jQuery( function ( $ ) {
                            $( 'form#post [name*="<?php echo $field_key; ?>"]' ).prop( 'disabled', true );

                            <?php if ( ! empty( $str_button ) ) : ?>
                                $( 'form#post [name*="<?php echo $field_key; ?>"]' ).closest( '.acf-input' ).children().wrapAll( '<div class="acf-input-wrap"></div>' );
                                $( 'form#post [name*="<?php echo $field_key; ?>"]' ).closest( '.acf-input' ).prepend( '<?php echo $str_button; ?>' );
                            <?php endif; ?>
                        } );
                        </script>
                        <?php
                    }
                }
            }
        }
    }


    public function admin_column_style() {
        ?>
        <style>
            .column-status { width: 150px; }
            .column-author { width: 14%; }
            .column-is_owner { width: 100px; }
        </style>
        <?php
    }


    public function admin_columns( $columns ) {
        $new_columns = array();

        foreach ( $columns as $key => $value ) {
            if ( $key === 'date' ) {
                $new_columns['status'] = '상태';
                $new_columns['date'] = '요청일자';
            } elseif ( $key === 'title' ) {
                $new_columns[ $key ] = '샵 이름';
                $new_columns['author'] = '닉네임';
                $new_columns['is_owner'] = '샵주여부';
            } else {
                $new_columns[ $key ] = $value;
            }
        }

        return $new_columns;
    }


    public function admin_column_value( $column_name, $post_id ) {
        if ( $column_name == 'status' ) {
            echo ( get_field( 'jt_status', $post_id ) ?: '처리중' );
        } elseif ( $column_name == 'is_owner' ) {
            echo ( get_field( 'modify_data_is_owner', $post_id ) ?: '-' );
        }
    }


    public function admin_filter_status_selector() {
        $post_type = esc_attr( isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post' );
        $namespace = $this->_namespace;

        if ( $post_type == $namespace ) {
            $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], array( '처리중', '처리완료' ) ) ? $_REQUEST['jt_status'] : '' );
            ?>
            <select name="jt_status">
                <option value="">모든 상태</option>
                <option value="처리중" <?php selected( $jt_status, '처리중' ); ?>>처리중</option>
                <option value="처리완료" <?php selected( $jt_status, '처리완료' ); ?>>처리완료</option>
            </select>
            <?php
        }
    }


    public function views_edit_status( $views ) {
        $args = array( 'post_type' => $this->_namespace, 'post_status' => 'publish',  'numberposts' => -1, 'fields' => 'ids' );
        $process = get_posts( array_merge( $args, array( 'meta_query' => array( 'relation' => 'OR', array( 'key' => 'jt_status', 'value' => '처리중' ), array( 'key' => 'jt_status', 'compare' => 'NOT EXISTS' ) ) ) ) );
        $done = get_posts( array_merge( $args, array( 'meta_key' => 'jt_status', 'meta_value' => '처리완료' ) ) );
        $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], array( '처리중', '처리완료' ) ) ? $_REQUEST['jt_status'] : '' );

        $new_view = array(
            'all'       => $views['all'],
            'process'   => sprintf(
                            '<a href="%s" class="%s">처리중 <span class="count">(%d)</span></a>',
                            admin_url( "edit.php?post_type={$this->_namespace}&jt_status=처리중" ),
                            ( $jt_status == '처리중' ? 'current' : '' ),
                            count( $process )
                        ),
            'done'      => sprintf(
                            '<a href="%s" class="%s">처리완료 <span class="count">(%d)</span></a>',
                            admin_url( "edit.php?post_type={$this->_namespace}&jt_status=처리완료" ),
                            ( $jt_status == '처리완료' ? 'current' : '' ),
                            count( $done )
                        ),
        );

        if ( isset( $views['trash'] ) ) $new_view['trash'] = $views['trash'];

        return $new_view;
    }


    public function admin_filter_status_action( $query ) {
        global $pagenow;

        $post_type = esc_attr( isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post' );
        $namespace = $this->_namespace;

        if ( $query->is_main_query() && $post_type === $namespace && is_admin() && $pagenow == 'edit.php' && isset( $_REQUEST['jt_status'] ) ) {
            $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], array( '처리중', '처리완료' ) ) ? $_REQUEST['jt_status'] : '' );
            if ( $jt_status == '처리중' ) {
                $query->query_vars['meta_query'] = array(
                    'relation'  => 'OR',
                    array(
                        'key'   => 'jt_status',
                        'value' => $jt_status,
                    ),
                    array(
                        'key'       => 'jt_status',
                        'compare'   => 'NOT EXISTS',
                    ),
                );
            } elseif ( $jt_status == '처리완료' ) {
                $query->query_vars['meta_query'] = array(
                    'relation'  => 'AND',
                    array(
                        'key'   => 'jt_status',
                        'value' => $jt_status,
                    ),
                );
            }
        }

        return $query;
    }


    public function remove_seo_meta_box() {
        remove_meta_box( 'jtseo', $this->_namespace, 'normal' );
    }


    public function create_post_type() {
        $name = $this->_name;
        $menu = $this->_menu;
        $slug = $this->_slug;
        $support = $this->_support;

        $labels = array(
            'name'               => $name,
            'singular_name'      => $name,
            'add_new'            => '새 ' . $name . ' 등록',
            'add_new_item'       => $name . ' 등록',
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
                'labels'                => $labels,
                'public'                => true,
                'show_ui'               => true,
                'query_var'             => true,
                'show_in_rest'          => true,
                'has_archive'           => false,
                'rewrite'               => array( 'slug' => $slug ),
                'supports'              => $support,
                'capability_type'       => 'post',
                'capabilities'          => array( 'create_posts' => false ),
                'map_meta_cap'          => true,
                'publicly_queryable'    => false,
            )
        );

        add_rewrite_rule( '^' . $slug . '/page/([0-9]+)', 'index.php?pagename=' . $slug . '&paged=$matches[1]', 'top' );
        flush_rewrite_rules();
    }


    public function create_taxonomy() {
        $namespace = $this->_namespace;
        $name = $this->_name;

        register_taxonomy(
            $namespace . '_categories',
            $namespace,
            array(
                'public'            => false,
                'hierarchical'      => true,
                'label'             => $name . ' 분류',
                'rewrite'           => false,
                'query_var'         => true,
                'show_ui'           => true,
                'show_in_rest'      => true,
                'show_admin_column' => true,
                'show_in_nav_menus' => true,
            )
        );
    }


    public function add_item( WP_REST_Request $request ) {
        if ( $this->_rest_config['guest'] || get_current_user_id() > 0 ) {
            $posts = $request->get_params();
            $files = $this->_get_files( $request->get_file_params() );
            $user_id = get_current_user_id();
            $data = array();

            if ( ! $user_id ) {
                return new WP_Error( 'error', '로그인 해주세요', array( 'status' => 200 ) );
            } else {
                $data['user'] = $user_id;
            }

            if ( ! isset( $posts['shop'] ) || empty( $posts['shop'] ) ) {
                return new WP_Error( 'error', '샵을 선택해주세요', array( 'status' => 200 ) );
            } else {
                $data['shop'] = $posts['shop'];
                $data['phone'] = get_field( 'shop_ad_tel_virtual', $posts['shop'] );
            }

            if ( ! isset( $posts['categories'] ) || empty( $posts['categories'] ) ) {
                return new WP_Error( 'error', '정보 수정요청 내용을 알려주세요', array( 'status' => 200 ) );
            } else {
                $data['categories'] = $posts['categories'];
            }

            if ( ! isset( $posts['content'] ) || empty( $posts['content'] ) ) {
                return new WP_Error( 'error', '정보 수정요청 내용을 알려주세요', array( 'status' => 200 ) );
            } else {
                $data['content'] = $posts['content'];
            }

            if ( isset( $files['files'] ) && is_array( $files['files'] ) && ! empty( $files['files'] ) ) {
                $data['files'] = array();

                foreach ( $files['files'] as $file ) {
                    $file_id = $this->_upload_file( $file );

                    if ( ! is_wp_error( $file_id ) ) {
                        $data['files'][] = $file_id;
                    } else {
                        return $file_id;
                    }
                }
            }

            $post_data = array(
                'post_type'     => $this->_namespace,
                'post_status'   => 'publish',
                'post_author'   => get_current_user_id(),
                'post_title'    => get_the_title( $posts['shop'] ),
                'post_name'     => $this->_get_post_title(),
            );

            $res = wp_insert_post( $post_data );

            if ( ! is_wp_error( $res ) ) {
                $data['is_owner'] = ( JT_Member::is_owner( get_current_user_id() ) ? '샵주' : '-' );

                update_field( 'modify_data', $data, $res );
                $res = update_field( 'jt_status', '처리중', $res );

                return new WP_REST_Response( array( 'success' => true ) );
            } else {
                return new WP_Error( 'error', $res->get_error_message(), array( 'status' => 200 ) );
            }
        }
    }


    public function get_config( WP_REST_Request $request ) {
        $config = get_field( 'modify_config', 'option' );
        $shop = get_page_by_path( $request->get_param( 'shop' ), ARRAY_A, 'shop' );

        if ( $shop ) {
            $config['shop'] = array(
                'id'    => $shop['ID'],
                'slug'  => $shop['post_name'],
                'title' => $shop['post_title'],
            );
        }

        if ( $this->_support_cat ) {
            $terms = get_terms( $this->_namespace . '_categories', array( 'hide_empty' => false, ) );

            foreach ( $terms as $idx => $term ) {
                $terms[ $idx ]->meta = get_fields( 'term_' . $term->term_id );
            }

            $config['terms'] = $terms;
        }

        if ( ! empty( $config ) ) {
            return new WP_REST_Response( $config, 200 );
        }

        return new WP_Error( 'empty', '데이터가 없습니다.', array( 'status' => 404 ) );
    }


    private function _get_files( $r_files ) {
        $res = array();

        if ( is_array( $r_files ) && ! empty( $r_files ) ) {
            foreach ( $r_files as $key => $files ) {
                $res[ $key ] = array();

                if ( ! ( is_array( $files['tmp_name'] ) && ! empty( $files['tmp_name'] ) ) ) continue;

                for ( $idx = 0; $idx < count( $files['tmp_name'] ); $idx++ ) {
                    if ( ! ( ! empty( $files['tmp_name'][ $idx ] ) && $files['error'][ $idx ] === 0 ) ) continue;

                    $res[ $key ][] = array(
                        'name'      => $files['name'][ $idx ],
                        'type'      => $files['type'][ $idx ],
                        'tmp_name'  => $files['tmp_name'][ $idx ],
                        'error'     => $files['error'][ $idx ],
                        'size'      => $files['size'][ $idx ],
                    );
                }
            }
        }

        return $res;
    }


    private function _get_post_title() {
        global $wpdb;

        $date = date_i18n( 'Y-m-d' );
        $cnt = $wpdb->get_var( $wpdb->prepare( " SELECT COUNT( * ) FROM {$wpdb->posts} WHERE post_type = %s AND post_date BETWEEN %s AND %s ", $this->_namespace, $date . ' 00:00:00', $date . ' 23:59:59' ) );

        return sprintf( '%s%03d', date_i18n( 'Ymd' ), $cnt + 1 );
    }
}