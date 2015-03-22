window.sudoku = window.sudoku || {};

window.sudoku.solve = function(params){
    // default options
    var defaults = {
            'element'   : null,
            'dimension' : 9
        };

    options = $.extend({}, defaults, params);

    // sanity check
    if( !window.sudoku.reader || !window.sudoku.solver || !window.sudoku.renderer ){
        console.error('There are missing dependencies');
        return false;
    }

    // get data from the sudoku.reader module
    options.data = window.sudoku.reader.getData( options );

    // add a reference to the renderer onto the options object
    options.renderer = new window.sudoku.renderer( options );

    if( !options.renderer.isComplete() ){
        // TODO
        // storing the solver instance is pretty much pointless at this stage
        // will probably do something with it later
        var solver = new window.sudoku.solver( options );
    }
};