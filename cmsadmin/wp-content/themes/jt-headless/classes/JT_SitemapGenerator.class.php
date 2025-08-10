<?php
$jt_sitemapGenerator = new JT_SitemapGenerator();

class JT_SitemapGenerator
{
    const TYPES = ["base", "blog", "event", "notice", "shop", "shoplist", "sitemap", "location", "metro",];
    private $home;

    public function __construct()
    {
        $this->home = rtrim(str_replace("/cmsadmin", "", home_url()), "/");
        add_action("rest_api_init", [$this, "rest_api_init"]);
    }

    public function rest_api_init()
    {
        register_rest_route(
            JT_REST_BASE,
            "/components/sitemap",
            [
                [
                    "methods"             => WP_REST_Server::READABLE,
                    "callback"            => [$this, "get"],
                    "permission_callback" => "__return_true",
                ],
            ]
        );
        register_rest_route(
            JT_REST_BASE,
            "components/sitemap/base",
            [
                [
                    "methods"             => WP_REST_Server::READABLE,
                    "callback"            => [$this, "get_base"],
                    "permission_callback" => "__return_true",
                ],
            ]
        );
    }

    private function getShopItems()
    {
        global $wpdb;

        $shop_ids = array_column($wpdb->get_results($wpdb->prepare(
            "   SELECT post_id
                    FROM {$wpdb->prefix}search_shop
                    WHERE 1=1
                        AND %s BETWEEN start_date AND end_date
                    ORDER BY
                        post_id ASC
                ",
            date_i18n("Y-m-d H:i:s")
        ), ARRAY_A), "post_id");
        $result = [];

        foreach ($shop_ids as $post_id) {
            if (get_post_status($post_id) == "publish") {
                $tmp_url = urldecode(rtrim(get_permalink($post_id), "/"));

                if (strpos($tmp_url, "?") === false) {
                    $result[] = [
                        "url"     => "{$tmp_url}/",
                        "created" => get_the_modified_date("c", $post_id),
                    ];
                }
            }
        }
        return $result;
    }

    private function getBaseItems()
    {
        $now = "2023-05-18T05:06:24+00:00";
        return [
            ["url" => "{$this->home}/", "created" => $now],
            ["url" => "{$this->home}/위치설정/", "created" => $now],
            ["url" => "{$this->home}/검색/", "created" => $now],
            ["url" => "{$this->home}/회사소개/", "created" => $now],
            ["url" => "{$this->home}/공지사항/", "created" => $now],
            ["url" => "{$this->home}/이벤트/", "created" => $now],
            ["url" => "{$this->home}/뭉치고-블로그/", "created" => $now],
            ["url" => "{$this->home}/문의하기/", "created" => $now],
            ["url" => "{$this->home}/제휴문의/", "created" => $now],
            ["url" => "{$this->home}/제휴문의/계산기/", "created" => $now],
            ["url" => "{$this->home}/제휴문의/신청/", "created" => $now],
            ["url" => "{$this->home}/로그인/", "created" => $now],
        ];
    }

    private function getShoplistItems()
    {
        $now = "2023-05-18T05:06:24+00:00";
        $result = [];
        $area_terms = array_map("urldecode", array_column(get_terms("shop_area", [
            "hide_empty" => false,
            "childless"  => true,
        ]), "slug"));
        $category_terms = array_map("urldecode", array_column(get_terms("shop_categories", [
            "hide_empty" => false,
            "childless"  => true,
        ]), "slug"));

        if (!is_wp_error($area_terms) && !is_wp_error($category_terms)) {
            $area_terms = array_map(function ($item) { return urldecode($item); }, $area_terms);
            $category_terms = array_map(function ($item) { return urldecode($item); }, $category_terms);

            foreach ($area_terms as $area) {
                foreach ($category_terms as $category) {
                    $result[] = [
                        "url"     => "{$this->home}/지역기반/{$area}/{$category}/",
                        "created" => $now,
                    ];
                }
            }
        }

        return $result;
    }

