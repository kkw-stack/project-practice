<?php
$jt_sidebar = new JT_SideBar();

class JT_SideBar
{
    public function __construct()
    {
        add_action('acf/init', [$this, 'acf_init']);
        add_action('rest_api_init', [$this, 'rest_api_init']);
    }

    public function acf_init()
    {
        if (function_exists('acf_add_options_page') && function_exists('acf_add_options_page')) {
            acf_add_options_page([
                'page_title'    => '사이드바 관리',
                'menu_title'    => '사이드바 관리',
                'capability'    => 'manage_options',
                'menu_slug'     => 'jt-sidebar-options',
                'update_button' => '업데이트',
            ]);
        }
    }

    public function rest_api_init()
    {
        register_rest_route(
            JT_REST_BASE,
            '/components/sidebar/now',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [$this, 'get_now_list'],
                    'permission_callback' => '__return_true',
                ],
            ]
        );
    }

    public function get_now_list()
    {
        $result = get_field('sidebar_now', 'options');
        return new WP_REST_Response($result ?: [], 200);
    }
}
