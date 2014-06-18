window.sudoku = window.sudoku || {};

window.sudoku.updater = (function(){

    var element = null,
        getCell     = function(row, col){
            return element.find('tr').eq(row).find('td').eq(col);
        },
        updateCell  = function( row, col, value, isDefault ){
            var cell = getCell( row, col ),
                className = (isDefault) ? 'v-default' : 'v-computed';

            if( cell.hasClass('v-default') || cell.hasClass('v-computed') ){
                className = 'v-double';
            }

            cell.addClass( className ).text( value );
        },
        init  = function( selector ){

            console.log('initializing sudoku.updater');

            element = $( selector );
        };

    return {
        init        : init,
        updateCell  : updateCell
    };

}());