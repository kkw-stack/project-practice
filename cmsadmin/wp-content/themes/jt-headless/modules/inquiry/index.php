<?php
/*
 * Name       : Inquiry
 * namespace  : inquiry
 * File       : /modules/inquiry/index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) Inquiry 프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


/**
 * Inquiry 프로그램 실행
 */
$jt_inquiry = new Jt_inquiry();

/**
 * Jt_inquiry Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_inquiry extends Jt_Module{

    public function __construct() {
        // parent::__construct( 'event', '게시판', '게시판', '게시판',array('title', 'editor', 'excerpt', 'jt_download'), false, '1.0.0', 90 );
        parent::__construct( array(
            'namespace'     => 'inquiry',
            'name'          => '1:1문의',
            'slug'          => '나의-문의내역',
            'support'       => array( 'title' ),
            'support_cat'   => true,
            'pageid'        => 982,
            'gutenberg'     => false,
            'rest_config'   => array(
                                'config'        => true,
                                'list_own'      => true,
                                'single_own'    => true,
                                'create'        => true,
                                'update'        => true,
                                'delete'        => true,
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


    public function disable_acf_data_script() {
        if ( get_post_type() === $this->_namespace ) {
            $field = get_field_object( 'inquiry_data' );

            if ( isset( $field['sub_fields'] ) && ! empty( $field['sub_fields'] ) ) {
                foreach ( $field['sub_fields'] as $sub_field ) {
                    if ( $sub_field['name'] != 'status' ) {
                        $field_key = 'acf[' . implode( '][', array( $field['key'], $sub_field['key'] ) ) . ']';
                        $str_button = '';

                        if ( $sub_field['name'] == 'author' ) {
                            $str_button = sprintf(
                                '<div class="acf-input-append" style="min-height:28px;height:28px;"><a href="%s" style="color:#444;text-decoration:none;" target="_blank"><span>프로필</span></a></div>',
                                admin_url( 'user-edit.php?user_id=' . get_field( 'inquiry_data_author' ) )
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
            .column-is_owner { width: 100px; }
        </style>
        <?php
    }


    public function admin_columns( $columns ) {
        $new_columns = array();

        foreach ( $columns as $key => $value ) {
            if ( $key == 'title' ) {
                $new_columns['title'] = '제목';
                $new_columns['author'] = '닉네임';
                $new_columns['is_owner'] = '샵주여부';
            } elseif ( $key == 'date' ) {
                $new_columns['status'] = '상태';
                $new_columns['date'] = '문의일자';
            } else {
                $new_columns[ $key ] = $value;
            }
        }

        return $new_columns;
    }


    public function admin_column_value( $column_name, $post_id ) {
        global $wpdb;

        if ( $column_name == 'status' ) {
            if ( get_field( 'inquiry_answer', $post_id ) ) {
                echo '답변완료';
            } else {
                echo '처리중';
            }
        } elseif ( $column_name === 'is_owner' ) {
            echo ( get_field( 'inquiry_data_is_owner', $post_id ) ?: '-' );
        }
    }


    public function admin_filter_status_selector() {
        $post_type = esc_attr( isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post' );
        $namespace = $this->_namespace;

        if ( $post_type == $namespace ) {
            $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], array( '처리중', '답변완료' ) ) ? $_REQUEST['jt_status'] : '' );
            ?>
            <select name="jt_status">
                <option value="">모든 상태</option>
                <option value="처리중" <?php selected( $jt_status, '처리중' ); ?>>처리중</option>
                <option value="답변완료" <?php selected( $jt_status, '답변완료' ); ?>>답변완료</option>
            </select>
            <?php
        }
    }


    public function views_edit_status( $views ) {
        $args = array( 'post_type' => $this->_namespace, 'post_status' => 'publish',  'numberposts' => -1, 'fields' => 'ids' );
        $process = get_posts( array_merge( $args, array( 'meta_query' => array( 'relation' => 'OR', array( 'key' => 'inquiry_answer', 'compare' => '=', 'value' => '' ), array( 'key' => 'inquiry_answer', 'compare' => 'NOT EXISTS' ) ) ) ) );
        $done = get_posts( array_merge( $args, array( 'meta_query' => array( array( 'key' => 'inquiry_answer', 'compare' => '!=', 'value' => '' ) ) ) ) );
        $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], array( '처리중', '답변완료' ) ) ? $_REQUEST['jt_status'] : '' );

        $new_view = array(
            'all'       => $views['all'],
            'process'   => sprintf(
                            '<a href="%s" class="%s">처리중 <span class="count">(%d)</span></a>',
                            admin_url( "edit.php?post_type={$this->_namespace}&jt_status=처리중" ),
                            ( $jt_status == '처리중' ? 'current' : '' ),
                            count( $process )
                        ),
            'done'      => sprintf(
                            '<a href="%s" class="%s">답변완료 <span class="count">(%d)</span></a>',
                            admin_url( "edit.php?post_type={$this->_namespace}&jt_status=답변완료" ),
                            ( $jt_status == '답변완료' ? 'current' : '' ),
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
            $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], array( '처리중', '답변완료' ) ) ? $_REQUEST['jt_status'] : '' );

            if ( $jt_status == '답변완료' ) {
                $query->query_vars['meta_query'] = array(
                    'relation'  => 'AND',
                    array(
                        'key'       => 'inquiry_answer',
                        'compare'   => '!=',
                        'value'     => '',
                    ),
                );
            } else {
                $query->query_vars['meta_query'] = array(
                    'relation'  => 'OR',
                    array(
                        'key'       => 'inquiry_answer',
                        'compare'   => 'NOT EXISTS',
                    ),
                    array(
                        'key'   => 'inquiry_answer',
                        'value' => '',
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
                'labels'        => $labels,
                'public'        => true,
                'show_ui'       => true,
                'query_var'     => true,
                'show_in_rest'  => true,
                'has_archive'   => false,
                'rewrite'       => array( 'slug' => $slug ),
                'supports'      => $support,
                'capability_type'   => 'post',
                'capabilities'  => array( 'create_posts' => false ),
                'map_meta_cap'  => true,
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
                'label'             => '문의유형',
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
            $config = get_field( 'inquiry_config', 'option' );

            if ( ! isset( $posts['email'] ) || empty( $posts['email'] ) ) {
                return new WP_Error( 'email_required', '이메일을 입력해주세요', array( 'status' => 200 ) );
            } elseif ( ! preg_match( '/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/', $posts['email'] ) ) {
                return new WP_Error( 'email_not_valid', '유효한 이메일을 입력해주세요', array( 'status' => 200 ) );
            }

            if ( ! isset( $posts['phone'] ) || empty( $posts['phone'] ) ) {
                return new WP_Error( 'phone_required', '휴대폰번호를 입력해주세요', array( 'status' => 200 ) );
            } elseif ( ! preg_match( '/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/', $posts['phone'] ) ) {
                return new WP_Error( 'phone_not_valid', '유효한 휴대폰번호를 입력해주세요', array( 'status' => 200 ) );
            }

            if ( ! isset( $posts['term'] ) || empty( $posts['term'] ) ) {
                return new WP_Error( 'term_required', '문의유형을 선택해 주세요', array( 'status' => 200 ) );
            } else {
                $terms = get_terms( $this->_namespace . '_categories', array( 'hide_empty' => false, ) );

                if ( ! in_array( $posts['term'], array_column( $terms, 'term_id' ) ) ) {
                    return new WP_error( 'term_not_valid', '유효한 문의유형을 선택해 주세요', array( 'status' => 200 ) );
                }
            }

            if ( ! isset( $posts['title'] ) || empty( $posts['title'] ) ) {
                return new WP_Error( 'title_required', '제목을 입력해주세요', array( 'status' => 200 ) );
            }

            if ( ! isset( $posts['content'] ) || empty( $posts['content'] ) ) {
                return new WP_Error( 'content_required', '내용을 입력해주세요', array( 'status' => 200 ) );
            }

            if ( ! isset( $posts['privacy'] ) || $posts['privacy'] !== 'true' ) {
                return new WP_Error( 'privacy_required', '개인정보 수집 및 이용에 동의해주세요', array( 'status' => 200 ) );
            }

            $data = array(
                'author'    => get_current_user_id(),
                'is_owner'  => JT_Member::is_owner( get_current_user_id() ) ? '샵주' : '-',
                'email'     => esc_attr( $posts['email'] ),
                'phone'     => preg_replace( '/(0(?:2|[0-9]{2}))([0-9]+)([0-9]{4}$)/', "$1-$2-$3", $posts['phone'] ),
                'term'      => get_term( $posts['term'], $this->_namespace . '_categories' )->name,
                'title'     => esc_attr( $posts['title'] ),
                'content'   => esc_attr( $posts['content'] ),
                'gallery'   => array(),
            );

            if ( isset( $files['gallery'] ) && is_array( $files['gallery'] ) && ! empty( $files['gallery'] ) ) {
                $data['gallery'] = array();

                foreach ( $files['gallery'] as $file ) {
                    $file_id = $this->_upload_file( $file, $config['file']['extension'] );

                    if ( ! is_wp_error( $file_id ) ) {
                        $data['gallery'][] = $file_id;
                    } else {
                        return $file_id;
                    }
                }
            }

            $post_data = array(
                'post_type'     => $this->_namespace,
                'post_status'   => 'publish',
                'post_author'   => get_current_user_id(),
                'post_title'    => $data['title'],
                'post_name'     => $this->_get_post_title(),
            );

            $res = wp_insert_post( $post_data );

            if ( ! is_wp_error( $res ) ) {
                update_field( 'inquiry_data', $data, $res );
                wp_set_post_terms( $res, $posts['term'], $this->_namespace . '_categories' );

                return new WP_REST_Response( array( 'success' => true ) );
            } else {
                return new WP_Error( 'error', $res->get_error_message(), array( 'status' => 200 ) );
            }
        }
    }


    public function get_config( WP_REST_Request $request ) {
        $config = get_field( 'inquiry_config', 'option' );

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


    protected function _get_post_data( $post_id = 0, $is_single = false ) {
        $post_id = intVal( $post_id );
        $post = get_post( $post_id );
        $result = null;

        if ( ! empty( $post ) ) {
            if ( ! current_user_can( 'administrator' ) && $this->_rest_config['list_own'] && $post->post_author != get_current_user_id() && current_user_can( 'administrator' ) ) return null;

            $inquiry_data = get_field( 'inquiry_data', $post->ID );
            $author = get_userdata( $post->post_author );
            $result = array(
                'id'        => intVal( $post->ID ),
                'slug'      => $post->post_name,
                'author'    => array(
                                'user_id'   => $author->ID,
                                'nickname'  => $author->display_name,
                                'email'     => $author->user_email,
                            ),
                'title'     => $inquiry_data['title'],
                'is_answer' => ! empty( get_field( 'inquiry_answer', $post->ID ) ),
                'date'      => $post->post_date,
            );

            if ( $is_single ) {
                $result['email'] = $inquiry_data['email'];
                $result['phone'] = $inquiry_data['phone'];
                $result['term'] = $inquiry_data['term'];
                $result['content'] = $inquiry_data['content'];
                $result['gallery'] = [];
                $result['answer'] = get_field( 'inquiry_answer', $post->ID );

                if ( is_array( $inquiry_data['gallery'] ) && count( $inquiry_data['gallery' ] ) > 0 ) {
                    foreach ( $inquiry_data['gallery'] as $image ) {
                        $result['gallery'][] = array(
                            'path'  => home_url() . $image,
                            'type'  => wp_get_image_mime( ABSPATH . $image ),
                            'name'  => pathinfo( $image )['basename'],
                        );
                    }
                }
            }
        }

        return $result;
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