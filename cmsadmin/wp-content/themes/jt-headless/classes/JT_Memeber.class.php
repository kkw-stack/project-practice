<?php
$jt_member = new JT_Member();

class JT_Member {
    public static function is_owner( $user_id = 0 ) {
        $shop_ids = get_posts( array(
            'post_type'         => 'shop',
            'post_status'       => array( 'publish', 'pending', 'private' ),
            'posts_per_page'    => -1,
            'paged'             => 1,
            'meta_key'          => 'shop_user',
            'meta_value'        => $user_id ?: get_current_user_id(),
            'fields'            => 'ids',
        ) );

        return ! empty( $shop_ids );
    }

    public function __construct() {
        add_filter( 'editable_roles', array( $this, 'editable_roles' ) );

        add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );

        add_action( 'set_logged_in_cookie', array( $this, 'set_logged_in_cookie' ), PHP_INT_MAX );
        add_action( 'clear_auth_cookie', array( $this, 'clear_auth_cookie' ), PHP_INT_MAX );
        add_filter( 'rest_post_dispatch', array( $this, 'rest_post_dispatch' ), PHP_INT_MAX, 3 );

        add_filter( 'author_link', array( $this, 'author_link' ), 10, 3 );

        add_action( 'delete_user', array( $this, 'delete_user' ) );

        add_action( 'pre_user_query', array( $this, 'pre_user_query' ) );

        add_filter( 'manage_users_columns', array( $this, 'manage_users_columns' ) );
        add_filter( 'manage_users_custom_column', array( $this, 'manage_users_custom_column' ), 10, 3 );
        add_filter( 'manage_users_sortable_columns', array( $this, 'manage_users_sortable_columns' ) );

        add_action( 'show_user_profile', array( $this, 'admin_profile' ) );
        add_action( 'edit_user_profile', array( $this, 'admin_profile' ) );

