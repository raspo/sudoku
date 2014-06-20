## The most inefficient Sudoku Solver

This my attempt at writing a Sudoku Solver in javascript.

I don't know what the proper algorithm to solve Sudoku puzzles is and I didn't research any. I'm just applying my (very limited) knowledge as an occasional Sudoku player.

This is basically just a programming exercise, and still a work in progress. I don't really care about efficiency here.

At the moment, the script can solve puzzles up to a "hard" level of difficulty. I still have to figure out a new algorithm to solve the really tough ones that are out there.


### The structure

The script is composed of three modules:

1. The **sudoku.reader**: reads the starting puzzle from any kind of source and returns a flat array of all 81 values. The current implementation of the **sudoku.reader** simply reads data from a HTML table that is sitting on the page.
2. The **sudoku.solver**: this is the core of the whole operation. Receives a flat array of data from the **sudoku.reader**, parses it and start applying some logic in order to solve it. It still needs a lot of work, this is the really inefficient part.
3. The **sudoku.renderer**: gets called by the **sudoku.solver** to show the results on the page. The current implementation of the **sudoku.renderer** outputs the results on the same HTML table that **sudoku.reader** was reading data from.

The idea is that one could swap any of those modules and still have it all working. 
Let's say you want to read sudoku puzzles by loading them from somewhere else via ajax, you just need to change the **sudoku.reader** module.


Again, this is all pointless ... Please don't hate ;)
