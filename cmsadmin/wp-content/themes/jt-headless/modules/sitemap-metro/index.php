<?php
/*
 * Name       : Sitemap Metro
 * namespace  : sitemap_metro
 * File       : /modules/sitemap /index.php
 * Author     : STUDIO-JT (201)
 * Guideline  : JTstyle.2.0 (beta : add wp comment code standard)
 * Guideline  : http://codex.studio-jt.co.kr/?p=746
 *              https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/
 *
 * SUMMARY:
 * 01) Sitemap Metro  프로그램 실행.
 * 02) Extend Jt_Module Class.
 *
 */


/**
 * Partnership 프로그램 실행
 */
$jt_sitemap_metro = new Jt_sitemap_metro();

/**
 * Jt_sitemap Class
 *
 * Extend Jt_Module class, note that folder location is important
 * Available template : last.php, list.php, single.php
 *
 * @see Jt_Module
 */
class Jt_sitemap_metro extends Jt_Module
{
    private $admin_list_blank_txt = '<span aria-hidden="true">—</span>';
    private $rest_base;
    private $wpdb;

    public function __construct()
    {
        global $wpdb;

        parent::__construct(
            [
                "namespace"   => "sitemap_metro",
                "name"        => "SiteMap Metro",
                "slug"        => "sitemap_metro",
                "support"     => ["title"],
                "support_cat" => true,
                "gutenberg"   => false,
            ]
        );

        $this->wpdb = $wpdb;
        $this->rest_base = defined("JT_REST_BASE") ? JT_REST_BASE : "jt/v1";

        add_action("admin_menu", [$this, "admin_menu"]);
        add_action("rest_api_init", [$this, "rest_api_init"]);

        add_filter("manage_{$this->_namespace}_posts_columns", [$this, "manage_admin_columns"]);
        add_action("manage_{$this->_namespace}_posts_custom_column", [$this, "manage_admin_column_value"], 10, 2);
        add_action("posts_where", [$this, "posts_where"], 10, 2);

        // show only child terms of area
        add_filter("acf/fields/taxonomy/query/key=field_646bff3aafe7d", [$this, "acf_taxonomy_query_filter"], 10, 3);
        // show term name with parent's name
        add_filter("acf/fields/taxonomy/result/key=field_646bff3aafe7d", [$this, "acf_taxonomy_result_filter"], 10, 4);
    }

    public function admin_menu() {
        add_submenu_page(
            'edit.php?post_type=sitemap_metro',
            '지하철역 호선 순서 관리',
            '지하철역 호선 순서 관리',
            'manage_options',
            'jt-shop-category-sort',
            [$this, "admin_category"],
            10
        );
    }


    public function admin_category() {
        wp_enqueue_script("jquery");
        wp_enqueue_script("jquery-ui-sortable");

        include __DIR__ . "/admin_category.php";
    }

    public function create_taxonomy()
    {
        $namespace = $this->_namespace;

        register_taxonomy(
            "{$namespace}_categories",
            $namespace,
            array(
                "hierarchical"       => true,
                "label"              => "지하철역 호선",
                "query_var"          => true,
                "show_in_rest"       => false,
                "rewrite"            => false,
                "show_admin_column"  => false,
                "show_ui"            => true,
                "show_in_quick_edit" => false,
                "meta_box_cb"        => false,
            )
        );
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
                        INNER JOIN {$this->wpdb->postmeta} AS pm ON pm.post_id = p.ID AND pm.meta_key = 'sitemap_metro'
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
                "taxonomy"   => "{$this->_namespace}_categories",
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
                                "key"   => "sitemap_metro",
                                "value" => $term->term_id,
                            ],
                            [
                                "key"     => "sitemap_category",
                                "value"   => $request->get_param("category"),
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
        $args["exclude"] = array_column(get_terms([
            "taxonomy"   => "{$this->_namespace}_categories",
            "parent"     => 0,
            "hide_empty" => false,
        ]), "term_id");
        return $args;
    }

    public function admin_filter_category_selector()
    {
        if (($_REQUEST["post_type"] ?? "post") == $this->_namespace) {
            $area = urldecode($_REQUEST["area"] ?? "");
            $terms = array_filter(get_terms([
                "taxonomy"   => "{$this->_namespace}_categories",
                "hide_empty" => false,
            ]), function ($obj) {
                return !empty($obj->parent);
            });
            ?>
            <select name="area">
                <option value="">모든 호선</option>
                <?php foreach ($terms as $term): ?>
                    <option value="<?php echo $term->term_id; ?>" <?php selected($area, $term->term_id); ?>><?php echo $this->getTermName($term); ?></option>
                <?php endforeach; ?>
            </select>
            <?php
        }
    }


    public function posts_where($where, $query)
    {
        if (is_admin() && $query->is_main_query() && !empty($query->query_vars["post_type"]) && $this->_namespace == $query->query_vars["post_type"]) {
            if (!empty($_REQUEST["area"])) {
                $where .= $this->wpdb->prepare(
                    " AND {$this->wpdb->posts}.ID IN (SELECT post_id FROM {$this->wpdb->postmeta} WHERE meta_key = %s AND meta_value = %d) ",
                    "sitemap_metro",
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
                $new_columns["metro"] = "지하철역 호선";
                $new_columns["shop"] = "샵 카테고리";
            }

            $new_columns[$key] = $val;
        }

        return $new_columns;
    }

    public function manage_admin_column_value($column_name, $post_id)
    {
        if ($column_name == "metro") {
            $metro = get_field("sitemap_metro", $post_id);

            if ($metro) {
                printf('<a href="%s">%s</a>', add_query_arg('area', $metro->term_id, $_SERVER["REQUEST_URI"]), $this->getTermName($metro));
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


    private function _render_terms($parent_id, $depth = 0, $shop_type = 'disabled') {
        $terms = get_terms("sitemap_metro_categories", [
            "hide_empty" => false,
            "parent"     => $parent_id,
        ]);
        ?>
        <?php if (is_array($terms) && count($terms) > 0): ?>
            <ul class="sortable <?= ($depth > 0 ? "panel" : ""); ?>" data-depth="<?= $depth; ?>">
                <?php foreach ($terms as $idx => $term) : ?>
                    <li data-term="<?php echo $term->term_id; ?>">
                        <input type="hidden" name="category[<?php echo $term->term_id; ?>]" value="<?php echo $idx + 1; ?>" />
                        <span class="accordion active"><?php echo $term->name; ?></span>

                        <?php $this->_render_terms($term->term_id, $depth + 1, $shop_type); ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
        <?php
    }


    private function updateCategorySort($data, $parent_id = 0, $depth = 0) {
        global $wpdb;

        $depth_num  = 100; // 뎁스별 허용 갯수
        $depth_max  = 3; // 최대 뎁스

        $terms = get_terms("sitemap_metro_categories", [
            "hide_empty" => false,
            "parent" => $parent_id,
            "fields" => "ids",
            "include" => array_keys($data),
            "orderby" => "include"
        ]);

        if (is_array($terms) && count($terms) > 0) {
            foreach ($terms as $term_id) {
                if (isset($data[$term_id])) {
                    $parent_sort = ($parent_id > 0 ? $wpdb->get_var(" SELECT term_order FROM {$wpdb->terms} WHERE term_id = {$parent_id} ") : 0);
                    $tmp_sort = intVal($data[$term_id]) * pow($depth_num, $depth_max - $depth) + $parent_sort;

                    $wpdb->update($wpdb->terms, ["term_order" => $tmp_sort], ["term_id" => $term_id]);
                }

                $this->updateCategorySort($data, $term_id, $depth + 1);
            }
        }
    }
}
