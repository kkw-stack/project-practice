( function ( $ ) {

    function initialize_field( $field ) {

        if ( $( '.jt-file-array.clone', $field ).length == 0 ) return false;

        $( '.jt-file-array-container', $field ).sortable( {
        } );
        $( '.jt-file-array-container', $field ).disableSelection();

        var $wrap = $( '.acf-input-wrap', $field );
        var min = parseInt( $wrap.data( 'min' ) );
        var max = parseInt( $wrap.data( 'max' ) );
        var $file = $( '.acf-actions input:file', $field );

        min = ( isNaN( min ) || min == 0 ? 0 : min );
        max = ( isNaN( max ) || max == 0 ? 0 : max );

        if ( max > 0 && $( '.jt-file-array:not(.clone)', $field ).length >= max ) {

            $( '.acf-actions', $field ).hide();

        }

        $file.on( 'change', function () {

            if ( this.files.length == 0 ) return;

            var file = this.files[0];
            var formData = new FormData();

            formData.append( 'action', 'jt_file_array_upload' );
            formData.append( 'file', file );

            $.ajax( {
                url: '/wp-admin/admin-ajax.php',
                type: 'post',
                processData: false,
                contentType: false,
                data: formData,
                success: function ( res ) {
                    if ( res.success == true ) {
                        var $target = $( '.jt-file-array.clone', $field ).clone();

                        $target.removeClass( 'clone' );
                        $target.find( 'input:hidden' ).prop( 'disabled', false );
                        $target.find( 'input:hidden' ).val( res.data.value );
                        $target.find( 'img' ).attr( 'src', res.data.preview );
                        $target.find( 'a' ).attr( 'href', res.data.value );

                        $target.appendTo( $( '.jt-file-array-container', $field ) );
                    } else {
                        alert( '파일 업로드 중 오류가 발생했습니다' );
                    }
                },
                error: function ( err ) {
                    console.log( err );
                }
            } );

            this.value = '';
            return false;

        } );

        $field.on( 'click', '.jt-file-array-add-row', function ( e ) {

            e.preventDefault();

            if ( $( '.jt-file-array.clone', $field ).length == 0 ) return false;

            if ( max == 0 ||  $( '.jt-file-array:not(.clone)', $field ).length < max ) {

                $file.trigger( 'click' );

            }

            return false;

        } );

        $field.on( 'click', '.jt-file-array-remove-row', function ( e ) {

            e.preventDefault();

            if ( $( '.jt-file-array.clone' ).length == 0 ) return false;

            $( this ).closest( 'li.jt-file-array' ).remove();

            if ( max == 0 || $( '.jt-file-array:not(.clone)', $field ).length < max ) {

                $( '.acf-actions', $field ).show();

            }

            return false;

        } );

    }


    if ( typeof acf.add_action !== 'undefined' ) {

        acf.add_action( 'ready_field/type=jt_file_array', initialize_field );
        acf.add_action( 'append_field/type=jt_file_array', initialize_field );

    } else {

        $( document ).on( 'acf/setup_fields', function ( e, postbox ) {

            $( postbox ).find( '.field[data-field_type="jt_file_array"]' ).each( function () {

                initialize_field( $( this ) );

            } );

        } );

    }

} )( jQuery );