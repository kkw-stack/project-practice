<?php
function jt_admin_bar_menu( $wp_admin_bar ) {
    $node_new = $wp_admin_bar->get_node( 'new-content' );
    $node_post = $wp_admin_bar->get_node( 'new-post' );
    $node_page = $wp_admin_bar->get_node( 'new-page' );
    $node_notice = $wp_admin_bar->get_node( 'new-notice' );
    $node_event = $wp_admin_bar->get_node( 'new-event' );
    $node_blog = $wp_admin_bar->get_node( 'new-blog' );
    $node_user = $wp_admin_bar->get_node( 'new-user' );
    $node_shop = $wp_admin_bar->get_node( 'new-shop' );
    $node_media = $wp_admin_bar->get_node( 'new-media' );

    if ( $node_new ) {
        $wp_admin_bar->remove_node( 'new-content' );
        $node_new->href = admin_url( 'post-new.php?post_type=shop' );
        $wp_admin_bar->add_node( $node_new );
    }

    if ( $node_post ) $wp_admin_bar->remove_node( 'new-post' );
    if ( $node_page ) $wp_admin_bar->remove_node( 'new-page' );

    if ( $node_shop ) {
        $wp_admin_bar->remove_node( 'new-shop' );
        $wp_admin_bar->add_node( $node_shop );
    }

    if ( $node_notice ) {
        $wp_admin_bar->remove_node( 'new-notice' );
        $wp_admin_bar->add_node( $node_notice );
    }

    if ( $node_event ) {
        $wp_admin_bar->remove_node( 'new-event' );
        $wp_admin_bar->add_node( $node_event );
    }

    if ( $node_blog ) {
        $wp_admin_bar->remove_node( 'new-blog' );
        $wp_admin_bar->add_node( $node_blog );
    }

    if ( $node_media ) {
        $wp_admin_bar->remove_node( 'new-media' );
        $wp_admin_bar->add_node( $node_media );
    }

    if ( $node_user ) {
        $wp_admin_bar->remove_node( 'new-user' );
        $wp_admin_bar->add_node( $node_user );
    }
}
add_action( 'admin_bar_menu', 'jt_admin_bar_menu', 999 );


function jt_acf_user_field_display( $result, $user, $field, $post_id ) {
    return $user->display_name . ' (' . get_field( 'member_data_phone', 'user_' . $user->ID ) . ')';
}
add_filter( 'acf/fields/user/result', 'jt_acf_user_field_display', 10, 4 );


function jt_admin_title( $admin_title, $title ) {
    $page = ( isset( $_REQUEST['page'] ) ? $_REQUEST['page'] : '' );

    if ( $page == 'jt-review' && isset( $_REQUEST['view'] ) && intVal( $_REQUEST['view'] ) > 0 ) {
        $admin_title = str_replace( $title, $title . ' 수정', $admin_title );
    } elseif ( $page == 'jt-search-static' && empty( $title ) ) {
        $admin_title = '검색어 통계' . $admin_title;
    }

    return $admin_title;
}
add_filter( 'admin_title', 'jt_admin_title', 10, 2 );