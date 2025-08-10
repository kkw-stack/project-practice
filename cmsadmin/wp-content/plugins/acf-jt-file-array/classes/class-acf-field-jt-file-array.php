<?php if ( ! defined( 'ABSPATH' ) ) exit; // exit if accessed directly


// check if class already exists
if ( ! class_exists( 'acf_field_jt_file_array' ) ) {


class acf_field_jt_file_array extends acf_field {

    function __construct( $settings ) {

        $this->name     = 'jt_file_array';
        $this->label    = 'JT File Array';
        $this->category = 'content';

        $this->defaults = array(
            'readonly'  => false,
            'disabled'  => false,
        );

        $this->settings = $settings;

        // do not delete!
        parent::__construct();

        add_action( 'wp_ajax_jt_file_array_upload', array( $this, 'ajax_action' ) );

    }


    public function ajax_action() {
        if ( wp_doing_ajax() ) {

            if ( $_POST['action'] == 'jt_file_array_upload' ) {

                $file = $_FILES['file'];

                if ( $file['tmp_name'] && $file['error'] === 0 ) {

                    $wp_upload = wp_upload_dir();
                    $path_info = pathinfo( $file['name'] );
                    $new_path = $wp_upload['path'] . '/' . $file['name'];
                    $new_name = str_replace( home_url(), '', $wp_upload['url'] ) . '/' . $file['name'];
                    $file_cnt = 0;

                    while ( file_exists( $new_path ) ) {

                        $file_cnt++;
                        $new_name = sprintf( '%s/%s-%d.%s', str_replace( home_url(), '', $wp_upload['url'] ), $path_info['filename'], $file_cnt, $path_info['extension'] );
                        $new_path = sprintf( '%s/%s-%d.%s', $wp_upload['path'], $path_info['filename'], $file_cnt, $path_info['extension'] );

                    }

                    if ( move_uploaded_file( $file['tmp_name'], $new_path ) ) {

                        $mime = mime_content_type( $new_path );
                        $preview = ( strpos( $mime, 'image' ) === false ? wp_mime_type_icon( $mime ) : $new_name );

                        wp_send_json_success( array( 'value' => $new_name, 'preview' => $preview, 'mime' => $mime ) );
                        exit;

                    }

                }

            }

            wp_send_json_error();
            exit;

        }

        exit;

    }

    function render_field_settings( $field ) {

        acf_render_field_setting( $field, array(
            'label' => 'Read Only',
            'type'  => 'true_false',
            'name'  => 'readonly',
            'ui'    => true,
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

        acf_render_field_setting( $field, array(
            'label'         => __( 'Preview Size', 'acf' ),
            'instructions'  => '',
            'type'          => 'select',
            'name'          => 'preview_size',
            'choices'       => acf_get_image_sizes()
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

        $size = acf_get_image_size( isset( $field['preview_size'] ) && ! empty( $field['preview_size'] ) ? $field['preview_size'] : 'thumbnail' );
        $download_url = add_query_arg( array( 'post_id' => get_the_ID(), 'label' => $field['label'], 'values' => implode( '||', $field['value'] ) ), plugins_url( 'download.php', dirname( __FILE__ ) ) );
        ?>

        <style>
            .jt-file-array.clone { display: none; }
            .jt-file-array { /* cursor: pointer; */ margin: 5px; display: block; vertical-align: top; /* border: 2px solid #eee; padding: 3px; */ }
            .jt-file-array img { border: 2px solid #eee; padding: 3px; }
            .jt-file-array .jt-file-array-remove-row { position: absolute; top: -9px; right: -9px; }

            .post-type-partnership .jt-file-array { display: inline-block; /* cursor: pointer; */ width: 150px; height: 150px; margin: 5px; }
        </style>

        <div class="acf-input-wrap" data-min="<?php echo $field['min']; ?>" data-max="<?php echo $field['max']; ?>">
            <ul class="jt-file-array-container">
                <?php if ( is_array( $field['value'] ) && ! empty( $field['value'] ) ) : ?>

                    <?php foreach ( $field['value'] as $idx => $value ) : ?>

                        <?php
                            $tmp_atts = $atts;
                            $tmp_atts['id'] = $tmp_atts['id'] . '-' . $idx;
                            $tmp_mime = mime_content_type( ABSPATH . $value );
                            $tmp_image = $this->_make_thumbnail( ABSPATH . $value, $size['width'], $size['height'] );
                        ?>

                        <li class="jt-file-array">
                            <div class="acf-input">
                                <div class="acf-input-wrap" style="overflow:visible;">
                                    <input type="hidden" <?php acf_esc_attr_e( $tmp_atts ); ?> value="<?php echo $value; ?>" />
                                    <!-- <a href="<?php echo home_url() . $value; ?>" target="_blank" rel="noopener noreferrer" download> -->
                                        <img src="<?php echo $tmp_image; ?>" />
                                    <!-- </a> -->

                                    <?php if ( ! $field['readonly'] && ! $field['disabled'] ) : ?>

                                        <a href="#" class="acf-icon -minus small acf-js-tooltip jt-file-array-remove-row" title="Remove Item"></a>

                                    <?php endif; ?>
                                </div>
                            </div>
                        </li>

                    <?php endforeach; ?>
                <?php elseif ( $field['readonly'] || $field['disabled'] ) : ?>
                    <li>-</li>

                <?php endif; ?>

                <?php if ( ! $field['readonly'] && ! $field['disabled'] ) : ?>

                    <?php
                        $tmp_atts = $atts;
                        $tmp_atts['id'] = $tmp_atts['id'] . '-clone';
                    ?>

                    <li class="jt-file-array clone" style="width:150px;height:150px;">
                        <div class="acf-input">
                            <div class="acf-input-wrap" style="overflow:visible;">
                                <input type="hidden" <?php acf_esc_attr_e( $tmp_atts ); ?> disabled />
                                <a href="" target="_blank" rel="noopener noreferrer" download>
                                    <img src="" />
                                </a>

                                <?php if ( ! $field['readonly'] && ! $field['disabled'] ) : ?>

                                    <a href="#" class="acf-icon -minus small acf-js-tooltip jt-file-array-remove-row" title="Remove Item"></a>

                                <?php endif; ?>
                            </div>
                        </div>
                    </li>

                <?php endif; ?>
            </ul>

            <div class="acf-actions">
                <?php if ( ! $field['readonly'] && ! $field['disabled'] ) : ?>
                    <a class="acf-button button small button-primary jt-file-array-add-row" href="#">항목 추가</a>
                    <input type="file" style="display:none;" />
                <?php endif; ?>

                <?php if ( is_array( $field['value'] ) && ! empty( $field['value'] ) ) : ?>
                    <a class="acf-button button button-primary" href="<?php echo $download_url; ?>">일괄 다운로드</a>
                <?php endif; ?>
            </div>

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

        return $valid;

    }


    function input_admin_enqueue_scripts() {

        $url     = $this->settings['url'];
        $version = $this->settings['version'];

        wp_register_script( 'jt_acf_file_array', $url . 'js/input.js', array( 'jquery', 'jquery-ui-sortable', 'acf-input' ), $version );
        wp_enqueue_script( 'jt_acf_file_array' );


    }


    private function _make_thumbnail( $source_path, $thumb_width, $thumb_height = 0, $v_position = 'center', $h_position = 'center' ) {
        if ( ! is_readable( $source_path ) ) return false;

        list( $source_width, $source_height, $source_type ) = getimagesize( $source_path );

        // define canvas for source image
        switch ( $source_type ) {
            case IMAGETYPE_GIF:
            case 1:
                $source_image = imagecreatefromgif( $source_path ); break;
            case IMAGETYPE_JPEG:
            case 2:
                $source_image = imagecreatefromjpeg( $source_path ); break;
            case IMAGETYPE_PNG:
            case 3:
                $source_image = imagecreatefrompng( $source_path ); break;
            case IMAGETYPE_WBMP:
            case 15:
                $source_image = imagecreatefromwbmp( $source_path ); break;
            default:
                return false;
        }

        try {
            $exif = @exif_read_data( $source_path );

            if (isset($exif['Orientation'])) {
                switch ( $exif['Orientation'] ) {
                    case 2:
                        imageflip( $source_image, IMG_FLIP_HORIZONTAL );
                        break;
                    case 3:
                        $source_image = imagerotate( $source_image, 180, 0 );
                        break;
                    case 4:
                        imageflip( $source_image, IMG_FLIP_VERTICAL );
                        break;
                    case 5:
                        $source_image = imagerotate( $source_image, -90, 0 );
                        list( $source_height, $source_width, $source_type ) = getimagesize( $source_path );
                        imageflip( $source_image, IMG_FLIP_HORIZONTAL );
                        break;
                    case 6:
                        $source_image = imagerotate( $source_image, -90, 0 );
                        list( $source_height, $source_width, $source_type ) = getimagesize( $source_path );
                        break;
                    case 7:
                        $source_image = imagerotate( $source_image, 90, 0 );
                        list( $source_height, $source_width, $source_type ) = getimagesize( $source_path );
                        imageflip( $source_image, IMG_FLIP_HORIZONTAL );
                        break;
                    case 8:
                        $source_image = imagerotate( $source_image, 90, 0 );
                        list( $source_height, $source_width, $source_type ) = getimagesize( $source_path );
                        break;
                }
            }
        } catch ( Exception $e ) { }

        // calc size
        $width_ratio = @( float ) $source_width / $thumb_width;

        if ( $thumb_height > 0 ) {
            $height_ratio = @( float ) $source_height / $thumb_height;

            $base_ratio = ( $width_ratio < $height_ratio ) ? $width_ratio : $height_ratio;

            $resized_width = round( $thumb_width * $base_ratio );
            $resized_height = round( $thumb_height * $base_ratio );

            switch ( $v_position ) {
                case 'top':
                    $start_y = 0; break;
                case 'bottom':
                    $start_y = $source_height - $resized_height; break;
                case 'middle':
                case 'center':
                    $start_y = round( ( $source_height - $resized_height ) * 0.5 ); break;
                case 'natural':
                default:
                    $start_y = round( ( $source_height - $resized_height ) * 0.3 ); break;
            }

            switch ( $h_position ) {
                case 'left':
                    $start_x = 0; break;
                case 'right':
                    $start_x = $source_width - $resized_width; break;
                case 'center':
                case 'natural':
                default:
                    $start_x = round( ( $source_width - $resized_width ) * 0.5 ); break;
            }
        } else {
            $thumb_width = $thumb_width;
            $thumb_height = round( $source_height * ( $thumb_width / $source_width ) );
            $resized_width = $source_width;
            $resized_height = $source_height;

            $start_x = 0;
            $start_y = 0;
        }

        // create thumbnail
        $thumb_image = imagecreatetruecolor( $thumb_width, $thumb_height );

        $white = imagecolorallocate( $thumb_image, 255, 255, 255 );
        imagefill( $thumb_image, 0, 0, $white );
        imagecopyresampled( $thumb_image, $source_image, 0, 0, $start_x, $start_y, $thumb_width, $thumb_height, $resized_width, $resized_height );

        ob_start();
        imagejpeg( $thumb_image );
        $img = ob_get_clean();

        return 'data:' . mime_content_type( $source_path ) . ';base64,' . base64_encode( $img );
    }


}


new acf_field_jt_file_array( $this->settings );


}
