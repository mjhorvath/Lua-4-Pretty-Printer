// HW2 Pretty-Printer v1.27
// Created: 08/14/05 by Mikail
// Last updated: 03/25/07
// Homepage: http://www.geocities.com/Area51/Quadrant/3864/homeworld.htm

var d0 = new Date()
var d1, d2, dn
var OutString = ''
var CountIteration = 0

var MssgEnable = false		// applies to WScript.exe only
var MssgVerbose = false		// applies to WScript.exe and CScript.exe
var MssgDebug = false		// applies to WScript.exe and CScript.exe
var ErrorOccured = false
var StripComments = false
var StripOldVersion = true
var UnixEndOfLine = false

var AppConsole = 0
if (typeof(WScript) != 'undefined')
{
	AppConsole = 1
}
var AppVersion = '1.27'
var AppInfo = 'HW2 Pretty-Printer v' + AppVersion + ' by Mikail' + '\n'
var AppComment = '-- Pretty-Printed using HW2 Pretty-Printer ' + AppVersion + ' by Mikail.' + '\n'
var AppError = ''+
'There are two ways in which you can use this pretty-printer:\n'+
'\n'+
'	1) In Explorer, drag & drop a single Lua file \n'+
'	   containing the code you wish to process onto the \n'+
'	   included JS file. The output will be copied to a new \n'+
'	   file with the same name and in the same directory as \n'+
'	   the input file, but with an additional ".pretty" \n'+
'	   extension.\n'+
'\n'+
'	2) On the command-line, the syntax is as follows:\n'+
'\n'+
'		cscript [ScriptPath] [InputPath] [[OutputPath]] \n'+
'		[[-o]] [[-s]] [[-help]] [[-verbose]] [[-debug]] \n'+
'		[[-unix]]\n'+
'\n'+
'	   [ScriptPath]	- The full path to \n'+
'			  "HW2_PrettyPrinter.js".\n'+
'	   [InputPath]	- The full path of the Lua file to \n'+
'			  process.\n'+
'	   [OutputPath]	- The full path of the output file. If \n'+
'			  omitted, then the output will be \n'+
'			  copied to a new file with the same \n'+
'			  name and in the same directory as the \n'+
'			  input file, but with an additional \n'+
'			  ".pretty" extension (unless the "-o" \n'+
'			  switch is also specified).\n'+
'	   [-o]		- Tells the program to overwrite the \n'+
'			  input file.\n'+
'	   [-s]		- Tells the program to strip comments \n'+
'			  from the code.\n'+
'	   [-help]	- Prints this help text to the screen.\n'+
'	   [-verbose]	- Turns verbose messaging on.\n'+
'	   [-debug]	- Generates an additional file in the \n'+
'			  source directory that is helpful in \n'+
'			  debugging the program (or file).\n'+
'	   [-unix]	- Creates Unix-style end-of-line \n'+
'			  characters. (Mainly a cosmetic issue.)\n'

// if running from the command-line or Windows Explorer...
if (AppConsole == 1)
{
	// set up file objects
	var ArgsObject = WScript.Arguments
	var ArgsLength = ArgsObject.length
	var fso = new ActiveXObject('Scripting.FileSystemObject')
	var HostPath = WScript.FullName
	var HostName = HostPath.substring(HostPath.lastIndexOf('\\') + 1, HostPath.length)

	// turn off messaging if the file is accessed from Explorer
	if ((HostName == 'WSCRIPT.EXE') && (MssgEnable == false))
	{
		WScript.Interactive = false
	}

	// if the program is called without arguments, print a help message and quit; else, continue.
	if (ArgsLength == 0)
	{
		PrintHelp()
	}
	else
	{
		// parse the program arguments
		var SrcPath = ArgsObject(0)
		var OutPath = SrcPath + '.pretty'
		var DbgPath = SrcPath + '.debug'
		if (ArgsLength > 1)
		{
			OutPath = ArgsObject(1)
			if ((OutPath == '-debug') || (OutPath == '-verbose') || (OutPath == '-help') || (OutPath == '-s') || (OutPath == '-o') || (OutPath == '-unix'))
			{
				OutPath = SrcPath + '.pretty'
			}
		}
		for (i = 1; i < ArgsObject.length; i ++)
		{
			if (ArgsObject(i) == '-o')		OutPath = SrcPath
			if (ArgsObject(i) == '-debug')		MssgDebug = true
			if (ArgsObject(i) == '-verbose')	MssgVerbose = true
			if (ArgsObject(i) == '-help')		PrintHelp()
			if (ArgsObject(i) == '-s')		StripComments = true
			if (ArgsObject(i) == '-unix')		UnixEndOfLine = true
		}

		// read the input file
		var SrcObject = fso.OpenTextFile(SrcPath, 1)
		var CodeString = SrcObject.ReadAll()
		SrcObject.Close()

		// start writing to the debug file
		if (MssgDebug == true)
		{
			var DebgObject = fso.OpenTextFile(DbgPath, 2, 1, 0)
			DebgObject.Close()
			WriteDebug(CodeString, '\t\tSource.')
		}

		// parse & process the input file
		PrintMessage('Parsing file...	[' + SrcPath + ']')
		d1 = new Date()
		var CodeString = ProcessCode(CodeString)
		d2 = new Date()
		PrintMessage('Time elapsed: ' + ((d2 - d1)/1000) + ' seconds')

		// strip old version info and add new
		if (StripOldVersion == true)	CodeString = CodeString.replace(/\-\- Pretty\-Printed using HW2 Pretty\-Printer[^\n]*\n/gm, "")
		if (StripComments == false)	CodeString = AppComment + CodeString

		// write to the output file, then close it
		var OutObject = fso.OpenTextFile(OutPath, 2, 1, 0)
		OutObject.Write(CodeString)
		OutObject.Close()
	}

	// quit if an error occured
	if (ErrorOccured == true) WScript.Quit(1)		
}

