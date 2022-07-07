const translate = require('google-translate-api-x');
const process = require('process');
const fs = require('fs')

const all_langs = require('./langs.json')


var langs = []
var settings = {
    "-if": "",
    "-i": "",
    "-il": "",
    "-l": 0,
    "-ol": "",
    "-of": "",
    "-o": false,
    "-oh": false,
    "-olr": false,
    "-ilr": false,
    "-d": ""
}

function recursiveCall(index,txt,promise) {
    return new Promise((resolve) => {
        if (promise == undefined) {
            // console.log(index, txt, txt == "", typeof promise);
            return resolve(recursiveCall(index+1,"",translate(txt, {from: langs[index], to: langs[index+1]})))
        } else {
            promise.then(ptext=>{
                // console.log(index, ptext.text, txt == "", typeof promise);
                if (index+1 < langs.length) {
                    return resolve(recursiveCall(index+1,"",translate(ptext.text, {from: langs[index], to: langs[index+1]})))
                } else {
                    return resolve(ptext.text)
                }
            })
        }
        
        
    })
}

function multiPartCall(index,parts,promise,text) {
    return new Promise((resolve) => {
        if (promise == undefined) {
            return resolve(multiPartCall(index+1,parts,recursiveCall(0,parts[index],undefined),""))
        } else {
            promise.then((txt) =>{
                if (index+1 < parts.length) {
                    debug(txt)
                    debug(text)
                    var otxt = text + " " + txt;
                    if (text == "") {
                        otxt = txt;
                    }
                    return resolve(multiPartCall(index+1,parts,recursiveCall(0,parts[index]),otxt))
                } else {
                    return resolve(text + " " + txt)
                }
            });
        }
    })
}

function debug(str) {
    if (settings['-d'] !== "") {
        fs.appendFileSync(settings['-d'], str + "\n\n")
    }
}

//help 
if (process.argv.includes("-h") || process.argv.includes("--help") || process.argv.length == 2) {
    console.log(`
Help for Random Translator ${"v" + require('./package.json').version} by Fuchsi2:
GitHub Repo: https://github.com/Fuchsi2/random-translate

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

`)
    process.exit(0)
}
if (process.argv.includes("-ll")) {
    console.log(all_langs.toString())
    process.exit(0)
}

// debug
if (process.argv.includes("-d") || process.argv.includes("--debug")) {
    settings['-d']=process.argv[process.argv.findIndex(i=>{return i == "-d"})+1]
}

if (!(process.argv.includes("-if") || process.argv.includes("-i"))) {
    console.error("a input (-if file/path.txt or -i \"this is text\") must be specified.")
    process.exit(1)
}
if (!(process.argv.includes("-of") || process.argv.includes("-o"))) {
    console.error("a output (-of file/path.txt or -o) must be specified.")
    process.exit(1)
}
if (process.argv.includes("-if") && process.argv.includes("-i")) {
    console.error("-if and -i cant be used at the same time.")
    process.exit(1)
}
if (process.argv.includes("-if")) {
    settings['-if']=process.argv[process.argv.findIndex(i=>{return i == "-if"})+1]
}else if (process.argv.includes("-i")) {
    settings['-i']=process.argv[process.argv.findIndex(i=>{return i == "-i"})+1]
}
if (process.argv.includes("-il")) {
    settings['-il']=process.argv[process.argv.findIndex(i=>{return i == "-il"})+1]
}
if (process.argv.includes("-l")) {
    settings['-l']=process.argv[process.argv.findIndex(i=>{return i == "-l"})+1]
}
if (process.argv.includes("-ol")) {
    settings['-ol']=process.argv[process.argv.findIndex(i=>{return i == "-ol"})+1]
}
if (process.argv.includes("-of")) {
    settings['-of']=process.argv[process.argv.findIndex(i=>{return i == "-of"})+1]
}
if (process.argv.includes("-o")) {
    settings['-o']=true
}
if (process.argv.includes("-oh")) {
    settings['-oh']=true
}
if (process.argv.includes("-olr")) {
    settings['-olr']=true
    ++settings['-l']
}
if (process.argv.includes("-ilr")) {
    settings['-ilr']=true
    ++settings['-l']
}
debug(JSON.stringify(settings))

var text;
if (settings['-if'] != "") {
    text = fs.readFileSync(settings['-if'],{encoding:'utf-8'})
} else if (settings['-i']) {
    text = settings['-i']
}
debug(text)

if (!settings['-ilr']) langs.push(settings['-il'])
for (let i = 0; i < settings['-l']; i++) {
    langs.push(all_langs[Math.floor(Math.random()*all_langs.length)])
}
if (!settings['-olr']) langs.push(settings['-ol'])
debug(langs.toString())

if (settings['-oh']) {
    console.log(langs.toString())
    console.log()
}

if (text.length > 100) {

    var parts = [""]
    var parti = 0
    text.split(/ |$/g).forEach(word => {
        if (parts[parti].length + word.length < 200) {
            parts[parti] +=word + " "
        } else {
            parts[++parti] = word
        }
    });
    debug(parts.length)
    debug(JSON.stringify(parts))

    multiPartCall(0,parts,undefined,"").then((txt) => {
        debug(txt)
        if (settings['-of'] != "") {
            fs.writeFileSync(settings['-of'],txt)
        }
        if (settings['-o']) {
            console.log(txt)
        }
    });

} else {
    recursiveCall(0,text).then((txt) =>{
        debug(txt)
        if (settings['-of'] != "") {
            fs.writeFileSync(settings['-of'],txt)
        }
        if (settings['-o']) {
            console.log(txt)
        }
    });
}