    private function getPostItems($post_type, $rpp = -1, $paged = 1)
    {
        $result = [];
        $post_ids = get_posts([
            "post_type"      => $post_type,
            "post_status"    => "publish",
            "posts_per_page" => $rpp,
            "paged"          => $paged,
            "fields"         => "ids",
        ]);

        foreach ($post_ids as $post_id) {
            $tmp_url = urldecode(rtrim(get_permalink($post_id), "/"));

            if (strpos($tmp_url, "?") === false) {
                $result[] = [
                    "url"     => "{$tmp_url}/",
                    "created" => get_the_modified_date("c", $post_id)
                ];
            }
        }
        return $result;
    }

    private function getSitemapItems()
    {
        $sitemap_category = get_terms("shop_categories", [
            "hide_empty" => false,
            "childless"  => true,
        ]);

        $created = "2023-05-18T14:02:23+09:00"; // [201] 최초 생성일자

        $result = [];
        $result[] = [
            "url"     => "{$this->home}/sitemap/",
            "created" => $created,
        ];

        if (!is_wp_error($sitemap_category)) {
            foreach ($sitemap_category as $tmp_term) {
                $decoded_slug = urldecode($tmp_term->slug);

                $result[] = [
                    "url"     => "{$this->home}/sitemap/area/{$decoded_slug}/",
                    "created" => $created,
                ];
            }

            foreach ($sitemap_category as $tmp_term) {
                $decoded_slug = urldecode($tmp_term->slug);

                $result[] = [
                    "url"     => "{$this->home}/sitemap/metro/{$decoded_slug}/",
                    "created" => $created,
                ];
            }
        }

        // $sitemap_category = get_terms("sitemap_metro_categories", [
        //     "hide_empty" => false,
        //     "childless"  => true,
        // ]);

        // if (!is_wp_error($sitemap_category)) {
        //     foreach ($sitemap_category as $tmp_term) {
        //         $decoded_slug = urldecode($tmp_term->slug);

        //         $result[] = [
        //             "url"     => "{$this->home}/sitemap/metro/{$decoded_slug}/",
        //             "created" => $created,
        //         ];
        //     }
        // }

        return $result;
    }

    private function getSitemapMetroItems($category)
    {
        $term = get_term($category, "shop_categories");
        $result = [];

        if ($term && !is_wp_error($term)) {
            $posts = get_posts([
                "post_type"      => "sitemap_metro",
                "post_status"    => "publish",
                "posts_per_page" => -1,
                "fields"         => "ids",
                "meta_query"     => [
                    [
                        "key"     => "sitemap_category",
                        "value"   => $term->term_id,
                        "compare" => "LIKE",
                    ]
                ],
            ]);

            if (!empty($posts)) {
                $result = array_map(function ($post_id) use ($term) {
                    $title = urldecode(get_the_title($post_id));
                    $meta_data = get_field("sitemap_location", $post_id);
                    // http://moongchigo.localhost/위치기반/타이마사지/?category=타이마사지&lat=37.5000784&lng=127.0385491&name=역삼동
                    return [
                        "url"     => htmlspecialchars("{$this->home}/위치기반/" . urldecode($term->slug) . "/?lat={$meta_data["lat"]}&lng={$meta_data["lng"]}&name={$title}"),
                        "created" => get_the_date("c", $post_id),
                    ];
                }, $posts);
            }
        }

        return $result;
    }

