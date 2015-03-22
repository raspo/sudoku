window.sudoku = window.sudoku || {};

window.sudoku.solver = function( options ){

    var renderer            = null,
        dimension           = null,
        sectorsDimension    = null,
        counters            = {
            masterCycle     : 0,
            cellsCycle      : 0,
            rowsCycle       : 0,
            colsCycle       : 0,
            sectorsCycle    : 0,
            backtracks      : 0
        },
        cycleCounter        = 0,
        time                = {
            start   : null,
            finish  : null
        },
        store               = {
            cells   : [],
            rows    : [],
            cols    : [],
            sectors : [],
            found   : []
        },
        mode                = 'normal',
        // cycle               = function(){
        //     counters.masterCycle += 1;

        //     var foundbeforeCycle = store.found.length;

        //     cycleCells();
        //     cycleRows();
        //     cycleCols();
        //     cycleSectors();

        //     checkResults( foundbeforeCycle );
        // },

        updateView          = function( isDefault ){
            if( renderer ){
                for(var i=0; i<store.cells.length; i++){

                    var cell = store.cells[i];

                    if( cell.value && !cell.isRendered ){
                        cell.isRendered = true;
                        renderer.updateCell( cell.row, cell.col, cell.value, isDefault );
                    }
                }
            }
        },

        checkResults        = function( foundbeforeCycle ){

            var missing = getMissing();

            updateView();

            if( missing.length === 0 ){
                console.log('found solution!');
                renderer.complete();
            } else {

                // if( mode === 'normal' ){

                //     // go into brutal mode
                //     mode = 'brutal';
                //     brutalCycle();

                // } else {

                    console.log('cannot find solution!');
                    console.log( missing.length + ' are still missing', missing);

                // }


            }

            // if( store.found.length === store.cells.length ){




            // } else if( foundbeforeCycle !== store.found.length ){

            //     if( mode === 'brutal' ){

            //         brutalCycle();

            //     } else {

            //         cycle();

            //     }

            // } else {

            //     if( mode === 'normal' ){

            //         // go into brutal mode
            //         mode = 'brutal';
            //         brutalCycle();

            //     } else {

            //         console.log('cannot find solution!');

            //         var missing = getMissing();

            //         console.log( missing.length + ' are still missing', missing);

            //     }
            // }
        },
        // brutalCycle         = function(){
        //     counters.masterCycle += 1;

        //     var foundbeforeCycle = store.found.length;

        //     // console.log('ENGAGE BRUTAL MODE');

        //     var missing         = getMissing(),
        //         foundValue      = false,
        //         possibleValue   = 0,
        //         cell            = null;

        //     for(var i=0; i<missing.length;){

        //         if( i < 0 ){ break; }

        //         possibleValue = store.cells[i].value + 1;
        //         foundValue = false;

        //         console.log(possibleValue);
        //         //cell.log();

        //         while( !foundValue && possibleValue <= dimension ) {

        //             console.log('checking value: ' + possibleValue);

        //             if( !store.cells[i].checkForValue( possibleValue ) ){

        //                 // If a valid value is found, mark found true,
        //                 // set the position to the value, and move to the
        //                 // next position

        //                 foundValue = true;
        //                 store.cells[i].setValue( possibleValue );
        //                 i++;

        //             } else {

        //                 // Otherwise, try the next value
        //                 possibleValue++;

        //             }
        //         }


        //         if( foundValue === false ){
        //             store.cells[i].setValue( null );
        //             // backtrack
        //             i = i-1;
        //             counters.backtracks += 1;

        //             console.log('BACKTRACKKKK');
        //         }
        //     }

        //     //checkResults( foundbeforeCycle );
        // },

        solve           = function(){
            counters.masterCycle += 1;

            var missing     = getMissing(),
                foundValue  = false,
                testValue   = 0,
                cellIndex   = 0,
                cell        = null;

            for(var i=0; i<missing.length;){

                if( i < 0 ){ break; }

                cellIndex = missing[i];
                cell = store.cells[cellIndex];

                testValue = cell.value + 1;
                foundValue = false;

                while( !foundValue && testValue <= dimension ) {

                    if( checkValue( cell.row, cell.col, cell.sector, testValue ) ){

                        // If a valid value is found, mark found true,
                        // set the position to the value, and move to the
                        // next position

                        foundValue = true;
                        setValue( cellIndex, testValue );
                        i++;

                    } else {

                        // Otherwise, try the next value
                        testValue++;

                    }
                }

                if( foundValue === false ){
                    setValue( cellIndex, null );
                    // backtrack
                    i = i-1;
                    counters.backtracks += 1;
                }
            }

            checkResults();
        },

        checkValue          = function( row, col, sector, value ){
            if(value && value <= dimension){
                if( checkRow( row, value ) && checkCol( col, value ) && checkSector( sector, value ) ){
                    return true;
                }
            }
            return false;
        },

        checkRow        = function(rowIndex, value){
            var isValidValue = true;
            for( var i=0; i<store.rows[rowIndex].length; i++ ){
                var cellIndex = store.rows[rowIndex][i];
                if( store.cells[cellIndex].value === value ){
                    return false;
                }
            }
            return isValidValue;
        },

        checkSector     = function(sectorIndex, value){
            var isValidValue = true;
            for( var i=0; i<store.sectors[sectorIndex].length; i++ ){
                var cellIndex = store.sectors[sectorIndex][i];
                if( store.cells[cellIndex].value === value ){
                    return false;
                }
            }
            return isValidValue;
        },

        checkCol        = function(colIndex, value){
            var isValidValue = true;
            for( var i=0; i<store.cols[colIndex].length; i++ ){
                var cellIndex = store.cols[colIndex][i];
                if( store.cells[cellIndex].value === value ){
                    return false;
                }
            }
            return isValidValue;
        },

        getMissing      = function(){
            var missing = [];
            for( var i=0; i<store.cells.length; i++ ){
                if( !store.cells[i].value ){
                    missing.push( i );
                }
            }
            return missing;
        },

        parseData       = function( flatData ){
            var cellValue   = null,
                rowIndex    = 0,
                colIndex    = 0,
                sectorIndex = 0;

            // build empty arrays of rows, cols and sectors objects
            for( var j=0; j<dimension; j++ ){
                store.rows.push([]);
                store.cols.push([]);
                store.sectors.push([]);
            }

            // loop through each item of the flat flatData
            for( var i=0; i<flatData.length; i++ ){

                if( (i !== 0) && (i % dimension === 0) ){
                    rowIndex += 1;
                }

                colIndex = i % dimension;

                // figure out the sector index
                if(colIndex % sectorsDimension === 0){
                    sectorIndex = (Math.floor( rowIndex / sectorsDimension ) * sectorsDimension) + (colIndex / sectorsDimension);
                }

                store.cells[ i ] = {
                    value       : null,
                    id          : i,
                    row         : rowIndex,
                    col         : colIndex,
                    sector      : sectorIndex,
                    isRendered  : false
                };

                // add a reference to the cell id on each row, col and sector
                store.rows[ rowIndex ].push(i);
                store.cols[ colIndex ].push(i);
                store.sectors[ sectorIndex ].push(i);

                // convert the value into a number
                cellValue = (flatData[i] !== null) ? parseInt(flatData[i], 10) : null;

                setValue( i, cellValue, true );
            }

            updateView(true);
        },

        setValue       = function( cellIndex, value ){
            var cell = store.cells[ cellIndex ];
            cell.value = value;
        };

        validateData    = function( flatData, dimension ){
            if( !flatData || !dimension ){
                return false;
            }

            if( flatData.length !== Math.pow(dimension, 2) ){
                return false;
            }

            for( var i=0; i<flatData.length; i++ ){
                if( flatData[i] !== null && !flatData[i].match(/^\d$/gi) ){
                    return false;
                }
            }

            return true;
        },
        calculateTime   = function(){
            var diff = time.finish.getTime() - time.start.getTime();
            console.log('execution time: ' + diff);
        },
        init            = function( params ){
            time.start = new Date();

            console.log('sudoku.solver - Initializing');

            if( !validateData( params.data, params.dimension ) ){
                console.error('sudoku.solver - Invalid data');
                return false;
            }

            // store the dimensions
            dimension = params.dimension;
            sectorsDimension = Math.sqrt(dimension);

            renderer = params.renderer;

            // parse the flat data array
            parseData( params.data );

            solve();

            time.finish = new Date();

            calculateTime();

            console.log(counters);
        };

    // initialize
    init( options );
};