function ProcessCode(TempString)
{
	var TempRegexp
	var TempReplce
	var TempMatch
	var TempMatch0
	var TempLength
	var TempMssg


	//------------------------------------------------------
	// Pre-processing...

	PrintMessage('\tPre-processing...')

	// Removing all carriage returns...
	TempMssg = '\t\tRemoving all carriage returns...'
	PrintVerbose(TempMssg)
	TempRegexp = /\r/gm
	TempReplce = ""
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Adding a blank line to the end if not already...
	TempMssg = '\t\tAdding a blank line to the end if not already...'
	PrintVerbose(TempMssg)
	if (TempString.charAt(TempString.length - 1) != '\n')
	{
		TempString += '\n'
	}
	WriteDebug(TempString, TempMssg)

	// Removing blank lines at the beginning of the file...
	TempMssg = '\t\tRemoving blank lines at the beginning of the file...'
	PrintVerbose(TempMssg)
	while (TempString.charAt(0) == '\n')
	{
		TempString = TempString.substring(1, TempString.length)
	}
	WriteDebug(TempString, TempMssg)


	//------------------------------------------------------
	// Storing special sequences...

	PrintMessage('\tStoring special sequences...')

	// Replacing comments with gibberish...
	TempMssg = '\t\tReplacing comments with gibberish...'
	PrintVerbose(TempMssg)
	var CommentsTable = []
	var CommentsCount = 0
	TempRegexp = /\-\-[^\n]*$/gm
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempMatch0 = TempMatch[0]
		if (StripComments == false)
		{
			TempReplce = "@c" + CommentsCount + "c@"
			TempString = TempString.replace(TempMatch0, TempReplce)
			CommentsTable[CommentsCount] = TempMatch0
		}
		else
		{
			TempReplce = ""
			TempString = TempString.replace(TempMatch0, TempReplce)
		}
		TempMatch = TempString.match(TempRegexp)
		if (StripComments == false)
		{
			CommentsCount += 1
		}
		else
		{
			CommentsCount = -1
		}
	}
	WriteDebug(TempString, TempMssg)

	// Replacing escaped quotation marks with gibberish...
	TempMssg = '\t\tReplacing escaped quotation marks with gibberish...'
	PrintVerbose(TempMssg)
	TempRegexp = /\\\"/mg
	TempReplce = "@qdq@"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /\\\'/mg
	TempReplce = "@qsq@"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /\\\[\\\[/mg
	TempReplce = "@qlq@"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /\\\]\\\]/mg
	TempReplce = "@qrq@"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Replacing strings with gibberish...
	TempMssg = '\t\tReplacing strings with gibberish.'
	PrintVerbose(TempMssg)
	var StringsTable = []
	var StringsCount = 0
	TempRegexp = /\[\[[^\[\]]*\]\]/
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempMatch0 = TempMatch[0]
		TempReplce = "@s" + StringsCount + "s@"
		TempString = TempString.replace(TempMatch0, TempReplce)
		StringsTable[StringsCount] = TempMatch0
		TempMatch = TempString.match(TempRegexp)
		StringsCount += 1
	}
	TempRegexp = /\"[^\"]*\"/
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempMatch0 = TempMatch[0]
		TempReplce = "@s" + StringsCount + "s@"
		TempString = TempString.replace(TempMatch0, TempReplce)
		StringsTable[StringsCount] = TempMatch0
		TempMatch = TempString.match(TempRegexp)
		StringsCount += 1
	}
	TempRegexp = /\'[^\']*\'/
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempMatch0 = TempMatch[0]
		TempReplce = "@s" + StringsCount + "s@"
		TempString = TempString.replace(TempMatch0, TempReplce)
		StringsTable[StringsCount] = TempMatch0
		TempMatch = TempString.match(TempRegexp)
		StringsCount += 1
	}
	WriteDebug(TempString, TempMssg)

	// Replacing empty tables with gibberish...
	TempMssg = '\t\tReplacing empty tables with gibberish...'
	PrintVerbose(TempMssg)
	TempRegexp = /\{\s*\}/gm
	TempReplce = "@tet@"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Replacing function arguments with gibberish...
	TempMssg = '\t\tReplacing function arguments with gibberish...'
	PrintVerbose(TempMssg)
	var ArgumentsTable = []
	var ArgumentsCount = 0
	TempRegexp = /\([^\(\)]*\)/
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempMatch0 = TempMatch[0]
		TempReplce = "@a" + ArgumentsCount + "a@"
		TempString = TempString.replace(TempMatch0, TempReplce)
		ArgumentsTable[ArgumentsCount] = TempMatch0
		TempMatch = TempString.match(TempRegexp)
		ArgumentsCount += 1
	}
	WriteDebug(TempString, TempMssg)

	// Replacing table indices with gibberish...
	TempMssg = '\t\tReplacing table indices with gibberish...'
	PrintVerbose(TempMssg)
	var IndicesTable = []
	var IndicesCount = 0
	TempRegexp = /\[[^\[\]]*\]/
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempMatch0 = TempMatch[0]
		TempReplce = "@i" + IndicesCount + "i@"
		TempString = TempString.replace(TempMatch0, TempReplce)
		IndicesTable[IndicesCount] = TempMatch0
		TempMatch = TempString.match(TempRegexp)
		IndicesCount += 1
	}
	WriteDebug(TempString, TempMssg)


	//------------------------------------------------------
	// Fixing whitespace and indentation...

	PrintMessage('\tFixing whitespace and indentation...')

	// Replacing whitespace with single spaces...
	TempMssg = '\t\tReplacing whitespace with single spaces...'
	PrintVerbose(TempMssg)
	TempRegexp = /\s\s+/mg
	TempReplce = " "
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempString = TempString.replace(TempRegexp, TempReplce)
		TempMatch = TempString.match(TempRegexp)
	}
	WriteDebug(TempString, TempMssg)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		TempString2 = ArgumentsTable[i]
		TempMatch = TempString2.match(TempRegexp)
		while (TempMatch != null)
		{
			TempString2 = TempString2.replace(TempRegexp, TempReplce)
			TempMatch = TempString2.match(TempRegexp)
		}
		ArgumentsTable[i] = TempString2
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		TempString2 = IndicesTable[i]
		TempMatch = TempString2.match(TempRegexp)
		while (TempMatch != null)
		{
			TempString2 = TempString2.replace(TempRegexp, TempReplce)
			TempMatch = TempString2.match(TempRegexp)
		}
		IndicesTable[i] = TempString2
	}
	TempRegexp = /\s+/mg
	TempReplce = " "
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		TempString2 = ArgumentsTable[i]
		TempString2 = TempString2.replace(TempRegexp, TempReplce)
		ArgumentsTable[i] = TempString2
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		TempString2 = IndicesTable[i]
		TempString2 = TempString2.replace(TempRegexp, TempReplce)
		IndicesTable[i] = TempString2
	}

	// Removing spaces before commas...
	TempMssg = '\t\tRemoving spaces before commas...'
	TempRegexp = /\s+,/gm
	TempReplce = ","
	PrintVerbose(TempMssg)
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}

	// Placing spaces after commas...
	TempMssg = '\t\tPlacing spaces after commas...'
	PrintVerbose(TempMssg)
	TempRegexp = /,\s*/mg
	TempReplce = ", "
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}

	// Adding a tab to the beginning of the string...
	TempMssg = '\t\tAdding a tab to the beginning of the string...'
	PrintVerbose(TempMssg)
	TempString = "\t" + TempString
	WriteDebug(TempString, TempMssg)

	// Breaking and indenting at every occurance of a left bracket...
	TempMssg = '\t\tBreaking and indenting at every occurance of a left bracket...'
	PrintVerbose(TempMssg)
	OutString = ""
	CountIteration = 0
	while (TempString.indexOf("{") != -1)
	{
		TempString = iterate1(TempString)
		TempString = indent(TempString)
		if (CountBreak('Error: Was unable to break and indent at every occurance of a left bracket.', 10000) == 1) break
	}
	TempString = OutString + TempString
	WriteDebug(TempString, TempMssg)

	// Breaking and outdenting at every occurance of a right bracket...
	TempMssg = '\t\tBreaking and outdenting at every occurance of a right bracket...'
	PrintVerbose(TempMssg)
	OutString = ""
	CountIteration = 0
	while (TempString.indexOf("}") != -1)
	{
		TempString = iterate2(TempString)
		TempString = outdent(TempString)
		if (CountBreak('Error: Was unable to break and outdent at every occurance of a right bracket.', 10000) == 1) break
	}
	TempString = OutString + TempString
	WriteDebug(TempString, TempMssg)

	// Replacing single spaces with new-lines...
	TempMssg = '\t\tReplacing single spaces with new-lines...'
	TempRegexp = /^(\t*)([^\t\ ]*)(\ )(.*)$/gm
	PrintVerbose(TempMssg)
	while (TempString.indexOf(" ") != -1)
	{
		TempString = TempString.replace(TempRegexp, "$1$2\n$1$4")
	}
	WriteDebug(TempString, TempMssg)

	// Removing blank lines...
	TempMssg = '\t\tRemoving blank lines...'
	PrintVerbose(TempMssg)
	TempRegexp = /^\s+$/gm
	TempReplce = ""
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /\n\n/gm
	TempReplce = "\n"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Putting key/variable pairs on the same line...
	TempMssg = '\t\tPutting key/variable pairs on the same line...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\@|\w)(\s+)(=)/gm
	TempReplce = "$1$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(=)(\s+)(@|\w|\-|\+|\.)/gm
	TempReplce = "$1$3"
	TempString = TempString.replace(TempRegexp, TempReplce)	// unary is checked, here
	WriteDebug(TempString, TempMssg)

	// Putting keywords on the same line...
	TempMssg = '\t\tPutting keywords on the same line...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\s)(function|while|for|if|elseif|local|global|until)(\s+)([^\{\s])/gm		// "return" not included here. too complicated to bother with it...
	TempReplce = "$1$2 $4"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /([^\}\s])(\s+)(then)(\s)/gm	// do is ignored here because it can appear all by itself
	TempReplce = "$1 $3$4"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(\s+)(or|and|not)(\s+)/gm
	TempReplce = " $2 "
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Removing whitespace between names and arguments...
	// Note: ugly, ugly, ugly.
	TempMssg = '\t\tRemoving whitespace between names and arguments...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\w|\_)(\s*)(@a\d*a@)/gm
	TempReplce = "$1$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Re-adding whitespace between "if", "elseif", "while" and "until" and their arguments...
	TempMssg = '\t\tRe-adding whitespace between "if", "elseif", "while" and "until" and their arguments...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\s)(if|elseif|while|until)(@a\d*a@)/gm
	TempReplce = "$1$2 $3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Re-adding whitespace between return and returned statements...
	// Note: statements following "return" are *explicitely* broken onto new lines, here--but only if they are contained within parentheses.
	TempMssg = '\t\tRe-adding whitespace between return and returned statements...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\s)(return)(@a\d*a@)/gm
	TempReplce = "$1$2\n$1$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

