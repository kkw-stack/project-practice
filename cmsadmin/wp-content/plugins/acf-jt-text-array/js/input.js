( function ( $ ) {

    function initialize_field( $field ) {

        $( '.jt-text-array-container', $field ).sortable( {
            axis: 'y',
            handle: '.acf-input-prepend',
        } );
        $( '.jt-text-array-container', $field ).disableSelection();

        var $wrap = $( '.acf-input-wrap', $field );
        var min = parseInt( $wrap.data( 'min' ) );
        var max = parseInt( $wrap.data( 'max' ) );

        min = ( isNaN( min ) || min == 0 ? 0 : min );
        max = ( isNaN( max ) || max == 0 ? 0 : max );

        if ( max > 0 && $( '.jt-text-array:not(.clone)', $field ).length >= max ) {

            $( '.acf-actions', $field ).hide();

        }

        $field.on( 'click', '.jt-text-array-add-row', function ( e ) {

            e.preventDefault();

            if ( $( '.jt-text-array.clone' ).length == 0 ) return false;

            var $target = $( '.jt-text-array.clone', $field ).clone();

            if ( max == 0 || $( '.jt-text-array:not(.clone)', $field ).length < max ) {

                $target.removeClass( 'clone' );
                $target.find( 'input:text, textarea' ).prop( 'disabled', false );

                $target.appendTo( $( '.jt-text-array-container', $field ) );

            }

            if ( max > 0 &&  $( '.jt-text-array:not(.clone)', $field ).length >= max ) {

                $( '.acf-actions', $field ).hide();

            }

            return false;

        } );

        $field.on( 'click', '.jt-text-array-remove-row', function ( e ) {

            e.preventDefault();

            if ( $( '.jt-text-array.clone' ).length == 0 ) return false;

            $( this ).closest( 'li.jt-text-array' ).remove();

            if ( max == 0 || $( '.jt-text-array:not(.clone)', $field ).length < max ) {

                $( '.acf-actions', $field ).show();

            }

            return false;

        } );

    }


    if ( typeof acf.add_action !== 'undefined' ) {

        acf.add_action( 'ready_field/type=jt_text_array', initialize_field );
        acf.add_action( 'append_field/type=jt_text_array', initialize_field );

    } else {

        $( document ).on( 'acf/setup_fields', function ( e, postbox ) {

            $( postbox ).find( '.field[data-field_type="jt_text_array"]' ).each( function () {

                initialize_field( $( this ) );

            } );

        } );

    }

} )( jQuery );