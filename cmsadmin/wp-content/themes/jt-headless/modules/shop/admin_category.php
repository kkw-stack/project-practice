<?php defined( 'ABSPATH' ) or die( 'Nothing to see here.' ); // Security (disable direct access).

$arr_ca = array(
    'shop_categories'   => '샵 카테고리',
    'shop_area'         => '지역 카테고리',
);

$cate = (isset($_REQUEST['category']) && in_array($_REQUEST['category'], array_keys($arr_ca)) ? $_REQUEST['category'] : 'shop_categories');

if (isset($_POST['category_sort_action_nonce']) && wp_verify_nonce($_POST['category_sort_action_nonce'], 'category_sort_action_nonce')) {
    $cate = ($_POST['category']['cate'] ? $_POST['category']['cate'] : $cate);


    if ($cate == 'shop_categories') {
        $main_ids = array_map('intVal', array_filter(explode(',', trim($_POST['category']['main']))));
        $sub_ids = array_map('intVal', array_filter(explode(',', trim($_POST['category']['sub']))));
        $tmp_ids = get_terms($cate, array(
            'hide_empty'    => false,
            'fields'        => 'ids',
        ));

        foreach ($tmp_ids as $tmp_id) {
            $tmp_type = 'disable';

            if (in_array($tmp_id, $main_ids)) $tmp_type = 'main';
            elseif (in_array($tmp_id, $sub_ids)) $tmp_type = 'sub';

            update_term_meta($tmp_id, '_shop_type', $tmp_type);
        }
    }

    if (isset($_POST['category']) && is_array($_POST['category']) && count($_POST['category']) > 0) {
        $this->update_category_sort($this->_esc_attr($_POST['category']));
    }

}

$terms = get_terms($cate, array(
    'hide_empty'    => false,
    'parent'        => 0,
));
?>

<style>
    /* Style the buttons that are used to open and close the accordion panel */
    .accordion {
        display: block;
        background-color: #e1e1e1;
        color: #444;
        padding: 18px;
        width: 100%;
        text-align: left;
        border: none;
        outline: none;
        transition: 0.4s;
    }

    /* Style the accordion panel. Note: hidden by default */
    .panel {
        padding: 18px;
        background-color: white;
        /* display: none; */
        overflow: hidden;
    }

    .sortable, .sortable li, .shop_sortable, .shop_sortable li {
        overflow: hidden;
    }

    .sortable li, .shop_sortable li { border: 1px solid #e1e1e1; }

    .shop_sortable {
        /* min-height: 100px; */
        border: 1px solid #e1e1e1;
        padding: 15px;
    }
</style>

<div class="wrap">
    <h2>카테고리 순서 관리</h2>

    <h2 class="nav-tab-wrapper">
        <?php foreach ( $arr_ca as $key => $val ) : ?>
        <a href="<?php echo admin_url('edit.php?post_type=shop&page=jt-shop-category-sort&category=' . $key); ?>" class="nav-tab <?php echo ($cate == $key ? 'nav-tab-active' : ''); ?>">
            <?php echo $val; ?>
        </a>
        <?php endforeach; ?>
    </h2>

    <form method="post">
        <?php wp_nonce_field('category_sort_action_nonce', 'category_sort_action_nonce'); ?>
        <input type="hidden" name="category[cate]" value="<?php echo $cate; ?>" />

        <?php
            if ($cate == 'shop_categories') {
                $this->_render_terms($cate, 0, 0, 'main');
                $this->_render_terms($cate, 0, 0, 'sub');
                $this->_render_terms($cate, 0, 0, 'disable');
            } else {
                $this->_render_terms($cate, 0);
            }
            submit_button();
        ?>
    </form>
</div>

<script>
jQuery( function ( $ ) {
    init();

    function init() {
        // ACCORDION INIT
        $('.accordion').on('click', function () {
            var $this = $(this);
            var $target = $this.siblings('.sortable');

            if ($target.length > 0) {
                $this.toggleClass('active');

                if ($this.hasClass('active')) {
                    $target.slideDown();
                } else {
                    $target.slideUp();
                }
            }

            return false;
        });

        // SORTABLE INIT
        $('ul.sortable').sortable({
            update: function () {
                $wrap = $(this);
                $wrap.find('> li > input:hidden').each(function (idx, item) {
                    $(item).val(idx + 1);
                });
            }
        });
        $('ul.sortable').disableSelection();

        // ShopCategory Sortable Init
        $('ul.shop_sortable').sortable({
            connectWith: 'ul.shop_sortable',
            dropOnEmpty: true,
            update: function () {
                ['main', 'sub', 'disable'].map(function (key) {
                    var tmp_ids = [];
                    $('ul.shop_sortable.' + key + ' li').each(function () {
                        tmp_ids.push($(this).data('term'));
                    });
                    $('ul.shop_sortable.' + key + ' input[name="category[' + key + ']"]').val(tmp_ids.join(','));

                    console.log(key, $('ul.shop_sortable.' + key + ' input[name="category[' + key + ']"]').val());
                } );


                $('ul.shop_sortable > li > input:hidden').each(function (idx, item) {
                    $(item).val(idx + 1);
                });
            }
        });
        $('ul.shop_sortable').disableSelection();
    }
});
</script>