//buggy when "do" appears where not necessary
/*
	// Putting parentheses around "if", "elseif", "while" and "until"...
	TempMssg = '\t\tPutting parentheses around "if", "elseif", "while" and "until"...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\s)(if|elseif|while)(\s+)(.+)(\s+)(then|do)(\s)/gm
	TempReplce = "$1$2$3($4)$5$6$7"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(\()(@a.*a@)(\))/gm
	TempReplce = "$2"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(until\ +)([^\n]*)(\n)/gm
	TempReplce = "$1($2)$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
*/
	// Putting "for" and "while" statements all on one line...
	// Note: there's three types of "for" statements.
	TempMssg = '\t\tPutting "for" and "while" statements all on one line...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\sfor\s.*,)(\s+)(.*)(\s+)(do\s)/gm			// for i = n, a do
	TempReplce = "$1 $3 $5"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(\sfor\s.*,)(\s+)(.*,)(\s+)(.*)(\s+)(do\s)/gm		// for i = n, a, b do
	TempReplce = "$1 $3 $5 $7"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(\sfor\s.*,)(\s+)(.*)(\s+)(in)(\s+)(.*)(\s+)(do\s)/gm	// for i, a in b do
	TempReplce = "$1 $3 $5 $7 $9"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(\swhile)(\s+)([^\s]*)(\s+)(do\s)/gm
	TempReplce = "$1 $3 $5"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
