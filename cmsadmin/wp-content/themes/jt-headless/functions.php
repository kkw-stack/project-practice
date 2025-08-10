<?php
header( 'Access-Control-Allow-Origin: *' );

define( 'JT_REST_BASE', 'jt/v1' );

add_theme_support( 'post-thumbnails' );

add_image_size( 'jt_admin_thumbnail', 500 );

function jt_get_client_ip() {
    if (getenv('HTTP_CLIENT_IP')) {
        return getenv('HTTP_CLIENT_IP');
    } else if (getenv('HTTP_X_FORWARDED_FOR')) {
        return getenv('HTTP_X_FORWARDED_FOR');
    } else if (getenv('HTTP_X_FORWARDED')) {
        return getenv('HTTP_X_FORWARDED');
    } else if (getenv('HTTP_FORWARDED_FOR')) {
        return getenv('HTTP_FORWARDED_FOR');
    } else if (getenv('HTTP_FORWARDED')) {
        return getenv('HTTP_FORWARDED');
    } else if (getenv('REMOTE_ADDR')) {
        return getenv('REMOTE_ADDR');
    }

    return '알수없음';
}


require_once locate_template( '/lib/browser.class.php' );

// Functions
require_once locate_template( '/functions/admin.php' );
require_once locate_template( '/functions/blocks.php' );
require_once locate_template( '/functions/kakao.php' );

// Classes
require_once locate_template( '/classes/JT_Memeber.class.php' ); // Menu
require_once locate_template( '/classes/JT_Main.class.php' ); // Main
require_once locate_template( '/classes/JT_SideBar.class.php' ); // SideBar
require_once locate_template( '/classes/JT_SitemapGenerator.class.php' ); // sitemap.xml Generator

// MODULES
require_once locate_template( '/modules/JT_Module.class.php' );
require_once locate_template( '/modules/shop/index.php' ); // shop type
require_once locate_template( '/modules/review/index.php' ); // review type
require_once locate_template( '/modules/modify/index.php' ); // modify type

require_once locate_template( '/modules/notice/index.php' ); // notice type
require_once locate_template( '/modules/event/index.php' ); // event type
require_once locate_template( '/modules/inquiry/index.php' ); // inquiry type
require_once locate_template( '/modules/partnership/index.php' ); // partnership type
require_once locate_template( '/modules/blog/index.php' ); // blog type
require_once locate_template( '/modules/sitemap/index.php' ); // blog type
require_once locate_template( '/modules/sitemap-metro/index.php' ); // blog type

add_filter( 'acf_jt_daum_api_key', function () { return '530b7b7cd7f7c74f7ec61d894e4ce5f9'; } );

function jt_custom_upload_mimes ( $existing_mimes = array() ) {
    $existing_mimes['hwp'] = 'application/x-hwp';
    $existing_mimes['egg'] = 'application/alzip';
    $existing_mimes['svg'] = 'image/svg+xml';

    return $existing_mimes;
}
add_filter('upload_mimes', 'jt_custom_upload_mimes', 99999999 );


