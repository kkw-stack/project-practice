<?php if( ! defined( 'ABSPATH' ) ) exit; // exit if accessed directly


// check if class already exists
if( ! class_exists( 'acf_field_jt_daum_map' ) ) {


class acf_field_jt_daum_map extends acf_field {

    private $daum_api_key;

    function __construct( $settings ) {

        $this->name     = 'jt_daum_map';
        $this->label    = 'JT Daum Map';
        $this->category = 'jquery';

        $this->defaults = array(
            'height'        => '',
            'center_lat'    => '',
            'center_lng'    => '',
            'zoom'          => ''
        );
        $this->default_values = array(
            'height'        => '400',
            'center_lat'    => '37.56682',
            'center_lng'    => '126.97865',
            'zoom'          => '3'
        );

        $this->l10n = array(
            'locating'  => 'Locating',
            'error'     => 'Error! Please enter a higher value',
        );

        $this->settings = $settings;

        $this->daum_api_key = apply_filters( 'acf_jt_daum_api_key', '' );

        // do not delete!
        parent::__construct();

    }

    function render_field_settings( $field ) {

        // center_lat
        acf_render_field_setting( $field, array(
            'label'         => 'Center',
            'instructions'  => 'Center the initial map',
            'type'          => 'text',
            'name'          => 'center_lat',
            'prepend'       => 'lat',
            'placeholder'   => $this->default_values['center_lat']
        ) );


        // center_lng
        acf_render_field_setting( $field, array(
            'label'         => 'Center',
            'instructions'  => 'Center the initial map',
            'type'          => 'text',
            'name'          => 'center_lng',
            'prepend'       => 'lng',
            'placeholder'   => $this->default_values['center_lng'],
            '_append'       => 'center_lat'
        ) );


        // zoom
        acf_render_field_setting( $field, array(
            'label'         => 'Zoom',
            'instructions'  => 'Set the initial zoom level',
            'type'          => 'text',
            'name'          => 'zoom',
            'placeholder'   => $this->default_values['zoom']
        ) );


        // allow_null
        acf_render_field_setting( $field, array(
            'label'         => 'Height',
            'instructions'  => 'Customise the map height',
            'type'          => 'text',
            'name'          => 'height',
            'append'        => 'px',
            'placeholder'   => $this->default_values['height']
        ) );

    }

    function render_field( $field ) {

        // validate value
        if ( empty( $field['value'] ) ) {

            $field['value'] = array();

        }


        // value
        $field['value'] = wp_parse_args( $field['value'], array(
            'address'   => '',
            'lat'       => '',
            'lng'       => ''
        ) );


        // default options
        foreach ( $this->default_values as $k => $v ) {

            if ( empty( $field[ $k ] ) ) {

                $field[ $k ] = $v;

            }

        }

        // vars
        $atts = array(
            'id'        => $field['id'],
            'class'     => 'acf-jt-daum-map ' . $field['class'],
            'data-lat'  => $field['center_lat'],
            'data-lng'  => $field['center_lng'],
            'data-zoom' => $field['zoom']
        );


        // has value
        if ( $field['value']['address'] ) {

            $atts['class'] .= ' -value';

        }

        if ( empty( $this->daum_api_key ) ) {

            ?>

            <p class="error">
                Error :: Set API Key Or Check Your API Settings <br />
                Use Filter :: <br />
                <code>
                    add_filter( "acf_jt_daum_api_key", function () { return "YOUR-API-KEY"; } );
                </code>
            </p>

            <?php

        } else {

            ?>
            <style>
                .acf-jt-daum-map { position: relative; border: #DFDFDF solid 1px; background: #fff; }
                .acf-jt-daum-map .title { position: relative; border-bottom: #DFDFDF solid 1px; }
                .acf-jt-daum-map .title:hover .acf-actions { display: block; }
                .acf-jt-daum-map .title .search { margin: 0; font-size: 14px; line-height: 30px; height: 40px; padding: 5px 10px; border: 0 none; box-shadow: none; border-radius: 0; font-family: inherit; cursor: text; }
                .acf-jt-daum-map .title .search { font-weight: bold; }
                .acf-jt-daum-map .title .search:focus { font-weight: normal; }
            </style>
            <div <?php acf_esc_attr_e( $atts ); ?>>

                <div class="acf-hidden">
                    <?php foreach( $field['value'] as $k => $v ): ?>
                        <?php acf_hidden_input( array( 'name' => $field['name'] . '[' . $k . ']', 'value' => $v, 'class' => 'input-' . $k ) ); ?>
                    <?php endforeach; ?>
                </div>

                <div class="title">
                    <div class="acf-actions -hover">
                        <a href="#" data-name="search" class="acf-icon -search grey" title="Search"></a>
                        <a href="#" data-name="clear" class="acf-icon -cancel grey" title="Clear location"></a>
                    </div>
                    <input class="search" type="text" placeholder="Search for address..." value="<?php echo esc_attr( $field['value']['address'] ); ?>" />
                </div>

                <div class="jt-map-wrapper" style="<?php echo esc_attr( 'height: ' . $field['height'] . 'px;' ); ?>"></div>
            </div>
            <?php

        }

    }

    function validate_value( $valid, $value, $field, $input ){

        if ( ! $field['required'] ) {

            return $valid;

        }


        if ( empty( $value ) || empty( $value['lat'] ) || empty( $value['lng'] ) ) {

            return false;

        }

        return $valid;

    }


    function update_value( $value, $post_id, $field ) {

        if ( $field['required'] ) {

            if ( empty( $value ) || empty( $value['lat'] ) || empty( $value['lng'] ) ) {

                return false;

            }

        }

        update_post_meta( $post_id, $field['name'] . '_lat', $value[ 'lat' ] );
        update_post_meta( $post_id, $field['name'] . '_lng', $value[ 'lng' ] );

        return $value;

    }

    function input_admin_enqueue_scripts() {

        if ( ! empty( $this->daum_api_key ) ) {

            $url     = $this->settings['url'];
            $version = $this->settings['version'];

            wp_enqueue_script( 'kakao-map-api', '//dapi.kakao.com/v2/maps/sdk.js?appkey=' . $this->daum_api_key. '&libraries=services', array( 'jquery' ), $version );

            wp_register_script( 'jt_daum_map', $url . 'js/input.js', array( 'jquery', 'acf-input' ), $version );
            wp_enqueue_script( 'jt_daum_map' );


        }

    }

}


new acf_field_jt_daum_map( $this->settings );


}