/*
	// Putting comma-separated lists on the same line...
	TempMssg = '\t\tPutting comma-separated lists on the same line...'
	PrintVerbose(TempMssg)
	TempRegexp = /(,)(\s+)([^\{\}\s])/gm
	TempReplce = "$1 $3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
*/
	// Indenting after "function", "then", "repeat" and "do"...
	TempMssg = '\t\tIndenting after "function", "then", "repeat" and "do"...'
	PrintVerbose(TempMssg)
	OutString = ""
	TempRegexp = /(\s|\=)(do|then|repeat|function\s(\w|_)+@a\d*a@|function\s*@a\d*a@)(\s)/
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		var TempCutoff = TempMatch.index + TempMatch[0].length - 1
		var TempString2 = TempString.substring(0, TempCutoff)
		var TempString3 = TempString.substring(TempCutoff, TempString.length)
		OutString += TempString2
		TempString = indent(TempString3)
		TempMatch = TempString.match(TempRegexp)
	}
	TempString = OutString + TempString
	WriteDebug(TempString, TempMssg)

	// Outdenting after "end", "elseif" and "until"...
	TempMssg = '\t\tOutdenting after "end", "elseif" and "until"...'
	PrintVerbose(TempMssg)
	OutString = ""
	// careful: variable names ending in these characters may appear in lists (e.g. followed by commas)
	TempRegexp = /(\t)(end|elseif|until)(\;*\s|\,)/
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		var TempCutoff = TempMatch.index + TempMatch[0].length
		var TempString2 = TempString.substring(0, TempCutoff - 1)
		var TempString3 = TempString.substring(TempCutoff - 1, TempString.length)
		OutString += TempString2
		TempString = outdent(TempString3)
		TempMatch = TempString.match(TempRegexp)
	}
	TempString = OutString + TempString
	WriteDebug(TempString, TempMssg)

	// Putting a comma between table-entries that are tables, if missing...
	TempMssg = '\t\tPutting a comma between table-entries that are tables, if missing...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\t*)(\})(\s*)(\;)(\s*)(\{)/gm
	TempReplce = "$1$2,\n$1$6"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Putting a comma after the last table-entry, if missing...
	// Note: some comments may be screwed up by this slightly.
	TempMssg = '\t\tPutting a comma after the last table-entry, if missing...'
	PrintVerbose(TempMssg)
	TempRegexp = /([^,\s\;])(\s*)(\})/gm
	TempReplce = "$1,$2$3"
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempString = TempString.replace(TempRegexp, TempReplce)
		TempMatch = TempString.match(TempRegexp)
	}
	WriteDebug(TempString, TempMssg)

	// Outdenting all "else", "elseif", "until" and "end" statements...
	TempMssg = '\t\tOutdenting all "else", "elseif", "until" and "end" statements...'
	PrintVerbose(TempMssg)
	TempRegexp = /^(\t)(\t*)(else|elseif|end|until)(\;*\s|\,)/gm
	TempReplce = "$2$3$4"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Placing blank lines before code blocks with global scope...
	TempMssg = '\t\tPlacing blank lines before code blocks with global scope...'
	PrintVerbose(TempMssg)
	TempRegexp = /^(\t)([^\t]*=\n)/gm
	TempReplce = "\n$1$2"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /^(\t)(function|if|while|for)(\s)/gm
	TempReplce = "\n$1$2$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Placing blank lines after code blocks with global scope...
	TempMssg = '\t\tPlacing blank lines after code blocks with global scope...'
	PrintVerbose(TempMssg)
	TempRegexp = /^(\t)(\}|end)(\s)/gm
	TempReplce = "$1$2$3\n"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Surrounding most operators with single spaces...
	// Note: need to handle unary minus better. a minus sign is unary if it is preceded by: -,+,*,/,=,<,>,return,\,,(,{,^\s*,., (what else?).
	// Note: probably need to check for unary operators beforehand, and then replace them with gibberish.
	// Note: 'and', 'or' and 'not' are handled a second time, here.
	TempMssg = '\t\tSurrounding most operators with single spaces...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\s*)(\~\=|\<\=|\>\=|\=\=|\<|\>|\=|\+|\-|\*|\/|\.\.)(\s*)/gm		//|and|or|not	//\+|\-
	TempReplce = " $2 "
	TempString = TempString.replace(TempRegexp, TempReplce)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)
