<?php
/*
 * Name       : REVIEW
 * namespace  : review
 * File       : /modules/review/index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) REVIEW 프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */

/**
 * REVIEW 프로그램 실행
 */
$jt_review = new Jt_review();

/**
 * Jt_notice Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_review {

    private $_table;
    private $_namespace;
    private $_base_url;

    public function __construct() {
        global $wpdb;

        $this->_table = $wpdb->prefix . 'jt_review';
        $this->_namespace = 'review';
        $this->_base_url = JT_REST_BASE;
        $this->_create_table();

        add_action( 'admin_menu', array( $this, 'admin_menu' ) );
        add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );

        add_action( 'wp_ajax_review_admin_action', array( $this, 'admin_action' ) );
    }


    public function admin_menu() {
        add_menu_page(
            '후기관리',
            '후기관리',
            'edit_posts',
            'jt-review',
            array( $this, 'admin_list' ),
        );
    }


    public function admin_list() {
        include TEMPLATEPATH . '/modules/review/admin.php';
    }


    public function rest_api_init() {
        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/author',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_author' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/list',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_list' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/can',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'can_item' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/exists/(?P<id>[\d]+)',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'check_exists' ),
                    'permission_callback'   => '__return_true',
                ),
            ),
        );

        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/get/(?P<id>[\d]+)',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_item' ),
                    'permission_callback'   => '__return_true',
                ),
            ),
        );

        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/add',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'add_item' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/update/(?P<id>[\d]+)',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'update_item' ),
                    'permission_callback'   => '__return_true',
                ),
            ),
        );

        register_rest_route(
            $this->_base_url,
            '/modules/' . $this->_namespace . '/delete/(?P<id>[\d]+)',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'delete_item' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );
    }

    public function get_author( WP_REST_Request $request ) {
        global $wpdb;

        $user_id = intVal( $request->get_param( 'author' ) );
        $user = $this->_get_author( $user_id );

        if ( $user_id && $user ) {
            $result = array(
                'user_id'   => $user->ID,
                'avatar'    => $user->avatar,
                'email'     => $user->user_email,
                'nickname'  => $user->display_name,
            );

            return new WP_REST_Response( $result );
        }

        return new WP_Error( 'error', '해당 유저 정보를 찾을 수 없습니다', array( 'status' => 200 ) );
    }


    public function get_list( WP_REST_Request $request ) {
        global $wpdb;

        $shop_id = intVal( $request->get_param( 'shop_id' ) );
        $user_id = intVal( $request->get_param( 'author' ) );
        $filter = ( is_array( $request->get_param( 'filter' ) ) ? $request->get_param( 'filter' ) : array() );
        $order = $request->get_param( 'order' );
        $current_user = get_current_user_id();

        $paged = max( intVal( $request->get_param( 'paged' ) ), 1 );
        $rpp = intVal( intVal( $request->get_param( 'rpp' ) ) > 0 ? $request->get_param( 'rpp' ) : get_option( 'posts_per_page' ) );
        $start = ( ( $paged - 1 ) * $rpp );

        $result = array( 'total_posts' => 0, 'total_pages' => 0, 'posts' => array(), );

        $where = "";

        if ( $shop_id > 0 ) {
            $where .= $wpdb->prepare( " AND {$this->_table}.post_id = %d ", $shop_id );
        } elseif ( $user_id > 0 ) {
            $where .= $wpdb->prepare( " AND {$this->_table}.user_id = %d ", $user_id );
        } else {
            $where .= " AND 1=0 ";
        }

        if ( $current_user ) {
            $where .= $wpdb->prepare(
                " AND ( ( {$this->_table}.user_id = %d AND {$this->_table}.status IN ( 'B', 'N' ) ) OR {$this->_table}.status IN ( 'Y' ) ) ",
                $current_user
            );
        } else {
            $where .= " AND {$this->_table}.status IN ( 'Y' ) ";
        }

        if ( in_array( 'photo', $filter ) ) {
            $where .= " AND {$this->_table}.file IS NOT NULL AND LENGTH( {$this->_table}.file ) > 0 ";
        }

        $orderby = " created DESC ";

        if ( $order == 'rankup' ) {
            $orderby = " score DESC, created DESC ";
        } elseif ( $order == 'rankdown' ) {
            $orderby = " score ASC, created DESC ";
        }

        $sql = " SELECT SQL_CALC_FOUND_ROWS {$this->_table}.uid
                FROM {$this->_table}
                    INNER JOIN {$wpdb->users} ON 1=1 AND {$wpdb->users}.ID = {$this->_table}.user_id
                    INNER JOIN {$wpdb->posts} ON 1=1 AND {$wpdb->posts}.ID = {$this->_table}.post_id AND {$wpdb->posts}.post_status = 'publish'
                WHERE 1=1
                    AND {$this->_table}.revision = 0
                    {$where}
                ORDER BY {$orderby}
                LIMIT {$start}, {$rpp} ";
        $res = $wpdb->get_results( $sql, ARRAY_A );
        $founds = intVal( $wpdb->get_var( " SELECT FOUND_ROWS() " ) );

        if ( ! empty( $res ) && $founds > 0 ) {
            foreach ( $res as $item ) {
                $posts[] = $this->_get_item( $item['uid'] );
            }

            $result = array(
                'total_posts'   => $founds,
                'total_pages'   => ceil( $founds / $rpp ),
                'total_wait'    => 0,
                'posts'         => $posts,
            );

            if ( $current_user ) {
                $result['total_wait'] = intVal( $wpdb->get_var( $wpdb->prepare(
                    "   SELECT COUNT(*) FROM (
                            SELECT {$this->_table}.*
                            FROM {$this->_table}
                                INNER JOIN {$wpdb->users} ON 1=1
                                    AND {$wpdb->users}.ID = {$this->_table}.user_id
                            WHERE 1=1
                                AND {$this->_table}.revision = 0
                                {$where}
                        ) AS t
                        WHERE t.status IN ( 'B', 'N' )
                    ",
                    $user_id
                ) ) );
            }



            if ( $result['total_pages'] > 1 ) {
                $base_url = add_query_arg(
                    urlencode_deep( $request->get_query_params() ),
                    rest_url( sprintf( '%s/modules/%s', $this->_base_url, $this->_namespace ) )
                );
                $result['pagination'] = array( 'current' => $base_url );

                if ( $paged > 1 ) {
                    $result['pagination']['prev'] = add_query_arg( 'paged', ( $paged - 1 > 1 ? $paged - 1 : 1 ), $base_url );
                }

                if ( $result['total_pages'] > $paged + 1 ) {
                    $result['pagination']['next'] = add_query_arg( 'paged', ( $paged + 1 > $result['total_pages'] ? $result['total_pages'] : $paged + 1 ), $base_url );
                }
            }
        }

        // $result['sql'] = $sql;
        return new WP_REST_Response( $result, 200 );
    }


    public function can_item( WP_REST_Request $request ) {
        global $wpdb;

        $shop_id = 0;
        $user_id = get_current_user_id();

        if ( $request->get_param( 'shop_id' ) ) {
            $shop_id = intVal( $request->get_param( 'shop_id' ) );
        }

        if ( $request->get_param( 'shop' ) ) {
            $shop_id = $this->_get_shop_id_from_slug( $request->get_param( 'shop' ) );
        }

        // 하루 3개 체크
        $cnt_all = $wpdb->get_var( $wpdb->prepare(
            " SELECT COUNT(*) FROM {$this->_table} WHERE user_id = %d AND 0 = TIMESTAMPDIFF( DAY, created, %s ) ",
            $user_id,
            date_i18n( 'Y-m-d H:i:s' )
        ) );

        // 하루에 한개의 샵 체크
        $cnt_shop = $wpdb->get_var( $wpdb->prepare(
            " SELECT COUNT(*) FROM {$this->_table} WHERE user_id = %d AND post_id = %d AND  0 = TIMESTAMPDIFF( DAY, created, %s ) ",
            $user_id,
            $shop_id,
            date_i18n( 'Y-m-d H:i:s' )
        ) );

        if ( $cnt_all < 3 && $cnt_shop == 0 ) {
            return new WP_REST_Response( array( 'success' => true ) );
        } else {
            return new WP_Error( 'error', '후기작성은 샵마다 1개씩,' . PHP_EOL . '24시간 이내 3개까지 가능합니다', array( 'status' => 200 ) );
        }
    }


    public function check_exists( WP_REST_Request $request ) {
        global $wpdb;

        $review_id = intVal( $request->get_param( 'id' ) );
        $uid = $wpdb->get_var( $wpdb->prepare( " SELECT uid FROM {$this->_table} WHERE uid = %d ", $review_id ) );

        return new WP_REST_Response( array( 'result' => $review_id == $uid , 'data' => $this->_get_item( $uid ) ) );
    }


    public function get_item( WP_REST_Request $request ) {
        global $wpdb;

        $review_id = intVal( $request->get_param( 'id' ) );
        $user_id = get_current_user_id();
        $uid = $wpdb->get_row( $wpdb->prepare( " SELECT uid FROM {$this->_table} WHERE uid = %d AND user_id = %d ", $review_id, $user_id ), ARRAY_A );

        if ( ! empty( $uid ) ) {
            $post = $this->_get_item( $uid );

            if ( $post['can_modify'] ) {
                return new WP_REST_Response( $post );
            } else {
                return new WP_Error( 'error', '해당 후기는 수정이 불가능합니다', array( 'status' => 200 ) );
            }
        }

        return new WP_Error( 'error', '해당 후기를 찾을 수 없습니다', array( 'status' => 200 ) );
    }


    public function add_item( WP_REST_Request $request ) {
        global $wpdb;

        $shop_id = $this->_get_shop_id_from_slug( $request->get_param( 'shop' ) );
        $user_id = get_current_user_id();

        $valid = $this->_validate( $request );

        if ( $valid !== true ) {
            return $valid;
        }

        $inputs = array(
            'post_id'   => $shop_id,
            'user_id'   => $user_id,
            'is_owner'  => ( JT_Member::is_owner( $user_id ) ? 'Y' : 'N' ),
            'status'    => 'N',
            'content'   => ( esc_attr( $request->get_param( 'content' ) ) ),
            'score'     => intVal( $request->get_param( 'score' ) ),
            'revision'  => 0,
            'created'   => date_i18n( 'Y-m-d H:i:s' ),
        );

        $files = $this->_get_files( $request );
        if ( isset( $files['files'] ) && ! empty( $files['files'] ) ) {
            $inputs['file'] = $this->_upload_file( $files['files'][0] );
            $inputs['thumbnail'] = $this->_get_thumbnail( $inputs['file'] );
        }

        $res = $wpdb->insert( $this->_table, $inputs );

        if ( $res !== false ) {
            return new WP_REST_Response( array( 'success' => true, 'message' => '소중한 후기 감사합니다' . PHP_EOL . '작성하신 후기는 확인 후 공개됩니다' ) );
        }

        return new WP_Error( 'error', '후기 등록 중 오류가 발생했습니다', array( 'status' => 500 ) );
    }


    public function update_item( WP_REST_Request $request ) {
        global $wpdb;

        $review_id = intVal( $request->get_param( 'id' ) );
        $user_id = get_current_user_id();

        $valid = $this->_validate( $request );

        if ( $valid !== true ) {
            return $valid;
        }

        $data['score'] = intVal( $request->get_param( 'score' ) );
        $data['content'] = $request->get_param( 'content' );
        $data['updated'] = date_i18n( 'Y-m-d H:i:s' );

        if ( ! $request->get_param( 'files' ) ) {
            $data['file'] = '';
        }

        $files = $this->_get_files( $request );
        if ( ! empty( $files ) ) {
            $data['file'] = $this->_upload_file( $files['files'][0] );
            $data['thumbnail'] = $this->_get_thumbnail( $data['file'] );
        }

        $res = $wpdb->update( $this->_table, $data, array( 'uid' => $review_id, 'user_id' => $user_id ) );

        if ( $res ) {
            return new WP_REST_Response( array( 'success' => true, 'message' => '후기수정을 완료했습니다' ) );
        }

        return new WP_Error( 'error', '후기수정 중 오류가 발생했습니다', array( 'status' => 200 ) );
    }


    public function delete_item( WP_REST_Request $request ) {
        global $wpdb;

        $review_id = intVal( $request->get_param( 'id' ) );
        $user_id = get_current_user_id();

        $exists = ( $wpdb->get_var( $wpdb->prepare( " SELECT COUNT(*) FROM {$this->_table} WHERE uid = %d AND user_id = %d ", $review_id, $user_id ) ) > 0 );

        if ( $exists ) {
            $res = $wpdb->update( $this->_table, array( 'status' => 'D' ), array( 'uid' => $review_id, 'user_id' => $user_id ) );

            if ( $res !== false ) {
                return new WP_REST_Response( array( 'success' =>  true, 'message' => '후기삭제를 완료했습니다' ) );
            } else {
                return new WP_Error( 'error', '후기 삭제 중 오류가 발생했습니다', array( 'status' => 200 ) );
            }
        } else {
            return new WP_Error( 'error', '해당 후기를 찾을 수 없습니다', array( 'status' => 200 ) );
        }
    }


    public function admin_action() {
        if ( isset( $_POST[ 'uid' ] ) && intVal( $_POST[ 'uid' ] ) > 0 ) {
            global $wpdb;

            $uid    = intVal( $_POST[ 'uid' ] );
            $data   = array();

            if ( isset( $_POST[ 'status' ] ) ) {
                if ( $_POST[ 'status' ] == 'Y' ) {
                    $data[ 'status' ]   = 'Y';
                    $data[ 'allowed' ]  = date_i18n( 'Y-m-d H:i:s' );
                } elseif ( $_POST[ 'status' ] == 'D' ) {
                    $data[ 'status' ]   = 'D';
                } elseif ( $_POST[ 'status' ] == 'B' ) {
                    $data[ 'status' ]   = 'B';
                } elseif ( $_POST[ 'status' ] == 'N' ) {
                    $data[ 'status' ]   = 'N';
                    $data[ 'allowed' ]  = null;
                }
            }

            if ( $data ) {
                $res = $wpdb->update( $this->_table, $data, array( 'uid' => $uid ) );

                if ( $res ) {
                    wp_send_json_success();
                } else {
                    wp_send_json_error();
                }
                exit;
            }
        }

        wp_send_json_error( '잘못된 접근입니다' );
        exit;
    }

    private function _get_author( $user_id = 0 ) {
        $userdata = get_userdata( $user_id );

        if ( ! $userdata ) {
            global $wpdb;

            $userdata = $wpdb->get_row( $wpdb->prepare(
                "   SELECT a.*, IFNULL( b.meta_value, 1 ) AS 'avatar'
                    FROM {$wpdb->prefix}withdraw AS a
                        LEFT JOIN {$wpdb->prefix}withdraw_meta AS b ON b.user_id = a.ID AND b.meta_key = 'member_data_avatar'
                    WHERE 1=1
                        AND a.ID = %d
                ",
                $user_id
            ) );
        } else {
            $userdata->avatar = ( get_field( 'member_data_avatar', 'user_' . $user_id ) ?: 1 );
        }

        return $userdata;
    }


    private function _get_item( $review_id = 0 ) {
        global $wpdb;

        if ( $review_id ) {
            $review = $wpdb->get_row( $wpdb->prepare(
                "   SELECT {$this->_table}.*, IFNULL( {$wpdb->usermeta}.meta_value, 1 ) AS 'avatar'
                    FROM {$this->_table}
                        INNER JOIN {$wpdb->usermeta} ON 1=1
                            AND {$wpdb->usermeta}.user_id = {$this->_table}.user_id
                            AND {$wpdb->usermeta}.meta_key = 'member_data_avatar'
                    WHERE 1=1
                        AND {$this->_table}.uid = %d
                ",
                $review_id
            ), ARRAY_A );

            if ( ! empty( $review ) ) {
                $userdata = $this->_get_author( $review['user_id'] );
                $tmp_post = get_post( $review['post_id'] );
                $result = array(
                    'id'            => $review['uid'],
                    'shop'          => array(
                                        'id'    => $review['post_id'],
                                        'title' => htmlspecialchars_decode( $tmp_post->post_title ),
                                        'slug'  => $tmp_post->post_name,
                                    ),
                    'author'        => array(
                                        'avatar'    => $userdata->avatar,
                                        'nickname'  => $userdata->display_name,
                                        'email'     => $userdata->user_email,
                                        'user_id'   => $userdata->ID,
                                    ),
                    'score'         => $review['score'],
                    'status'        => $review['status'],
                    'content'       => preg_replace( '"(\r?\n){3,}"', PHP_EOL . PHP_EOL, $review['content'] ),
                    'files'         => ( $review['file'] ? array( array(
                                            'path'  => home_url() . $review['file'],
                                            'type'  => wp_get_image_mime( ABSPATH . $review['file'] ),
                                            'name'  => pathinfo( $review['file'] )['basename'],
                                        ) ) :
                                        array()
                                    ),
                    'thumbnail'     => ( $review['thumbnail'] ? array( array(
                                            'path'  => home_url() . $review['thumbnail'],
                                            'type'  => wp_get_image_mime( ABSPATH . $review['thumbnail'] ),
                                            'name'  => pathinfo( $review['thumbnail'] )['basename'],
                                        ) ) :
                                        array()
                                    ),
                    'date'          => $review['created'],
                    'date_diff'     => $this->_time_diff( $review['created'] ),
                    'can_modify'    => (
                                        $review['status'] == 'N' &&
                                        abs( strtotime( $review['created'] ) - strtotime( date_i18n( 'Y-m-d H:i:s' ) ) ) < ( 60 * 60 * 48 )
                                    ),
                );

                return $result;
            }
        }

        return null;
    }


    protected function _upload_file( $file ) {
        try {
            $wp_upload = wp_upload_dir();
            $path_info = pathinfo( $file['name'] );
            $new_path = $wp_upload['path'] . '/' . $file['name'];
            $new_mime = mime_content_type( $file['tmp_name'] );
            $extension = strtolower( isset( $path_info['extension'] ) ? $path_info['extension'] : '' );
            $new_name = str_replace( home_url(), '', $wp_upload['url'] ) . '/' . $path_info['filename'] . '.' . $extension;
            $file_cnt = 0;

            if ( in_array( $extension, array( 'jpg', 'png', 'jpeg', 'gif' ) ) ) {
                while ( file_exists( $new_path ) ) {
                    $file_cnt++;
                    $new_name = sprintf( '%s/%s-%d.%s', str_replace( home_url(), '', $wp_upload['url'] ), $path_info['filename'], $file_cnt, $extension );
                    $new_path = sprintf( '%s/%s-%d.%s', $wp_upload['path'], $path_info['filename'], $file_cnt, $extension );
                }

                if ( move_uploaded_file( $file['tmp_name'], $new_path ) ) {
                    return str_replace( '/cmsadmin', '', $new_name );
                }
            } else {
                return new WP_Error( 'image_not_valid', '첨부할 수 없는 확장자입니다', array( 'status' => 200 ) );
            }
        } catch ( Exception $e ) { }

        return new WP_Error( 'error', '사진을 올리는 중 오류가 발생했습니다', array( 'status' => 200 ) );
    }

    protected function _get_thumbnail( $file = '' ) {
        if ( $file && file_exists( ABSPATH . $file ) ) {
            $file = ABSPATH . $file;
            $path_info = pathinfo( $file );
            $new_name = str_replace( $path_info['basename'], 'thumbnail-' . $path_info['filename'] . '.' . $path_info['extension'], $path_info['dirname'] . '/' . $path_info['basename'] );
            $resize_image = wp_get_image_editor( $path_info['dirname'] . '/' . $path_info['basename'] );

            if ( ! is_wp_error( $resize_image ) ) {
                $resize_image->set_quality( 100 );
                $resize_image->maybe_exif_rotate();
                $resize_image->resize( 808, 404, array( 'center', 'center' ) );
                $resize_image->save( $new_name );

                return str_replace( '/cmsadmin', '', str_replace( ABSPATH, '', $new_name ) );
            }
        }

        return $file;
    }

    private function _create_table() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $sql = " CREATE TABLE IF NOT EXISTS `{$this->_table}` (
            `uid` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            `post_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '샵 ID',
            `parent_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '댓글 부모 ID',
            `user_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '사용자 ID',
            `status` ENUM('Y','N','D','B') NOT NULL DEFAULT 'N' COMMENT '상태(Y:승인완료,N:미승인,B:Blocked,D:삭제)' COLLATE 'utf8_general_ci',
            `content` TEXT NOT NULL COMMENT '내용' COLLATE 'utf8_general_ci',
            `file` VARCHAR(255) NULL DEFAULT '' COMMENT '파일첨부' COLLATE 'utf8_general_ci',
            `score` TINYINT(3) UNSIGNED NOT NULL COMMENT '별점',
            `revision` BIGINT(20) UNSIGNED NOT NULL COMMENT '리비전ID',
            `created` DATETIME NOT NULL COMMENT '작성일',
            `updated` DATETIME NULL DEFAULT NULL COMMENT '수정일',
            `allowed` DATETIME NULL DEFAULT NULL COMMENT '승인일',
            PRIMARY KEY (`uid`) USING BTREE,
            INDEX `post_id` (`post_id`) USING BTREE,
            INDEX `parent_id` (`parent_id`) USING BTREE,
            INDEX `user_id` (`user_id`) USING BTREE,
            INDEX `revision` (`revision`) USING BTREE,
            INDEX `status` (`status`) USING BTREE
        )
        COMMENT='샵 리뷰 정보'
        {$charset_collate}
        ; ";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }


    private function _time_diff( $from, $to = '' ) {
        $from   = is_int( $from ) ? $from : strtotime( date( 'Y-m-d 00:00:00', strtotime( $from ) ) );
        $to     = ( $to ?: strtotime( date_i18n( 'Y-m-d H:i:s' ) ) );
        $diff   = abs( $from - $to );
        $res    = array();

        $arr_separators = array(
            'year'      => 60 * 60 * 24 * 365,
            'month'     => 60 * 60 * 24 * 30,
            'week'      => 60 * 60 * 24 * 7,
            'day'       => 60 * 60 * 24,
            'hour'      => 60 * 60,
            'minute'    => 60,
            'second'    => 1,
        );

        foreach ( $arr_separators as $key => $val ) {
            if ( $diff / $val > 1 ) {
                $res[ $key ] = floor( $diff / $val ); // sprintf( '%d %s', floor( $diff / $val ), $key );

                if ( $key != 'second' ) {
                    $diff = $diff % $val;
                }
            }
        }

        if ( isset( $res[ 'year' ] ) && $res[ 'year' ] > 2 ) {
            return $res[ 'year' ] . '년전';
        }

        if ( isset( $res[ 'year' ] ) && $res[ 'year' ] == 2 ) {
            return '재작년';
        }

        if ( ( isset( $res[ 'year' ] ) && $res[ 'year' ] > 0 ) || ( isset( $res[ 'month' ] ) && $res[ 'month' ] > 11 ) ) {
            return '작년';
        }

        if ( isset( $res[ 'month' ] ) && $res[ 'month' ] > 1 ) {
            return $res[ 'month'] . '개월 전';
        }

        if ( isset( $res[ 'month' ] ) && $res[ 'month' ] == 1 ) {
            return '지난 달';
        }

        if ( isset( $res[ 'week' ] ) && $res[ 'week' ] > 1 ) {
            return '이번 달';
        }

        if ( isset( $res[ 'week' ] ) && $res[ 'week' ] == 1 ) {
            return '저번 주';
        }

        if ( isset( $res[ 'day' ] ) && $res[ 'day' ] > 2 ) {
            return '이번 주';
        }

        if ( isset( $res[ 'day' ] ) && $res[ 'day' ] == 2 ) {
            return '그제';
        }

        if ( isset( $res[ 'day' ] ) && $res[ 'day' ] == 1 ) {
            return '어제';
        }

        return '오늘';
    }


    private function _get_user_id_by_nickname( $nickname ) {
        global $wpdb;

        $res = $wpdb->get_var( $wpdb->prepare(
            " SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = 'nickname' AND meta_value = %s LIMIT 1 ",
            esc_attr( $nickname )
        ) );

        return intVal( $res );
    }


    private function _get_shop_id_from_slug( $slug ) {
        $find = get_page_by_path( esc_attr( $slug ), OBJECT, 'shop' );

        if ( $find ) {
            return $find->ID;
        }

        return 0;
    }


    private function _get_files( $request ) {
        $r_files = $request->get_file_params();
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


    private function _validate( $request ) {
        global $wpdb;

        $review_id = intVal( $request->get_param( 'id' ) );
        $shop_id = $this->_get_shop_id_from_slug( $request->get_param( 'shop' ) );
        $user_id = get_current_user_id();

        if ( $review_id > 0 ) {
            $exists = ( $wpdb->get_var( $wpdb->prepare( " SELECT COUNT(*) FROM {$this->_table} WHERE uid = %d AND user_id = %d ", $review_id, $user_id ) ) > 0 );

            if ( ! $exists ) {
                return new WP_Error( 'error', '후기수정 권한이 없습니다', array( 'status' => 200 ) );
            }
        }

        if ( ! $shop_id ) {
            return new WP_Error( 'error', '해당 샵을 찾을 수 없습니다', array( 'status' => 200 ) );
        }

        if ( ! $user_id ) {
            return new WP_Error( 'error', '로그인이 필요한 서비스입니다', array( 'status' => 200 ) );
        }

        if ( ! $review_id ) {
            // 하루 3개 체크
            $cnt_all = $wpdb->get_var( $wpdb->prepare(
                " SELECT COUNT(*) FROM {$this->_table} WHERE status <> 'D' AND user_id = %d AND 0 = TIMESTAMPDIFF( DAY, created, %s ) ",
                $user_id,
                date_i18n( 'Y-m-d H:i:s' )
            ) );

            // 하루에 한개의 샵 체크
            $cnt_shop = $wpdb->get_var( $wpdb->prepare(
                " SELECT COUNT(*) FROM {$this->_table} WHERE status <> 'D' AND user_id = %d AND post_id = %d AND 0 = TIMESTAMPDIFF( DAY, created, %s ) ",
                $user_id,
                $shop_id,
                date_i18n( 'Y-m-d H:i:s' )
            ) );

            if ( $cnt_all >= 3 || $cnt_shop > 0 ) {
                return new WP_Error( 'error', '후기작성은 샵마다 한 개씩,' . PHP_EOL . '하루 최대 3개까지만 작성 가능합니다', array( 'status' => 200 ) );
            }
        }

        if ( ! intVal( $request->get_param( 'score' ) ) ) {
            return new WP_Error( 'error', '별점을 선택해주세요', array( 'status' => 200 ) );
        }

        if ( mb_strlen( trim( preg_replace( '/\s\s+/', ' ', $request->get_param( 'content' ) ) ) ) < 20 ) {
            return new WP_Error( 'error', '후기는 최소 20자 이상 작성해주세요', array( 'status' => 200 ) );
        }

        if ( mb_strlen( trim( preg_replace( '/\s\s+/', ' ', $request->get_param( 'content' ) ) ) ) > 400 ) {
            return new WP_Error( 'error', '후기는 최대 400자 이하 작성해주세요', array( 'status' => 200 ) );
        }

        $files = $this->_get_files( $request );
        if ( isset( $files['files'] ) && ! empty( $files['files'] ) ) {
            if ( count( $files['files'] ) > 1 ) {
                return new WP_Error( 'error', '파일은 1개만 등록 가능합니다', array( 'status' => 200 ) );
            }

            $file = $files['files'][0];
            $path_info = pathinfo( $file['name'] );

            if ( ! in_array( strtolower( $path_info['extension'] ), array( 'jpg', 'gif', 'png', 'jpeg' ) ) || $file['size'] > ( 15 * 1024 * 1024 ) ) {
                return new WP_Error( 'error', '15MB 이하, JPG, PNG, GIF 형식의 파일만 등록 가능합니다', array( 'status' => 200 ) );
            }
        }

        return true;
    }
}