<?php
/* ************************************** *
 * Add requeried theme support
 * ************************************** */
function jt_blocks_theme_support(){
	
    // Disable block pattern section
    remove_theme_support( 'core-block-patterns' );

    // repelace default color with custom setting
	add_theme_support( 'editor-color-palette' );

     // removes the text box where users can enter custom pixel sizes
     add_theme_support('disable-custom-font-sizes');

     // remove font sizes picker
     add_theme_support( 'editor-font-sizes' );

     // Responsive embedded content
     add_theme_support( 'responsive-embeds' );

}
add_action( 'after_setup_theme', 'jt_blocks_theme_support' );



/* ************************************** *
 * Enqueue Admin Block editor custom  style
 * ************************************** */
function jt_blocks_editor_styles() {
	
    wp_enqueue_style( 'block-editor-styles', get_bloginfo('template_directory').'/css/admin-blocks-editor.css', false, '1.0', 'all' );
	
}
add_action( 'enqueue_block_editor_assets', 'jt_blocks_editor_styles' );




/* ************************************** *
 * Custom color setting
 * jt-stap.css style update 필수 
 * ************************************** */
function jt_blocks_color_palette() {
    add_theme_support(
        'editor-color-palette', array(
            array(
                'name'  => '청록색',
                'slug' => 'type-01',
                'color' => '#2AC1BC',
            ),
            array(
                'name'  => '검은색',
                'slug' => 'type-03',
                'color' => '#222222',
            ),
            array(
                'name'  => '회색',
                'slug' => 'type-02',
                'color' => '#666666',
            ),
            array(
                'name'  => '흰색',
                'slug' => 'type-04',
                'color' => '#ffffff',
            ),
            array(
                'name'  => '라이트 그레이',
                'slug' => 'type-05',
                'color' => '#f8f8f8',
            )
        )
    );
}
add_action( 'after_setup_theme', 'jt_blocks_color_palette' );



/* ************************************** *
 * BLACK LIST COMPONENT USING JS
 * ************************************** */
function jt_blacklist_blocks() {
	
    wp_enqueue_script(
        'jt-gutenberg-blacklist',
        get_bloginfo('template_directory').'/js/blocks-blacklist.js',
        array( 'wp-blocks' ),
		0.2
    );
	
}
add_action( 'enqueue_block_editor_assets', 'jt_blacklist_blocks' );