function jt_admin_pagination_html( $paged, $cnt, $rpp, $admin_url, $is_top = false ) {
    ?>
    <div class="tablenav-pages">
        <span class="displaying-num"><?php echo $cnt; ?> 항목</span>

        <?php if ( $cnt > $rpp ) : ?>
            <span class="pagination-links">
                <?php if ( $paged > 1 ) : ?>
                    <a class="first-page button" href="<?php echo $admin_url; ?>">
                        <span class="screen-reader-text">첫 페이지</span>
                        <span aria-hidden="true">«</span>
                    </a>
                    <a class="prev-page button" href="<?php echo add_query_arg( 'paged', $paged - 1, $admin_url ); ?>">
                        <span class="screen-reader-text">이전 페이지</span>
                        <span aria-hidden="true">‹</span>
                    </a>
                <?php else : ?>
                    <span class="tablenav-pages-navspan button disabled" aria-hidden="true">«</span>
                    <span class="tablenav-pages-navspan button disabled" aria-hidden="true">‹</span>
                <?php endif; ?>

                <span class="paging-input">
                    <span class="total-pages"><?php echo ceil( $cnt / $rpp ); ?></span> 중
                    <label for="current-page-selector" class="screen-reader-text">현재 페이지</label>
                    <?php if ( $is_top ) : ?>
                        <input class="current-page" id="current-page-selector" type="text" name="paged" value="<?php echo $paged; ?>" size="<?php echo strlen( ceil( $cnt / $rpp ) ); ?>" aria-describedby="table-paging" />
                    <?php else : ?>
                        <?php echo $paged; ?>
                    <?php endif; ?>
                    <span class="tablenav-paging-text"></span>
                </span>

                <?php if ( ceil( $cnt / $rpp ) > $paged ) : ?>
                    <a class="next-page button" href="<?php echo add_query_arg( 'paged', $paged + 1, $admin_url ); ?>">
                        <span class="screen-reader-text">다음 페이지</span>
                        <span aria-hidden="true">›</span>
                    </a>
                    <a class="last-page button" href="<?php echo add_query_arg( 'paged', ceil( $cnt / $rpp ), $admin_url ); ?>">
                        <span class="screen-reader-text">마지막 페이지</span>
                        <span aria-hidden="true">»</span>
                    </a>
                <?php else : ?>
                    <span class="tablenav-pages-navspan button disabled" aria-hidden="true">›</span>
                    <span class="tablenav-pages-navspan button disabled" aria-hidden="true">»</span>
                <?php endif; ?>
            </span>
        <?php endif; ?>
    </div>
    <?php
}


// Permalink 의 cmsadmin Prefix 제거
function jt_permalink_removePrefix( $permalink ) {
    return str_replace( $_SERVER['HTTP_HOST'] . '/cmsadmin', $_SERVER['HTTP_HOST'], $permalink );
}
add_filter( 'post_type_link', 'jt_permalink_removePrefix', 999999 );

// Next.js 의 로그인 페이지로 리다이렉트
function jt_prevent_wp_login() {
    global $pagenow;

    if ( ! in_array( jt_get_client_ip(), array( '::1', '127.0.0.1', '115.22.23.125', '13.125.170.97' ) ) ) {
        $action = ( isset( $_GET['action'] ) ? $_GET['action'] : '' );

        if (
            $pagenow == 'wp-login.php' &&
            (
                ! $action ||
                ( $action && ! in_array( $action, array( 'logout', 'lostpassword', 'rp', 'resetpass' ) ) )
            )
        ) {
            wp_redirect( '/로그인?redirect=/cmsadmin/admin' );
            exit();
        }
    }
}
// add_action('init', 'jt_prevent_wp_login');


function jt_redirect_404_user_not_admin() {
    if ( ! current_user_can( 'edit_posts' ) ) {
        global $wp_query;

        $wp_query->set_404();
        status_header( 404 );
        get_template_part( 404 );
        exit;
    }
}
add_action( 'admin_init', 'jt_redirect_404_user_not_admin' );

add_filter( 'flush_rewrite_rules_hard', '__return_false' );

function jt_admin_enqueue_scripts() {
    wp_enqueue_style( 'jt-admin', get_template_directory_uri() . '/css/admin.css', array(), '1.0.1' );
    wp_enqueue_script( 'jt-acf-date-picker-custom-js', get_template_directory_uri() . '/js/admin-acf.js', array( 'jquery' ), '1.0.1', true );
}
add_action( 'admin_enqueue_scripts', 'jt_admin_enqueue_scripts' );

