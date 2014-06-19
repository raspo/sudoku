window.sudoku = window.sudoku || {};

window.sudoku.reader = (function(){

    // loop through each cell to built an array of 81 elements
    // containing the value of each cell
    // empty cells will have a value of null
    var readDataFromElement = function( element ){
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
        getData = function( options ){
            if( !options.element ){
                console.error('sudoku.reader => No element specified');
                return false;
            }

            var element = $( options.element );

            if( !element.length ){
                console.error('sudoku.reader => The element was not found on the page');
                return false;
            }

            return readDataFromElement( element );
        };

    return {
        getData : getData
    };

}());