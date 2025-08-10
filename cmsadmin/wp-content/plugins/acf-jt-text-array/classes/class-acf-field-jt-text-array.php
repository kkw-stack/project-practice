<?php if ( ! defined( 'ABSPATH' ) ) exit; // exit if accessed directly


// check if class already exists
if ( ! class_exists( 'acf_field_jt_text_array' ) ) {


class acf_field_jt_text_array extends acf_field {

    function __construct( $settings ) {

        $this->name     = 'jt_text_array';
        $this->label    = 'JT Text Array';
        $this->category = 'basic';

        $this->defaults = array(
            'readonly'  => false,
            'disabled'  => false,
        );

        $this->settings = $settings;

        // do not delete!
        parent::__construct();

    }

    function render_field_settings( $field ) {

        acf_render_field_setting( $field, array(
            'label' => 'Read Only',
            'type'  => 'true_false',
            'name'  => 'readonly',
            'ui'    => true,
        ) );

        acf_render_field_setting( $field, array(
            'label' => 'Use MultiLines',
            'type'  => 'true_false',
            'name'  => 'multiline',
            'ui'    => true,
        ) );

        acf_render_field_setting( $field, array(
            'label' => 'Placeholder Text',
            'type'  => 'text',
            'name'  => 'placeholder',
        ) );

        acf_render_field_setting( $field, array(
            'label' => 'Max Item',
            'type'  => 'number',
            'name'  => 'max',
        ) );

        acf_render_field_setting( $field, array(
            'label' => 'Min Item',
            'type'  => 'number',
            'name'  => 'min',
        ) );

    }

    function render_field( $field ) {

        // validate value
        if ( empty( $field['value'] ) ) {

            $field['value'] = array();

        }

        // vars
        $atts = array(
            'id'    => $field['id'],
            'name'  => $field['name'] . '[]',
            'class' => $field['class'],
        );


        // has value
        if ( $field['value'] ) {

            $atts['class'] .= ' -value';

        }

        if ( $field['disabled'] ) {

            $field['readonly'] = false;

        }

        ?>

        <style>
            .jt-text-array.clone { display: none; }
            .jt-text-array .acf-input-prepend { cursor: move; }
            .jt-text-array .acf-input-append { border: none; background: none; }
        </style>

        <div class="acf-input-wrap" data-min="<?php echo $field['min']; ?>" data-max="<?php echo $field['max']; ?>">
            <ul class="jt-text-array-container">
                <?php if ( is_array( $field['value'] ) && ! empty( $field['value'] ) ) : ?>

                    <?php foreach ( $field['value'] as $idx => $value ) : ?>

                        <?php
                            $tmp_atts = $atts;
                            $tmp_atts['id'] = $tmp_atts['id'] . '-' . $idx;
                        ?>

                        <li class="jt-text-array">
                            <div class="acf-input">
                                <?php if ( ! $field['readonly'] && ! $field['disabled'] ) : ?>

                                    <div class="acf-input-prepend">≡</div>
                                    <div class="acf-input-append">
                                        <a href="#" class="acf-icon -minus small acf-js-tooltip jt-text-array-remove-row" title="Remove Item"></a>
                                    </div>

                                <?php endif; ?>

                                <div class="acf-input-wrap">
                                    <?php if ( isset( $field['multiline'] ) && $field['multiline'] ) : ?>

                                        <textarea
                                            <?php acf_esc_attr_e( $tmp_atts ); ?>
                                            <?php echo ( $field['readonly'] ? 'readonly' : '' ); ?>
                                            <?php echo ( $field['disabled'] ? 'disabled' : '' ); ?>
                                        ><?php echo $value; ?></textarea>

                                    <?php else : ?>

                                        <input
                                            type="text"
                                            <?php acf_esc_attr_e( $tmp_atts ); ?>
                                            value="<?php echo $value; ?>"
                                            <?php echo ( $field['readonly'] ? 'readonly' : '' ); ?>
                                            <?php echo ( $field['disabled'] ? 'disabled' : '' ); ?>
                                        />

                                    <?php endif; ?>
                                </div>
                            </div>
                        </li>

                    <?php endforeach; ?>

                <?php endif; ?>

                <?php if ( ! $field['readonly'] && ! $field['disabled'] ) : ?>

                    <?php
                        $tmp_atts = $atts;
                        $tmp_atts['id'] = $tmp_atts['id'] . '-clone';
                    ?>

                    <li class="jt-text-array clone">
                        <div class="acf-input">
                            <div class="acf-input-prepend">≡</div>
                            <div class="acf-input-append">
                                <a href="#" class="acf-icon -minus small acf-js-tooltip jt-text-array-remove-row" title="Remove Item"></a>
                            </div>
                            <div class="acf-input-wrap">
                                <?php if ( $field['multiline'] ) : ?>

                                    <textarea
                                        <?php acf_esc_attr_e( $tmp_atts ); ?>
                                        <?php echo ( $field['readonly'] ? 'readonly' : '' ); ?>
                                        disabled
                                    ></textarea>

                                <?php else : ?>

                                    <input
                                        type="text"
                                        <?php acf_esc_attr_e( $tmp_atts ); ?>
                                        <?php echo ( $field['readonly'] ? 'readonly' : '' ); ?>
                                        disabled
                                    />

                                <?php endif; ?>
                            </div>
                        </div>
                    </li>

                <?php endif; ?>
            </ul>
            <?php if ( ! $field['readonly'] && ! $field['disabled'] ) : ?>

                <div class="acf-actions">
                    <a class="acf-button button small button-primary jt-text-array-add-row" href="#">항목 추가</a>
                </div>

            <?php endif; ?>
        </div>

        <?php

    }

    function validate_value( $valid, $value, $field, $input ){

        if ( $field['required'] ) {

            return ! empty( array_filter( $value ) );

        }

        if ( $field['max'] > 0 ) {

            return $field['max'] >= count( $value );

        }

        if ( $field['min'] > 0 ) {

            return count( $value ) >= $field['min'];

        }

        if ( ! $field['required'] ) {

            return $valid;

        }

    }

    function input_admin_enqueue_scripts() {

        $url     = $this->settings['url'];
        $version = $this->settings['version'];

        wp_register_script( 'jt_acf_text_array', $url . 'js/input.js', array( 'jquery', 'jquery-ui-sortable', 'acf-input' ), $version );
        wp_enqueue_script( 'jt_acf_text_array' );


    }

}


new acf_field_jt_text_array( $this->settings );


}