    private function getSitemapLocationItems($category)
    {
        $term = get_term($category, "shop_categories");
        $result = [];

        if ($term && !is_wp_error($term)) {
            $posts = get_posts([
                "post_type"      => "sitemap",
                "post_status"    => "publish",
                "posts_per_page" => -1,
                "fields"         => "ids",
                "meta_query"     => [
                    [
                        "key"     => "sitemap_category",
                        "value"   => $term->term_id,
                        "compare" => "LIKE",
                    ]
                ],
            ]);

            if (!empty($posts)) {
                $result = array_map(function ($post_id) use ($term) {
                    $title = urldecode(get_the_title($post_id));
                    $meta_data = get_field("sitemap_location", $post_id);
                    // http://moongchigo.localhost/위치기반/타이마사지/?category=타이마사지&lat=37.5000784&lng=127.0385491&name=역삼동
                    return [
                        "url"     => htmlspecialchars("{$this->home}/위치기반/" . urldecode($term->slug) . "/?lat={$meta_data["lat"]}&lng={$meta_data["lng"]}&name={$title}"),
                        "created" => get_the_date("c", $post_id),
                    ];
                }, $posts);
            }
        }

        return $result;
    }

    public function get(WP_REST_Request $request)
    {
        global $wpdb;

        $type = $request->get_param("type");
        $category = intVal($request->get_param("category") ?? 0);
        // $paged = max(1, intVal($request->get_param("paged") ?? 1));
        // $rpp = intVal($request->get_param("rpp") ?? 10);
        // $offset = ($paged - 1) * $rpp;
        $result = [];

        if (!in_array($type, static::TYPES)) {
            return new WP_REST_Response($result, 200);
        }

        if ($type == "base") {
            $result = $this->getBaseItems();
        } elseif ($type == "shop") {
            $result = $this->getShopItems();
        } elseif (in_array($type, ["notice", "event", "blog"])) {
            // $result = $this->getPostItems($type, $rpp, $paged);
            $result = $this->getPostItems($type);
        } elseif ($type == "shoplist") {
            $result = $this->getShoplistItems();
        } elseif ($type == "sitemap") {
            $result = $this->getSitemapItems();
        } elseif ($type == "location" && $category > 0) {
            $result = $this->getSitemapLocationItems($category);
        } elseif ($type == "metro" && $category > 0) {
            $result = $this->getSitemapMetroItems($category);
        }

        return new WP_REST_Response($result, 200);
    }

    public function get_base()
    {
        // 기본 sitemap 링크 추가
        $result = array_map(function ($item) {
            return "{$this->home}/sitemap-{$item}.xml";
        }, array_filter(static::TYPES, function ($item) {
            return !in_array($item, ["location", "metro"]);
        }));

        $location_terms = get_terms("shop_categories", [
            "hide_empty" => false,
            "childless"  => true,
        ]);

        if (!is_wp_error($location_terms)) {
            // Sitemap 지역별 카테고리 매핑 추가
            $result = array_merge($result, array_map(function ($item) {
                return "{$this->home}/sitemap-location-{$item->term_id}.xml";
            }, array_filter($location_terms, function ($term) {
                $posts = get_posts([
                    "post_type"      => "sitemap",
                    "post_status"    => "publish",
                    "posts_per_page" => 1,
                    "fields"         => "ids",
                    "meta_query"     => [
                        [
                            "key"     => "sitemap_category",
                            "value"   => $term->term_id,
                            "compare" => "LIKE",
                        ]
                    ],
                ]);
                return !empty($posts);
            })));

            // Sitemap 지하철역별 카테고리 매핑 추가
            $result = array_merge($result, array_map(function ($item) {
                return "{$this->home}/sitemap-metro-{$item->term_id}.xml";
            }, array_filter($location_terms, function ($term) {
                $posts = get_posts([
                    "post_type"      => "sitemap_metro",
                    "post_status"    => "publish",
                    "posts_per_page" => 1,
                    "fields"         => "ids",
                    "meta_query"     => [
                        [
                            "key"     => "sitemap_category",
                            "value"   => $term->term_id,
                            "compare" => "LIKE",
                        ]
                    ],
                ]);
                return !empty($posts);
            })));
        }

        return new WP_REST_Response($result, 200);
    }

}