/*
classes/JT_SitemapGenerator.class.php 로 이관
next.js 에서 ssr 렌더링 및 REST API 로 실시간 데이터 조회로 변경
function jt_update_sitemap($options = array()) {
    global $wpdb;

    $home_url = rtrim(str_replace('/cmsadmin', '', home_url()), '/');
    $current_date_format = date('c');

    $sitemap_paths = array();

    // base site map
    $sitemap_base_filename = $_SERVER['DOCUMENT_ROOT'] . '/public/sitemap-base.xml';
    if (!file_exists($sitemap_base_filename) || isset($options['forced_update_base']) == true) {
        _generate_sitemap($sitemap_base_filename, array(
            array( 'url' => $home_url, 'created' => $current_date_format ),
            // array( 'url' => $home_url . '/위치설정/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/검색/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/회사소개/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/공지사항/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/이벤트/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/뭉치고-블로그/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/문의하기/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/제휴문의/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/제휴문의/계산기/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/제휴문의/신청/', 'created' => $current_date_format ),
            array( 'url' => $home_url . '/로그인/', 'created' => $current_date_format ),
        ));
    }
    $sitemap_paths[] = $sitemap_base_filename;

    // shop single page site map
    // 샵
    // '/샵/:slug',
    // '/샵/:slug/amp',
    // '/샵/:slug/모두보기',
    $sitemap_shop_filename = $_SERVER['DOCUMENT_ROOT'] . '/public/sitemap-shop.xml';
    $shop_ids = array_column( $wpdb->get_results( $wpdb->prepare(
        "   SELECT post_id
            FROM {$wpdb->prefix}search_shop
            WHERE 1=1
                AND %s BETWEEN start_date AND end_date
            ORDER BY
                post_id ASC
        ",
        date_i18n( 'Y-m-d H:i:s' )
    ), ARRAY_A ), 'post_id' );
    $shop_data = array();

    foreach ($shop_ids as $post_id) {
        $tmp_shop = get_post($post_id);
        if (get_post_status($post_id) == 'publish' ) {
            $tmp_url = rtrim(get_permalink($post_id), '/');

            if (strpos($tmp_url, '?') === false) {
                $shop_data[] = array(
                    'url'       => $tmp_url . '/',
                    'created'   => get_the_modified_date('c', $post_id),
                );
            }
        }
    }
    _generate_sitemap($sitemap_shop_filename, $shop_data);
    $sitemap_paths[] = $sitemap_shop_filename;


    // 공지사항, 이벤트, 블로그
    // '/공지사항/:slug',
    // '/공지사항/:slug/amp',
    // '/이벤트/:slug',
    // '/이벤트/:slug/amp',
    // '/뭉치고-블로그/:slug',
    // '/뭉치고-블로그/:slug/amp',
    foreach (array('notice', 'event', 'blog') as $type) {
        $tmp_data = array();
        $post_ids = get_posts( array(
            'post_type'         => $type,
            'post_status'       => 'publish',
            'posts_per_page'    => -1,
            'fields'            => 'ids',
        ) );

        foreach ( $post_ids as $post_id ) {
            $tmp_url = rtrim(get_permalink($post_id), '/');

            if ( strpos( $tmp_url, '?' ) === false ) {
                $tmp_data[] = array(
                    'url'   => $tmp_url . '/',
                    'created'   => get_the_modified_date('c', $post_id)
                );
            }
        }

        $tmp_sitemap_filename = $_SERVER['DOCUMENT_ROOT'] . '/public/sitemap-' . $type . '.xml';
        _generate_sitemap($tmp_sitemap_filename, $tmp_data);
        $sitemap_paths[] = $tmp_sitemap_filename;
    }


    // 지역별 카테고리 리스트
    // '/지역기반/:area',
    // '/지역기반/:area/:category',
    $sitemap_shop_list_filename = $_SERVER['DOCUMENT_ROOT'] . '/public/sitemap-shoplist.xml';
    $shop_list_data = array();
    $area_terms = array_map( 'urldecode', array_column( get_terms( 'shop_area', array(
        'hide_empty'    => false,
        'childless'     => true,
    ) ), 'slug' ) );
    $category_terms = array_map( 'urldecode', array_column( get_terms( 'shop_categories', array(
        'hide_empty'    => false,
        'childless'     => true,
    ) ), 'slug' ) );

    foreach ( $area_terms as $area ) {
        // 리다이렉션 발생 사이트라 제거
        // $shop_list_data[] = array(
        //     'url'       => $home_url . '/지역기반/' . $area,
        //     'created'   => $current_date_format,
        // );

        foreach ( $category_terms as $category ) {
            $shop_list_data[] = array(
                'url'       => $home_url . '/지역기반/' . $area . '/' . $category . '/',
                'created'   => $current_date_format,
            );
        }
    }
    _generate_sitemap($sitemap_shop_list_filename, $shop_list_data);
    $sitemap_paths[] = $sitemap_shop_list_filename;

    // 사용자 후기 모아보기
    // '/사용자-후기-모아보기/:author',
    // [20220914:: 제거]
    // $sitemap_author_filename = $_SERVER['DOCUMENT_ROOT'] . '/public/sitemap-author.xml';
    // $author_data = array();
    // $user_ids = get_users( array(
    //     'role'      => 'subscriber',
    //     'fields'    => 'ids',
    // ) );
    // foreach ( $user_ids as $user_id ) {
    //     $review_cnt = $wpdb->get_var( $wpdb->prepare(
    //         "   SELECT COUNT(*)
    //             FROM {$wpdb->prefix}jt_review AS r
    //                 INNER JOIN {$wpdb->prefix}search_shop AS s ON s.post_id = r.post_id
    //             WHERE 1=1
    //                 AND r.user_id = %d
    //                 AND %s BETWEEN s.start_date AND s.end_date
    //         ",
    //         $user_id,
    //         date_i18n( 'Y-m-d H:i:s' )
    //     ) );

    //     if ( intVal( $review_cnt ) > 0 ) {
    //         $author_data[] = array(
    //             'url'       => $home_url . '/사용자-후기-모아보기/' . $user_id,
    //             'created'   => $current_date_format,
    //         );
    //     }
    // }
    // _generate_sitemap($sitemap_author_filename, $author_data);
    // $sitemap_paths[] = $sitemap_author_filename;

    // SiteMap
    $sitemap_data = [];
    $sitemap_sitemap_filename = $_SERVER['DOCUMENT_ROOT'] . '/public/sitemap-sitemap.xml';
    $sitemap_category = get_terms("shop_categories", [
        "hide_empty" => false,
        "childless" => true,
    ]);

    foreach ($sitemap_category as $tmp_term) {
        // $created = date_i18n("c");
        $created = "2023-05-18T14:02:23+09:00"; // [201] 최초 생성일자
        $decoded_slug = urldecode($tmp_term->slug);

        $sitemap_data[] = [
            "url" => "{$home_url}/sitemap/{$decoded_slug}/",
            "created" => $created,
        ];
    }
    _generate_sitemap($sitemap_sitemap_filename, $sitemap_data);
    $sitemap_paths[] = $sitemap_sitemap_filename;

    // create sitemap.xml
    $sitemap = fopen($_SERVER['DOCUMENT_ROOT'] . '/public/sitemap.xml', 'w');
    fwrite($sitemap, '<?xml version="1.0" encoding="UTF-8"?>');
    fwrite($sitemap, '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    foreach ($sitemap_paths as $item) {
        fwrite($sitemap, '<sitemap><loc>' . str_replace($_SERVER['DOCUMENT_ROOT'] . '/public', $home_url, $item) . '</loc></sitemap>');
    }
    fwrite($sitemap, '</sitemapindex>');
    fclose($sitemap);


    // $result = array(
    //     'urls'      => array_map( 'urldecode', $urls ),
    //     'created'   => date( 'c' ),
    // );

    // update_option( 'jt_sitemap', $result );

    // return $result;
}
*/