        add_filter( 'acf/load_field/key=field_60f64f7a2c30b', array( $this, 'avatar_image_render' ) );
    }


    public function avatar_image_render( $field ) {
        $field['choices'][1] = sprintf( '<img src="%s" />', get_stylesheet_directory_uri() . ( '/images/avatars/character-01.png' ) );
        $field['choices'][2] = sprintf( '<img src="%s" />', get_stylesheet_directory_uri() . ( '/images/avatars/character-02.png' ) );
        $field['choices'][3] = sprintf( '<img src="%s" />', get_stylesheet_directory_uri() . ( '/images/avatars/character-03.png' ) );

        return $field;
    }

    public function editable_roles( $roles ) {
        $newSort = array(
            'administrator',
            'editor',
            'author',
            'contributor',
            'subscriber',
        );
        $newRoles = array();

        foreach ( $newSort as $item ) {
            $newRoles[ $item ] = $roles[ $item ];
        }

        return $newRoles;
    }


    public function pre_user_query( $query ) {
        global $wpdb;

        if ( isset( $_REQUEST['s'] ) && ! empty( $_REQUEST['s'] ) ) {
            $search = '%' . str_replace( ' ', '%', esc_attr( $_REQUEST['s'] ) ) . '%';

            $tmp_where = '';
            $tmp_where .= $wpdb->prepare( " display_name LIKE %s ", $search ); // 닉네임
            $tmp_where .= $wpdb->prepare( " OR user_email LIKE %s ", $search ); // 이메일
            $tmp_where .= $wpdb->prepare( " OR ID IN ( SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = 'member_data_phone' AND meta_value LIKE %s ) ", $search ); // 연락처

            $query->query_where = str_replace( 'WHERE 1=1 AND (', 'WHERE 1=1 AND (' . $tmp_where . ' OR ', $query->query_where );
        }

        if ( ( ! isset( $_REQUEST['orderby'] ) || empty( $_REQUEST['orderby'] ) ) && ( ! isset( $_REQUEST['order'] ) || empty( $_REQUEST['order'] ) ) ) {
            $query->query_orderby = " ORDER BY user_registered DESC, user_login ASC ";
        }

        if ( isset( $_REQUEST['orderby'] ) ) {
            $newOrder = '';
            $order = ( isset( $_REQUEST['order'] ) && strtolower( $_REQUEST['order'] ) === 'desc' ? 'DESC' : 'ASC' );

            if ( $_REQUEST['orderby'] === 'jt_shop' ) {
                $newOrder = " (
                    SELECT COUNT( DISTINCT ID )
                    FROM {$wpdb->posts}
                        INNER JOIN {$wpdb->postmeta} ON {$wpdb->postmeta}.post_id = {$wpdb->posts}.ID AND {$wpdb->postmeta}.meta_key = 'shop_user'
                    WHERE
                        {$wpdb->posts}.post_type = 'shop'
                        AND {$wpdb->posts}.post_status IN ( 'publish', 'pending' )
                        AND {$wpdb->postmeta}.meta_value = {$wpdb->users}.ID
                ) {$order}, ";
            } elseif ( $_REQUEST['orderby'] === 'jt_review' ) {
                $newOrder = " (
                    SELECT COUNT(*) FROM {$wpdb->prefix}jt_review WHERE user_id = {$wpdb->users}.ID AND status <> 'D' AND revision = 0
                ) {$order}, ";
            }

            $query->query_orderby = " ORDER BY {$newOrder} user_login {$order} ";
        }
    }


    public function manage_users_columns( $columns ) {
        /*
        cb: "<input type=\"checkbox\" />"
        email: "이메일"
        name: "이름"
        posts: "글"
        role: "역할"
        */

        $newColumns = array();
        foreach ( $columns as $key => $val ) {
            if ( $key === 'name' ) {
                $newColumns[ $key ] = '닉네임';
                $newColumns['phone'] = '연락처';
            } else if ( ! in_array( $key , array( 'posts' ) ) ) {
                $newColumns[ $key ] = $val;
            }
        }

        $newColumns['shop'] = '보유 샵';
        $newColumns['review'] = '작성 후기';

        return $newColumns;
    }


    public function manage_users_sortable_columns( $columns ) {
        $columns['shop'] = 'jt_shop';
        $columns['review'] = 'jt_review';

        return $columns;
    }

    function manage_users_custom_column( $val, $column_name, $user_id ) {
        global $wpdb;

        if ( $column_name === 'phone' ) {
            $val = get_field( 'member_data_phone', 'user_' . $user_id );
        } else if ( $column_name === 'shop' ) {
            $shops = new WP_Query( array(
                'posts_per_page'    => 1,
                'post_type'         => 'shop',
                'post_status'       => array( 'publish', 'pending' ),
                'meta_key'          => 'shop_user',
                'meta_value'        => $user_id,
                'fields'            => 'ids',
            ) );
            $val = sprintf( '<a href="%s" target="_blank" rel="noopener noreferrer">%d</a>', add_query_arg( array( 'jt_author' => $user_id ), admin_url( 'edit.php?post_type=shop' ) ), $shops->found_posts );
        } else if ( $column_name === 'review' ) {
            $cnt = $wpdb->get_var( $wpdb->prepare( " SELECT COUNT(*) FROM {$wpdb->prefix}jt_review WHERE user_id = %d AND status <> 'D' AND revision = 0 ", $user_id ) );
            $val = sprintf( '<a href="%s" target="_blank" rel="noopener noreferrer">%d</a>', add_query_arg( array( 'jt_author' => $user_id, 'jt_status' => 'ALL' ), admin_url( 'admin.php?page=jt-review' ) ), $cnt );
        }
        return $val;
    }


    public function admin_profile( $user ) {
        global $wpdb;

        $user_id = $user->ID;
        $shops = get_posts( array(
            'posts_per_page'    => -1,
            'post_type'         => 'shop',
            'post_status'       => array( 'publish', 'pending' ),
            'meta_key'          => 'shop_user',
            'meta_value'        => $user_id,
            'fields'            => 'ids',
        ) );

        ?>
        <?php if ( ! empty( $shops ) ) : ?>
            <h3>샵주 매칭</h3>
            <table class="form-table" role="presentation">
                <tbody>
                    <?php foreach ( $shops as $shop_id ) : ?>
                        <tr class="user-description-wrap">
                            <th>샵 이름</th>
                            <td>
                                <a href="<?php echo get_edit_post_link( $shop_id ); ?>" target="_blank" rel="noopener noreferrer">
                                    <?php echo get_the_title( $shop_id ); ?>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
        <?php

    }



    public function author_link( $link, $author_id, $author_nicename ) {
        return "/사용자-후기-모아보기/{$author_id}";
    }

    public function set_logged_in_cookie( $logged_in_cookie ) {
        $_COOKIE[ LOGGED_IN_COOKIE ] = $logged_in_cookie;
    }

    public function rest_post_dispatch( WP_REST_Response $response, WP_REST_Server $rest, WP_REST_Request $request ) {
        if ( is_user_logged_in() ) {
            $response->header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
        }

        return $response;
    }

    public function clear_auth_cookie() {
        $_COOKIE[ LOGGED_IN_COOKIE ] = '';
    }


    public function rest_api_init() {
        register_rest_route(
            JT_REST_BASE,
            '/member/user',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_user' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/member/login/kakao',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'login_kakao' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/member/regist/kakao',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'regist_kakao' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/member/profile',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'update_profile' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/member/logout',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'logout' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/member/withdraw',
            array(
                array(
                    'methods'               => WP_REST_Server::ALLMETHODS,
                    'callback'              => array( $this, 'withdraw' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/member/ban',
            array(
                array(
                    'methods'               => WP_REST_Server::ALLMETHODS,
                    'callback'              => array( $this, 'get_ban' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            JT_REST_BASE,
            '/member/unique',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'is_unique' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );
    }


    public function get_user( WP_REST_Request $request ) {
        $result = $this->_get_user();

        return new WP_REST_Response( $result, 200 );
    }


    public function login_kakao( WP_REST_Request $request ) {
        global $wpdb;

        $access_token = $request->get_param( 'access_token' );

        $response = wp_remote_get( 'https://kapi.kakao.com/v2/user/me', array(
            'headers'   => array(
                'Authorization' => 'Bearer ' . $access_token,
                'Content-type'  => 'application/x-www-form-urlencoded;charset=utf-8'
            ),
        ) );

        try {
            $data = json_decode( $response['body'] );
            $user_id = 0;
            $result = null;
            $provider_id = $data->id . '@k';
            $provider_email = '';
            $provider_phone = '';

            if (
                isset( $data->kakao_account->email ) && ! empty( $data->kakao_account->email ) &&
                isset( $data->kakao_account->has_email ) && $data->kakao_account->has_email &&
                isset( $data->kakao_account->is_email_valid ) && $data->kakao_account->is_email_valid &&
                isset( $data->kakao_account->is_email_verified ) && $data->kakao_account->is_email_verified
            ) {
                $provider_email = $data->kakao_account->email;
            }

            if (
                isset( $data->kakao_account->phone_number ) && ! empty( $data->kakao_account->phone_number ) &&
                isset( $data->kakao_account->has_phone_number ) && $data->kakao_account->has_phone_number
            ) {
                $provider_phone = $data->kakao_account->phone_number;
                if ( count( explode( ' ', $provider_phone ) ) > 1 ) {
                    $provider_phone = preg_replace( '/(0(?:2|[0-9]{2}))([0-9]+)([0-9]{4}$)/', "$1-$2-$3", '0' . explode( ' ', $provider_phone )[1] );
                } else {
                    $provider_phone = preg_replace( '/(0(?:2|[0-9]{2}))([0-9]+)([0-9]{4}$)/', "$1-$2-$3", $provider_phone );
                }
            }

            $user_by_id = get_user_by( 'login', $provider_id );

            if ( $provider_phone ) {
                $user_by_phone = $wpdb->get_var( $wpdb->prepare( " SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = 'member_data_phone' AND meta_value = %s ", $provider_phone ) );

                if ( $user_by_phone && empty( $user_by_id ) ) {
                    $user_by_id = get_userdata( $user_by_phone );
                }
            }

            if ( ! empty( $user_by_id ) ) {
                $user = wp_signon( array(
                    'user_login'    => $user_by_id->user_login,
                    'user_password' => md5( $user_by_id->user_login ),
                    'remember'      => false,
                ) );

                if ( ! is_wp_error( $user ) ) {
                    update_user_meta( $user->ID, 'kakao_token', $access_token );
                    wp_set_current_user( $user->ID );
                    wp_set_auth_cookie( $user->ID );
                    $result = $this->_get_user();
                }

            } else {
                $result = array(
                    'user_id'       => 0,
                    'user_login'    => $provider_id,
                    'email'         => $provider_email,
                    'phone'         => $provider_phone,
                    'nickname'      => ( isset( $data->kakao_account->profile->nickname ) ? $data->kakao_account->profile->nickname : '' ),
                    'token'         => $access_token,
                );
            }

            if ( ! empty( $result ) ) {
                return new WP_REST_Response( $result, 200 );
            }

            return new WP_Error( 'empty', '데이터가 없습니다', array( 'status' => 404 ) );
        } catch ( Exception $e ) {
            return new WP_Error( 'error', $e->getMessage(), array( 'status' => 404 ) );
        }

        return new WP_Error( 'empty', '데이터가 없습니다', array( 'status' => 404 ) );
    }


    public function regist_kakao( WP_REST_Request $request ) {
        global $wpdb;

        $data = $request->get_params();

        $user_id = intVal( $data['user_id'] );
        $user_login = esc_attr( $data['user_login'] );
        $user_email = esc_attr( $data['email'] );
        $user_nickname = esc_attr( $data['nickname'] );
        $user_phone = esc_attr( $data['phone'] );
        $ban_list = array_map( 'trim', explode( ',', str_replace( array( PHP_EOL, '|' ), array( ',', '\|' ), get_field( 'ban_list', 'option' ) ) ) );

        if ( ! isset( $data['terms_agree'] ) && $data['terms_agree'] != 'Y' ) {
            return $this->_error( 'terms_agree', '뭉치고 이용약관에 동의해주세요' );
        }

        if ( ! isset( $data['policy_agree'] ) && $data['policy_agree'] != 'Y' ) {
            return $this->_error( 'policy_agree', '개인정보 수집이용에 동의해주세요' );
        }

        if ( empty( $user_login ) ) {
            return $this->_error( 'user_login', '잘못된 접근입니다' );
        }

        if ( empty( $user_nickname ) ) {
            return $this->_error( 'nickname', '닉네임을 입력해주세요' );
        } elseif ( strpos( $user_nickname, ' ' ) !== false ) {
            return $this->_error( 'nickname', '닉네임에 공백이 포함되어 있습니다' );
        } elseif ( mb_strlen( $user_nickname ) > 10 || mb_strlen( $user_nickname ) < 2 ) {
            return $this->_error( 'nickname', '닉네임은 2-10자로 입력해주세요' );
        } elseif ( ! empty( $ban_list ) && preg_match( '/' . implode( '|', $ban_list ) . '/', $user_nickname ) ) {
            return $this->_error( 'nickname', '닉네임에 금지어가 포함되어 있습니다' );
        } else {
            $cnt = $wpdb->get_var( $wpdb->prepare( " SELECT COUNT( * ) FROM {$wpdb->usermeta} WHERE meta_key = 'nickname' AND meta_value = %s ", $user_nickname ) );

            if ( $cnt > 0 ) {
                return $this->_error( 'nickname', '중복된 닉네임이 존재합니다' );
            }
        }

        if ( empty( $user_email ) ) {
            return $this->_error( 'email', '이메일을 입력해주세요' );
        } elseif ( ! preg_match( '/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/', $user_email ) ) {
            return $this->_error( 'email', '유효한 이메일을 입력해주세요' );
        } else {
            $cnt = $wpdb->get_var( $wpdb->prepare( " SELECT COUNT( * ) FROM {$wpdb->users} WHERE user_email = %s ", $user_email ) );

            if ( $cnt > 0 ) {
                return $this->_error( 'email', '중복된 이메일이 존재합니다' );
            }
        }

        if ( empty( $user_phone ) || ! preg_match( '/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/', $user_phone ) ) {
            return $this->_error( 'phone', '휴대폰 번호 인증을 완료하지 않아 카카오계정으로 로그인이 불가능한 사용자입니다.' );
        } else {
            $cnt = $wpdb->get_var( $wpdb->prepare( " SELECT COUNT(*) FROM {$wpdb->usermeta} WHERE meta_key = 'member_data_phone' AND meta_value = %s ", $user_phone ) );

            if ( $cnt > 0 ) {
                return $this->_error( 'exists', '이미 가입한 회원입니다' );
            }
        }

        if ( $user_id > 0 ) {
            return $this->_error( 'exists', '이미 가입한 회원입니다' );
        }

        $user_by_id = get_user_by( 'user_login', $user_login );
        if ( ! empty( $user_by_id ) ) {
            return $this->_error( 'exists', '이미 가입한 회원입니다' );
        }

        $user_data = array(
            'user_login'            => $user_login,
            'user_pass'             => md5( $user_login ),
            'user_nicename'         => $user_nickname,
            'user_email'            => $user_email,
            'display_name'          => $user_nickname,
            'nickname'              => $user_nickname,
            'first_name'            => $user_nickname,
            'last_name'             => '',
            'show_admin_bar_front'  => false,
        );

        $user_id = wp_insert_user( $user_data );

        if ( ! is_wp_error( $user_id ) ) {
            update_user_meta( $user_id, 'nickname', $user_nickname );

            $member_data = array(
                'phone'             => $user_phone,
                'avatar'            => 1,
                'marketing'         => ( $data['jt_marketing'] && $data['jt_marketing'] == 'Y' ),
                'marketing_date'    => ( $data['jt_marketing'] && $data['jt_marketing'] == 'Y' ? date_i18n( 'Y-m-d H:i:s' ) : '' ),
            );
            update_field( 'member_data', $member_data, 'user_' . $user_id );

            if ( isset( $data['token'] ) && ! empty( $data['token'] ) ) update_user_meta( $user_id, 'kakao_token', $data['token'] );

            wp_set_current_user( $user_id );
            wp_set_auth_cookie( $user_id );

            $result = $this->_get_user();

            return new WP_REST_Response( $result, 200 );
        }

        return $this->_error( 'error', '회원 가입 중 오류가 발생했습니다' );
    }


    public function update_profile( WP_REST_Request $request ) {
        if ( is_user_logged_in() ) {
            $res = false;

            if ( intVal( $request->get_param( 'avatar' ) ) > 0 ) {
                $res = update_field( 'member_data_avatar', intVal( $request->get_param( 'avatar' ) ), 'user_' . get_current_user_id() );
            }

            if ( in_array( $request->get_param( 'marketing' ), array( 'Y', 'N' ) ) ) {
                $data = array( 'marketing' => false, 'marketing_date' => '' );
                if ( $request->get_param( 'marketing' ) === 'Y' ) {
                    $data = array( 'marketing' => true, 'marketing_date' => date_i18n( 'Y-m-d H:i:s' ), );
                }
                $res = update_field( 'member_data', $data, 'user_' . get_current_user_id() );
            }

            return new WP_REST_Response( $res !== false, 200 );
        }

        return new WP_Error( 'permission_denied', '잘못된 접근입니다', array( 'status' => 403 ) );
    }


    public function logout( WP_REST_Request $request ) {
        if ( is_user_logged_in() ) {
            wp_logout();
        }

        return new WP_REST_Response( true, 200 );
    }


    public function withdraw( WP_REST_Request $request ) {
        if ( is_user_logged_in() ) {
            if ( current_user_can( 'administrator' ) ) {
                return new WP_Error( 'permission_denied', '관리자 계정은 회원탈퇴 할 수 없습니다', array( 'status' => 403 ) );
            }

            require_once ABSPATH . 'wp-admin/includes/user.php';

            // $table = $wpdb->prefix . 'jt_review';

            $res = wp_delete_user( get_current_user_id() );

            if ( $res === true ) {
                wp_logout();

                return new WP_REST_Response( true, 200 );
            } else {
                return new WP_Error( 'error', '회원 탈퇴 중 오류가 발생했습니다', array( 'status' => 500 ) );
            }
        }

        return new WP_Error( 'permission_denied', '잘못된 접근입니다', array( 'status' => 403 ) );
    }


    public function get_ban( WP_REST_Request $request ) {
        $ban_list = array_map( 'trim', explode( ',', str_replace( array( PHP_EOL, '|' ), array( ',', '\|' ), get_field( 'ban_list', 'option' ) ) ) );

        return new WP_REST_Response( $ban_list );
    }


    public function is_unique( WP_REST_Request $request ) {
        global $wpdb;

        $type = esc_attr( $request->get_param( 'type' ) );
        $value = esc_attr( $request->get_param( 'value' ) );

        if ( $type === 'email' ) {
            $sql = $wpdb->prepare( " SELECT COUNT( * ) FROM {$wpdb->users} WHERE user_email = %s ", $value );
            $cnt = $wpdb->get_var( $sql );

            return new WP_REST_Response( $cnt == 0 );
        } elseif ( $type === 'nickname' ) {
            $sql = $wpdb->prepare( " SELECT COUNT( * ) FROM {$wpdb->usermeta} WHERE meta_key = 'nickname' AND meta_value = %s ", $value );
            $cnt = $wpdb->get_var( $sql );

            return new WP_REST_Response( $cnt == 0 );
        }

        return new WP_Error( 'permission_denied', '잘못된 접근입니다', array( 'status' => 403 ) );
    }


    public function delete_user( $user_id ) {
        global $wpdb;

        try {
            $remove_to_trash = false;
            $user_data  = $wpdb->get_row( $wpdb->prepare( " SELECT * FROM {$wpdb->users} WHERE ID = %d ", $user_id ), ARRAY_A );
            $user_meta  = $wpdb->get_results( $wpdb->prepare( " SELECT * FROM {$wpdb->usermeta} WHERE user_id = %d ", $user_id ), ARRAY_A );

            $user_data[ 'withdraw_date' ] = date_i18n( 'Y-m-d H:i:s' );

            $res = $wpdb->insert( "{$wpdb->prefix}withdraw", $user_data );

            foreach ( $user_meta as $tmp_meta ) {
                $wpdb->insert( "{$wpdb->prefix}withdraw_meta", $tmp_meta );
            }

            $shops = get_posts( array(
                'post_type'     => 'shop',
                'meta_key'      => 'shop_user',
                'meta_value'    => $user_id,
                'fields'        => 'ids',
            ) );
            // 샵주 매칭 된 샵 비공개 처리
            if ( ! empty( $shops ) ) {
                foreach ( $shops as $shop_id ) {
                    wp_update_post( array( 'ID' => $shop_id, 'post_status' => 'private', ) );
                }
            }

            // 1:1 문의, 정보 수정요청, 제휴문의 삭제
            $user_posts = get_posts( array(
                'post_type'         => array( 'inquiry', 'partnership', 'modify' ),
                'author'            => $user_id,
                'fields'            => 'ids',
                'posts_per_page'    => -1,
            ) );

            if ( ! empty( $user_posts ) ) {
                foreach ( $user_posts as $user_post_id ) {
                    if ( $remove_to_trash ) {
                        wp_trash_post( $user_post_id );
                    } else {
                        wp_delete_post( $user_post_id, true );
                    }
                }
            }

            // 후기 삭제
            if ( $remove_to_trash ) {
                $wpdb->query( $wpdb->prepare( " UPDATE {$wpdb->prefix}jt_review SET status = 'D' WHERE user_id = %d ", $user_id ) );
            } else {
                $wpdb->query( $wpdb->prepare( " DELETE FROM {$wpdb->prefix}jt_review WHERE user_id = %d ", $user_id ) );
            }

            // 찜 삭제
            $wpdb->delete( $wpdb->prefix . 'jt_zzim', array( 'user_id' => $user_id ) );

            // 카카오 연결 해제
            try {
                $token = get_user_meta( $user_id, 'kakao_token', true );
                if ( $token ) {
                    $response = wp_remote_post( 'https://kapi.kakao.com/v1/user/unlink', array(
                        'headers'   => array(
                            'Authorization' => 'Bearer ' . $token,
                            'Content-type'  => 'application/x-www-form-urlencoded;charset=utf-8'
                        ),
                    ) );
                }
            } catch ( Exception $e ) { }
        } catch ( Exception $e ) {
            $wpdb->delete( "{$wpdb->prefix}withdraw", array( 'ID' => $user_id ) );
            $wpdb->delete( "{$wpdb->prefix}withdraw_meta", array( 'user_id' => $user_id ) );

            echo "
                <script>
                    alert( '처리중 오류가 발생했습니다' );
                    history.back();
                </script>
            ";
            exit;
        }
    }

    private function _get_user() {
        if ( is_user_logged_in() ) {
            global $wpdb;

            $user = wp_get_current_user();
            $member_data = get_field( 'member_data', 'user_' . $user->ID );
            $now_str = date_i18n( 'Y-m-d H:i:s' );

            $result = array(
                'user_id'   => $user->ID,
                'nickname'  => $user->display_name,
                'phone'     => $member_data['phone'],
                'email'     => $user->user_email,
                'avatar'    => ( $member_data['avatar'] ?: 1 ),
                'marketing' => ( $member_data['marketing'] == true ? 'Y' : 'N' ),
                'shop'      => array(),
            );

            $shop_sql = "   SELECT p.ID AS post_id, TIMESTAMPDIFF( DAY, CONCAT( pm_end.meta_value, ' 10:59:59' ), '{$now_str}' ) AS dday
                            FROM {$wpdb->posts} AS p
                                INNER JOIN {$wpdb->postmeta} AS pm_type ON pm_type.post_id = p.ID AND pm_type.meta_key = 'shop_ad_type'
                                INNER JOIN {$wpdb->postmeta} AS pm_start ON pm_start.post_id = p.ID AND pm_start.meta_key = 'shop_ad_period_start'
                                INNER JOIN {$wpdb->postmeta} AS pm_end ON pm_end.post_id = p.ID AND pm_end.meta_key = 'shop_ad_period_end'
                                INNER JOIN {$wpdb->postmeta} AS pm_user ON pm_user.post_id = p.ID AND pm_user.meta_key = 'shop_user' AND pm_user.meta_value = {$user->ID}
                            WHERE 1=1
                                AND p.post_type = 'shop'
                                AND p.post_status IN ( 'publish', 'pending' )
                            GROUP BY p.ID
                            ORDER BY
                                (
                                    CASE WHEN '{$now_str}' BETWEEN CONCAT( pm_start.meta_value, ' 11:00:00' ) AND CONCAT( pm_end.meta_value, ' 10:59:59' ) THEN 0
                                    WHEN '{$now_str}' < CONCAT( pm_start.meta_value, ' 11:00:00' ) THEN 1
                                    ELSE 2 END
                                ) ASC,
                                (
                                CASE WHEN '{$now_str}' < CONCAT( pm_start.meta_value, ' 11:00:00' ) THEN ABS( TIMESTAMPDIFF( DAY, CONCAT( pm_start.meta_value, ' 10:59:59' ), '{$now_str}' ) )
                                    ELSE ABS( dday ) END
                                ) ASC,
                                (
                                    CASE WHEN pm_type.meta_value = 'super' THEN 0
                                    WHEN pm_type.meta_value = 'big' THEN 1
                                    ELSE 2 END
                                ) ASC,
                                p.post_date DESC
            ";
            $shops = $wpdb->get_results( $shop_sql, ARRAY_A );
            // $result['sql'] = $shop_sql;

            if ( ! empty( $shops ) ) {
                $tmp_arr_type = array(
                    'super' => array(
                                'name'  => '슈퍼리스트',
                                'class' => 'multi_shop_super',
                            ),
                    'big'   => array(
                                'name'  => '빅히트콜',
                                'class' => 'multi_shop_bighit',
                            ),
                    'basic' => array(
                                'name'  => '일반샵',
                                'class' => 'multi_shop_normal',
                            ),
                );

                foreach ( $shops as $shop ) {
                    $shop_id = $shop['post_id'];
                    $shop_ad = get_field( 'shop_ad', $shop_id );

                    $start = ( $shop_ad['period']['start'] ? strtotime( $shop_ad['period']['start'] . ' 00:00:00' ) : 0 );
                    $end = ( $shop_ad['period']['end'] ? strtotime( $shop_ad['period']['end'] . ' 10:59:59' ) : 0 );

                    $interval = ( new DateTime( date( 'Y-m-d', $end ) ) )->diff( new DateTime( date_i18n( 'Y-m-d' ) ) );
                    $dday = $interval->format( '%r%a' ) * ( -1 );
                    $str_dday = 'D - ' . $dday;

                    if ( strtotime( $shop_ad['period']['start'] . ' 11:00:00' ) > strtotime( date_i18n( 'Y-m-d H:i:s' ) ) ) {
                        $str_dday = '광고예약';
                    } elseif ( ( $dday == 0 && date_i18n( 'H' ) >= 11 ) || ( $dday < 0 ) ) {
                        $str_dday = '광고종료';
                    }

                    $result['shop'][] = array(
                        'shop_id'   => $shop_id,
                        'permalink' => str_replace( home_url(), '', get_permalink( $shop_id ) ),
                        'slug'      => get_post_field( 'post_name', $shop_id ) ?: sanitize_title( get_the_title( $shop_id ), $shop_id ),
                        'title'     => get_the_title( $shop_id ),
                        'type'      => $tmp_arr_type[ $shop_ad['type'] ]['name'],
                        'class'     => $tmp_arr_type[ $shop_ad['type'] ]['class'],
                        'is_ready'  => $shop_ad['ready'],
                        'start'     => date( 'Y-m-d', $start ),
                        'end'       => date( 'Y-m-d', $end ),
                        'dday'      => $str_dday,
                        'week'      => array( '일', '월', '화', '수', '목', '금', '토' )[ date( 'w', $end ) ],
                    );
                }
            }

            return $result;
        }

        return null;
    }


    private function _error( $code = 'error', $msg = '잘못된 접근입니다' ) {
        return new WP_REST_Response( array( 'code' => $code, 'message' => $msg ), 200 );
    }
}