/*
	// Adding a space before unary operators...
	// Note: this makes negation operations look ugly, but unary operations would otherwise be much less readable.
	TempMssg = '\t\tAdding a space before unary operators...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\s*)(\-)(\s*)/gm
	TempReplce = " $2"
	TempString = TempString.replace(TempRegexp, TempReplce)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)
*/
	// Adding a space before equal signs at the end of a line...
	TempMssg = '\t\tAdding a space before equal signs at the end of a line...'
	PrintVerbose(TempMssg)
	TempRegexp = /([^\=]\=\n)/gm
	TempReplce = " $1"
	TempString = TempString.replace(TempRegexp, TempReplce)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)

	// Breaking unary operators onto new lines...
	// Note: need to handle more cases (don't do this for table indices or function arguments)...
	TempMssg = '\t\tBreaking unary operators onto new lines.'
	PrintVerbose(TempMssg)
	TempRegexp = /(\t*)(.*\{)([ \t]*)(\s[\+\-])/gm
	TempReplce = "$1$2\n\t$1$4"
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempString = TempString.replace(TempRegexp, TempReplce)
		TempMatch = TempString.match(TempRegexp)
	}
	TempRegexp = /(\t*)(.*\,)([ \t]*)(\s[\+\-])/gm
	TempReplce = "$1$2\n$1$4"
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempString = TempString.replace(TempRegexp, TempReplce)
		TempMatch = TempString.match(TempRegexp)
	}
	WriteDebug(TempString, TempMssg)

	// Remove spaces from around the exponation operator...
	TempMssg = '\t\tRemove spaces from around the exponation operator...'
	PrintVerbose(TempMssg)
	TempRegexp = /\s*(\^)\s*/gm
	TempReplce = "$1"
	TempString = TempString.replace(TempRegexp, TempReplce)
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)
/*
	// Removing whitespace from inside table indices and function arguments...
	TempMssg = '\t\tRemoving whitespace from inside table indices and function arguments...'
	PrintVerbose(TempMssg)
	TempRegexp = /\s+/gm
	TempReplce = ""
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}
*/
	// Remove spaces from around table indices...
	TempMssg = '\t\tRemove spaces from around table indices...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\s*)([\(\)\[\]])(\s*)/gm
	TempReplce = "$2"
	for (i = 0; i < IndicesCount; i ++)
	{
		IndicesTable[i] = IndicesTable[i].replace(TempRegexp, TempReplce)
	}
	for (i = 0; i < ArgumentsCount; i ++)
	{
		ArgumentsTable[i] = ArgumentsTable[i].replace(TempRegexp, TempReplce)
	}

	// Breaking before left table brackets, if not already...
	TempMssg = '\t\tBreaking before left table brackets, if not already...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\t*)([^\t]+)(\{)/gm
	TempReplce = "$1$2\n$1$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Breaking after right table brackets, if not already...
	// Note: I could only find one case... the more general methods didn't work for me
	TempMssg = '\t\tBreaking after right table brackets, if not already...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\t*)(\})( )/gm
	TempReplce = "$1$2\n$1"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)


	//------------------------------------------------------
	// Retrieving special sequences...

	PrintMessage('\tRetrieving special sequences...')

	// Replacing gibberish with original table indices...
	TempMssg = '\t\tReplacing gibberish with original table indices...'
	PrintVerbose(TempMssg)
	for (i = IndicesCount - 1; i > -1; i --)
	{
		TempRegexp = "@i" + i + "i@"
		TempReplce = IndicesTable[i]
		TempString = TempString.replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)

	// Replacing gibberish with original function arguments...
	TempMssg = '\t\tReplacing gibberish with original function arguments...'
	PrintVerbose(TempMssg)
	for (i = ArgumentsCount - 1; i > -1; i --)
	{
		TempRegexp = "@a" + i + "a@"
		TempReplce = ArgumentsTable[i]
		TempString = TempString.replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)

	// Replacing gibberish with original empty tables...
	TempMssg = '\t\tReplacing gibberish with original empty tables...'
	PrintVerbose(TempMssg)
	TempRegexp = /@tet@/gm
	TempReplce = "{}"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Replacing gibberish with original strings...
	TempMssg = '\t\tReplacing gibberish with original strings...'
	PrintVerbose(TempMssg)
	for (i = StringsCount - 1; i > -1; i --)
	{
		TempRegexp = "@s" + i + "s@"
		TempReplce = StringsTable[i]
		TempString = TempString.replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)

	// Replacing gibberish with original escaped quotation marks...
	TempMssg = '\t\tReplacing gibberish with original escaped quotation marks...'
	PrintVerbose(TempMssg)
	TempRegexp = /(@qdq@)/mg
	TempReplce = "\\\""
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /(@qsq@)/mg
	TempReplce = "\\\'"
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /@qlq@/mg
	TempReplce = "\\\[\\\["
	TempString = TempString.replace(TempRegexp, TempReplce)
	TempRegexp = /@qrq@/mg
	TempReplce = "\\\]\\\]"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Replacing gibberish with original comments...
	TempMssg = '\t\tReplacing gibberish with original comments...'
	PrintVerbose(TempMssg)
	for (i = CommentsCount - 1; i > -1; i --)
	{
		TempRegexp = /(\t*)(\@c\d*c\@)/
		TempReplce = "$1$2$1"
		TempString = TempString.replace(TempRegexp, TempReplce)
		TempRegexp = "@c" + i + "c@"
		TempReplce = CommentsTable[i]
		TempString = TempString.replace(TempRegexp, TempReplce)
	}
	WriteDebug(TempString, TempMssg)


	//------------------------------------------------------
	// Clean-up...

	PrintMessage('\tClean-up...')

	// Outdenting every line...
	TempMssg = '\t\tOutdenting every line...'
	PrintVerbose(TempMssg)
	TempRegexp = /^\t/mg
	TempReplce = ""
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
/*
	// Removing double-blank spaces...
	TempMssg = '\t\tRemoving double-blank spaces...'
	PrintVerbose(TempMssg)
	TempRegexp = /  /gm
	TempReplce = " "
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempString = TempString.replace(TempRegexp, TempReplce)
		TempMatch = TempString.match(TempRegexp)
	}
	TempRegexp = /\n[\t ]+\n/gm
	TempReplce = "\n\n"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
*/
	// Removing zero-value decimals...
	TempMssg = '\t\tRemoving zero-value decimals...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\d)(\.0+)([^\w])/mg
	TempReplce = "$1$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Removing trailing zero-value decimals...
	TempMssg = '\t\tRemoving trailing zero-value decimals...'
	PrintVerbose(TempMssg)
	TempRegexp = /(\d\.\d*[123456789]+)(0+)([^\w])/mg
	TempReplce = "$1$3"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Adding missing zeros before decimals...
	TempMssg = '\t\tAdding missing zeros before decimals...'
	PrintVerbose(TempMssg)
	TempRegexp = /([^\w])(\.\d)/mg
	TempReplce = "$10$2"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
