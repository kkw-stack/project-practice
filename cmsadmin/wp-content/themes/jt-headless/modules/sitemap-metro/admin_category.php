<?php defined("ABSPATH") or die("Nothing to see here."); // Security (disable direct access).

if (isset($_POST["category_sort_action_nonce"]) && wp_verify_nonce($_POST["category_sort_action_nonce"], "category_sort_action_nonce")) {
    if (isset($_POST["category"]) && is_array($_POST["category"]) && count($_POST["category"]) > 0) {
        $this->updateCategorySort($_POST["category"]);
    }

}

$terms = get_terms("sitemap_metro_categories", [
    "hide_empty"    => false,
    "parent"        => 0,
]);
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
    <h2>지하철역 호선 순서 관리</h2>

    <form method="post">
        <?php wp_nonce_field("category_sort_action_nonce", "category_sort_action_nonce"); ?>

        <?php
            $this->_render_terms(0);
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
    }
});
</script>