/*
classes/JT_SitemapGenerator.class.php 로 이관
next.js 에서 ssr 렌더링 및 REST API 로 실시간 데이터 조회로 변경
function _generate_sitemap($filename, $data) {
    try {
        $home_url = str_replace('/cmsadmin', '', home_url());
        $sitemap = fopen($filename, 'w');
        fwrite($sitemap, '<?xml version="1.0" encoding="UTF-8"?>');
        fwrite($sitemap, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        if (!empty($data)) {
            foreach ($data as $item) {
                $tmp_url = $home_url . implode('/', array_map('urlencode', explode('/', str_replace($home_url, '', urldecode($item['url'])))));
                fwrite($sitemap, '<url><loc>' . rtrim($tmp_url, '/') . '/' . '</loc><lastmod>' . $item['created'] . '</lastmod></url>');
            }
        }
        fwrite($sitemap, '</urlset>');
        fclose($sitemap);

        return true;
    } catch (Exception $e) {
        return false;
    }
}
*/

function jt_decode_html_specialchar( $value ) {
    if ( is_admin() && is_string( $value ) ) {
        return htmlspecialchars_decode( $value, ENT_QUOTES );
    }
    return $value;
}
add_filter( 'acf/load_value', 'jt_decode_html_specialchar', 10 );