// May caus bugs in mixed tables

	// Removing semi-colons at the end of lines...
	// Maybe replace all semi-colons -- not just at the end of lines -- with new-lines, instead. Otherwise, it could be more of a nuisance.
	// Warning! They're needed in some cases (at least, in Homeworld 2) not handled here.
	TempMssg = '\t\tRemoving semi-colons at the end of lines...'
	PrintVerbose(TempMssg)
	TempRegexp = /([^,\s])(\s*)(\;)(\n)/mg
	TempReplce = "$1$2$4"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)

	// Fixing natural logarithms...
	TempMssg = '\t\tFixing natural logarithms...'
	PrintVerbose(TempMssg)
	TempRegexp = /([^\w]\d+)(e|E)(\s+)(\-|\+)(\s+)(\d+)/mg
	TempReplce = "$1$2$4$6"
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
/*
	// Removing lines containing only whitespace...
	// Seems to not be necessary any longer.
	TempMssg = '\t\tRemoving lines containing only whitespace...'
	PrintVerbose(TempMssg)
	TempRegexp = /\n[ \t]+\n/gm
	TempReplce = "\n"
	TempMatch = TempString.match(TempRegexp)
	TempString = TempString.replace(TempRegexp, TempReplce)
	WriteDebug(TempString, TempMssg)
*/
	// Removing double-blank lines...
	TempMssg = '\t\tRemoving double-blank lines...'
	PrintVerbose(TempMssg)
	TempRegexp = /\n\n\n/gm
	TempReplce = "\n\n"
	TempMatch = TempString.match(TempRegexp)
	while (TempMatch != null)
	{
		TempString = TempString.replace(TempRegexp, TempReplce)
		TempMatch = TempString.match(TempRegexp)
	}
	WriteDebug(TempString, TempMssg)

	// Removing blank lines at the beginning of the file...
	TempMssg = '\t\tRemoving blank lines at the beginning of the file...'
	PrintVerbose(TempMssg)
	while (TempString.charAt(0) == '\n')
	{
		TempString = TempString.substring(1, TempString.length - 1)
	}
	WriteDebug(TempString, TempMssg)

	// Adding a blank line to the end of the file if not already...
	TempMssg = '\t\tAdding a blank line to the end of the file if not already...'
	PrintVerbose(TempMssg)
	if (TempString.charAt(TempString.length - 1) != '\n')
	{
		TempString = TempString + '\n'
	}
	WriteDebug(TempString, TempMssg)

	if (UnixEndOfLine == false)
	{
		// Replacing all carriage returns...
		TempMssg = '\t\tReplacing all carriage returns...'
		PrintVerbose(TempMssg)
		TempRegexp = /\n/mg
		TempReplce = "\r\n"
		TempString = TempString.replace(TempRegexp, TempReplce)
		WriteDebug(TempString, TempMssg)
	}

	return TempString
}

