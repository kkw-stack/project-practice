<?php
$jt_main = new JT_Main();

class JT_Main {

    public function __construct() {
        add_action( 'init', array( $this, 'init' ) );

        add_filter( 'screen_options_show_screen', array( $this, 'screen_options_show_screen' ), 9999, 2 );

        add_action( 'acf/init', array( $this, 'acf_init' ) );
        add_action( 'admin_menu', array( $this, 'admin_menu' ), 99 );

        add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );
    }

    public function init() {
        register_nav_menus( array(
            'my-menu'   => __('마이메뉴'),
            'sub-menu'  => __('서브메뉴')
        ) );
    }

    public function screen_options_show_screen( $show_screen, $screen ) {
        global $pagenow;

        if ( $show_screen && $pagenow === 'admin.php' && isset( $_REQUEST['page'] ) && $_REQUEST['page'] === 'jt-search-static' ) {
            return false;
        }

        return $show_screen;
    }

    public function acf_init() {
        if ( function_exists( 'acf_add_options_page' ) && function_exists( 'acf_add_options_page' ) ) {
            acf_add_options_page( array(
                'page_title'    => '메인화면 관리',
                'menu_title'    => '메인화면 관리',
                'capability'    => 'manage_options',
                'menu_slug'     => 'main-options',
                'update_button' => '업데이트',
            ) );

            acf_add_options_page( array(
                'page_title'    => '부탁말씀',
                'menu_title'    => '부탁말씀',
                'capability'    => 'manage_options',
                'menu_slug'     => 'notice-options',
                'update_button' => '업데이트',
            ) );

            acf_add_options_page( array(
                'page_title'    => '닉네임 금지어',
                'menu_title'    => '닉네임 금지어',
                'capability'    => 'manage_options',
                'menu_slug'     => 'ban-options',
                'update_button' => '업데이트',
            ) );

            acf_add_options_page( array(
                'page_title'    => '알림톡 발신번호',
                'menu_title'    => '알림톡 발신번호',
                'capability'    => 'edit_posts',
                'menu_slug'     => 'kakaotalk-options',
                'update_button' => '업데이트',
            ) );

            acf_add_options_page( array(
                'page_title'    => '이용약관 관리',
                'menu_title'    => '이용약관 관리',
                'capability'    => 'edit_posts',
                'menu_slug'     => 'terms-options',
                'update_button' => '업데이트',
            ) );

            acf_add_options_page( array(
                'page_title'    => '인기 검색어',
                'menu_title'    => '인기 검색어',
                'capability'    => 'manage_options',
                'menu_slug'     => 'jt-search',
                'redirect'      => true,
            ) );

            acf_add_options_sub_page( array(
                'page_title'    => '인기 검색어 관리',
                'menu_title'    => '인기 검색어 관리',
                'capability'    => 'manage_options',
                'parent_slug'   => 'jt-search',
                'menu_slug'     => 'jt-search-list'
            ) );

            acf_add_options_sub_page( array(
                'page_title'    => '검색어 통계',
                'menu_title'    => '검색어 통계',
                'capability'    => 'manage_options',
                'parent_slug'   => 'jt-search',
                'menu_slug'     => 'jt-search-static',
            ) );
        }
    }


    public function admin_menu() {
        if ( function_exists( 'add_submenu_page' ) ) {
            add_submenu_page(
                null,
                '통계',
                '통계',
                'manage_options',
                'jt-search-static',
                array( $this, 'admin_static' )
            );
        }
    }


    public function admin_static() {
        wp_enqueue_style( 'jquery-ui-datepicker', get_template_directory_uri() . '/css/vendors/datepicker/jquery-ui.min.css' );
        wp_enqueue_script( 'jquery-ui-datepicker' );

        echo "
            <script>
                jQuery( '#acf-form-data' ).closest( 'form' ).remove();
                jQuery( '.acf-admin-notice' ).remove();
            </script>
        ";

        global $wpdb;

        $rpp = 20; // ( defined( 'DOING_AJAX' ) && DOING_AJAX ? 10 : 20 );
        $paged = ( isset( $_REQUEST['paged'] ) && intVal( $_REQUEST['paged'] ) > 0 ? intVal( $_REQUEST['paged'] ) : 1 );
        $start = ( $paged - 1 ) * $rpp;

        $start_date = ( isset( $_REQUEST['start_date'] ) ? $_REQUEST['start_date'] : '' );
        $end_date = ( isset( $_REQUEST['end_date'] ) ? $_REQUEST['end_date'] : '' );
        $search = ( isset( $_REQUEST['s'] ) ? $_REQUEST['s'] : '' );

        $where = '';

        if ( date( 'Y-m-d', strtotime( $start_date ) ) == $start_date ) {
            $where .= $wpdb->prepare( " AND created >= %s ", date( 'Y-m-d 00:00:00', strtotime( $start_date ) ) );
        }

        if ( date( 'Y-m-d', strtotime( $end_date ) ) == $end_date ) {
            $where .= $wpdb->prepare( " AND created <= %s ", date( 'Y-m-d 23:59:59', strtotime( $end_date ) ) );
        }

        if ( ! empty( $search ) ) {
            $where .= $wpdb->prepare( " AND search LIKE %s ", str_replace( ' ', '%', '%' . $search . '%' ) );
        }

        $cnt = $wpdb->get_var( " SELECT COUNT( DISTINCT( search ) ) FROM {$wpdb->prefix}jt_search WHERE 1=1 {$where}" );
        $res = $wpdb->get_results(
            " SELECT search, COUNT( uid ) AS cnt FROM {$wpdb->prefix}jt_search WHERE 1=1 {$where} GROUP BY search ORDER BY cnt DESC LIMIT {$start}, {$rpp} ",
            ARRAY_A
        );

        include_once locate_template( '/pages/admin-search-static.php' );
    }


    public function rest_api_init() {
        register_rest_route(
            JT_REST_BASE,
            '/components/seo',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_seo' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/category',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_category' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/area',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_area' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/menu',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_menu' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/main/',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_main' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/privacy/',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_privacy' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/terms/',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_terms' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/privacy/regist/',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_privacy_regist' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/search/',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_search' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/components/search/add/',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'add_search_keywords' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );
    }


    public function get_seo() {
        $result = array(
            'title'         => jtseo_default_title(),
            'description'   => jtseo_get_site_desc(),
            'keywords'      => jtseo_get_site_keywords(),
            'image'         => jtseo_default_thumb(),
        );
        return new WP_REST_Response( $result, 200 );
    }


    public function get_category() {
        return new WP_REST_Response( $this->_get_category( 'shop' ), 200 );
    }


    public function get_area() {
        return new WP_REST_Response( $this->_get_category( 'area' ), 200 );
    }


    public function get_menu() {
        $result = array();
        $items = wp_get_nav_menu_items( 'sub-menu', array( 'order' => 'ASC', 'orderby' => 'menu_order' ) );

        foreach ( $items as $item ) {
            $post_id = $item->db_id;

            if ( get_post_status( $post_id ) == 'publish' ) {
                $result[] = array(
                    'id'        => $item->db_id,
                    'menu_type' => $item->type,
                    'type'      => $item->object,
                    'url'       => $this->_esc_domain( $item->url ),
                    'title'     => $item->title,
                );
            }
        }

        return new WP_REST_Response( $result, 200 );
    }


    public function get_init( WP_REST_Request $request ) {
        $result = array(
            'menu'      => $this->_get_menu(),
            'category'  => $this->_get_category(),
        );

        return new WP_REST_Response( $result, 200 );
    }


    public function get_main( WP_REST_Request $requst ) {
        $category = $this->_get_category();
        $result = array(
            'slide'     => $this->_get_slide(),
            'notice'    => $this->_get_notice(),
            'blog'      => $this->_get_blog(),
            'board'     => $this->_get_board(),
            'category'  => $this->_get_category( 'shop' ),
            'faq'       => $this->_get_faq(),
        );

        return new WP_REST_Response( $result, 200 );
    }


    public function get_privacy( WP_REST_Request $request ) {
        $privacy = get_field( 'main_terms_privacy', 'option' );

        return new WP_REST_Response( $privacy, 200 );
    }


    public function get_terms( WP_REST_Request $request ) {
        $data = get_field( 'main_terms', 'option' );

        return new WP_REST_Response( array( 'service' => $data['service'], 'location' => $data['location'] ), 200 );
    }


    public function get_privacy_regist( WP_REST_Request $requst ) {
        $privacy = get_field( 'main_terms_regist', 'option' );

        return new WP_REST_Response( $privacy, 200 );
    }


    public function get_search( WP_REST_Request $request ) {
        $search = array_column( get_field( 'search_keywords', 'option' ), 'search' );

        return new WP_REST_Response( $search, 200 );
    }


    public function add_search_keywords( WP_REST_Request $request ) {
        if ( ! empty( $request->get_param( 'search' ) ) ) {
            global $wpdb;

            $browser = new Browser();

            $wpdb->insert( $wpdb->prefix . 'jt_search', array(
                'user_id'   => get_current_user_id(),
                'search'    => esc_attr( $request->get_param( 'search' ) ),
                'ip'        => $this->_ip(),
                'platform'  => $browser->getPlatform(),
                'browser'   => $browser->getName(),
                'agent'     => $browser->getUserAgent(),
                'created'   => date_i18n( 'Y-m-d H:i:s' )
            ) );
        }
    }

    private function _get_category( $type = '' ) {
        $result = array( 'shop' => array(), 'area' => array() );

        if ( $type === 'shop' || $type === '' ) {
            $terms = get_terms( 'shop_categories', array( 'hide_empty' => false, 'fields' => 'ids' ) );

            if ( ! empty( $terms ) ) {
                foreach ( $terms as $term_id ) {
                    $tmp_type = get_term_meta($term_id, '_shop_type', true);

                    if (in_array($tmp_type, array('main', 'sub'))) {
                        $term = get_term( $term_id );
                        $tmp_class = get_field( 'shop_category_info_class', 'term_' . $term->term_id );
                        $tmp_icon = get_field( 'shop_category_info_image', 'term_' . $term->term_id );

                        $result['shop'][] = array(
                            'id'            => trim( $term->term_id ),
                            'class'         => trim( $tmp_class ),
                            'name'          => trim( $term->name ),
                            'slug'          => trim( $term->slug ),
                            'description'   => trim($term->description),
                            'url'           => trim( $this->_esc_domain( get_category_link( $term ) ) ),
                            'image'         => trim( wp_get_attachment_image_url( $tmp_icon, 'full' ) ),
                            'is_main'       => $tmp_type == 'main',
                        );
                    }
                }
            }

            if ( $type === 'shop' ) return $result['shop'];
        }

        if ( $type === 'area' || $type === '' ) {
            $areas = get_terms( 'shop_area', array( 'hide_empty' => false, 'parent' => 0 ) );

            if ( is_array( $areas ) && ! empty( $areas ) ) {
                foreach ( $areas as $area ) {
                    $child = get_terms( 'shop_area', array( 'hide_empty' => false, 'parent' => $area->term_id ) );
                    $res_child = array();
                    $count = 0;

                    if ( is_array( $child ) && ! empty( $child ) ) {
                        foreach ( $child as $item ) {
                            // $tmp_loc = get_field( 'category_location', 'term_' . $item->term_id );
                            $count += $item->count;

                            $res_child[] = array(
                                'id'    => trim( $item->term_id ),
                                'name'  => trim( $item->name ),
                                'count' => $item->count,
                                'slug'  => trim( $item->slug ),
                            );
                        }
                    }

                    $result['area'][] = array(
                        'id'    => trim( $area->term_id ),
                        'name'  => trim( $area->name ),
                        'slug'  => trim($area->slug),
                        'count' => $area->count,
                        'child' => ( $res_child ),
                    );
                }
            }

            if ( $type === 'area' ) return $result['area'];
        }

        return $result;
    }



    private function _get_slide() {

        $banners = get_field( 'main_banner', 'option' );
        $result = array();

        if ( ! empty( $banners ) ) {
            foreach ( $banners as $banner ) {
                if ( $banner['use'] ) {
                    $result[] = array(
                        'url'       => $this->_esc_domain( $banner['link']['url'] ?: '#' ),
                        'target'    => ( $banner['link']['url'] && $banner['link']['target'] ),
                        'image'     => wp_get_attachment_image_url( $banner['image'], 'jt_main_slide2x' ),
                    );
                }
            }
        }

        return $result;
    }


    private function _get_notice() {
        $notices = get_field( 'main_notice', 'option' );
        $result = array();

        if ( ! empty( $notices ) ) {
            foreach ( $notices as $item ) {
                $result[] = array(
                    'url'       => $this->_esc_domain( $item['link']['url'] ?: '#' ),
                    'target'    => ( $item['link']['url'] && $item['link']['target'] ),
                    'content'   => $item['content'],
                );
            }
        }

        return $result;
    }


    private function _get_blog() {
        $blogs = array_column( get_field( 'main_blog', 'option' ), 'item' );
        $result = array();

        if ( ! empty( $blogs ) ) {
            foreach ( $blogs as $item ) {
                $blog = get_post( $item );

                if ( $blog->post_status == 'publish' ) {
                    $result[] = array(
                        'id'        => $blog->ID,
                        'slug'      => $blog->post_name,
                        'url'       => $this->_esc_domain( get_permalink( $blog ) ),
                        'thumbnail' => ( has_post_thumbnail( $blog ) ? get_the_post_thumbnail_url( $blog, 'jt_main_blog_list' ) : '' ),
                        'title'     => $blog->post_title,
                        'date'      => date( 'Y-m-d', strtotime( $blog->post_date ) ),
                        'datetime'  => $blog->post_date,
                    );
                }
            }
        }

        return $result;
    }


    private function _get_board() {
        $boards = get_field( 'main_board', 'option' );
        $result = array();

        if ( ! empty( $boards ) ) {
            foreach ( $boards as $key => $item ) {
                if ( $item > 0 ) {
                    $board = get_post( $item );

                    $result[ $key ] = array(
                        'id'        => $board->ID,
                        'slug'      => $board->post_name,
                        'url'       => $this->_esc_domain( get_permalink( $board ) ),
                        'thumbnail' => ( has_post_thumbnail( $board ) ? get_the_post_thumbnail_url( $board, 'jt_main_blog_list' ) : '' ),
                        'title'     => $board->post_title,
                        'date'      => date( 'Y-m-d', strtotime( $board->post_date ) ),
                        'datetime'  => $board->post_date,
                    );
                } else {
                    $result[ $key ] = null;
                }
            }
        }

        return $result;
    }

    public function _get_faq() {
        $faq = get_field('main_faq', 'option');
        return !empty($faq) && is_array($faq) ? $faq : [];
    }


    private function _esc_domain( $url ) {
        return str_replace( home_url(), '', $url );
    }


    // User IP
    private function _ip() {
        $ip = '';

        if ( ! empty( $_SERVER[ 'HTTP_X_FORWARDED_FOR' ] ) && filter_var( $_SERVER[ 'HTTP_X_FORWARDED_FOR' ], FILTER_VALIDATE_IP ) ) {
            $ip = $_SERVER[ 'HTTP_X_FORWARDED_FOR' ];
        } elseif ( ! empty( $_SERVER[ 'HTTP_X_SUCURI_CLIENTIP' ] ) && filter_var( $_SERVER[ 'HTTP_X_SUCURI_CLIENTIP' ], FILTER_VALIDATE_IP ) ) {
            $ip = $_SERVER[ 'HTTP_X_SUCURI_CLIENTIP' ];
        } elseif ( isset( $_SERVER[ 'REMOTE_ADDR' ] ) ) {
            $ip = $_SERVER[ 'REMOTE_ADDR' ];
        }

        $ip = preg_replace( '/^(\d+\.\d+\.\d+\.\d+):\d+$/', '\1', $ip );

        return $ip;
    }
}
