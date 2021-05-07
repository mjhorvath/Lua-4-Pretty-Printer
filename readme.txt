--- HW2 Pretty-Printer v1.27
--- Created: 08/14/05 by Mikail
--- Last updated: 03/25/07
--- Homepage: 
--- http://www.geocities.com/Area51/Quadrant/3864/homeworld.htm
--- Discussion: 
--- http://forums.relicnews.com/showthread.php?t=84449
--- Download: 
--- http://www.geocities.com/Area51/Quadrant/3864/homeworld.htm


----------------------------------------------------------------


INTRODUCTION
This is a pretty-printer for Lua source-code. It has only been 
tested with Lua 4.0, but may work with later versions.

INSTALLATION
Extract the contents of this archive into a folder on your 
harddrive.

Note: Windows Scripting Host v5.6 must be installed in order to 
use the Explorer and batch modes.

INSTRUCTIONS
There are two ways in which you can use this pretty-printer:

	1) In Explorer, drag & drop a single Lua file 
	   containing the code you wish to process onto the 
	   included JS file. The output will be copied to a new 
	   file with the same name and in the same directory as 
	   the input file, but with an additional ".pretty" 
	   extension.

	2) On the command-line, the syntax is as follows:

		cscript [ScriptPath] [InputPath] [[OutputPath]] 
		[[-o]] [[-s]] [[-help]] [[-verbose]] [[-debug]] 
		[[-unix]]

	   [ScriptPath]	- The full path to 
			  "HW2_PrettyPrinter.js".
	   [InputPath]	- The full path of the Lua file to 
			  process.
	   [OutputPath]	- The full path of the output file. If 
			  omitted, then the output will be 
			  copied to a new file with the same 
			  name and in the same directory as the 
			  input file, but with an additional 
			  ".pretty" extension (unless the "-o" 
			  switch is also specified).
	   [-o]		- Tells the program to overwrite the 
			  input file.
	   [-s]		- Tells the program to strip comments 
			  from the code.
	   [-help]	- Prints this help text to the screen.
	   [-verbose]	- Turns verbose messaging on.
	   [-debug]	- Generates an additional file in the 
			  source directory that is helpful in 
			  debugging the program (or file).
	   [-unix]	- Creates Unix-style end-of-line 
			  characters. (Mainly a cosmetic issue.)

COMMON PROBLEMS
Note: if the program encounters what it thinks is an error, it 
will print an error message and quit.

Make sure the file you're processing doesn't contain any of the 
following strings, as they will cause the pretty-printer to 
fail:
	@qdq@
	@qsq@
	@qlq@
	@qrq@
	@tet@
	@c<n>c@		(where <n> is any positive integer)
	@s<n>s@		(where <n> is any positive integer)
	@i<n>i@		(where <n> is any positive integer)
	@a<n>a@		(where <n> is any positive integer)

Also make sure the file doesn't have more than 10000 pairs of 
curly brackets.


----------------------------------------------------------------


CHANGE LOG

v1.27
• Fixed removal of semi-colons. (They're sometimes needed to 
  separate different types of table entries.)
• Blank lines are now removed from the beginning of files and 
  added to the end of files, if not already.
• Parentheses are no longer added around operations. (Old 
  method was buggy.)
• Hopefully fixed natural logarithms. (The different parts 
  were being separated if an addition or negation sign 
  appeared between them.)

v1.26
• Added the "-unix" command-line switch.

v1.25
• Some changes to pre-formatting.

v1.24
• A little bit of code clean-up.
• Gibberish is now replaced with original code in reverse order.
• Old version info is now removed before adding the new.
• Improved removal of lines containing only whitespace.
• Table-entries containing nothing but semi-colons are no 
  longer removed, as this could potentially lead to bugs.

v1.23
• Zero-decimal values are now removed.
• Zeroes are now added before decimals when missing.
• Semi-colons at the end of lines are now removed.
• Better checking for double-spacing.
• A new-line character is now added to the end of the file if 
  missing.
• Line breaks no longer occur before unary operators in 
  function arguments and table indices.
• Improved line-breaking before unary operators.
• Unary operators are now always followed by a space. (Makes 
  other arithmetic look correct.)
• Fixed drag & drop support broken in the last release.
• Table-entries containing nothing but semi-colons are now 
  removed.
• Improved inserting of comma after last table-entry.
• Improved putting key-value pairs on the same line.
• Spaces before commas are now removed.

v1.22
• Added the "-s" switch. The program can now be told to strip 
  comments from the code.
• Fixed a bug that resulted in some command-line arguments not 
  to being detected properly.