function iterate1(TempString)
{
	var TempRegexp = /(\t*)([^\{\t]*)(\{)(.*)/
	var TempReplce = "$1$2\n$1$3\n"
	OutString += TempString.replace(TempRegexp, TempReplce)
	TempReplce = "$1$4"
	return TempString.replace(TempRegexp, TempReplce)
}

function iterate2(TempString)
{
	var TempCutoff = TempString.indexOf("}") + 1
	if (TempString.charAt(TempCutoff) == ",")
	{
		TempCutoff += 1
	}
	var TempString2 = TempString.substring(0, TempCutoff)
	var TempString3 = TempString.substring(TempCutoff, TempString.length)
	var TempRegexp = /^([^\}\n]*)(\},?)/m
	var TempMatch = TempString2.match(TempRegexp)
	var TempString4 = TempMatch[0]
	TempRegexp = /^(\t)(\t*)([^\}\t]*)(\},?)/gm
	var TempReplce = "$2"
	var TempString5 = TempString4.replace(TempRegexp, TempReplce)
	TempReplce = "$1$2$3\n$2$4\n"
	OutString += TempString2.replace(TempRegexp, TempReplce)
	return "\t" + TempString5 + TempString3
}

function iterate3(TempMatch, TempRegexp)
{
	var TempCutoff = TempMatch.index + TempMatch[0].length - 1
	var TempString2 = TempMatch.input.substring(0, TempCutoff)
	var TempString3 = TempMatch.input.substring(TempCutoff, TempMatch.input.length)
	OutString += TempString2
	var TempString4 = indent(TempString3)
	return TempString4.match(TempRegexp)
}

