<style>
.wp-list-table th { font-weight: 600 !important; font-size: 1.2em;}
.jt-column-header-code { width: 30px; }
.jt-column-header-title {  }
.jt-column-header-static { width: 80px; }

p.nofounds {text-align:center;line-height:50px;vertical-align:middle;}

.datepicker { background-color: #fff !important; }
</style>

<div class="wrap">
    <h2>검색어 통계</h2>
    <form method="get">
        <input type="hidden" name="page" value="jt-search-static" />

        <p class="search-box">
            <label class="screen-reader-text" for="post-search-input">검색:</label>
            <input type="search" id="post-search-input" name="s" value="<?php echo $search; ?>">
            <input type="submit" id="search-submit" class="button" value="검색">
        </p>

        <div class="tablenav top">
            <div class="alignleft actions">
                <label for="filter-by-date" class="screen-reader-text">날짜로 필터</label>
                <input type="text" name="start_date" class="datepicker" value="<?php echo $start_date; ?>" readonly />
                ~
                <input type="text" name="end_date" class="datepicker" value="<?php echo $end_date; ?>" readonly />
                <input type="submit" name="filter_action" id="post-query-submit" class="button" value="검색">
            </div>

            <?php jt_admin_pagination_html( $paged, $cnt, $rpp, admin_url( 'admin.php?page=jt-search-static' ), true ); ?>
            <br class="clear" />
        </div>
    </form>

    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th scope="col" class="manage-column column-primary jt-column-header-code" style="width:10%;">순위</th>
                <th scope="col" class="manage-column column-primary jt-column-header-title">검색어</th>
                <th scope="col" class="manage-column column-primary jt-column-header-static" style="width:20%;">누적 검색 횟수</th>
            </tr>
        </thead>

        <tbody>
            <?php if ( is_array( $res ) && count( $res ) > 0 ) : ?>

                <?php foreach ( $res as $idx => $row ) : ?>

                    <tr>
                        <!-- <td><?php echo ( $cnt - ( ( $paged - 1 ) * $rpp ) - $idx ); ?></td> -->
                        <td><?php echo ( ( ( $paged - 1 ) * $rpp ) + $idx ) + 1; ?></td>
                        <td><?php echo $row[ 'search' ]; ?></td>
                        <td><?php echo number_format( $row[ 'cnt' ] ); ?></td>
                    </tr>

                <?php endforeach; ?>

            <?php else : ?>

                <tr>
                    <td colspan="3">
                        <p class="nofounds">등록된 검색어가 없습니다</p>
                    </td>
                </tr>

            <?php endif; ?>
        </tbody>
    </table>


        <div class="tablenav bottom">
            <?php jt_admin_pagination_html( $paged, $cnt, $rpp, admin_url( 'admin.php?page=jt-search-static' ), false ); ?>
            <br class="clear" />
        </div>
</div>

<script>
jQuery( function ( $ ) {
    $( '.datepicker' ).datepicker( { dateFormat: 'yy-mm-dd' } );

    jQuery.datepicker.setDefaults( {
        dateFormat          : 'yy-mm-dd',
        prevText            : '이전 달',
        nextText            : '다음 달',
        monthNames          : [ '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월' ],
        monthNamesShort     : [ '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월' ],
        dayNames            : [ '일', '월', '화', '수', '목', '금', '토' ],
        dayNamesShort       : [ '일', '월', '화', '수', '목', '금', '토' ],
        dayNamesMin         : [ '일', '월', '화', '수', '목', '금', '토' ],
        showMonthAfterYear  : true,
        yearSuffix          : '년'
    } );
} );
</script>