• Blank lines at the beginning of files are now removed.
• Fixed formatting around table indices.
• Tables used as function arguments are no longer broken onto 
  new lines.
• Formatting of whitespace for function arguments and table 
  indices are is now handled separately from the rest of the 
  code. Grouping of different operations based on function is 
  now, as a result, better.

v1.21
• Added the option to overwrite the source file using the "-o" 
  switch.
• Added the option to specify the output file.
• Calls to "dofile" and "dofilepath" are no longer garbled.
• Help screen has been updated.
• Whitespace between function names and function arguments is 
  now removed.

v1.2
• Included a test file in the archive for stress-testing the 
  program.
• Multiple files can no longer be processed at once, either via 
  the command-line or drag & drop.
• Added the "-help", "-verbose" and "debug" switches.
• "for i = a, b, c do" statements no longer break onto new 
  lines.
• Unary operators no longer cause list items to be placed at 
  the end of the previous line.
• Fixed some cases of unary operators not handled properly.
• Exponation operator is no longer surrounded by spaces.
• Functions defined in lists now break/indent properly.
• Functions defined in variable/value format now break/indent 
  properly.
• Lone "do ... end" statements now break properly.
• "repeat ... until" are now dealt with specifically.
• Missing parentheses are now placed around "until" statements.
• Tables inside expressions no longer screw things up.
• Variable names containing the substring "or" are no longer 
  split before and after the substring.
• Carriage returns are now being added along with all line-
  feeds.
• Comments are now replaced first.
• String indices are now stored as gibberish in the indices 
  table.
• Gibberish is now reverted back into code in the reverse order 
  that it was converted into gibberish.
• "return" no longer screws up breaking and indentation.
• Values returned following "return" are now always placed on 
  the following line.

v1.1
• Comma-separated list elements no longer appear all on the 
  same line.
• More detailed progress report printed to screen.
• The program will now alert the user and quit if it encounters 
  an error.

v1.02
• The program now prints the version, as well as usage 
  instructions, when it is run without any parameters.
• The output file extension has been changed from ".out" to 
  ".pretty".
• Added message output to the screen showing progress of the 
  program when the program is run in the "cscript" host (as 
  opposed to the "wscript" host).

v1.01
• Mathematical/logical symbols within parentheses are now 
  processed.
• Whitespace within parentheses is now processed.

v1.0
• The program now works with all Lua code (as far as I've 
  tested), not just tables.
• The progam now prints a small personal blurb to the output 
  file.

v0.51
• The first opening bracket in each table is now properly 
  indented.
• New lines are now generated after semicolons.
• Mathematical & logical symbols are now surrounded by spaces.
• Nested parentheses are now handled properly.

v0.5
• Initial release.


----------------------------------------------------------------


KNOWN ISSUES

• Unary operators not handled properly.	[mostly fixed]
• Haven't tested if the idioms described in section 4.5.4 of 
  the Lua 4 manual are handled properly. [to do]
• Haven't tested sure if the self-referential function 
  definitions described in section 4.5.8 of the Lua 4 manual 
  are handled properly. [to do]
• Valued returned using "return" always appear on the following 
  line. [will not be fixed]
• Need to test more thoroughly for oddly-named variables (e.g., 
  variables named "functionfoo" or "endbar"). [to do]
• Haven't yet tested Lua's object-oriented syntax. [to do]
• Remove spaces from around function arguments. [fixed]
• Need command-line options to change how the pretty-printer 
  behaves. [fixed]
• Need the option to overwrite the source file. [fixed]
• Calls to "dofile" and "dofilepath" were getting garbled. 
  [fixed]
• Need to update the help screen. [fixed]
• Whitespace between function names and function arguments 
  needs to be removed. [fixed]
• Line breaks are occuring before unary negation symbols in 
  function arguments. [fixed]
• Tables used as function arguments are broken onto new lines. 
  [fixed]
• Need to remove table-entries containing nothing but semi-
  colons. [fixed]
• Tables contained within tables but preceded by non-tables are 
  separated by an additional, unnecessary line. (They were 
  originally separated by a semi-colon.) [fixed]
• Minimal files, such as 
  "data\scripts\gamerules\donothing.lua", aren't outdented 
  properly. [fixed, see below]
• Improper indentation if the last character in a file is not a 
  new-line. [fixed]
• Extra new-line appears at the end of files. [to do]
• Table-indices following variable names are broken onto new 
  lines if they are separated by spaces.
• Comments at the end of lines should be moved to the previous 
  line -- not the next line.
• Does not currently parse VARARG functions properly.
• Probably does not properly parse table methods.
• Probably others...
