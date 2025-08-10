<?php
/*
 * Name       : Partnership
 * namespace  : partnership
 * File       : /modules/partnership /index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) Partnership  프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


/**
 * Partnership 프로그램 실행
 */
$jt_partnership = new Jt_partnership();

/**
 * Jt_partnership Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_partnership extends Jt_Module{

    public function __construct() {
        // parent::__construct( 'event', '게시판', '게시판', '게시판',array('title', 'editor', 'excerpt', 'jt_download'), false, '1.0.0', 90 );

        parent::__construct( array(
            'namespace'     => 'partnership',
            'name'          => '제휴문의',
            'slug'          => '입금안내',
            'support'       => array( 'title' ),
            'support_cat'   => false,
            'gutenberg'     => false,
            'rest_config'   => array(
                                'config'        => true,
                                'list'          => false,
                                'list_own'      => true,
                                'single_own'    => true,
                                'single'        => true,
                                'create'        => true,
                            ),
        ) );

        add_action( 'init', array( $this, 'acf_option' ) );

        add_action( 'admin_footer', array( $this, 'disable_acf_data_script' ) );
        add_filter( 'acf/prepare_field/name=partnership_data', array( $this, 'disable_acf_data' ) );

        add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
        add_action( 'wp_ajax_partnership_admin_action', array( $this, 'admin_ajax_action' ) );

        add_action( 'restrict_manage_posts', array( $this, 'admin_filter_status_selector' ) );
        add_filter( 'views_edit-' . $this->_namespace, array( $this, 'views_edit_status' ) );
        add_filter( 'pre_get_posts', array( $this, 'admin_filter_status_action' ) );

        add_action( 'posts_where', array( $this, 'posts_where' ), 10, 2 );

        add_action( 'admin_head', array( $this, 'admin_column_style' ) );
        add_filter( 'manage_' . $this->_namespace . '_posts_columns', array( $this, 'admin_columns' ) );
        add_action( 'manage_' . $this->_namespace . '_posts_custom_column', array( $this, 'admin_column_value' ), 10, 2 );

        add_action( 'do_meta_boxes', array( $this, 'remove_seo_meta_box' ) );

        add_action( 'rest_api_init', array( $this, 'custom_rest_api_init' ) );
    }


    public function acf_option() {
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
            $field = get_field_object( 'partnership_data' );
            ?>
            <script>
            jQuery( function ( $ ) {
                $( 'div[data-name="partnership_data"].acf-field-group' ).find( 'input:not([type=hidden]), textarea, select' ).prop( 'disabled', true );
                $( 'div[data-name="partnership_data"].acf-field-group' ).find( 'input:checkbox' ).prop( 'readonly', true ).prop( 'disabled', false ).on( 'click', function () { return false; } );

                $( 'div[data-name="basic"] div[data-name="author"] div.acf-input' ).children().wrapAll( '<div class="acf-input-wrap"></div>' );
                $( 'div[data-name="basic"] div[data-name="author"] div.acf-input' ).prepend( '<div class="acf-input-append" style="min-height:28px;height:28px;"><a href="<?php echo admin_url( 'user-edit.php?user_id=' . get_field( 'partnership_data_basic_author' ) ); ?>" style="color:#444;text-decoration:none;" target="_blank"><span>프로필</span></a></div>' );
            } );
            </script>
            <?php
        }
    }


    public function disable_acf_data( $field ) {
        if ( in_array( $field['type'], array( 'text', 'textarea', 'number', 'jt_text_array', 'jt_file_array' ) ) ) {
            $field['readonly'] = true;
            $field['disabled'] = true;
        } elseif ( isset( $field['sub_fields'] ) && is_array( $field['sub_fields'] ) && ! empty( $field['sub_fields'] ) ) {
            foreach ( $field['sub_fields'] as $idx => $item ) {
                $field['sub_fields'][ $idx ] = $this->disable_acf_data( $item );
            }
        }

        return $field;
    }


    public function add_meta_boxes() {
        add_meta_box( 'partnership_status_selector', '상태', array( $this, 'status_meta_box' ), $this->_namespace, 'side' );
    }


    public function status_meta_box( $post ) {
        $status = get_field( 'jt_status', $post );
        ?>
        <div class="acf-field">
            <div class="acf-input jt_manage_status">
                <button type="button" class="button <?php echo ( $status == '미등록' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $post->ID; ?>" data-status="미등록">
                    <span>미등록</span>
                </button>
                <button type="button" class="button <?php echo ( $status == '등록완료' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $post->ID; ?>" data-status="등록완료">
                    <span>등록완료</span>
                </button>
                <button type="button" class="button <?php echo ( $status == 'Blocked' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $post->ID; ?>" data-status="Blocked">
                    <span>Block</span>
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

                    if ( [ '미등록', '등록완료', 'Blocked' ].indexOf( status ) < 0 ) {
                        alert( '잘못된 접근입니다' );
                    }

                    $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'partnership_admin_action', uid: uid, status: status }, function ( res ) {
                        if ( res.success && status === '미등록' ) {
                            alert( '미등록으로 변경했습니다' );
                        } else if ( res.success && status === '등록완료' ) {
                            alert( '등록을 완료했습니다' );
                        } else if ( res.success && status == 'Blocked' ) {
                            alert( 'Block으로 처리했습니다' );
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
            isset( $_POST['status'] ) && in_array( $_POST['status'], array( '미등록', '등록완료', 'Blocked' ) )
        ) {
            $res = update_field( 'jt_status', $_POST['status'], $_POST['uid'] );

            if ( $res ) wp_send_json_success();
            else wp_send_json_error();

            exit;
        }

        wp_send_json_error( '잘못된 접근입니다' );
        exit;
    }


    public function admin_filter_status_selector() {
        $post_type = esc_attr( isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post' );
        $namespace = $this->_namespace;

        if ( $post_type == $namespace ) {
            $arr_status = array( '미등록', '등록완료', 'Blocked' );
            $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], $arr_status ) ? $_REQUEST['jt_status'] : '' );
            ?>
            <select name="jt_status">
                <option value="">모든 상태</option>
                <?php foreach ( $arr_status as $item ) : ?>
                    <option value="<?php echo $item; ?>" <?php selected( $jt_status, $item ); ?>><?php echo $item; ?></option>
                <?php endforeach; ?>
            </select>
            <?php
        }
    }


    public function views_edit_status( $views ) {
        $args = array( 'post_type' => $this->_namespace, 'post_status' => 'publish',  'numberposts' => -1, 'fields' => 'ids' );

        $process = get_posts( array_merge( $args, array( 'meta_query' => array(
            'relation' => 'OR',
            array( 'key' => 'jt_status', 'value' => '미등록' ),
            array( 'key' => 'jt_status', 'compare' => 'NOT EXISTS' ),
        ) ) ) );
        $done = get_posts( array_merge( $args, array( 'meta_key' => 'jt_status', 'meta_value' => '등록완료' ) ) );
        $blocked = get_posts( array_merge( $args, array( 'meta_key' => 'jt_status', 'meta_value' => 'Blocked' ) ) );

        $arr_status = array( '미등록', '등록완료', 'Blocked' );
        $jt_status = urldecode( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], $arr_status ) ? $_REQUEST['jt_status'] : '' );

        $new_view = array(
            'all'       => $views['all'],
            'process'   => sprintf(
                            '<a href="%s" class="%s">미등록 <span class="count">(%d)</span></a>',
                            admin_url( "edit.php?post_type={$this->_namespace}&jt_status=미등록" ),
                            ( $jt_status == '미등록' ? 'current' : '' ),
                            count( $process )
                        ),
            'done'      => sprintf(
                            '<a href="%s" class="%s">등록완료 <span class="count">(%d)</span></a>',
                            admin_url( "edit.php?post_type={$this->_namespace}&jt_status=등록완료" ),
                            ( $jt_status == '등록완료' ? 'current' : '' ),
                            count( $done )
                        ),
            'blocked'   =>  sprintf(
                            '<a href="%s" class="%s">Blocked <span class="count">(%d)</span></a>',
                            admin_url( "edit.php?post_type={$this->_namespace}&jt_status=Blocked" ),
                            ( $jt_status == 'Blocked' ? 'current' : '' ),
                            count( $blocked )
                        ),
        );

        if ( isset( $views['trash'] ) ) $new_view['trash'] = $views['trash'];

        return $new_view;
    }


    public function admin_filter_status_action( $query ) {
        global $pagenow;

        $post_type = esc_attr( isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post' );
        $namespace = $this->_namespace;

        if ( $query->is_main_query() && $post_type === $namespace && is_admin() && $pagenow == 'edit.php' ) {
            $arr_status = array( '미등록', '등록완료', 'Blocked' );

            if ( isset( $_REQUEST['jt_status'] ) && in_array( urldecode( $_REQUEST['jt_status'] ), $arr_status ) ) {
                if ( $_REQUEST['jt_status'] == '미등록' ) {
                    $query->query_vars['meta_query'] = array(
                        'relation'  => 'OR',
                        array(
                            'key'       => 'jt_status',
                            'compare'   => 'NOT EXISTS',
                        ),
                        array(
                            'key'   => 'jt_status',
                            'value' => '',
                        ),
                    );
                } else {
                    if ( ! isset( $query->query_vars['meta_query'] ) ) {
                        $query->query_vars['meta_query'] = array( 'relation' => 'AND' );
                    }
                }

                $query->query_vars['meta_query'][] = array(
                    'key'   => 'jt_status',
                    'value' => urldecode( $_REQUEST['jt_status'] ),
                );
            }
        }

        return $query;
    }


    public function posts_where( $where, $query ) {
        global $wpdb;

        if ( is_admin() && $query->is_main_query() && isset( $query->query_vars['post_type'] ) && $this->_namespace == $query->query_vars['post_type'] ) {
            if ( isset( $query->query['s'] ) && ! empty( $query->query['s'] ) ) {
                $replace = "post_title LIKE $1 ) ";
                $replace .= " OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'partnership_data_ad_phone' AND meta_value LIKE $1 ) ) ";
                $replace .= " OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'partnership_data_ceo_phone' AND meta_value LIKE $1 ) ) ";
                $where = preg_replace( "/post_title\s+LIKE\s*(\'[^\']+\')\s*\)/", $replace, $where );
            }
        }

        return $where;
    }


    public function admin_column_style() {
        ?>
        <style>
            .column-status { width: 150px; }
            .column-ad_type { width: 150px; }
            .column-is_owner { width: 100px; }
        </style>
        <?php
    }


    public function admin_columns( $columns ) {
        $new_columns = array();

        foreach ( $columns as $key => $value ) {
            if ( $key === 'date' ) {
                $new_columns['author'] = '닉네임';
                $new_columns['is_owner'] = '샵주여부';
                $new_columns['ad_type'] = '광고상품';
                $new_columns['status'] = '상태';
                $new_columns['date'] = '문의일자';
            } elseif ( $key == 'title' ) {
                $new_columns['title'] = '샵 이름';
            } else {
                $new_columns[ $key ] = $value;
            }
        }

        return $new_columns;
    }


    public function admin_column_value( $column_name, $post_id ) {
        if ( $column_name == 'status' ) {
            echo ( get_field( 'jt_status', $post_id ) ?: '미등록' );
        } elseif ( $column_name == 'ad_type' ) {
            the_field( 'partnership_data_ad_type', $post_id );
        } elseif ( $column_name == 'is_owner' ) {
            echo ( get_field( 'partnership_data_basic_is_owner', $post_id ) ?: '-' );
        }
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
                'labels'            => $labels,
                'public'            => true,
                'show_ui'           => true,
                'query_var'         => true,
                'show_in_rest'      => true,
                'has_archive'       => false,
                'rewrite'           => array( 'slug' => $slug ),
                'supports'          => $support,
                'capability_type'   => 'post',
                'capabilities'      => array( 'create_posts' => false ),
                'map_meta_cap'      => true,
            )
        );

        add_rewrite_rule( '^' . $slug . '/page/([0-9]+)', 'index.php?pagename=' . $slug . '&paged=$matches[1]', 'top' );
        flush_rewrite_rules();
    }


    public function custom_rest_api_init() {
        register_rest_route(
            $this->_rest_config['base'],
            '/modules/' . $this->_namespace . '/result/(?P<slug>(.*)+)',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_result_data' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );
    }


    public function get_result_data( WP_REST_Request $request ) {
        $post_id = $this->_get_post_id_from_request( $request );

        if ( $post_id > 0 && ( get_post_field( 'post_author', $post_id ) == get_current_user_id() || current_user_can( 'administrator' ) ) ) {
            $post_data = get_field( 'partnership_data_ad', $post_id );
            $config = get_field( 'partnership_config_bank', 'option' );
            $result = array(
                'type'      => $post_data['type'],
                'price'     => $post_data['price']['result'],
                'bank'      => $config['bank'],
                'account'   => $config['account'],
                'name'      => $config['name'],
            );

            return new WP_REST_Response( $result );
        }

        return new WP_Error( 'empty', '데이터가 없습니다.', array( 'status' => 404 ) );
    }


    public function add_item( WP_REST_Request $request ) {
        if ( $this->_rest_config['guest'] || get_current_user_id() > 0 ) {
            $meta_data = array(
                'basic'     => array(
                                'name'      => '',
                                'author'    => get_current_user_id(),
                                'is_owner'  => ( JT_Member::is_owner( get_current_user_id() ) ? '샵주' : '-' ),
                            ),
                'ad'        => array(
                                'type'      => '',
                                'bg'        => '미적용',
                                // 'addition'  => '-',
                                'period'    => '',
                                'price'     => array(
                                                'origin'    => 0,
                                                'sale'      => 0,
                                                'result'    => 0,
                                            ),
                                'use_sms'   => '미적용',
                                'use_card'  => '미적용',
                            ),
                'ceo'       => array(
                                'name'  => '',
                                'phone' => '',
                            ),
                'shop'      => array(
                                'gallery'   => array(),
                                'location'  => '',
                                'address'   => array(
                                                'zipcode'   => '',
                                                'addr'      => '',
                                                'sub'       => '',
                                            ),
                                'hide_map'  => '미적용',
                                'price'     => '',
                                'opening'   => '',
                                'holiday'   => '',
                            ),
                'menu'      => array(
                                'guide'     => '-',
                                'keywords'  => '',
                                'course'    => '',
                                'gallery'   => array(),
                                'category'  => '',
                            ),
                'info'      => array(
                                'intro'     => '-',
                                'member'    => '-',
                                'manager'   => '-',
                                'company'   => '-',
                                'code'      => '-',
                            ),
                'review'    => array(
                                'notice'    => '-',
                            ),
                'agreement' => array(
                                'privacy'   => '동의',
                                'pledge'    => '동의',
                                'marketing' => '미동의',
                            ),
            );

            $posts = $request->get_params();
            $files = $this->_get_files( $request->get_file_params() );
            $config = get_field( 'partnership_config', 'option' );

            $types = array( '슈퍼리스트' => 88000, '빅히트콜' => 55000, '일반샵' => 33000 );
            $periods = array( '1개월' => 1, '2개월' => 2, '5개월' => 5 );
            $sales = array( '1개월' => 0, '2개월' => 0.1, '5개월' => 0.2 );
            $additions = array( '배경색꾸미기' => 33000 );

            // 1. 문의정보 : basic
            //// 샵 이름(필수) : name
            if ( ! ( isset( $posts['shop_name'] ) && ! empty( $posts['shop_name'] ) ) ) {
                return new WP_Error( 'shop_name_required', '샵 이름을 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['basic']['name'] = $this->_esc_attr( $posts['shop_name'] );
            }


            // 2. 광고상품 안내 : ad
            //// 광고상품(필수) : type
            if ( !( isset( $posts['ad_type'] ) && ! empty( $posts['ad_type'] ) ) ) {
                return new WP_Error( 'ad_type_required', '광고상품을 선택해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['ad']['type'] = $this->_esc_attr( $posts['ad_type'] );
            }

            //// 추가상품 : addition
            $tmp_addition = array();
            if ( in_array( $meta_data['ad']['type'], array( '슈퍼리스트', '빅히트콜' ) ) || 1) {
                if ( isset( $posts['ad_addition'] ) && is_array( $posts['ad_addition'] ) && ! empty( $posts['ad_addition'] ) ) {
                    foreach ( $posts['ad_addition'] as $item ) {
                        if ( in_array( $item, array_keys( $additions ) ) ) {
                            if ( $item == '배경색꾸미기' ) {
                                $meta_data['ad']['bg'] = '적용';
                            }
                            // $tmp_addition[] = $this->_esc_attr( $item );
                        }
                    }

                    // if ( ! empty( $tmp_addition ) ) $meta_data['ad']['addition'] = implode( PHP_EOL, $tmp_addition );
                }
            }

            //// 광고기간(필수) : period
            if ( $posts['ad_type'] === '일반샵' && 0) {
                $meta_data['ad']['period'] = '1개월(정가)';
            } elseif ( ! ( isset( $posts['ad_period'] ) && ! empty( $posts['ad_period'] ) ) ) {
                return new WP_Error( 'ad_period_required', '광고기간을 선택해주세요', array( 'status' => 200 ) );
            } else {
                if ( $posts['ad_period'] == '1개월' ) $meta_data['ad']['period'] = $this->_esc_attr( $posts['ad_period'] ) . '(정가)';
                if ( $posts['ad_period'] == '2개월' ) $meta_data['ad']['period'] = $this->_esc_attr( $posts['ad_period'] ) . '(10%할인)';
                if ( $posts['ad_period'] == '5개월' ) $meta_data['ad']['period'] = $this->_esc_attr( $posts['ad_period'] ) . '(20%할인)';
            }

            //// 이용가격 : price
            if ( $meta_data['ad']['type'] !== '일반샵' || 1) {
                $origin = $types[ $posts['ad_type'] ];
                $period = $periods[ $posts['ad_period'] ];
                $sale = $sales[ $posts['ad_period'] ];
                $addition = 0;

                if ( is_array( $posts['ad_addition'] ) && count( $posts['ad_addition'] ) > 0 ) {
                    foreach( $posts['ad_addition'] as $item ) {
                        if ( isset( $additions[ $item ] ) ) {
                            $addition += $additions[ $item ];
                        }
                    }
                }

                $origin_price = ( $origin + $addition ) * $period;
                $saled_price = intVal( $origin_price * $sale );
                $result_price = $origin_price - $saled_price;

                $meta_data['ad']['price'] = array(
                    'origin'    => number_format( $origin_price ),
                    'sale'      => number_format( $saled_price ),
                    'result'    => number_format( $result_price ),
                );
            } else {
                $meta_data['ad']['price'] = array( 'origin' => 0, 'sale' => 0, 'result' => 0 );
            }

            //// 샵 전화번호(필수) : phone
            if ( ! ( isset( $posts['shop_phone'] ) && ! empty( $posts['shop_phone'] ) ) ) {
                return new WP_Error( 'shop_phone_required', '샵 휴대폰번호 또는 일반전화번호를 입력해주세요', array( 'status' => 200 ) );
            } elseif ( ! preg_match( '/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/', $posts['shop_phone'] ) ) {
                return new WP_Error( 'shop_phone_not_valid', '샵 휴대폰번호 또는 일반전화번호를 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['ad']['phone'] = preg_replace( '/(0(?:2|[0-9]{2}))([0-9]+)([0-9]{4}$)/', "$1-$2-$3", $posts['shop_phone'] );
            }

            //// 문자예약 : use_sms
            if ( isset( $posts['shop_use_sms'] ) && $posts['shop_use_sms'] == 'true' ) {
                $meta_data['ad']['use_sms'] = '적용';
            }

            //// 카드결제 : use_card
            if ( isset( $posts['shop_use_card'] ) && $posts['shop_use_card'] == 'true' ) {
                $meta_data['ad']['use_card'] = '적용';
            }


            // 3. 신청인 정보
            //// 사장님 성함(필수) : name
            if ( ! ( isset( $posts['ceo_name'] ) && ! empty( $posts['ceo_name'] ) ) ) {
                return new WP_Error( 'ceo_name_required', '사장님 성함을 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['ceo']['name'] = $this->_esc_attr( $posts['ceo_name'] );
            }

            //// 사장님 휴대폰번호(필수) : phone
            if ( ! ( isset( $posts['ceo_phone'] ) && ! empty( $posts['ceo_phone'] ) ) ) {
                return new WP_Error( 'ceo_phone_required', '사장님 휴대폰번호를 입력해주세요', array( 'status' => 200 ) );
            } elseif ( ! preg_match( '/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/', $posts['ceo_phone'] ) ) {
                return new WP_Error( 'ceo_phone_not_valid', '유효한 사장님 휴대폰번호를 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['ceo']['phone'] = preg_replace( '/(0(?:2|[0-9]{2}))([0-9]+)([0-9]{4}$)/', "$1-$2-$3", $posts['ceo_phone'] );
            }

            // 4. 샵 정보 : shop
            //// 샵사진 : gallery
            if ( isset( $files['shop_gallery'] ) && is_array( $files['shop_gallery'] ) && ! empty( $files['shop_gallery'] ) ) {
                $meta_data['shop']['gallery'] = array();

                foreach ( $files['shop_gallery'] as $file ) {
                    if ( count( $meta_data['shop']['gallery'] ) > $config['file']['shop']['max'] ) {
                        return new WP_Error(
                            'shop_file_max_error',
                            sprintf( '사진은 최대 %d장까지 첨부 가능합니다', $config['file']['shop']['max'] ),
                            array( 'status' => 200 )
                        );
                    }

                    $file_id = $this->_upload_file( $file, $config['file']['shop']['extension'] );

                    if ( ! is_wp_error( $file_id ) ) {
                        $meta_data['shop']['gallery'][] = $file_id;
                    } else {
                        return $file_id;
                    }
                }
            }

            //// 샵 찾아오는 길(필수) : location
            if ( ! ( isset( $posts['shop_location'] ) && ! empty( $posts['shop_location'] ) ) ) {
                return new WP_Error( 'shop_location_required', '샵 찾아오는 길을 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['shop']['location'] = $this->_esc_attr( $posts['shop_location'] );
            }

            //// 샵 주소(필수) : address => array( zipcode, addr, sub )
            if (
                ! ( isset( $posts['shop_address']['zipcode'] ) && ! empty( $posts['shop_address']['zipcode'] ) ) ||
                ! ( isset( $posts['shop_address']['address'] ) && ! empty( $posts['shop_address']['address'] ) )
            ) {
                return new WP_Error( 'shop_address_requied', '샵 주소를 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['shop']['address'] = array(
                    'zipcode'   => $this->_esc_attr( $posts['shop_address']['zipcode'] ),
                    'addr'      => $this->_esc_attr( $posts['shop_address']['address'] ),
                    'sub'       => $this->_esc_attr( $posts['shop_address']['sub'] ),
                );
            }

            //// 샵 지도숨김 여부 : hide_map
            if ( isset( $posts['shop_hide_map'] ) && $posts['shop_hide_map'] == 'true' ) {
                $meta_data['shop']['hide_map'] = '적용';
            }


            //// 최소금액(필수) : price
            if ( ! ( isset( $posts['shop_price'] ) && ! empty( $posts['shop_price'] ) ) ) {
                return new WP_Error( 'shop_price_required', '최소금액을 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['shop']['price'] = $this->_esc_attr( $posts['shop_price'] );
            }


            //// 영업시간(필수) : opening
            if ( ! ( isset( $posts['shop_opening'] ) && ! empty( $posts['shop_opening'] ) ) ) {
                return new WP_Error( 'shop_opening_required', '영업시간을 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['shop']['opening'] = $this->_esc_attr( $posts['shop_opening'] );
            }

            //// 휴무일(필수) : holiday
            if ( ! ( isset( $posts['shop_holiday'] ) && ! empty( $posts['shop_holiday'] ) ) ) {
                return new WP_Error( 'shop_holiday_required', '휴무일을 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['shop']['holiday'] = $this->_esc_attr( $posts['shop_holiday'] );
            }


            // 5. 메뉴 탭 : menu
            //// 안내 및 혜택 : guide
            if ( isset( $posts['menu_guide'] ) && ! empty( $posts['menu_guide'] ) ) {
                $meta_data['menu']['guide'] = $this->_esc_attr( $posts['menu_guide'] );
            }

            //// #우리샵은 이래요 : keywords
            if ( isset( $posts['menu_keywords'] ) && is_array( $posts['menu_keywords'] ) && ! empty( $posts['menu_keywords'] ) ) {
                $meta_data['menu']['keywords'] = implode( PHP_EOL, $this->_esc_attr( $posts['menu_keywords'] ) );
            }

            //// 코스안내(필수) : course
            if ( ! ( isset( $posts['menu_course'] ) && ! empty( $posts['menu_course'] ) ) ) {
                return new WP_Error( 'menu_course_required', '코스안내를 입력해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['menu']['course'] = $this->_esc_attr( $posts['menu_course'] );
            }

            //// 코스안내 사진 : gallery
            if ( isset( $files['menu_gallery'] ) && is_array( $files['menu_gallery'] ) && ! empty( $files['menu_gallery'] ) ) {
                $meta_data['menu']['gallery'] = array();

                foreach ( $files['menu_gallery'] as $file ) {
                    if ( count( $meta_data['menu']['gallery'] ) > $config['file']['menu']['max'] ) {
                        return new WP_Error(
                            'menu_file_max_error',
                            sprintf( '사진은 최대 %d장까지 첨부 가능합니다', $config['file']['menu']['max'] ),
                            array( 'status' => 200 )
                        );
                    }

                    $file_id = $this->_upload_file( $file, $config['file']['menu']['extension'] );

                    if ( ! is_wp_error( $file_id ) ) {
                        $meta_data['menu']['gallery'][] = $file_id;
                    } else {
                        return $file_id;
                    }
                }
            }

            //// 카테고리 선택(필수) : category
            if ( ! ( isset( $posts['menu_category'] ) && is_array( $posts['menu_category'] ) && ! empty( $posts['menu_category'] ) ) ) {
                return new WP_Error( 'menu_category_required', '카테고리를 선택해주세요', array( 'status' => 200 ) );
            } else {
                $terms = get_terms( array( 'taxonomy' => 'shop_categories', 'hide_empty' => false ) );
                $tmp_res = array();

                foreach ( $terms as $item ) {
                    if ( in_array( $item->term_id, $posts['menu_category'] ) ) {
                        $tmp_res[] = $item->name;
                    }
                }


                if ( count( $tmp_res ) !== count( $posts['menu_category'] ) ) {
                    return new WP_Error( 'menu_category_not_valid', '유효한 카테고리를 선택해주세요', array( 'status' => 200 ) );
                } else {
                    $meta_data['menu']['category'] = implode( PHP_EOL, $tmp_res );
                }
            }

            // 5. 정보 탭 : info
            //// 샵 소개 : intro
            if ( isset( $posts['info_intro'] ) && ! empty( $posts['info_intro'] ) ) {
                $meta_data['info']['intro'] = $this->_esc_attr( $posts['info_intro'] );
            }

            //// 관리사님 소개 : member
            if ( isset( $posts['info_member'] ) && ! empty( $posts['info_member'] ) ) {
                $meta_data['info']['member'] = $this->_esc_attr( $posts['info_member'] );
            }

            //// 관리사님 호칭 : manager => array( item )
            if ( isset( $posts['info_manager'] ) && is_array( $posts['info_manager'] ) && ! empty( $posts['info_manager'] ) ) {
                $meta_data['info']['manager'] = implode( PHP_EOL, $this->_esc_attr( $posts['info_manager'] ) );
            }

            //// 상호명 : company
            if ( isset( $posts['info_company'] ) && ! empty( $posts['info_company'] ) ) {
                $meta_data['info']['company'] = $this->_esc_attr( $posts['info_company'] );
            }
            //// 사업자등록번호 : code
            if ( ( isset( $posts['info_code'] ) && ! empty( $posts['info_code'] ) ) ) {
                $meta_data['info']['code'] = $this->_esc_attr( $posts['info_code'] );
            }

            // 6. 후기 탭 : review
            //// 알려드립니다 : notice
            if ( isset( $posts['review_notice'] ) && ! empty( $posts['review_notice'] ) ) {
                $meta_data['review']['notice'] = $this->_esc_attr( $posts['review_notice'] );
            }

            // 약관 동의 : agreement
            //// 개인정보 수집 및 이용 동의(필수) : privacy
            if ( ! ( isset( $posts['agreement_privacy'] ) && $posts['agreement_privacy'] === 'true' ) ) {
                return new WP_Error( 'agreement_privacy_required', '개인정보 수집 및 이용에 동의해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['agreement']['privacy'] = '동의';
            }

            //// 뭉치고 제휴서약서 동의(필수) : pledge
            if ( ! ( isset( $posts['agreement_pledge'] ) && $posts['agreement_pledge'] === 'true' ) ) {
                return new WP_Error( 'agreement_pledge_required', '개인정보 수집 및 이용에 동의해주세요', array( 'status' => 200 ) );
            } else {
                $meta_data['agreement']['pledge'] = '동의';
            }

            //// 마케팅 정보 메일 SMS 수신 동의 : marketing
            if ( isset( $posts['agreement_marketing'] ) && $posts['agreement_marketing'] === 'true' ) {
                $meta_data['agreement']['marketing'] = '동의';
            }

            $post_data = array(
                'post_type'     => $this->_namespace,
                'post_status'   => 'publish',
                'post_author'   => get_current_user_id(),
                'post_title'    => $meta_data['basic']['name'],
                'post_name'     => $this->_get_post_title(),
            );

            $res = wp_insert_post( $post_data );

            if ( ! is_wp_error( $res ) ) {
                $res_fields = update_field( 'partnership_data', $meta_data, $res ) && update_field( 'jt_status', '미등록', $res );

                if ( $res_fields ) {
                    jt_send_kakao( $res, 'PARTNERSHIP' );

                    return new WP_REST_Response( array( 'slug' => $post_data['post_name'] ) );
                } else {
                    wp_delete_post( $res );
                    return new WP_Error( 'error', '등록 중 오류가 발생했습니다', array( 'status' => 200 ) );
                }

                return new WP_REST_Response( $this->_get_post_data( $res ) );
            } else {
                return new WP_Error( 'error', $res->get_error_message(), array( 'status' => 200 ) );
            }
        }
    }


    public function get_config( WP_REST_Request $request ) {
        $config = get_field( 'partnership_config', 'option' );
        $terms = get_terms( 'shop_categories', array( 'hide_empty' => false ) );

        if ( ! empty( $terms ) ) {
            $config['terms'] = array();

            foreach ( $terms as $term ) {
                $tmp = get_field( 'shop_category_info', 'term_' . $term->term_id );

                $config['terms'][] = array(
                    'id'    => $term->term_id,
                    'name'  => $term->name,
                    'class' => $tmp['class'],
                    'image' => ( intVal( $tmp['image'] ) > 0 ? wp_get_attachment_image_url( $tmp['image'], 'full' ) : false ),
                );
            }
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

        $cnt = $wpdb->get_var( $wpdb->prepare(
            " SELECT COUNT( * ) FROM {$wpdb->posts} WHERE post_type = %s AND post_date BETWEEN %s AND %s ",
            $this->_namespace,
            date_i18n( 'Y-m-d' ) . ' 00:00:00',
            date_i18n( 'Y-m-d' ) . ' 23:59:59'
        ) );

        return sprintf( '%s%03d', date_i18n( 'Ymd' ), $cnt + 1 );
    }
}
