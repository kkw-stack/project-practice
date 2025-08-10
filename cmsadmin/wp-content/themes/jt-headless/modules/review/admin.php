<?php defined( 'ABSPATH' ) or die( 'Nothing to see here.' ); // Security (disable direct access).

global $wpdb;

$uid = intVal( isset( $_REQUEST['view'] ) && intVal( $_REQUEST['view'] ) > 0 ? $_REQUEST['view'] : 0 );

?>

<style>
.jt-single th { width: 20%; min-width: 200px; }

.jt-column-header-code { width: 30px; }
.jt-column-header-title { width: *; }
.jt-column-header-nickname { width: 20%; min-width: 327px; }
.jt-column-header-created { width: 14%; }
.jt-column-header-status { width: 10%; }
.jt-column-header-is_owner { width: 100px; }


p.nofounds {text-align:center;line-height:50px;vertical-align:middle;}
</style>

<div class="wrap">
    <?php if ( $uid == 0 ) : ?>

        <?php
            $rpp = 20; // ( defined( 'DOING_AJAX' ) && DOING_AJAX ? 10 : 20 );
            $search = esc_attr( isset( $_REQUEST['s'] ) && ! empty( $_REQUEST['s'] ) ? $_REQUEST['s'] : '' );
            $status = ( isset( $_REQUEST['jt_status'] ) && in_array( $_REQUEST['jt_status'], array( 'ALL', 'Y', 'N', 'B' ) ) ? $_REQUEST['jt_status'] : 'ALL' );
            $paged = intVal( isset( $_REQUEST['paged'] ) && intVal( $_REQUEST['paged'] ) > 0 ? $_REQUEST['paged'] : 1 );
            $author = intVal( isset( $_REQUEST['jt_author'] ) && intVal( $_REQUEST['jt_author'] ) > 0 ? $_REQUEST['jt_author'] : 0 );
            $start = ( $paged - 1 ) * $rpp;
            $where = '';

            if ( $status && $status !== 'ALL' ) {
                $where .= $wpdb->prepare( " AND status = %s ", $status );
            }

            if ( $search ) {
                $where .= $wpdb->prepare( " AND content LIKE %s ", '%' . str_replace( ' ', '%', $search ). '%' );
            }

            if ( $author > 0 ) {
                $where .= $wpdb->prepare( " AND user_id = %d ", $author );
            }

            $cnt_t = $wpdb->get_var(
                "   SELECT COUNT( * )
                    FROM {$this->_table}
                        INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_table}.user_id
                    WHERE status <> 'D' AND revision = 0
                "
            );
            $cnt_n = $wpdb->get_var(
                "   SELECT COUNT( * )
                    FROM {$this->_table}
                        INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_table}.user_id
                    WHERE status = 'N' AND revision = 0
                "
            );
            $cnt_y = $wpdb->get_var(
                "   SELECT COUNT( * )
                    FROM {$this->_table}
                        INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_table}.user_id
                    WHERE status = 'Y' AND revision = 0
                "
            );
            $cnt_b = $wpdb->get_var(
                "   SELECT COUNT( * )
                    FROM {$this->_table}
                        INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_table}.user_id
                    WHERE status = 'B' AND revision = 0
                "
            );
            $cnt = $wpdb->get_var(
                "   SELECT COUNT( * )
                    FROM {$this->_table}
                        INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_table}.user_id
                    WHERE status <> 'D' AND revision = 0 {$where}
                "
            );
            $list = $wpdb->get_results(
                "   SELECT *
                    FROM {$this->_table}
                        INNER JOIN {$wpdb->users} ON {$wpdb->users}.ID = {$this->_table}.user_id
                    WHERE status <> 'D' AND revision = 0 {$where}
                    ORDER BY uid DESC
                    LIMIT {$start}, {$rpp}
                ",
                ARRAY_A
            );

            $base_url = admin_url( 'admin.php?page=jt-review' );
            $res_url = $base_url;

            if ( $search ) {
                $res_url = add_query_arg( 's', $search, $res_url );
            }

            if ( $status ) {
                $res_url = add_query_arg( 'jt_status', $status, $res_url );
            }
        ?>

        <h1 class="wp-heading-inline">후기관리</h1>
        <?php if ( ! empty( $search ) ) : ?> <span class="subtitle">검색 결과: <strong><?php echo $search; ?></strong></span> <?php endif; ?>

        <hr class="wp-header-end">

        <ul class="subsubsub">
            <li>
                <a href="<?php echo add_query_arg( 'jt_status', 'ALL', $base_url ); ?>" <?php echo ( $status == 'ALL' ? 'class="current"' : '' ); ?>>
                    모두
                    <span class="count">(<?php echo $cnt_t; ?>)</span>
                </a>
            </li>
            <li>|</li>
            <li>
                <a href="<?php echo add_query_arg( 'jt_status', 'N', $base_url ); ?>" <?php echo ( $status == 'N' ? 'class="current"' : '' ); ?>>
                    미승인
                    <span class="count">(<?php echo $cnt_n; ?>)</span>
                </a>
            </li>
            <li>|</li>
            <li>
                <a href="<?php echo add_query_arg( 'jt_status', 'Y', $base_url ); ?>" <?php echo ( $status == 'Y' ? 'class="current"' : '' ); ?>>
                    승인완료
                    <span class="count">(<?php echo $cnt_y; ?>)</span>
                </a>
            </li>
            <li>|</li>
            <li>
                <a href="<?php echo add_query_arg( 'jt_status', 'B', $base_url ); ?>" <?php echo ( $status == 'B' ? 'class="current"' : '' ); ?>>
                    Blocked
                    <span class="count">(<?php echo $cnt_b; ?>)</span>
                </a>
            </li>
        </ul>


        <form method="get">
            <input type="hidden" name="page" value="jt-review" />
            <input type="hidden" name="jt_status" value="<?php echo $status; ?>" />

            <p class="search-box">
                <label class="screen-reader-text" for="post-search-input">검색:</label>
                <input type="search" id="post-search-input" name="s" value="">
                <input type="submit" id="search-submit" class="button" value="후기내용 검색">
            </p>

            <div class="tablenav top">
                <?php jt_admin_pagination_html( $paged, $cnt, $rpp, $res_url, true ); ?>
                <br class="clear" />
            </div>
        </form>

        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th scope="col" class="manage-column column-primary jt-column-header-code">번호</th>
                    <th scope="col" class="manage-column column-primary jt-column-header-title">샵 이름</th>
                    <th scope="col" class="manage-column column-primary jt-column-header-nickname">닉네임</th>
                    <th scope="col" class="manage-column column-primary jt-column-header-is_owner">샵주여부</th>
                    <th scope="col" class="manage-column column-primary jt-column-header-status">상태</th>
                    <th scope="col" class="manage-column column-primary jt-column-header-created">작성일자</th>
                </tr>
            </thead>

            <tbody>
                <?php if ( is_array( $list ) && count( $list ) > 0 ) : ?>
                    <?php foreach ( $list as $idx => $row ) : $user = get_userdata( $row['user_id'] ); ?>
                        <tr>
                            <td><?php echo ( $cnt - ( ( $paged - 1 ) * $rpp ) - $idx ); ?></td>
                            <td><a href="<?php echo admin_url( 'admin.php?page=jt-review&view=' . $row['uid'] ); ?>"><?php echo get_the_title( $row['post_id'] ); ?></a></td>
                            <td><a href="<?php echo add_query_arg( 'jt_author', $user->ID, $base_url ); ?>"><?php echo $user->display_name; ?></a></td>
                            <td><?php echo ( $row['is_owner'] == 'Y' ? '샵주' : '-' ); ?></td>
                            <td><?php echo ( $row['status'] == 'Y' ? '승인완료' : ( $row['status'] == 'B' ? 'Blocked' : ( $row['status'] == 'D' ? '삭제' : '미승인' ) ) ); ?></td>
                            <td><?php echo date_i18n( 'Y/m/d, g:i a', strtotime( $row['created'] ) ); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php else : ?>
                    <tr>
                        <td colspan="5">
                            <p class="nofounds">등록된 후기가 없습니다</p>
                        </td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>

        <form method="get">
            <input type="hidden" name="page" value="jt-review" />

            <div class="tablenav top">
                <?php jt_admin_pagination_html( $paged, $cnt, $rpp, $res_url, false ); ?>
                <br class="clear" />
            </div>
        </form>
    <?php else : ?>
        <?php
            $data = $wpdb->get_row( $wpdb->prepare( " SELECT * FROM {$this->_table} WHERE uid = %d LIMIT 1 ", $uid ), ARRAY_A );
            $status_label = array(
                'N' => '미승인',
                'Y' => '승인',
                'B' => 'Blocked',
                'D' => '삭제',
            );
        ?>

        <h1 class="wp-heading-inline">후기관리 수정</h1>
        <hr class="wp-header-end">
        <ul class="subsub"></ul>

        <table class="wp-list-table widefat fixed striped jt-single">
            <tbody>
                <tr>
                    <th>샵 이름</th>
                    <td><?php echo get_the_title( $data['post_id'] ); ?></td>
                </tr>
                <tr>
                    <th>닉네임</th>
                    <td><?php the_author_meta( 'nickname', $data['user_id'] ); ?></td>
                </tr>
                <tr>
                    <th>샵주여부</th>
                    <td><?php echo ( $data['is_owner'] == 'Y' ? '샵주' : '-' ); ?></td>
                </tr>
                <tr>
                    <th>작성일자</th>
                    <td><?php echo date_i18n( 'Y년 m월 d일, H:i', strtotime( $data['created'] ) ); ?></td>
                </tr>
                <tr>
                    <th>별점</th>
                    <td><?php echo $data['score']; ?></td>
                </tr>
                <tr>
                    <th>후기내용</th>
                    <td><?php echo nl2br( preg_replace( '"(\r?\n){3,}"', PHP_EOL . PHP_EOL, $data['content'] ) ); ?></td>
                </tr>
                <tr>
                    <th>첨부이미지</th>
                    <td>
                        <?php if ( $data['file'] ) : ?>
                            <img src="<?php echo home_url() . $data['file']; ?>" style="width:500px;" />
                        <?php else: ?>
                            -
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <th>상태</th>
                    <td>
                        <button type="button" class="disallow_review button <?php echo ( $data['status'] == 'N' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $data['uid']; ?>">
                            <span>미승인</span>
                        </button>
                        <button type="button" class="allow_review button <?php echo ( $data['status'] == 'Y' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $data['uid']; ?>">
                            <span>승인완료</span>
                        </button>
                        <button type="button" class="block_review button <?php echo ( $data['status'] == 'B' ? 'button-primary' : '' ); ?>" data-uid="<?php echo $data['uid']; ?>">
                            <span>Block</span>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <script>
        jQuery( function ( $ ) {
            $( '.allow_review' ).on( 'click', function () {
                var $this   = $( this );
                var uid     = $this.data( 'uid' );

                if ( $this.hasClass( 'button-primary' ) ) return false;

                $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'review_admin_action', uid: uid, status: 'Y' }, function ( res ) {
                    if ( res.success ) {
                        alert( '승인을 완료했습니다' );
                    } else {
                        alert( '오류가 발생했습니다' );
                    }

                    location.reload();
                    return false;
                } );
            } );

            $( '.disallow_review' ).on( 'click', function () {
                var $this   = $( this );
                var uid     = $this.data( 'uid' );

                if ( $this.hasClass( 'button-primary' ) ) return false;

                $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'review_admin_action', uid: uid, status: 'N' }, function ( res ) {
                    if ( res.success ) {
                        alert( '미승인으로 변경했습니다' );
                    } else {
                        alert( '오류가 발생했습니다' );
                    }

                    location.reload();
                    return false;
                } );
            } );

            $( '.block_review' ).on( 'click', function () {
                var $this   = $( this );
                var uid     = $this.data( 'uid' );

                if ( $this.hasClass( 'button-primary' ) ) return false;

                $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'review_admin_action', uid: uid, status: 'B' }, function ( res ) {
                    if ( res.success ) {
                        alert( 'Block으로 처리했습니다' );
                    } else {
                        alert( '오류가 발생했습니다' );
                    }

                    location.reload();
                    return false;
                } );
            } );

            <?php /*
            $( '.del_review' ).on( 'click', function () {
                var $this   = $( this );
                var uid     = $this.data( 'uid' );

                $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', { action: 'review_admin_action', uid: uid, status: 'D' }, function ( res ) {
                    if ( res.success ) {
                        alert( '삭제되었습니다' );
                        location.href = '<?php echo admin_url( 'admin.php?page=jt-review' ); ?>';
                    } else {
                        alert( '오류가 발생했습니다' );
                        location.reload();
                    }
                } );

                return false;
            } );
            */ ?>
        } );
        </script>
    <?php endif; ?>
</div>