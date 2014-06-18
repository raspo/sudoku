window.sudoku = window.sudoku || {};

window.sudoku.reader = (function(){

    var element     = null,
        // loop through each cell to built an array of 81 elements
        // containing the value of each cell if any
        // otherwise, the value will be null
        readData    = function(){

            var data    = [],
                value   = null;

            // loop through each table row
            element.find('tr').each(function( rowIndex ){

                $(this).find('td').each(function( colIndex ){

                    value = $(this).text() || null;

                    data.push( value );

                });

            });

            return data;
        },
        init    = function( selector ){

            console.log('initializing sudoku.reader');

            element = $( selector );

            return readData();
        };

    return {
        init  : init
    };

}());