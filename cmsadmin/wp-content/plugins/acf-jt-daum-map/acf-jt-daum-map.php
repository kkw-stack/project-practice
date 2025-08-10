<?php if ( ! defined( 'ABSPATH' ) ) exit; // exit if accessed directly
/*
Plugin Name: Advanced Custom Fields: JT DAUM MAP
Plugin URI: PLUGIN_URL
Description: ACF JT DAUM MAP
Version: 1.0.0
Author: Studio JT
Author URI: https://studio-jt.co.kr
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

if ( !class_exists( 'acf_plugin_jt_daum_map' ) ) {

class acf_plugin_jt_daum_map {

    var $settings;

    function __construct() {

        $this->settings = array(
            'version' => '1.0.1'
            , 'url'   => plugin_dir_url( __FILE__ )
            , 'path'  => plugin_dir_path( __FILE__ )
        );

        add_action( 'acf/include_field_types', array( $this, 'include_field' ) ); // v5
        // add_action( 'acf/register_fields', array( $this, 'include_field' ) ); // v4

    }

    function include_field( $version = 4 ) {

        include_once 'includes/class-acf-field-jt-daum-map.php';

    }

}

new acf_plugin_jt_daum_map();


}