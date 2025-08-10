if ( typeof acf !== 'undefined' && typeof acf.add_filter !== 'undefined' ) {
    // function to merge two Javavascipt objects IE compatible, from prototype.js http://prototypejs.org/doc/latest/language/Object/extend/
    function extend( destination, source ) {
        for ( var property in source ) destination[ property ] = source[ property ];

        return destination;
    }

    // Acf hook -> Hooks -> Filters -> date_picker_args
    // see https://www.advancedcustomfields.com/resources/adding-custom-javascript-fields/
    acf.add_filter( 'date_picker_args', function( args, $field ) {
        // do something to args
        var year = ( new Date() ).getFullYear();
        var custom_args = {
            yearRange: '-' + ( year - 2021 ) + ':+3', // value to change
        };

        args = extend( args, custom_args );

        // return
        return args;
    } );
}