window.sudoku = window.sudoku || {};

window.sudoku.solver = (function(){

    var size            = null,
        sectorsSize     = null,
        counters        = {
            masterCycle     : 0,
            cellsCycle      : 0,
            rowsCycle       : 0,
            colsCycle       : 0,
            sectorsCycle    : 0
        },
        cycleCounter    = 0,
        dataArray       = [],
        time            = {
            start   : null,
            finish  : null
        },
        store           = {
            cells   : [],
            rows    : [],
            cols    : [],
            sectors : [],
            found   : []
        },
        cycle           = function(){
            counters.masterCycle += 1;

            var foundbeforeCycle = store.found.length;

            cycleCells();
            cycleRows();
            cycleCols();
            cycleSectors();

            if( store.found.length === store.cells.length ){

                console.log('found solution!');

            } else if( foundbeforeCycle !== store.found.length ){

                cycle();

            } else {

                console.log('cannot find solution!');

                var missing = [];

                for( var i=0; i<store.cells.length; i++ ){
                    if( !store.cells[i].hasValue() ){
                        missing.push( store.cells[i] );
                    }
                }

                console.log('still missing these', missing);

            }
        },
        cycleCells      = function(){
            counters.cellsCycle += 1;

            for( var i=0; i<store.cells.length; i++ ){
                if( store.cells[ i ].check() ){
                    cycleCells();
                    return;
                }
            }
        },
        cycleRows       = function(){
            counters.rowsCycle += 1;

            for( var i=0; i<store.rows.length; i++ ){
                if( store.rows[ i ].check() ){
                    cycleRows();
                    return;
                }
            }
        },
        cycleCols      = function(){
            counters.colsCycle += 1;

            for( var i=0; i<store.cols.length; i++ ){
                if( store.cols[ i ].check() ){
                    cycleCols();
                    return;
                }
            }
        },
        cycleSectors    = function(){
            counters.sectorsCycle += 1;

            for( var i=0; i<store.sectors.length; i++ ){
                if( store.sectors[ i ].check() ){
                    cycleSectors();
                    return;
                }
            }
        },
        buildValuesArray  = function(){
            var values = [];
            for( var i=0; i<size; i++ ){
                values.push(i+1);
            }
            return values;
        },
        cellObject      = function(params){
            this.log            = function(){
                console.log( 'CELL ' + this.id + ' =>  row: '+ this.rowIndex + ' - col: ' + this.colIndex + ' - sector: ' + this.sectorIndex + ' - value: ' + this.value );
            };

            this.check          = function(){
                if( this.hasValue() ){ return; }

                if( this.possibleValues.length === 1 ){
                    this.setValue( this.possibleValues[0] );
                    return true;
                }

                for( var i=0; i<this.possibleValues.length; i++ ){
                    if( this.checkForValue( this.possibleValues[i] ) ){
                        this.removePossibleValue( this.possibleValues[i] );
                        return true;
                    }
                }
                return false;
            };

            this.removePossibleValue = function( value ){
                var index = this.possibleValues.indexOf(value);
                if( index !== -1 ){
                    this.possibleValues.splice(index, 1);
                }
            };

            this.checkForValue  = function( value ){
                var foundInRow = null,
                    foundInCol = null,
                    foundInSector = null;

                foundInRow = this.row().hasValue( value );
                if( foundInRow ){ return true; }

                foundInCol = this.col().hasValue( value );
                if( foundInCol ){ return true; }

                foundInSector = this.sector().hasValue( value );
                if( foundInSector ){ return true; }

                return false;
            };

            this.row            = function(){
                return store.rows[ this.rowIndex ];
            };

            this.col            = function(){
                return store.cols[ this.colIndex ];
            };

            this.sector         = function(){
                return store.sectors[ this.sectorIndex ];
            };

            this.hasValue       = function(){
                return (this.value !== null);
            };

            this.hasPossibleValue   = function( value ){
                var index = this.possibleValues.indexOf(value);
                if( index !== -1 ){
                    return true;
                } else {
                    return false;
                }
            };

            this.setValue       = function( value, isDefault ){
                if( value !== null ){
                    this.value = value;
                    this.possibleValues = [];

                    this.row().removeMissingValue( value );
                    this.col().removeMissingValue( value );
                    this.sector().removeMissingValue( value );

                    store.found.push( this.id );

                    this.updateView(isDefault);
                }
            };

            this.updateView     = function(isDefault){
                window.sudoku.updater.updateCell( this.rowIndex, this.colIndex, this.value, isDefault );
            };

            this.value          = null;
            this.id             = params.id;
            this.rowIndex       = params.row;
            this.colIndex       = params.col;
            this.sectorIndex    = params.sector;
            this.possibleValues = buildValuesArray();
        },
        cellsGroupObject         = function( id, type ){
            this.log            = function(){
                console.log(  this.type + ' ' + this.id + ' =>  missing: '+ this.missingValues.join(',') );
            };

            this.addCell        = function( cellId ){
                // add a reference to the cell id
                this.cellsIndexes.push( cellId );

                // if the cell already has a value add this information to the cellsGroup as well
                if( this.cell( cellId ).hasValue() ){
                    this.addValue( this.cell( cellId ).value );
                }
            };

            this.check          = function(){
                var missingCounter  = 0,
                    cellId          = null;

                for( var i=0; i<this.missingValues.length; i++ ){

                    missingCounter  = 0;
                    cellId          = null;

                    for( var j=0; j<this.cellsIndexes.length; j++ ){

                        if( this.cell( this.cellsIndexes[j] ).hasPossibleValue( this.missingValues[i] ) ){

                            missingCounter += 1;
                            cellId = this.cellsIndexes[j];

                        }

                    }

                    if( missingCounter === 1 ){

                        console.log('FOUND YA ' +this.type + ' '+ this.id +' ===== '+ this.cell( cellId ).rowIndex +' -|- ' + this.cell( cellId ).colIndex +' -|- '+ cellId +  ' -|- ' + this.missingValues[i] );

                        this.cell( cellId ).setValue( this.missingValues[i] );

                        return true;
                    }

                }
            };

            this.removeMissingValue      = function(value){
                var index = this.missingValues.indexOf(value);
                if( index !== -1 ){
                    this.missingValues.splice(index, 1);
                }
            };

            this.hasValue = function( value ){
                var index = this.missingValues.indexOf( value );
                return ( index === -1 ) ? true : false;
            };

            this.addValue       = function( value ){
                for( var i=0; i<this.missingValues.length; i++ ){
                    if( value === this.missingValues[i] ){
                        this.missingValues.splice(i, 1);
                        break;
                    }
                }
            };

            this.cell           = function( cellId ){
                return store.cells[ cellId ];
            };

            this.id             = id;
            this.type           = type;
            this.cellsIndexes   = [];
            this.missingValues  = buildValuesArray();
        },
        parseData       = function(){
            if( validateData() ){

                var cellValue   = null,
                    rowIndex    = 0,
                    colIndex    = 0,
                    sectorIndex = 0;

                // build empty arrays of rows, cols and sectors objects
                for( var j=0; j<size; j++ ){
                    store.rows.push( new cellsGroupObject(j, 'row') );
                    store.cols.push( new cellsGroupObject(j, 'col') );
                    store.sectors.push( new cellsGroupObject(j, 'sector') );
                }

                // loop through each item of the flat dataArray
                for( var i=0; i<dataArray.length; i++ ){

                    if( (i !== 0) && (i % size === 0) ){
                        rowIndex += 1;
                    }

                    colIndex = i % size;

                    // figure out the sector index
                    if(colIndex % sectorsSize === 0){
                        sectorIndex = (Math.floor( rowIndex / sectorsSize ) * sectorsSize) + (colIndex / sectorsSize);
                    }

                    store.cells.push( new cellObject({
                        value   : null,
                        id      : i,
                        row     : rowIndex,
                        col     : colIndex,
                        sector  : sectorIndex
                    }) );

                    // add a reference to the cell id on each row, col and sector
                    store.rows[ rowIndex ].addCell( i );
                    store.cols[ colIndex ].addCell( i );
                    store.sectors[ sectorIndex ].addCell( i );

                    // convert the value into a number
                    cellValue = (dataArray[i] !== null) ? parseInt(dataArray[i], 10) : null;

                    store.cells[i].setValue( cellValue, true );
                }

            } else {
                console.error('invalid data provived by the sudoku.reader module');
            }
        },
        validateData    = function(){
            if( dataArray.length !== Math.pow(size, 2) ){
                return false;
            }

            for( var i=0; i<dataArray.length; i++ ){
                if( dataArray[i] !== null && !dataArray[i].match(/^\d$/gi) ){
                    return false;
                }
            }

            return true;
        },
        calculateTime   = function(){
            var diff = time.finish.getTime() - time.start.getTime();
            console.log('execution time: ' + diff);
        },
        init            = function( selector, sectorSize ){

            time.start = new Date();

            console.log('initializing sudoku.solver');

            // store the size of the schema
            sectorsSize = sectorSize;
            size = Math.pow(sectorsSize, 2);

            dataArray = window.sudoku.reader.init( selector );
            window.sudoku.updater.init( selector );

            // parse the data array provived by the sudoku.reader module
            parseData();

            cycle();

            time.finish = new Date();

            calculateTime();

            console.log(counters);
        };

    return {
        init  : init
    };

}());