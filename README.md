# random-translate
a commandline tool for chained random translation

# syntax

`
Help for Random Translator by Fuchsi2/Fuchsi_II/Seb.Fxs:

node index.js [-if path/to/text/file.txt | -i "input text" ] -il en -l 3 -ol de -of path/to/output/file.txt -o

///help///

-ll                     - list all available languages.

-h / --help             - print help page.


///options///

-if <path>              - path to input file. (not compatible with -i)

-i <input-text>         - input text. must be in double-quotes("). (not compatible with -if)

-il <input-language>    - language for input. can be any listed in -ll and auto.

-ilr                    - random input language

-l <number>             - number of random languages to use. number > 0.

-ol <output-language>   - language for output. can be any listed in -ll.

-olr                    - random output language

-of <path>              - path to output file.

-o                      - print output text to console.

-oh                     - print list of used languages (-il and -ol included).
`

# build
`npm run build`

for more targetplattforms edit targets in package.json.