function indent(TempString)
{
	var TempRegexp = /^(.*)$/gm
	var TempReplce = "\t$1"
	return TempString.replace(TempRegexp, TempReplce)
}

function outdent(TempString)
{
	var TempRegexp = /^(\t)(.*)$/gm
	var TempReplce = "$2"
	return TempString.replace(TempRegexp, TempReplce)
}

function ShowProgress()
{
	document.getElementById("work").style.display = "inline"
	document.getElementById("done").style.display = "none"
//	setTimeout(PrintToWindow(CodeString), 5000)
}

function HideProgress()
{
	document.getElementById("work").style.display = "none"
	document.getElementById("done").style.display = "inline"
}

function PrintToWindow(CodeString)
{
	// process the code
	CodeString = ProcessCode(CodeString)

	// set up the window
	if (typeof(OutputWindow) == 'undefined')
	{
		var OutputWindow = window.open()
	}
	else if (OutputWindow.closed == true)
	{
		var OutputWindow = window.open()
	}

	// write to the window
	OutputWindow.document.open()
	OutputWindow.document.write
	(
		'<html><head><title>Output</title><link rel="stylesheet" type="text/css" href="wakka.css" /></head><body><div class="page" style="height: 90%;"><textarea style="width: 100%; height: 90%">' +
		CodeString +
		'</textarea><input name="submit" type="submit" value="Close" onclick="window.close()" /></div></body></html>'
	)
	OutputWindow.document.close()
}

function PrintMessage(TempString)
{
	if (AppConsole == 1)
	{
		WScript.Echo(TempString)
	}
}

function PrintVerbose(TempString)
{
	if ((AppConsole == 1) && (MssgVerbose == true))
	{
		WScript.Echo(TempString)
	}
}

function PrintDebug(TempString)
{
	if ((AppConsole == 1) && (MssgDebug == true))
	{
		WScript.Echo(TempString)
	}
}

function WriteDebug(TempString1, TempString2)
{
	if ((AppConsole == 1) && (MssgDebug == true))
	{
		var TempString3 = '\f'+
		'-----------------------------------------------------------\n'+
		'--' + TempString2 + '\n'+
		'-----------------------------------------------------------\n\n'+
		TempString1 + '\n\n'

		DebgObject = fso.OpenTextFile(DbgPath, 8, 1, 0)
		DebgObject.Write(TempString3)
		DebgObject.Close()
	}
}

function AlertMessage(TempString)
{
	if (AppConsole == 1)
	{
		WScript.Echo(TempString)		
	}
	else
	{
		alert(TempString)
	}
}

function ReportError(ErrorMessage, ErrorCode)
{
	AlertMessage(ErrorMessage)
	ErrorOccurred = true
	if (AppConsole == 1)
	{
		AlertMessage('HW2_PrettyPrinter quit prematurely.')
		WScript.Quit(2)		
	}
}

function CountBreak(ErrorMessage, NumIterate)
{
	CountIteration += 1
	if (CountIteration > NumIterate)
	{
		ReportError(ErrorMessage, 1)
		return 1
	}
	else return 0
}

function CountLength(TempTable)
{
	if (TempTable != null)
	{
		return TempTable.length
	}
	else return 0
}

function PrintHelp()
{
	PrintMessage(AppInfo)
	PrintMessage(AppError)
}
