window.sudoku = window.sudoku || {};

window.sudoku.solver = function( options ){
    'use strict';

    var renderer            = null,
        dimension           = null,
        sectorsDimension    = null,
        counters            = {
            foundvalues     : 0,
            backtracks      : 0
        },
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

                if( renderer ){
                    renderer.complete();
                }

            } else {

                console.log('cannot find solution!');

            }
        },

        solve           = function(){
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

                        // If a valid value is found, move to the next position

                        counters.foundvalues += 1;
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
                if( checkGroup( 'rows', row, value ) && checkGroup( 'cols', col, value ) && checkGroup( 'sectors', sector, value ) ){
                    return true;
                }
            }
            return false;
        },

        checkGroup          = function( groupType, groupIndex, value){
            var isValidValue = true;
            for( var i=0; i<store[groupType][groupIndex].length; i++ ){
                var cellIndex = store[groupType][groupIndex][i];
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
        },

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
            console.log('execution time: ' + diff +'ms');
        },
        init            = function( params ){
            time.start = new Date();

            // console.log('sudoku.solver - Initializing');

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