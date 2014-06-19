window.sudoku = window.sudoku || {};

window.sudoku.renderer = function( options ){

    var element     = null,
        findCell    = function(row, col){
            return element.find('tr').eq(row).find('td').eq(col);
        },
        updateCell  = function( row, col, value, isDefault ){

            var cell        = findCell( row, col ),
                className   = (isDefault) ? 'v-default' : 'v-computed';

            if( cell.hasClass('v-default') || cell.hasClass('v-computed') ){
                className = 'v-double';
            }

            cell.addClass( className ).text( value );
        },
        init        = function( options ){
            console.log('sudoku.renderer - Initializing');

            element = $( options.element );
        };

    // expose updateCell as a public method
    this.updateCell = updateCell;

    // initialize
    init( options );
};