window.sudoku = window.sudoku || {};

window.sudoku.renderer = function( options ){

    var element     = null,
        isComplete  = false,
        findCell    = function(row, col){
            return element.find('tr').eq(row).find('td').eq(col);
        },
        updateCell  = function( row, col, value, isDefault ){
            if( isComplete ){ return; }

            var cell        = findCell( row, col ),
                className   = (isDefault) ? 'v-default' : 'v-computed';

            if( cell.hasClass('v-default') || cell.hasClass('v-computed') ){
                className = 'v-double';
            }

            cell.addClass( className ).text( value );
        },
        complete    = function(){
            element.addClass('s-completed');
            isComplete = true;
        },
        init        = function( options ){
            // console.log('sudoku.renderer - Initializing');

            element = $( options.element );

            if( element.hasClass('s-completed') ){
                isComplete = true;
            }
        };

    // public methods
    this.updateCell = updateCell;
    this.complete = complete;
    this.isComplete = function(){ return isComplete; };

    // initialize
    init( options );
};