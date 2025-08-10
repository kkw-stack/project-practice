<?php
/*
 * Name       : Sitemap
 * namespace  : sitemap
 * File       : /modules/sitemap /index.php
 * Author     : STUDIO-JT (201)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) Sitemap  프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


/**
 * Partnership 프로그램 실행
 */
$jt_sitemap = new Jt_sitemap();

/**
 * Jt_sitemap Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_sitemap extends Jt_Module
{
    private $admin_list_blank_txt = '<span aria-hidden="true">—</span>';
    private $rest_base;
    private $wpdb;

    public function __construct()
    {
        global $wpdb;

        parent::__construct(
            [
                "namespace"   => "sitemap",
                "name"        => "SiteMap",
                "slug"        => "sitemap",
                "support"     => ["title"],
                "support_cat" => false,
                "gutenberg"   => false,
            ]
        );

        $this->wpdb = $wpdb;
        $this->rest_base = defined("JT_REST_BASE") ? JT_REST_BASE : "jt/v1";

        add_action("rest_api_init", [$this, "rest_api_init"]);

        add_action("restrict_manage_posts", [$this, "admin_filter_area_selector"]);
        add_filter("manage_{$this->_namespace}_posts_columns", [$this, "manage_admin_columns"]);
        add_action("manage_{$this->_namespace}_posts_custom_column", [$this, "manage_admin_column_value"], 10, 2);
        add_action("posts_where", [$this, "posts_where"], 10, 2);

        // show only child terms of area
        add_filter("acf/fields/taxonomy/query/key=field_6462c9dc736ee", [$this, "acf_taxonomy_query_filter"], 10, 3);
        // show term name with parent's name
        add_filter("acf/fields/taxonomy/result/key=field_6462c9dc736ee", [$this, "acf_taxonomy_result_filter"], 10, 4);
    }

    public function rest_api_init()
    {
        register_rest_route($this->rest_base, "/modules/{$this->_namespace}", [
            [
                "methods"             => WP_REST_Server::READABLE,
                "callback"            => [$this, "get_list"],
                "permission_callback" => "__return_true",
            ],
        ]);
    }

    public function get_list(WP_REST_Request $request)
    {
        try {
            if (empty($request->get_param("category"))) {
                return new WP_Error("Error", "category is required", ["status" => 400]);
            }

            $include_sql = $this->wpdb->prepare(
                "   SELECT DISTINCT(pm.meta_value)
                    FROM {$this->wpdb->posts} AS p
                        INNER JOIN {$this->wpdb->postmeta} AS pm ON pm.post_id = p.ID AND pm.meta_key = 'sitemap_area'
                        INNER JOIN {$this->wpdb->postmeta} AS pmc ON pmc.post_id = p.ID AND pmc.meta_key = 'sitemap_category'
                    WHERE 1=1
                        AND p.post_type = %s
                        AND p.post_status = %s
                        AND pmc.meta_value LIKE %s
                ",
                $this->_namespace,
                "publish",
                "%" . sprintf('s:%d:"%d"', strlen($request->get_param("category")), $request->get_param("category")) . "%"
            );

            $includes = array_column($this->wpdb->get_results($include_sql, ARRAY_A), "meta_value");

            if (empty($includes)) {
                return new WP_REST_Response([
                    "total_posts" => 0,
                    "total_pages" => 0,
                    "posts"       => [],
                ], 200);
            }

            $paged = max(1, intVal($request->get_param("paged")));
            $rpp = intVal($request->get_param("rpp") ?? get_option("posts_per_page"));
            $args = [
                "taxonomy"   => "shop_area",
                "hide_empty" => false,
                "include"    => $includes,
            ];
            $total = count(get_terms($args));
            $terms = get_terms(array_merge($args, [
                "number" => $rpp,
                "offset" => (($paged - 1) * $rpp),
            ]));

            $result = [];

            if (!empty($terms)) {
                foreach ($terms as $term) {
                    $posts = get_posts([
                        "post_type"      => $this->_namespace,
                        "post_status"    => "publish",
                        "posts_per_page" => -1,
                        "meta_query"     => [
                            "relation" => "AND",
                            [
                                "key"   => "sitemap_area",
                                "value" => $term->term_id,
                            ],
                            [
                                "key" => "sitemap_category",
                                "value" => $request->get_param("category"),
                                "compare" => "LIKE",
                            ]
                        ],
                    ]);

                    $result[] = [
                        "id"    => $term->term_id,
                        "name"  => $this->getTermName($term),
                        "count" => count($posts),
                        "child" => array_map(function ($item) {
                            $meta_data = get_field("sitemap", $item->ID);

                            return [
                                "id"       => $item->ID,
                                "name"     => $item->post_title,
                                "location" => $meta_data["location"],
                            ];
                        }, $posts),
                    ];
                }
            }

            return new WP_REST_Response([
                "total_posts" => $total,
                "total_pages" => ceil($total / $rpp),
                "posts"       => $result,
            ], 200);
        } catch (Exception $e) {
            return new WP_Error("Error", $e->getMessage(), ["status" => 400]);
        }
    }

    public function acf_taxonomy_result_filter($text, $term, $field, $post_id)
    {
        return $this->getTermName($term);
    }

    public function acf_taxonomy_query_filter($args, $field, $post_id)
    {
        $args['exclude'] = array_column(get_terms([
            "taxonomy"   => "shop_area",
            "parent"     => 0,
            "hide_empty" => false,
        ]), "term_id");
        return $args;
    }

    public function admin_filter_area_selector()
    {
        if (($_REQUEST["post_type"] ?? "post") == $this->_namespace) {
            $area = urldecode($_REQUEST["area"] ?? "");
            $terms = array_filter(get_terms([
                "taxonomy"   => "shop_area",
                "hide_empty" => false,
            ]), function ($obj) {
                return !empty($obj->parent);
            });
            ?>
            <select name="area">
                <option value="">모든 지역</option>
                <?php foreach ($terms as $term): ?>
                    <option value="<?php echo $term->term_id; ?>" <?php selected($area, $term->term_id); ?>><?php echo $this->getTermName($term); ?></option>
                <?php endforeach; ?>
            </select>
            <?php
        }
    }


    public function posts_where( $where, $query ) {
        if (is_admin() && $query->is_main_query() && !empty($query->query_vars["post_type"] ) && $this->_namespace == $query->query_vars["post_type"] ) {
            if (!empty($_REQUEST["area"])) {
                $where .= $this->wpdb->prepare(
                    " AND {$this->wpdb->posts}.ID IN (SELECT post_id FROM {$this->wpdb->postmeta} WHERE meta_key = 'sitemap_area' AND meta_value = %d) ",
                    intVal($_REQUEST["area"])
                );
            }
        }

        return $where;
    }

    private function getTermName($term)
    {
        $term_name = "";
        try {
            $term_name = $term->name;

            if ($term->parent > 0) {
                $parent = get_term($term->parent);

                if ($parent) {
                    $term_name = $parent->name . " " . $term_name;
                }
            }
        } catch (Exception $e) {
        }

        return $term_name;
    }

    public function manage_admin_columns($columns)
    {
        $new_columns = [];

        foreach ($columns as $key => $val) {
            if ($key == "date") {
                $new_columns["area"] = "지역 카테고리";
                $new_columns["shop"] = "샵 카테고리";
            }

            $new_columns[$key] = $val;
        }

        return $new_columns;
    }

    public function manage_admin_column_value($column_name, $post_id)
    {
        if ($column_name == "area") {
            $area = get_field("sitemap_area", $post_id);

            if ($area) {
                printf('<a href="%s">%s</a>', add_query_arg('area', $area->term_id, $_SERVER["REQUEST_URI"]), $area->name);
            } else {
                echo $this->admin_list_blank_txt;
            }
        }

        if ($column_name == "shop") {
            $category = get_field("sitemap_category", $post_id);

            if (!empty($category)) {
                echo implode(", ", array_column($category, "name"));
            } else {
                echo $this->admin_list_blank_txt;
            }
        }
    }
}
