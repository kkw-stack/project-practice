<?php
/*
 * Name       : SHOP
 * namespace  : shop
 * File       : /modules/shop/index.php
 * Author     : STUDIO-JT (Nico)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) SHOP 프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


 /**
 * Shop Size 추가
 */
add_image_size( 'jt_shop_single_slide', 720, 420, array( 'center', 'top' ) );
add_image_size( 'jt_shop_list', 180, 180, array( 'center', 'top' ) );


/**
 * SHOP 프로그램 실행
 */
$jt_shop = new Jt_shop();

/**
 * Jt_shop Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_shop extends Jt_Module{

    private $_distance = 15;
    private $_zzim_table;
    private $_search_table;

    public function __construct() {
        parent::__construct( array(
            'namespace'     => 'shop',
            'name'          => '샵',
            'menu'          => '샵 관리',
            'support'       => array( 'title', 'excerpt', 'thumbnail' ),
            'support_cat'   => true,
            //'pageid'        => 90,
        ) );

        global $wpdb;

        $this->_zzim_table = $wpdb->prefix . 'jt_zzim';
        $this->_search_table = $wpdb->prefix . 'search_shop';

        $this->_create_zzim_table();
        $this->_create_search_table();

        add_filter( 'get_the_terms', array( $this, 'get_the_terms' ), 10, 3 );

        add_filter( 'term_link', array( $this, 'term_link' ), 10, 3 );

        add_filter( 'private_title_format', array( $this, 'private_title_format' ), 10, 2 );

        add_action( 'admin_menu', array( $this, 'admin_menu' ) );

        add_action( 'add_meta_boxes', array( $this, 'add_metabox' ) );
        add_action( 'acf/input/admin_footer', array( $this, 'admin_script' ) );

        add_filter( 'views_edit-' . $this->_namespace, array( $this, 'view_edit_subsubsub' ) );
        add_filter( 'pre_get_posts', array( $this, 'pre_get_posts' ) );

        add_action( 'posts_where', array( $this, 'posts_where' ), 10, 2 );

        add_action( 'admin_enqueue_scripts', array( $this, 'admin_style' ) );

        add_filter( 'manage_' . $this->_namespace . '_posts_columns', array( $this, 'manage_admin_columns' ) );
        add_action( 'manage_' . $this->_namespace . '_posts_custom_column', array( $this, 'manage_admin_column_value' ), 10, 2 );

        add_action( 'restrict_manage_posts', array( $this, 'admin_filter_area_selector' ) );

        add_action( 'admin_footer', array( $this, 'admin_footer' ) );

        add_action( 'save_post', array( $this, 'save_post' ), 10, 2 );
        add_action( 'deleted_post', array( $this, 'deleted_post' ), 10, 2 );

        add_action( 'wp_ajax_get_area_category', array( $this, 'get_area_category' ) );

        add_action( 'wp_ajax_sync_today', array( $this, 'admin_sync_today' ) );
    }


    public function admin_sync_today() {
        if ( isset( $_POST[ 'post_id' ] ) && intVal( $_POST[ 'post_id' ] ) > 0 && current_user_can( 'edit_posts' ) ) {
            $args = array(
                'ID'                => intVal( $_POST[ 'post_id' ] ),
                'post_date'         => date_i18n( 'Y-m-d H:i:s' ),
                'post_date_gmt'     => date( 'Y-m-d H:i:s' ),
                'post_modified'     => date_i18n( 'Y-m-d H:i:s' ),
                'post_modified_gmt' => date( 'Y-m-d H:i:s' ),
            );
            // print_r( $args ); exit;

            $res = wp_update_post( $args );

            if ( is_wp_error( $res ) ) {
                wp_send_json_error( $res->get_error_messages() );
            } else {
                wp_send_json_success();
            }
        }
    }

    public function enable_sticky( $post ) {
        if ( $post->post_type === $this->_namespace ) {
            ?>
            <div style="padding: 5px 0 15px 0">
                <span id="sticky-span" style="margin-left:12px;">
                    <input id="sticky" name="sticky" type="checkbox" value="sticky" <?php checked( is_sticky( $post->ID ), true ); ?> />
                    <label for="sticky" class="selectit">공지</label>
                </span>
                <button type="button" class="button right jt_sync_today" style="margin: 0px 5px 5px 0px;" data-id="<?php echo $post->ID; ?>"><span>초기화</span></button>
            </div>
            <script>
            jQuery( function ( $ ) {
                $( '.jt_sync_today' ).on( 'click', function () {
                    var $this = $( this );

                    $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'sync_today', post_id: $this.data( 'id' ) }, function ( res ) {
                        if ( res.success ) {
                            alert( '발행일을 초기화했습니다' );
                            location.reload();
                        } else {
                            alert( '오류가 발생했습니다' );
                            console.log( res );
                        }
                    } );

                    return false;
                } );
            } );
            </script>
            <?php
        }
    }


    public function get_the_terms( $terms, $post_id, $taxonomy ) {
        if ( get_post_type( $post_id ) === $this->_namespace ) {
            if ( $taxonomy === 'shop_categories' ) {
                array_multisort( array_column( $terms, 'term_order' ), SORT_ASC, $terms );
            } elseif ( $taxonomy === 'shop_area' ) {
                array_multisort( array_column( $terms, 'parent' ), SORT_ASC, $terms );
            }
        }

        return $terms;
    }


    public function term_link( $url, $term, $taxonomy ) {
        // if ( $taxonomy === 'shop_area' ) {
        //     $url = str_replace( '/cmsadmin/샵-지역별/', '/지역기반/', $url );
        // } else if ( $taxonomy === 'shop_categories' ) {
        //     $url = str_replace( '/cmsadmin/샵-카테고리/', '/위치기반/', $url );
        // }

        return $url;
    }


    public function private_title_format( $format, $post ) {
        if ( get_post_type( $post ) === $this->_namespace ) {
            return '%s';
        }

        return $format;
    }


    public function save_post( $post_id, $post ) {
        global $wpdb;

        if ( $post->post_type == $this->_namespace ) {
            $type = get_field( 'shop_ad_type', $post_id );

            if ( ! in_array( $type, array( 'super', 'big' ) ) && 0) { // 일반샵은 엄지척, 배경색을 초기화
                update_field( 'shop_ad_type', 'basic', $post_id );
                update_field( 'shop_ad_bg', false, $post_id );
                update_field( 'shop_ad_label', false, $post_id );
            }

            // Date 변경시 실제 DB 에는 20200101 형식으로 들어가있어서 올바른 포맷으로 다시 업데이트 처리
            $start = get_field( 'shop_ad_period_start', $post_id );
            if ( $start ) update_field( 'shop_ad_period_start', $start, $post_id );

            $end = get_field( 'shop_ad_period_end', $post_id );
            if ( $end ) update_field( 'shop_ad_period_end', $end, $post_id );

            // TODO :: 알림톡 발송
            $origin_status = ( $_REQUEST['original_post_status'] ?: '' );
            $kakao_send = get_field( '_kakao_send', $post_id );
            $ceo_phone = get_field( 'shop_ad_user_phone', $post_id );

            if ( $ceo_phone && intVal( date_i18n( 'H' ) ) >= 11 ) { // 11~23시 사이에 오픈된 샵은 광고시작/광고종료 알림톡 발송
                $today = date_i18n( 'Y-m-d' );
                $dday = date( 'Y-m-d', strtotime( date_i18n( 'Y-m-d' ) . ' +3 days' ) );
                $update = $post->post_date != $post->post_modified;

                // 2022-07-19 [201] :: 임시글, 휴지통 처리시 알림톡 발송 방지 추가
                if (!in_array($post->post_status, array('draft', 'trash'))) {
                    if ( $update == true ) {
                        if ( ( $kakao_send['phone'] != $ceo_phone || $kakao_send['start'] != $start ) && $today == $start && ( $kakao_send['phone'] != $ceo_phone || $origin_status == 'pending' ) ) jt_send_kakao( $post_id, 'START' );
                        if ( $kakao_send['end'] != $end && $today == $end && $origin_status == 'publish' ) jt_send_kakao( $post_id, 'END' );
                        if ( $type != 'basic' && ( $kakao_send['phone'] != $ceo_phone || $kakao_send['end'] != $end ) && $dday == $end ) jt_send_kakao( $post_id, 'DDAY' );
                    } elseif ( $today >= $start && $today < $end ) {
                        if ( $today == $start ) jt_send_kakao( $post_id, 'START' );
                        if ( $today == $end ) jt_send_kakao( $post_id, 'END' );
                        if ( $type != 'basic' && $dday == $end ) jt_send_kakao( $post_id, 'DDAY' );
                    }
                }
            }

            update_field( '_kakao_send', array( 'start' => $start, 'end' => $end, 'phone' => $ceo_phone ), $post_id ); // 카톡 미발송시 최신 데이터 반영

            if ( date_i18n( 'YmdH' ) >= date( 'YmdH', strtotime( $end . ' 11:00:00' ) ) && $post->post_status == 'publish' ) { // 샵 종료일로 광고를 종료시 대기중으로 상태를 변경
                $wpdb->update( $wpdb->posts, array( 'post_status' => 'pending' ), array( 'ID' => $post_id ) );
            } elseif ( date_i18n( 'YmdH' ) < date( 'YmdH', strtotime( $start . ' 11:00:00' ) ) && $post->post_status == 'publish' ) { // 샵 시작일로 광고를 예약 처리시 상태를 변경
                $wpdb->update( $wpdb->posts, array( 'post_status' => 'pending' ), array( 'ID' => $post_id ) );
            } elseif ( date_i18n( 'YmdH' ) >= date( 'YmdH', strtotime( $start . ' 11:00:00' ) ) && date_i18n( 'YmdH' ) < date( 'YmdH', strtotime( $end . ' 11:00:00' ) ) && $post->post_status == 'pending' ) { // 샵 종료일로 광고를 연장하면 발생으로 상태를 변경
                $wpdb->update( $wpdb->posts, array( 'post_status' => 'publish' ), array( 'ID' => $post_id ) );
            }

            $this->_add_search_data( $post_id ); // 검색용 테이블 처리
        }
    }


    public function deleted_post( $post_id, $post ) {
        global $wpdb;

        $wpdb->delete( $this->_search_table, array( 'post_id' => $post_id ) );
    }


    public function get_area_category() {
        $taxonomy   = $this->_namespace . '_area';
        $term_id    = intVal( $_POST[ 'term_id' ] );
        $term       = get_term( $term_id, $taxonomy );

        if ( $term ) {
            $terms = get_terms( array( 'taxonomy' => $taxonomy, 'parent' => $term->term_id, 'hide_empty' => false ) );
            wp_send_json_success( $terms );
            exit;
        }

        wp_send_json_error();
    }


    public function add_metabox() {
        add_meta_box( 'jt_zzim_list', '찜 사용자', array( $this, 'zzim_metabox' ), 'shop' );
    }


    public function zzim_metabox() {
        global $wpdb;

        $shop_id    = get_the_ID();
        $zzim_list  = $wpdb->get_results( $wpdb->prepare(
            "   SELECT *
                FROM {$this->_zzim_table}
                    INNER JOIN {$wpdb->posts} ON {$wpdb->posts}.ID = {$this->_zzim_table}.shop_id
                    INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_zzim_table}.user_id
                WHERE 1=1
                    AND shop_id = %d
                    AND {$wpdb->posts}.post_status = 'publish'
            ",
            $shop_id
        ) );
        ?>
        <style>
            .jt_zzim_list li { display: inline-block; border: 1px solid #cecece; border-radius: 5px; padding: 5px; margin: 5px; }
            .jt_zzim_list li a { text-decoration: none; color: gray; }
        </style>

        <ul class="jt_zzim_list">
            <?php if ( ! empty( $zzim_list ) ) : ?>
                <?php foreach ( array_column( $zzim_list, 'user_id' ) as $idx => $user_id ) : $user_data = get_userdata( $user_id ); ?>
                    <li>
                        <a href="<?php echo admin_url( 'user-edit.php?user_id=' . $user_id ); ?>" target="_blank">
                            <span><?php echo get_the_author_meta( 'nickname', $user_id ); ?></span>
                        </a>
                    </li>
                <?php endforeach; ?>
            <?php endif; ?>
        </ul>
        <?php
    }


    public function admin_footer() {
        global $post_type;

        if ( $post_type == 'shop' ) {
            ?>
            <script>
                jQuery( function ( $ ) {
                    // 20220524 라벨 클릭 이벤트 방지를 위해 추가 그룹 아이디 변경시 변경 필요
                    $( '#acf-group_5e0449ece2b46' ).find( 'label' ).removeAttr( 'for' );

                    $( '.categorychecklist' ).each( function () {
                        var $list = $( this );

                        $( 'input:checkbox', $list ).on( 'change', function () {
                            var $this   = $( this );
                            var $parent = $this.closest( 'ul.children' );

                            if ( $parent.length > 0 ) {
                                $( '#in-' + $parent.closest( 'li' ).attr( 'id' ) ).prop( 'checked', $parent.find( 'input:checkbox:checked' ).length > 0 );
                            }
                        } );
                    } );

                    $( '[name=post_title]' ).prop( 'required', true );
                    $( '#publish' ).on( 'click', function () {

                        var $this   = $( this );
                        var $form   = $this.closest( 'form' );
                        var $title  = $( '[name=post_title]', $form );

                        if ( $title.val().trim().length == 0 ) {

                            alert( '샵 이름을 입력해주세요' );
                            $title.focus();
                            return false;

                        }

                        var $target = $( '[name="tax_input[shop_categories][]"]:checked', $form );
                        if ( $target.length == 0 ) {

                            alert( '샵 카테고리를 선택해주세요' );
                            return false;

                        }

                        var $target = $( '#shop_area-0depth', $form );
                        if ( $target.length > 0 && ! $target.val() ) {

                            alert( '지역 카테고리를 선택해주세요' );
                            $target.focus();
                            return false;

                        }

                        $target = $( '#shop_area-1depth', $form );
                        if ( $target.length > 0 && ! $target.val() ) {

                            alert( '지역 카테고리를 선택해주세요' );
                            $target.focus();
                            return false;

                        }

                    } );
                } );
            </script>
            <?php
        }
    }


    public function manage_admin_columns( $columns ) {
        $new_columns = array();

        foreach ( $columns as $key => $value ) {
            if ( $key == 'date' ) {
                $new_columns['shop_type'] = '광고상품';
                $new_columns['jt_author'] = '샵주';
            }

            $new_columns[ $key ] = $value;
        }

        return $new_columns;
    }


    public  function manage_admin_column_value( $column_name, $post_id ) {
        if ( $column_name == 'shop_type' ) {
            $type = get_field( 'shop_ad_type', $post_id );
            ?>
            <?php if ( $type == 'super' ) : ?>
                <a href="<?php echo admin_url( 'edit.php?post_type=shop&shop_type=super' ); ?>">슈퍼리스트</a>
            <?php elseif ( $type == 'big' ) : ?>
                <a href="<?php echo admin_url( 'edit.php?post_type=shop&shop_type=big' ); ?>">빅히트콜</a>
            <?php else : ?>
                <a href="<?php echo admin_url( 'edit.php?post_type=shop&shop_type=basic' ); ?>">일반샵</a>
            <?php endif; ?>
            <?php
        } elseif ( $column_name === 'jt_author' ) {
            $author = get_field( 'shop_user', $post_id );
            $userdata = get_userdata( $author );

            if ( $userdata ) {
                printf( '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>', add_query_arg( array( 'jt_author' => $author ), admin_url( 'edit.php?post_type=shop' ) ), $userdata->display_name );
            } else {
                echo '<span aria-hidden="true">—</span>';
            }
        }
    }

    public function admin_filter_area_selector() {
        $post_type = esc_attr( isset( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : 'post' );
        $namespace = $this->_namespace;
        $category = $namespace . '_area';

        if ( $post_type == $namespace ) {
            $jt_cat = urldecode( isset( $_REQUEST[ $category ] ) ? $_REQUEST[ $category ] : '' );
            $terms = get_terms( array( 'taxonomy' => $category, 'hide_empty' => false ) );
            ?>
            <select name="<?php echo $category; ?>">
                <option value="">모든 지역</option>
                <?php foreach ( $terms as $term ) : ?>
                    <option value="<?php echo urldecode( $term->slug ); ?>" <?php selected( $jt_cat, urldecode( $term->slug ) ); ?>><?php echo $term->name; ?></option>
                <?php endforeach; ?>
            </select>
            <?php
        }
    }

    public function admin_style() {
        ?>
        <style>
            .acf-switch .acf-switch-slider { left: 50% !important; right: 2px !important; }
            .acf-switch.-on .acf-switch-slider { left: 2px !important; right: 50% !important; }
            .acf-switch span { float: right !important; }

            .manage-column.column-shop_type { width: 100px; }
            .manage-column.column-taxonomy-shop_area { width: 150px; }
            .manage-column.column-taxonomy--shop_categories { width: 150px; }
            .manage-column.column-jt_author { width: 14%; }

            .toplevel_page_main-options .acf-taxonomy-field .categorychecklist-holder { width: 300px; max-height: 100% !important; }

            #shop_categories-adder, #shop_area-adder { display: none; }
        </style>
        <?php
    }


    public function admin_script() {
        ?>
        <script>
            jQuery( function ( $ ) {
                if ( $( 'form#post [name="post_type"]' ).val() === 'shop' ) {
                    $( 'form#post #title' ).attr( 'maxlength', 30 );
                    $( 'form#post #title' ).on( 'input', function () {
                        var $this = $( this );
                        $this.val( $this.val().substr( 0, 30 ) );
                    } );
                }

                var $wrap   = $( 'div[data-name="shop_ad"]' );

                if ( $wrap.length > 0 ) {
                    var $start  = $( 'div[data-name="start"] input:text', $wrap );
                    var $end    = $( 'div[data-name="end"] input:text', $wrap );
                    var start   = new Date();

                    $( 'div[data-name="month"] input:radio', $wrap ).on( 'change', function () {
                        var $this = $( this );

                        if ( $this.prop( 'checked' ) ) {
                            if ( $start.val().length == 0 ) {
                                $start.val( $.datepicker.formatDate( 'yy-mm-dd', start ) );
                            } else {
                                start = new Date( $start.val() );
                            }

                            var end = new Date( start.getTime() + ( parseInt( $this.val() ) * 30 * 24 * 60 * 60 * 1000 ) );

                            $end.val( $.datepicker.formatDate( 'yy-mm-dd', end ) );

                            if ( $start.closest( '.acf-input-wrap' ).find( 'input:hidden' ).length > 0 ) {
                                $start.closest( '.acf-input-wrap' ).find( 'input:hidden' ).val( $.datepicker.formatDate( 'yy-mm-dd', start ) );
                            }

                            if ( $end.closest( '.acf-input-wrap' ).find( 'input:hidden' ).length > 0 ) {
                                $end.closest( '.acf-input-wrap' ).find( 'input:hidden' ).val( $.datepicker.formatDate( 'yy-mm-dd', end ) );
                            }
                        }
                    } );

                    if ( $start.val() ) {
                        var tmp_date = new Date( $start.val() );
                        tmp_date.setDate( tmp_date.getDate() + 1 );
                        $end.datepicker( 'option', 'minDate', $.datepicker.formatDate( 'yy-mm-dd', tmp_date ) );
                    }

                    $start.on( 'change', function ( event ) {
                        if ( $start.val() ) {
                            var tmp_date = new Date( $start.val() );
                            tmp_date.setDate( tmp_date.getDate() + 1 );

                            $end.datepicker( 'option', 'minDate', $.datepicker.formatDate( 'yy-mm-dd', tmp_date ) );
                        }

                        var start   = new Date( $start.val() );
                        var $month  = $( 'div[data-name="month"] input:radio:checked', $wrap );
                        var end = new Date( start.getTime() + ( parseInt( $month.val() ) * 30 * 24 * 60 * 60 * 1000 ) );

                        $end.val( $.datepicker.formatDate( 'yy-mm-dd', end ) );

                        if ( $end.closest( '.acf-input-wrap' ).find( 'input:hidden' ).length > 0 ) {
                            $end.closest( '.acf-input-wrap' ).find( 'input:hidden' ).val( $.datepicker.formatDate( 'yy-mm-dd', end ) );
                        }
                    } );
                }
            } );
        </script>
        <?php
    }


    public function view_edit_subsubsub( $items ) {
        global $wpdb;

        $new_items = array();

        foreach ( $items as $key => $val ) {
            $new_items[ $key ] = $val;

            if ( $key == 'publish' ) {
                $super_cnt = $wpdb->get_var( "
                    SELECT COUNT( DISTINCT( a.ID ) )
                    FROM jt_posts AS a
                        INNER JOIN jt_postmeta AS b ON b.post_id = a.ID AND b.meta_key = 'shop_ad_type'
                    WHERE
                        a.post_type = 'shop'
                        AND a.post_status = 'publish'
                        AND b.meta_value = 'super';
                " );
                $big_cnt = $wpdb->get_var(
                    "   SELECT COUNT( DISTINCT( a.ID ) )
                        FROM jt_posts AS a
                            INNER JOIN jt_postmeta AS b ON b.post_id = a.ID AND b.meta_key = 'shop_ad_type'
                        WHERE
                            a.post_type = 'shop'
                            AND a.post_status = 'publish'
                            AND b.meta_value = 'big'; "
                );
                $basic_cnt = $wpdb->get_var(
                    "   SELECT COUNT( DISTINCT( a.ID ) )
                        FROM jt_posts AS a
                            INNER JOIN jt_postmeta AS b ON b.post_id = a.ID AND b.meta_key = 'shop_ad_type'
                        WHERE
                            a.post_type = 'shop'
                            AND a.post_status = 'publish'
                            AND b.meta_value NOT IN ( 'super', 'big' );
                " );

                $new_items['super'] = sprintf(
                    '<a href="%s" class="%s" aria-current="page">슈퍼리스트 <span class="count">(%d)</span></a>',
                    admin_url( 'edit.php?post_type=shop&shop_type=super' ),
                    ( isset( $_REQUEST['shop_type'] ) && $_REQUEST['shop_type'] == 'super' ? 'current' : '' ),
                    $super_cnt
                );
                $new_items['big'] = sprintf(
                    '<a href="%s" class="%s" aria-current="page">빅히트콜 <span class="count">(%d)</span></a>',
                    admin_url( 'edit.php?post_type=shop&shop_type=big' ),
                    ( isset( $_REQUEST['shop_type'] ) && $_REQUEST['shop_type'] == 'big' ? 'current' : '' ),
                    $big_cnt
                );
                $new_items['basic'] = sprintf(
                    '<a href="%s" class="%s" aria-current="page">일반샵 <span class="count">(%d)</span></a>',
                    admin_url( 'edit.php?post_type=shop&shop_type=basic' ),
                    ( isset( $_REQUEST['shop_type'] ) && $_REQUEST['shop_type'] == 'basic' ? 'current' : '' ),
                    $basic_cnt
                );
            }
        }

        return $new_items;
    }


    public function pre_get_posts( $query ) {
        global $pagenow;

        if ( 'edit.php' != $pagenow || ! $query->is_admin ) {
            return $query;
        }

        if ( isset( $_REQUEST['shop_type'] ) && ! empty( $_REQUEST['shop_type'] ) ) {
            $query->set( 'meta_query', array(
                array(
                    'key'       => 'shop_ad_type',
                    'value'     => $this->_esc_attr( $_REQUEST['shop_type'] ),
                    'compare'   => '='
                )
            ) );
        }
    }


    public function posts_where( $where, $query ) {
        global $wpdb;

        if ( is_admin() && $query->is_main_query() && isset( $query->query_vars['post_type'] ) && $this->_namespace == $query->query_vars['post_type'] ) {
            if ( isset( $query->query['s'] ) && ! empty( $query->query['s'] ) ) {
                $replace = "post_title LIKE $1 ) ";
                $replace .= "
                    OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_ad_tel_virtual' AND meta_value LIKE $1 ) )
                    OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_ad_tel_real' AND meta_value LIKE $1 ) )
                    OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_ad_user_phone' AND meta_value LIKE $1 ) )
                ";
                $where = preg_replace( "/post_title\s+LIKE\s*(\'[^\']+\')\s*\)/", $replace, $where );
            }

            if ( isset( $_REQUEST['jt_author'] ) ) {
                $where .= $wpdb->prepare( " AND ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_user' AND meta_value = %d ) ) ", intVal( $_REQUEST['jt_author'] ) );
            }
        }

        return $where;
    }


    public function create_taxonomy() {
        $namespace = $this->_namespace;
        $name      = $this->_name;

        if ( 1 ) { // 링크 제거 버전
            register_taxonomy(
                $namespace . '_categories',
                $namespace,
                array(
                    'public'            => false,
                    'hierarchical'      => true,
                    'label'             => '샵 카테고리',
                    'rewrite'           => false, //array( 'slug' => $name . '-카테고리' ),
                    'query_var'         => true,
                    'show_ui'           => true,
                    'show_in_rest'      => true,
                    'show_admin_column' => true,
                    'show_in_nav_menus' => true,
                )
            );

            register_taxonomy(
                $namespace . '_area',
                $namespace,
                array(
                    'public'            => false,
                    'hierarchical'      => true,
                    'label'             => '지역 카테고리',
                    'rewrite'           => false, //array( 'slug' => $name . '-지역별' ),
                    'query_var'         => true,
                    'show_ui'           => true,
                    'show_in_rest'      => true,
                    'show_admin_column' => true,
                    'show_in_nav_menus' => true,
                    'meta_box_cb'       => array( $this, 'area_taxonomy_metabox' ),
                )
            );

            register_taxonomy(
                $namespace . '_tag',
                $namespace,
                array(
                    'public'            => false,
                    'hierarchical'      => false,
                    'label'             => '태그',
                    'rewrite'           => false, // array( 'slug' => '태그' ),
                    'query_var'         => true,
                    'show_ui'           => true,
                    'show_in_rest'      => true,
                    'show_admin_column' => true,
                    'show_in_nav_menus' => true,
                )
            );
        } else {
            register_taxonomy(
                $namespace . '_categories',
                $namespace,
                array(
                    'hierarchical'      => true,
                    'label'             => '샵 카테고리',
                    'query_var'         => true,
                    'show_in_rest'      => true,
                    'rewrite'           => array( 'slug' => $name . '-카테고리' ),
                    'show_admin_column' => true,
                    'public'            => true,
                )
            );

            register_taxonomy(
                $namespace . '_area',
                $namespace,
                array(
                    'hierarchical'      => true,
                    'label'             => '지역 카테고리',
                    'query_var'         => true,
                    'show_in_rest'      => true,
                    'rewrite'           => array( 'slug' => $name . '-지역별' ),
                    'show_admin_column' => true,
                    'public'            => true,
                    'meta_box_cb'       => array( $this, 'area_taxonomy_metabox' ),
                )
            );

            register_taxonomy(
                $namespace . '_tag',
                $namespace,
                array(
                    'hierarchical'      => false,
                    'label'             => '태그',
                    'rewrite'           => array( 'slug' => '태그' ),
                    'query_var'         => true,
                    'public'            => true,
                )
            );
        }
    }


    public function area_taxonomy_metabox( $post, $box ) {
        extract( wp_parse_args( ( ! isset( $box[ 'args' ] ) || ! is_array( $box[ 'args' ] ) ? array() : $box['args'] ), array( 'taxonomy' => $this->_namespace . '_area' ) ), EXTR_SKIP );
        $tax        = get_taxonomy( $taxonomy );
        $name       = ( $taxonomy == 'category' ) ? 'post_category' : 'tax_input[' . $taxonomy . ']';
        $term_obj   = wp_get_object_terms( $post->ID, $taxonomy );

        // echo '<script>console.log( ' . json_encode( $term_obj ) . ' );</script>';
        ?>

        <div id="taxonomy-<?php echo $taxonomy; ?>" class="categorydiv">
            <label for="<?php echo $taxonomy; ?>-0depth">시도</label>
            <?php
                wp_dropdown_categories( array(
                    'taxonomy'          => $taxonomy,
                    'hide_empty'        => 0,
                    'parent'            => 0,
                    'id'                => $taxonomy . '-0depth',
                    'name'              => "{$name}[0]",
                    'selected'          => ( isset( $term_obj[ 0 ]->term_id ) ? $term_obj[ 0 ]->term_id : 0 ),
                    'orderby'           => 'name',
                    'hierarchical'      => 0,
                    'show_option_none'  => '&mdash;',
                    'option_none_value' => '',
                    'class'             => 'widefat',
                    'required'          => true,
                ) );
            ?>
            <br />
            <br />

            <label for="<?php echo $taxonomy; ?>-1depth">시군구</label>
            <?php
                wp_dropdown_categories( array(
                    'taxonomy'          => $taxonomy,
                    'hide_empty'        => 0,
                    'parent'            => ( isset( $term_obj[ 0 ]->term_id ) ? $term_obj[ 0 ]->term_id : -1 ),
                    'id'                => $taxonomy . '-1depth',
                    'name'              => "{$name}[1]",
                    'selected'          => ( isset( $term_obj[ 1 ]->term_id ) ? $term_obj[ 1 ]->term_id : 0 ),
                    'orderby'           => 'name',
                    'hierarchical'      => 0,
                    'show_option_none'  => '&mdash;',
                    'option_none_value' => '',
                    'class'             => 'widefat',
                    'required'          => true,
                ) );
            ?>
        </div>
        <script>
            jQuery( function ( $ ) {

                $( 'select[name*="<?php echo $name; ?>"]' ).on( 'change', function () {
                    var $list   = $( 'select[name*="<?php echo $name; ?>"]' );
                    var $this   = $( this );
                    var idx     = $list.index( $this );

                    if ( $this.val() > 0 ) {
                        if ( $list.length > idx + 1 ) {
                            $list.eq( idx + 1 ).find( 'option:not(:first)' ).remove();
                            $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'get_area_category', term_id: $this.val() }, function ( res ) {
                                if ( res.success ) {
                                    $.each( res.data, function ( res_idx, res_item ) {
                                        $list.eq( idx + 1 ).append( $( '<option />', { value: res_item.term_id, text: res_item.name } ) );
                                    } );
                                }
                            } );
                        }
                    } else {
                        for ( var i = idx + 1; i < $list.length; i++ ) {
                            $list.eq( i ).find( 'option:not(:first)' ).remove();
                        }
                    }
                } );
            } );
        </script>
        <?php

    }

    public function rest_api_init() {
        parent::rest_api_init();

        register_rest_route(
            $this->_rest_config['base'],
            '/modules/' . $this->_namespace . '/status/toggle',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'toggle_status' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_rest_config['base'],
            '/modules/' . $this->_namespace . '/status/toggleAll',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'toggle_status_all' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_rest_config['base'],
            '/modules/' . $this->_namespace . '/zzim/toggle/',
            array(
                array(
                    'methods'               => WP_REST_Server::CREATABLE,
                    'callback'              => array( $this, 'toggle_zzim' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_rest_config['base'],
            '/modules/' . $this->_namespace . '/zzim/list/',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_zzim' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );

        register_rest_route(
            $this->_rest_config['base'],
            '/modules/' . $this->_namespace . '/seo/',
            array(
                array(
                    'methods'               => WP_REST_Server::READABLE,
                    'callback'              => array( $this, 'get_seo' ),
                    'permission_callback'   => '__return_true',
                ),
            )
        );
    }


    public function get_seo( WP_REST_Request $request ) {
        $category = get_term_by( 'slug', urlencode( $request->get_param( 'category' ) ), $this->_namespace . '_categories' );
        $area = get_term_by( 'slug', urlencode( $request->get_param( 'area' ) ), $this->_namespace . '_area' );

        if ( $area && $area->parent ) {
            $area->parentInfo = get_term( $area->parent );
        }

        $count = new WP_Query(array(
            'post_type' => $this->_namespace,
            'posts_per_page' => 6,
            'paged' => 1,
            'tax_query' => array(
                array(
                    'taxonomy' => $this->_namespace . '_categories',
                    'field' => 'slug',
                    'terms' => urlencode($request->get_param('category')),
                ),
                array(
                    'taxonomy' => $this->_namespace . '_area',
                    'field' => 'slug',
                    'terms' => urlencode($request->get_param('area')),
                ),
            ),
        ));

        return new WP_REST_Response( array(
            'category'  => $category,
            'area'      => $area,
            'posts'     => $count->posts,
            'count'     => $count->found_posts,
        ) );
    }


    public function get_list( WP_REST_Request $request ) {
        global $wpdb;

        try {
            $now_date = date_i18n( 'Y-m-d H:i:s' );
            $paged = max( intVal( $request->get_param( 'paged' ) ), 1 );
            $rpp = intVal( intVal( $request->get_param( 'rpp' ) ) > 0 ? $request->get_param( 'rpp' ) : get_option( 'posts_per_page' ) );
            $location = array( 'lat' => ( $request->get_param( 'lat' ) ?: '' ), 'lng' => ( $request->get_param( 'lng' ) ?: '' ) );
            $area = urlencode( urldecode( $request->get_param( 'area' ) ) );
            $start = ( $paged - 1 ) * $rpp;
            $where = array();
            $order = array();
            $groupby = ' ad_type, post_id ';
            $having = '';

            $result = array( 'total_posts' => 0, 'total_pages' => 0, 'posts' => array(), );

            // WHERE
            if ($_SERVER['SERVER_NAME'] != 'moongchigo.com' && !empty($request->get_param('search'))) {
                // 임시로 지역/위치 기반 검색 제거
            } elseif ( $area && $area !== 'false' ) {
                $where[] = $wpdb->prepare(
                    "   post_id IN (
                            SELECT {$wpdb->term_relationships}.object_id
                            FROM {$wpdb->terms}
                                INNER JOIN {$wpdb->term_taxonomy} ON {$wpdb->term_taxonomy}.term_id = {$wpdb->terms}.term_id
                                INNER JOIN {$wpdb->term_relationships} ON {$wpdb->term_relationships}.term_taxonomy_id = {$wpdb->terms}.term_id
                            WHERE 1=1
                                AND {$wpdb->term_taxonomy}.taxonomy = %s
                                AND ( {$wpdb->terms}.slug = %s OR {$wpdb->terms}.term_id = %s )
                        )
                    ",
                    $this->_namespace . '_area',
                    esc_attr( $area ),
                    esc_attr( $area )
                );
            } elseif ( isset( $location['lat'] ) && floatVal( $location['lat'] ) > 0 && isset( $location['lng'] ) && floatVal( $location['lng'] ) > 0 ) {
                $where[] = $wpdb->prepare(
                    " CAST( GET_DISTANCE( %f, %f, lat, lng ) AS DECIMAL( 10, 8 ) ) BETWEEN 0 AND {$this->_distance} ",
                    $location['lat'],
                    $location['lng']
                );
            } else if ( empty( $request->get_param( 'search' ) ) ) {
                // $where[] = ' 1=0 ';
            }

            if ( ! empty( $request->get_param( 'category' ) ) || empty( $request->get_param( 'search' ) ) ) {
                $tmp_cate = urlencode( urldecode( $request->get_param( 'category' ) ) );

                if ( empty( $tmp_cate ) ) {
                    $tmp_terms = get_terms( $this->_namespace . '_categories', array( 'hide_empty' => false ) );

                    if ( ! empty( $tmp_terms ) ) {
                        $tmp_cate = $tmp_terms[0]->slug;
                    }
                }

                if ( ! empty( $tmp_cate ) ) {
                    $where[] = $wpdb->prepare(
                        "   post_id IN (
                                SELECT {$wpdb->term_relationships}.object_id
                                FROM {$wpdb->terms}
                                    INNER JOIN {$wpdb->term_taxonomy} ON {$wpdb->term_taxonomy}.term_id = {$wpdb->terms}.term_id
                                    INNER JOIN {$wpdb->term_relationships} ON {$wpdb->term_relationships}.term_taxonomy_id = {$wpdb->terms}.term_id
                                WHERE 1=1
                                    AND {$wpdb->term_taxonomy}.taxonomy = %s
                                    AND {$wpdb->terms}.slug = %s
                            )
                        ",
                        $this->_namespace . '_categories',
                        esc_attr( $tmp_cate )
                    );
                }
            }

            if ( is_array( $request->get_param( 'filter' ) ) && ! empty( $request->get_param( 'filter' ) ) ) {
                if ( in_array( 'photo', $request->get_param( 'filter' ) ) ) {
                    $where[] = " ad_type IN ( 'super', 'big' ) ";
                    $where[] = " post_id IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_basic_gallery' AND meta_value IS NOT NULL AND meta_value <> '' ) ";
                }

                if ( in_array( 'card', $request->get_param( 'filter' ) ) ) {
                    $where[] = " post_id IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_ad_card' AND meta_value = 1 ) ";
                }

                if (in_array('event', $request->get_param('filter'))) {
                    $where[] = " post_id IN (SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_review_event' AND meta_value = 1) ";
                }

                $groupby = ' post_id ';
            }

            if ( ! empty( $request->get_param( 'search' ) ) ) {
                $param_search = trim( esc_attr( $request->get_param( 'search' ) ) );

                // 샵카테고리, 지역 카테고리, #우리샵은이래요 AND 처리
                // $term_ids = get_terms(array('name__like' => $param_search, 'fields' => 'ids'));

                // print_r(str_replace(' ', '%', $param_search)); exit;

                // 샵카테고리, 지역 카테고리, #우리샵은이래요 OR 처리
                // $term_ids = array();
                // foreach (explode(' ', $params_search) as $s) {
                //     $tmp_ids = get_terms(array( 'name__like' => $s, 'fields' => 'ids'));
                //     if (!empty($tmp_ids)) {
                //         $term_ids = array_merge($term_ids, $tmp_ids);
                //     }
                // }

                // 띄어쓰기로 분할해서 모두 포함된 아이만
                // $term_ids = array_column($wpdb->get_results($wpdb->prepare(" SELECT term_id FROM {$wpdb->terms} WHERE name LIKE %s ", '%' . str_replace(' ', '%', $param_search) . '%')), 'term_id');
                $term_ids = array();
                foreach (explode(' ', $param_search) as $search_key) {
                    $tmp_result = array_unique(get_terms(array('name__like' => $search_key, 'fields' => 'ids')));
                    $term_ids = array_merge($term_ids, $tmp_result);
                }
                if (!empty($term_ids)) {
                    $term_ids = array_keys(array_filter(array_count_values($term_ids), function ($item) {
                        return $item > 1;
                    }));
                }
                $term_ids = empty($term_ids) ? array(0) : $term_ids;

                $tmp_sql = [];
                foreach (explode(' ', trim($param_search)) as $search_key) {
                    if (empty(trim($search_key))) {
                        continue;
                    }

                    $tmp_search = '%' . htmlspecialchars_decode($search_key) . '%';
                    $tmp_sql[] = $wpdb->prepare(
                        "(
                            post_id IN (
                                SELECT ID
                                FROM {$wpdb->posts}
                                WHERE 1=1
                                    AND post_type = %s
                                    AND post_status = 'publish'
                                    AND (
                                        post_title LIKE %s
                                        OR post_content LIKE %s
                                        OR post_excerpt LIKE %s
                                        OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_basic_address' AND meta_value LIKE %s ) )
                                        OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_basic_loc_one_line' AND meta_value LIKE %s ) )
                                        OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_menu_%' AND meta_value LIKE %s ) )
                                        OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_info_%' AND meta_value LIKE %s ) )

                                    )
                            )
                        )",
                        $this->_namespace,
                        $tmp_search,
                        $tmp_search,
                        $tmp_search,
                        $tmp_search,
                        $tmp_search,
                        $tmp_search,
                        $tmp_search,
                        $tmp_search
                    );
                }
                if (!empty($tmp_sql)) {
                    $where[] = "(
                        (" . implode(' AND ', $tmp_sql) . ")
                        OR post_id IN (
                            SELECT object_id FROM {$wpdb->term_relationships} WHERE term_taxonomy_id IN ( " . implode( ',', $term_ids ) . " )
                        )
                    )";
                } else {
                    $where[] = "(post_id IN (
                        SELECT object_id FROM {$wpdb->term_relationships} WHERE term_taxonomy_id IN ( " . implode( ',', $term_ids ) . " )
                    ))";
                }

                // $tmp_search = '%' . htmlspecialchars_decode($param_search) . '%';
                // $where[] = $wpdb->prepare(
                //     " (
                //         post_id IN (
                //             SELECT ID
                //             FROM {$wpdb->posts}
                //             WHERE 1=1
                //                 AND post_type = %s
                //                 AND post_status = 'publish'
                //                 AND (
                //                     post_title LIKE %s
                //                     OR post_content LIKE %s
                //                     OR post_excerpt LIKE %s
                //                     OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_basic_address' AND meta_value LIKE %s ) )
                //                     OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_basic_loc_one_line' AND meta_value LIKE %s ) )
                //                     OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_menu_%' AND meta_value LIKE %s ) )
                //                     OR ( {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key LIKE 'shop_info_%' AND meta_value LIKE %s ) )

                //                 )
                //         )
                //         OR post_id IN (
                //             SELECT object_id FROM {$wpdb->term_relationships} WHERE term_taxonomy_id IN ( " . implode( ',', $term_ids ) . " )
                //         )
                //     )
                //     ",
                //     $this->_namespace,
                //     $tmp_search,
                //     $tmp_search,
                //     $tmp_search,
                //     $tmp_search,
                //     $tmp_search,
                //     $tmp_search,
                //     $tmp_search,
                //     $tmp_search
                // );

                $groupby = ' post_id ';
            }

            // ORDER
            if ( ! empty( $request->get_param( 'order' ) ) ) {
                // $order[] = " ( CASE WHEN ad_type = 'super' THEN 0 WHEN ad_type = 'big' THEN 0 ELSE 2 END ) ASC ";

                if ( $request->get_param( 'order' ) == 'rating' ) {
                    $order[] = " (
                        SELECT ROUND( AVG( score ), 1 )
                        FROM {$wpdb->prefix}jt_review
                            INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$wpdb->prefix}jt_review.user_id
                        WHERE
                            post_id = t.post_id
                            AND status = 'Y'
                            AND revision = 0
                    ) DESC ";
                }

                if ( $request->get_param( 'order' ) == 'review' ) {
                    $order[] = " (
                        SELECT COUNT( uid )
                        FROM {$wpdb->prefix}jt_review
                            INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$wpdb->prefix}jt_review.user_id
                        WHERE
                            post_id = t.post_id
                            AND status = 'Y'
                            AND revision = 0
                    ) DESC ";
                }
                $order[] = " ( CASE WHEN ad_type = 'super' THEN 0 WHEN ad_type = 'big' THEN 1 ELSE 2 END ) ASC ";

                $groupby = ' post_id ';
            } else if ( isset( $location['lat'] ) && floatVal( $location['lat'] ) > 0 && isset( $location['lng'] ) && floatVal( $location['lng'] ) > 0 ) {
                $order[] = $wpdb->prepare( " CAST( GET_DISTANCE( %f, %f, lat, lng ) AS DECIMAL( 10, 8 ) ) ASC ", $location['lat'], $location['lng'] );
                $order[] = " ( CASE WHEN ad_type = 'super' THEN 0 WHEN ad_type = 'big' THEN 1 ELSE 2 END ) ASC ";
            } else {
                $order[] = " ( CASE WHEN ad_type = 'super' THEN 0 WHEN ad_type = 'big' THEN 1 ELSE 2 END ) ASC ";
            }

            if (
                empty( $request->get_param( 'search' ) ) &&
                $area &&
                $area !== 'false' &&
                empty( $request->get_param( 'filter' ) ) &&
                empty( $request->get_param( 'order' ) )
            ) {
                $order[] = " end_date DESC ";
                // $order[] = " ( CASE WHEN origin_type = 'super' THEN 0 WHEN origin_type = 'big' THEN 1 ELSE 2 END ) ASC ";
            } else {
                // $order[] = " ( CASE WHEN origin_type = 'super' THEN 0 WHEN origin_type = 'big' THEN 1 ELSE 2 END ) ASC ";
                $order[] = " end_date DESC ";
            }


            $order[] = " post_date DESC ";

            $str_where = ( ! empty( $where ) ? ' AND ' . implode( ' AND ', $where ) : '' );
            $str_order = implode( ', ', $order );

            $sql = "    SELECT SQL_CALC_FOUND_ROWS post_id, ad_type, origin_type, post_date, start_date, end_date, lat, lng
                        FROM {$this->_search_table} AS t
                        WHERE 1=1
                            AND '{$now_date}' BETWEEN t.start_date AND t.end_date
                            {$str_where}
                        GROUP BY {$groupby}
                        {$having}
                        ORDER BY {$str_order}
                        LIMIT {$start}, {$rpp}
            ";

            $res = $wpdb->get_results( $sql, ARRAY_A );
            $founds = intVal( $wpdb->get_var( " SELECT FOUND_ROWS() " ) );

            if ( ! empty( $res ) && $founds > 0 ) {
                foreach ( $res as $item ) {
                    $tmp_post = $this->_get_post_data( $item['post_id'] );

                    if ( $tmp_post ) {
                        $tmp_post['type'] = $item['ad_type'];
                        $tmp_post['basic']['distance'] = $this->_get_distance( $item['post_id'], $location );
                        $posts[] = $tmp_post;
                    }
                }

                $result = array(
                    'total_posts'   => $founds,
                    'total_pages'   => ceil( $founds / $rpp ),
                    'posts'         => $posts,
                );

                if ( $result['total_pages'] > 1 ) {
                    $base_url = add_query_arg(
                        urlencode_deep( $request->get_query_params() ),
                        rest_url( sprintf( '%s/modules/%s', $this->_rest_config['base'], $this->_namespace ) )
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

            if (in_array($_SERVER['REMOTE_ADDR'], array('59.20.140.229', '13.125.170.97', '::1', '127.0.0.1'))) {
                $result['sql'] = $sql;
            }
        } catch ( Exception $e ) {
            return new WP_REST_Response( array( 'total_posts' => 0, 'total_pages' => 0, 'posts' => array() ), 200);
        }

        return new WP_REST_Response( $result, 200 );
    }


    public function get_item( WP_REST_Request $request ) {
        $post_id = $this->_get_post_id_from_request( $request );
        $preview_id = intVal( $request->get_param( 'preview_id' ) ?: 0 );
        $post = $this->_get_post_data( $post_id, true, $preview_id );
        $location = array( 'lat' => $request->get_param( 'lat' ), 'lng' => $request->get_param( 'lng' ) );

        if ( ! empty( $post ) ) {
            $start = get_field( 'shop_ad_period_start', $post_id );
            $end = get_field( 'shop_ad_period_end', $post_id );

            $start = intVal( $start ? date( 'YmdH', strtotime( $start . ' 00:00:00' ) ) : 0 );
            $end = intVal( $end ? date( 'YmdH', strtotime( $end . ' 11:00:00' ) ) : 0 );
            $now = intVal( date_i18n( 'YmdH' ) );

            if ( $start > 0 && $end > 0 && $now > $start && $now < $end ) {
                $post['basic']['distance'] = $this->_get_distance( $post_id, $location );

                return new WP_REST_Response( $post, 200 );
            }
        }

        return new WP_Error( 'empty', '데이터가 없습니다.', array( 'status' => 404 ) );
    }


    public function toggle_status( WP_REST_Request $request ) {
        $shop_id = intVal( $request->get_param( 'shop_id' ) );
        $status = ( $request->get_param( 'status' ) === 'Y' ? true : false );
        $user_id = get_current_user_id();
        $result = false;

        if ( $user_id ) {
            $shop = get_posts( array(
                'post_status'   => array( 'publish', 'private', 'pending' ),
                'post_type'     => $this->_namespace,
                'post__in'      => array( $shop_id ),
                'meta_key'      => 'shop_user',
                'meta_value'    => $user_id,
                'fields'        => 'ids',
            ) );

            if ( ! empty( $shop ) ) {
                foreach ( $shop as $shop_id ) {
                    $result = update_field( 'shop_ad_ready', $status == true ? '1' : '0', $shop_id );
                }
            }
        }

        return new WP_REST_Response( $result, 200 );
    }


    public function toggle_status_all( WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $status = ( $request->get_param( 'status' ) === 'Y' ? true : false );
        $result = false;

        if ( $user_id ) {
            $shop = get_posts( array(
                'post_type'         => $this->_namespace,
                'post_status'       => 'any',
                'meta_key'          => 'shop_user',
                'meta_value'        => $user_id,
                'fields'            => 'ids',
                'posts_per_page'    => -1,
            ) );

            if ( ! empty( $shop ) ) {
                global $wpdb;

                $wpdb->query( $wpdb->prepare(
                    " UPDATE {$wpdb->postmeta} SET meta_value = %s WHERE post_id IN ( " . implode( ',', $shop ) . " ) AND meta_key = 'shop_ad_ready' ",
                    $status ? '1' : '0'
                ) );
            }
        }

        return new WP_REST_Response( $result, 200 );
    }


    public function get_zzim( WP_REST_Request $request ) {
        global $wpdb;

        $user_id = get_current_user_id();
        $paged = max( intVal( $request->get_param( 'paged' ) ), 1 );
        $rpp = intVal( intVal( $request->get_param( 'rpp' ) ) > 0 ? $request->get_param( 'rpp' ) : get_option( 'posts_per_page' ) );
        $start = ( $paged - 1 ) * $rpp;
        $now_date = date_i18n( 'Y-m-d H:i:s' );

        $result = array( 'total_posts' => 0, 'total_pages' => 0, 'posts' => array(), );

        $sql = $wpdb->prepare(
            "   SELECT SQL_CALC_FOUND_ROWS {$wpdb->posts}.ID AS post_id
                FROM {$wpdb->posts}
                    INNER JOIN {$this->_zzim_table} ON {$this->_zzim_table}.shop_id = {$wpdb->posts}.ID
                    INNER JOIN {$wpdb->postmeta} ON {$wpdb->postmeta}.post_id = {$wpdb->posts}.ID AND {$wpdb->postmeta}.meta_key = 'shop_ad_type'
                WHERE 1=1
                    AND {$this->_zzim_table}.user_id = %d
                    AND {$wpdb->posts}.post_type = 'shop'
                    AND {$wpdb->posts}.post_status = 'publish'
                    AND {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_ad_period_start' AND %s >= CONCAT( meta_value, ' 11:00:00' ) )
                    AND {$wpdb->posts}.ID IN ( SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'shop_ad_period_end' AND %s < CONCAT( meta_value, ' 11:00:00' ) )
                GROUP BY {$wpdb->posts}.ID
                ORDER BY
                    -- ( CASE WHEN {$wpdb->postmeta}.meta_value = 'super' THEN 0 WHEN {$wpdb->postmeta}.meta_value = 'big' THEN 0 ELSE 1 END ) ASC,
                    {$this->_zzim_table}.created DESC
                LIMIT {$start}, {$rpp}
            ",
            $user_id,
            $now_date,
            $now_date
        );

        $res = $wpdb->get_results( $sql );
        $founds = intVal( $wpdb->get_var( " SELECT FOUND_ROWS() " ) );
        $posts = array();

        if ( $founds > 0 ) {
            foreach ( array_column( $res, 'post_id' ) as $post_id ) {
                $tmp_post = $this->_get_post_data( $post_id );
                $location = json_decode( $request->get_param( 'location' ), true );
                $tmp_post['basic']['distance'] = $this->_get_distance( $post_id, $location );

                $posts[] = $tmp_post;

            }

            $result = array(
                'total_posts'   => $founds,
                'total_pages'   => ceil( $founds / $rpp ),
                'posts'         => $posts,
            );

            if ( $result['total_pages'] > 1 ) {
                $base_url = add_query_arg(
                    urlencode_deep( $request->get_query_params() ),
                    rest_url( sprintf( '%s/modules/%s/zzim/list', $this->_rest_config['base'], $this->_namespace ) )
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

        if ($_SERVER['REMOTE_ADDR'] == '115.22.23.125') {
            $result['sql'] = $sql;
        }

        return new WP_REST_Response( $result );
    }


    public function toggle_zzim( WP_REST_Request $request ) {
        global $wpdb;

        $shop_id = intVal( $request->get_param( 'shop_id' ) );
        $user_id = get_current_user_id();

        if ( $user_id ) {
            $exists = $wpdb->get_var( $wpdb->prepare( " SELECT COUNT(*) FROM {$this->_zzim_table} WHERE shop_id = %d AND user_id = %d ", $shop_id, $user_id ) );

            if ( $exists > 0 ) {
                $wpdb->delete( "{$this->_zzim_table}", array(
                    'user_id'   => $user_id,
                    'shop_id'   => $shop_id,
                ) );
            } else {
                $wpdb->insert( "{$this->_zzim_table}", array(
                    'user_id'   => $user_id,
                    'shop_id'   => $shop_id,
                    'created'   => date_i18n( 'Y-m-d H:i:s' )
                ) );
            }
        }

        return new WP_REST_Response( $this->_get_zzim_info( $shop_id, $user_id ) );
    }



    protected function _get_post_data( $post_id = 0, $is_single = false ) {
        $post_id = intVal( $post_id );
        $post = get_post( $post_id );
        $result = null;

        if ( ! empty( $post ) ) {
            $shop_ad = get_field( 'shop_ad', $post->ID );
            $shop_basic = get_field( 'shop_basic', $post->ID );

            $area = get_the_terms( $post->ID, $this->_namespace . '_area' );
            if ( ! empty( $area ) ) {
                usort( $area, function ( $a1, $a2 ) {
                    return $a1->parent >= $a2->parent && $a1->term_id <= $a2->term_id;
                } );
            }

            $category = get_the_terms( $post->ID, $this->_namespace . '_categories' );

            $result = array(
                'id'        => intVal( $post->ID ),
                'slug'      => $post->post_name,
                'permalink' => str_replace( home_url(), '', get_permalink( $post ) ),
                'status'    => $post->post_status,
                'is_sticky' => is_sticky( $post->ID ),
                'author'    => intVal( $post->post_author ),
                'title'     => htmlspecialchars_decode( $post->post_title ),
                'thumbnail' => ( has_post_thumbnail( $post->ID ) ? get_the_post_thumbnail_url( $post ) : '' ),
                'type'      => get_field( 'shop_ad_type', $post->ID ),
                'area'      => ( ! empty( $area ) ? array_column( $area, 'name' ) : array() ),
                'date'      => $post->post_date,
                'modified'  => ( $post->post_modified ?: $post->post_date ),
                'category'  => ( ! empty( $category ) ? array_column( $category, 'name' ) : array() ),
                'basic'     => array(
                                'is_ready'  => $shop_ad['ready'],
                                'is_cert'   => $shop_ad['label'],
                                'use_bg'    => $shop_ad['bg'],
                                'desc'      => $shop_basic['loc_one_line'],
                                'event'     => array(
                                                'sale'      => get_field( 'shop_menu_event', $post->ID ),
                                                'review'    => get_field( 'shop_review_event', $post->ID ),
                                            ),
                                'review'    => $this->_get_review_info( $post->ID ),
                                'zzim'      => $this->_get_zzim_info( $post->ID ),
                                'price'     => $shop_basic['price'],
                                'map'       => array(
                                    'is_home'   => $shop_basic['home'],
                                    'address'   => $shop_basic['address'],
                                    'lat'       => $shop_basic['location']['lat'],
                                    'lng'       => $shop_basic['location']['lng'],
                                ),
                                'phone' => '+82' . substr(str_replace('-', '', $shop_ad['tel']['virtual']), 1),
                            ),
            );

            if ( $is_single ) {
                // ACF
                $shop_menu  = get_field( 'shop_menu', $post->ID );
                $shop_info = get_field( 'shop_info', $post->ID );
                $shop_review = get_field( 'shop_review', $post->ID );
                $shop_tags = get_the_terms( $post->ID, 'shop_tag' );
                $common_notice  = get_field( 'common_notice', 'option' );

                $sms_msg        = '뭉치고(moongchigo.com)를 통해 예약문의드립니다. %0A' . PHP_EOL;

                // SHOP BASIC
                $result['basic']['opening'] = ( $shop_basic['opening'] ?: false );
                $result['basic']['holiday'] = ( $shop_basic['holiday'] ?: false );
                $result['basic']['sms'] = array(
                    'use'   => ( $shop_ad['sms'] == true ),
                    'phone' => $shop_ad['tel']['virtual'],
                    'msg'   => '뭉치고(moongchigo.com)를 통해 예약문의드립니다. %0A',
                );
                $result['basic']['map'] = array(
                    'is_home'   => $shop_basic['home'],
                    'address'   => $shop_basic['address'],
                    'lat'       => $shop_basic['location']['lat'],
                    'lng'       => $shop_basic['location']['lng'],
                );
                $result['basic']['gallery'] = array();

                if ( is_array( $shop_basic['gallery'] ) && ! empty( $shop_basic['gallery'] ) ) {
                    foreach ( $shop_basic['gallery'] as $item ) {
                        $tmp_url = wp_get_attachment_image_url( $item, 'jt_shop_single_slide' );

                        if ( ! empty( $tmp_url ) ) {
                            $result['basic']['gallery'][] = $tmp_url;
                        }
                    }
                }

                $result['tabs'] = array(
                    'menu'      => array(
                                    'info'      => ( (in_array( $shop_ad['type'], array( 'super', 'big' ) ) || 1) && $shop_menu['info'] ? $shop_menu['info'] : false ),
                                    'keywords'  => ( is_array( $shop_tags ) && ! empty( $shop_tags ) ? array_column( $shop_tags, 'name' ) : false ),
                                    'course'    => ( is_array( $shop_menu['course'] ) && ! empty( $shop_menu['course'] ) ? $shop_menu['course'] : false ),
                                    'notice'    => ( is_array( $common_notice['shop'] ) && ! empty( $common_notice['shop'] ) ? $common_notice['shop'] : false ),
                                    'moong'     => ( is_array( $common_notice['moong'] ) && ! empty( $common_notice['moong'] ) ? $common_notice['moong'] : false ),
                                ),
                    'info'      => array(
                                    'intro'         => ( $shop_info['intro'] ?: false ),
                                    'member_intro'  => ( $shop_info['member_intro'] ?: false ),
                                    'member'        => ( $shop_info['member'] ?: false ),
                                    'location'      => ( $shop_info['location'] ?: false ),
                                    'company'       => array(
                                                        'name'  => ( $shop_info['company']['name'] ?: '-' ),
                                                        'code'  => ( $shop_info['company']['number'] ?: '-' ),
                                                    ),
                                ),
                    'review'    => array(
                                    'notice'    => ($shop_review['event'] ? $shop_review['notice'] : false ),
                                    'event'     => ($shop_review['event'] ?: false),
                                ),
                );
            }
        }

        return $result;
    }


    private function _get_distance( $post_id, $location ) {
        if ( $location['lat'] && $location['lng'] ) {
            if ( $location['lat'] > 0 && $location['lng'] > 0 ) {
                $shop = get_field( 'shop_basic_location', $post_id );

                if ( $shop['lat'] == $location['lat'] && $shop['lng'] == $location['lng' ] ) return '0km';

                $theta = $shop['lng'] - $location['lng'];
                $dist = rad2deg( acos( sin( deg2rad( $shop['lat'] ) ) * sin( deg2rad( $location['lat'] ) ) + cos( deg2rad( $shop['lat'] ) ) * cos( deg2rad( $location['lat'] ) ) * cos( deg2rad( $theta ) ) ) );
                $dist = $dist * 60 * 1.1515 * 1.609344;

                return ( $dist > 1000 ? '??' : sprintf( '%0.02fkm', $dist ) );
            }
        }

        return '';
    }


    private function _get_zzim_info( $shop_id, $user_id = 0 ) {
        global $wpdb;

        $user_id = ( $user_id > 0 ? $user_id : get_current_user_id() );
        $exists = ( $user_id > 0 ? intVal( $wpdb->get_var( $wpdb->prepare( " SELECT COUNT(*) FROM {$this->_zzim_table} WHERE shop_id = %d AND user_id = %d ", $shop_id, $user_id ) ) ) > 0 : false );
        $zzim_cnt = $wpdb->get_var( $wpdb->prepare(
            "   SELECT COUNT( * )
                FROM {$this->_zzim_table}
                    INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_zzim_table}.user_id
                WHERE 1=1
                    AND {$this->_zzim_table}.shop_id = %d
            "
            , $shop_id
        ) );

        if ( $zzim_cnt / 10 >= 100 ) {
            $zzim_cnt = '1000+';
        } else if ( $zzim_cnt > 100 ) {
            $zzim_cnt = sprintf( '%d+', floor( $zzim_cnt / 10 ) * 10 );
        }

        return array( 'is_zzim' => $exists, 'count' => $zzim_cnt );
    }


    public function admin_menu() {
        add_submenu_page(
            'edit.php?post_type=shop',
            '카테고리 순서 관리',
            '카테고리 순서 관리',
            'manage_options',
            'jt-shop-category-sort',
            array( $this, 'admin_category' ),
            10
        );
    }


    public function admin_category() {
        wp_enqueue_script('jquery');
        wp_enqueue_script('jquery-ui-sortable');

        include TEMPLATEPATH . '/modules/shop/admin_category.php';
    }


    private function _render_terms($category, $parent_id, $depth = 0, $shop_type = 'disabled') {
        $is_shop = ($category == 'shop_categories');
        $args = array(
            'taxonomy'      => $category,
            'hide_empty'    => false,
            'parent'        => $parent_id,
        );

        if ($is_shop) {
            if (in_array($shop_type, array('main', 'sub'))) {
                $args['meta_query'] = array(
                    array(
                        'key'   => '_shop_type',
                        'value' => $shop_type,
                    ),
                );
            } else {
                $args['meta_query'] = array(
                    'relation'  => 'OR',
                    array(
                        'key'       => '_shop_type',
                        'compare'   => 'NOT EXISTS',
                    ),
                    array(
                        'key'       => '_shop_type',
                        'compare'   => 'NOT IN',
                        'value'     => array('main', 'sub'),
                    ),
                );
            }
        }
        $terms = get_terms($args);
        ?>

        <?php if (is_array($terms) && count($terms) > 0 || ($is_shop && $depth == 0)): ?>
            <?php if ($is_shop && $depth == 0): ?>
                <h2><?php
                    if ($shop_type == 'main') {
                        echo 'Main Categories';
                    }  elseif ($shop_type == 'sub') {
                        echo 'Sub Categories';
                    } else {
                        echo 'Disabled Categories';
                    }
                ?></h2>
            <?php endif; ?>

            <ul class="<?php echo ($is_shop ? 'shop_sortable ' . $shop_type : 'sortable'); ?> <?php echo ($depth > 0 ? 'panel' : ''); ?>" data-depth="<?php echo $depth; ?>">
                <?php foreach ($terms as $idx => $term) : ?>
                    <li data-term="<?php echo $term->term_id; ?>">
                        <input type="hidden" name="category[<?php echo $term->term_id; ?>]" value="<?php echo $idx + 1; ?>" />
                        <span class="accordion active"><?php echo $term->name; ?></span>

                        <?php $this->_render_terms($category, $term->term_id, $depth + 1, $shop_type); ?>
                    </li>
                <?php endforeach; ?>

                <?php if ($is_shop): ?>
                    <input type="hidden" name="category[<?php echo $shop_type; ?>]" value="<?php echo implode(',', array_column($terms, 'term_id')); ?>" />
                <?php endif; ?>
            </ul>
        <?php endif; ?>

        <?php
    }


    private function update_category_sort( $data, $parent_id = 0, $depth = 0 ) {
        global $wpdb;

        $depth_num  = 100; // 뎁스별 허용 갯수
        $depth_max  = 3; // 최대 뎁스

        $terms      = get_terms( $data['cate'], array( 'hide_empty' => false, 'parent' => $parent_id, 'fields' => 'ids', 'include' => array_keys( $data ), 'orderby' => 'include' ) );

        if ( is_array( $terms ) && count( $terms ) > 0 ) {
            foreach ( $terms as $term_id ) {
                if ( isset( $data[ $term_id ] ) ) {
                    $parent_sort = ( $parent_id > 0 ? $wpdb->get_var( " SELECT term_order FROM {$wpdb->terms} WHERE term_id = {$parent_id} " ) : 0 );
                    $tmp_sort = intVal( $data[ $term_id ] ) * pow( $depth_num, $depth_max - $depth ) + $parent_sort;

                    $wpdb->update( $wpdb->terms, array( 'term_order' => $tmp_sort ), array( 'term_id' => $term_id ) );
                }

                $this->update_category_sort( $data, $term_id, $depth + 1 );
            }
        }
    }




    private function _get_review_info( $post_id ) {
        global $wpdb;

        $rank = $wpdb->get_var( $wpdb->prepare(
            "   SELECT ROUND( AVG( score ), 1 )
                FROM {$wpdb->prefix}jt_review
                    INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$wpdb->prefix}jt_review.user_id
                WHERE 1=1
                    AND post_id = %d
                    AND status = 'Y'
                    AND revision = 0
            ",
            $post_id
        ) );
        $cnt = $wpdb->get_var( $wpdb->prepare(
            "   SELECT COUNT( uid )
                FROM {$wpdb->prefix}jt_review
                    INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$wpdb->prefix}jt_review.user_id
                WHERE 1=1
                    AND post_id = %d
                    AND status = 'Y'
                    AND revision = 0
            ",
            $post_id
        ) );

        return array(
            'rank'  => sprintf( '%0.01f', $rank ),
            'cnt'   => ( $cnt > 10 ? ( $cnt < 1000 ? sprintf( '%d0+', floor( $cnt / 10 ) )  : '1000+' ) : $cnt ),
        );
    }


    private function _create_zzim_table() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $sql = " CREATE TABLE IF NOT EXISTS `{$this->_zzim_table}` (
            `user_id` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
            `shop_id` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
            `created` DATETIME NOT NULL,
            PRIMARY KEY (`user_id`, `shop_id`) USING BTREE,
            INDEX `shop_id` (`shop_id`) USING BTREE,
            INDEX `user_id` (`user_id`) USING BTREE
        )
        {$charset_collate}
        ; ";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        dbDelta( $sql );
    }

    private function _add_search_data( $post_id ) {
        global $wpdb;

        // 기존 등록된 데이터 삭제
        $wpdb->delete( $this->_search_table, array( 'post_id' => $post_id ) );

        if ( get_post_status( $post_id ) === 'publish' ) {
            $shop_ad = get_field( 'shop_ad', $post_id );
            $shop_basic = get_field( 'shop_basic', $post_id );

            $data = array(
                'post_id'       => $post_id,
                'ad_type'       => $shop_ad['type'],
                'origin_type'   => $shop_ad['type'],
                'post_date'     => get_post_field( 'post_date', $post_id ),
                'start_date'    => date( 'Y-m-d H:i:s', strtotime( $shop_ad['period']['start'] . ' 11:00:00' ) ),
                'end_date'      => date( 'Y-m-d H:i:s', strtotime( $shop_ad['period']['end'] . ' 10:59:59' ) ),
                'lat'           => sprintf( '%.8f', $shop_basic['location']['lat'] ),
                'lng'           => sprintf( '%.8f', $shop_basic['location']['lng'] ),
            );

            $wpdb->insert( $this->_search_table, $data );

            if ( $shop_ad['type'] === 'super' ) {
                $data['ad_type'] = 'big';
                $wpdb->insert( $this->_search_table, $data );
            }
        }
    }

    private function _create_search_table() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $sql = " CREATE TABLE IF NOT EXISTS `{$this->_search_table}` (
            `post_id` BIGINT(20) UNSIGNED NOT NULL,
            `ad_type` VARCHAR(50) NOT NULL COLLATE 'utf8_general_ci',
            `origin_type` VARCHAR(50) NOT NULL COLLATE 'utf8_general_ci',
            `post_date` DATETIME NOT NULL,
            `start_date` DATETIME NOT NULL,
            `end_date` DATETIME NOT NULL,
            `lat` VARCHAR(50) NOT NULL COLLATE 'utf8_general_ci',
            `lng` VARCHAR(50) NOT NULL COLLATE 'utf8_general_ci',
            PRIMARY KEY (`post_id`, `ad_type`) USING BTREE
        )
        {$charset_collate}
        ; ";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        dbDelta( $sql );
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
