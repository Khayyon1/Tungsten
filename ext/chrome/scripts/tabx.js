/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const TabX = __webpack_require__(5);
const display = __webpack_require__(6);
__webpack_require__(7);

var WordCompleteModel = {
    predictCurrentWord: function(input){return messageBackgroundPage("WORD_COMPLETE", input)}
}

var WordPredictModel = {
    predictNextWord: function(input){return messageBackgroundPage("WORD_PREDICT", input)}
}

//Before Constructor is called
//      Check Settings for what features are enabled

var tabx;

chrome.storage.local.get(function(results)
{
    if(results != null)
    {
        console.log("Current word enabled: " + results["Current Word"]);
        console.log("Next word enables: " + results["Next Word"]);

        tabx = new TabX(WordCompleteModel, WordPredictModel,
            display,
            document,
            wordCompleteEnabled=results["Current Word"],
            wordPredictEnabled=results['Next Word']);

        tabx.registerListeners();
        if(!results['activated'])
        {
            console.log("Disabled upon init");
            tabx.disable();
        }

        console.log("I was created");
    }
});


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
    console.log("received message: " + message)
    if(message == "enableTabX") {
        tabx.enable();
        console.log("I was enabled");
    }

    else if(message == "disableTabX") {
        tabx.disable();
        console.log("I was disabled");
    }

    else if(message == "enableWordPrediction")
    {
        console.log("enabled Word Prediction")
        tabx.enableWordPrediction();
    }
    else if(message == "enableWordCompletion")
    {
        console.log("enabled Word Completion")

        tabx.enableWordCompletion();
    }

    else if(message == "disableWordPrediction")
    {
        console.log("disabled Word Prediction")

        tabx.disableWordPrediction();
    }

        else if(message == "disableWordCompletion")
    {
        console.log("disabled Word Completion");

        tabx.disableWordCompletion();
    }
});

async function messageBackgroundPage(request, input)
{
    let response = new Promise(function(resolve, reject)
    {
        chrome.runtime.sendMessage({"TabxOp": request, "TabxInput": input}, function (response) {
            resolve(response.TabxResults);
        });
    });

    console.log("before results");
    let results = await response;
    console.log("after results: " + results);

    return results;
}



/***/ }),
/* 5 */
/***/ (function(module, exports) {

// this.document.addEventListener("keyup", displaySuggestions);

var _current_word = "";

//import {wordCompleteModel} from './models/wordcomplete.js';
var _debug = false;

const TabX = class
{
    constructor(wordCompleteModel,
                wordPredictModel,
                displayStrategy,
                document=document,
                wordCompleteEnabled=true,
                wordPredictEnabled=true)
    {
        this.wordCompleteModel = wordCompleteModel;
        this.wordPredictModel = wordPredictModel;
        this.displayStrategy = displayStrategy;
        this.shortcuts = ["1", "2", "3"];
        this.document = document;
        this.wordPredictEnabled = wordPredictEnabled;
        this.wordCompleteEnabled = wordCompleteEnabled;
        this.enabled = true;
    }

    setDocument(document)
    {
        this.document = document;
    }

    async getAppropriateSuggestions()
    {
        var elem = this.document.activeElement
        var previous = elem.value.charAt(elem.selectionStart - 1)
        if(previous != " " && this.wordCompleteEnabled)
        {
            return await this.getSuggestions(this.getCurrentWord(elem))
        }

        else if(this.wordPredictEnabled)
        {
            return await this.getNextWordSuggestion(elem.value)
        }
    }

    async displaySuggestions(activeElement)
    {
        if(!this.activeElementIsTextField())
        {
            return;
        }


        if(this.document.activeElement.value == "" || this.getCurrentWord(this.document.activeElement) == "")
        {
            return;
        }


        let suggestions = await this.getAppropriateSuggestions();

        if(suggestions.length == 0)
        {
            return;
        }

        this.mappings = {};

        for(let i = 0; i < suggestions.length; i++)
        {
            let shortcut = this.shortcuts[i];
            let suggestion = suggestions[i];

            //Every shortcut is mapped to a suggestion that TabX can reference
            //later
            this.mappings[shortcut] = suggestion;
        }

        this.displayStrategy.tearDown();
        this.displayStrategy.display(this.mappings);
    }

    activeElementIsTextField()
    {
        var activeElement = this.document.activeElement;
        return activeElement.tagName == 'INPUT';
    }

    wordCompletion(activeElement, userChoice)
    {
        activeElement.value = this.replaceWordAt(
            activeElement.value,
            activeElement.selectionStart,
            userChoice);
    }

    replaceWordAt(str, i, word, delimiter=' ')
    {
        var startOfWord = str.lastIndexOf(delimiter, i - 1);
        var before = str.substring(0, startOfWord);

        if (before != "" && before != null)
        {
            before += " "
        }

        var after  = str.substring(i);

        if(after.charAt(0) != "" && after.charAt(0) != " ")
        {
            after = " " + after;
        }

        return before + word + after;
    }

    //Assumes that the caret is at the end of a word in a text field
    getCurrentWord(inputField)
    {
        var text = inputField.value;
        var caret = inputField.selectionStart;

        if(caret == 0)
        {
            return "";
        }

        //Check to see if the previoius character is a whitespace
        //If it is not, push previous back one to allow the current
        //word be the word that comes before a whitespace
        //Ex. "hello |" -> "hello"
        var prev = text.charAt(caret - 1);
        if(prev === " "){
            prev = text.charAt(caret - 2);
            caret -= 1;
        }

        //Make sure caret is at the end of a developing word
        if(prev.match(/\w/))
        {
            //Iterate backwards to find the first instance of a white space
            // 0 to caret
            var startOfWord = this.indexOfStartOfCurrentWord(text, caret);

            if(startOfWord == 0)
            {
                return text.substring(0, caret);
            }
            else
            {
                return text.substring(startOfWord, caret);
            }
        }

        else
        {
            return "";
        }
    }

    indexOfStartOfCurrentWord(text, caret)
    {
        //Iterate backwards to find the first instance of a white space
        var i = caret;
        while(i > 0 && text.charAt(i - 1).match(/\w/))
        {
            i--;
        }

        return i;
    }

    inputHasCharactersOtherThanLetters(string)
    {
        return (/[^a-zA-Z\s]/).test(string)
    }

    inputIsEmpty(string)
    {
        return string === "";
    }

    inputIsNotValid(str)
    {
        return this.inputHasCharactersOtherThanLetters(str) || this.inputIsEmpty(str);
    }

    async getSuggestions(incomplete_string)
    {
        if(this.inputIsNotValid(incomplete_string))
        {
            return [];
        }

        else
        {
            return await this.wordCompleteModel.predictCurrentWord(incomplete_string);
        }

    }


    async getNextWordSuggestion(str)
    {
        var caret_position = this.document.activeElement.selectionStart;
        var left_of_caret = caret_position - 1;
        var space_precedes_caret = str.charAt(left_of_caret) == " ";
        var currentWord = this.getCurrentWord(this.document.activeElement);

        if(this.inputIsNotValid(currentWord) || !space_precedes_caret)
        {
            return [];
        }
        else
        {
            return await this.wordPredictModel.predictNextWord(this.getCurrentWord(this.document.activeElement));
        }
    }

    handleUserInput(event)
    {

        if (this.activeElementIsTextField() && this.enabled)
        {
            this.displaySuggestions(this.document.activeElement);
        }
    }

    registerListeners()
    {
        //Provide suggestions based on developing word
        this.document.addEventListener('keydown', this.handleWordComplete.bind(this));

        //Shows suggestions
        this.document.addEventListener('keyup', this.handleUserInput.bind(this));
        var serviceableElements = this.document.querySelectorAll("input[type=text]");

        //Listens for when active elements lose focus
        for(var i = 0; i < serviceableElements.length; i++)
        {
            var elem = serviceableElements[i];
            elem.addEventListener('blur', function()
            {
               this.displayStrategy.tearDown();
            }.bind(this));
        };
    }

    enable()
    {
        this.enabled = true;
    }

    disable()
    {
        this.enabled = false
    }

    handleWordComplete(event)
    {
        if(!this.enable){return;}
        var keyname = event.key;
        if(this.activeElementIsTextField() && this.shortcuts.includes(keyname) && this.displayStrategy.isActive())
        {
            event.preventDefault();
            var userChoice = this.mappings[keyname];
            this.wordCompletion(this.document.activeElement, userChoice);
        };
    }

    disableWordPrediction()
    {
        this.wordPredictEnabled = false;
    }

    disableWordCompletion()
    {
        this.wordCompleteEnabled = false;
    }

    enableWordPrediction()
    {
        this.wordPredictEnabled = true;
    }

    enableWordCompletion()
    {
        this.wordCompleteEnabled = true;
    }

};

module.exports = TabX;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

var ID = "suggestions"
var current_table = null;

function createSuggestionsTable()
{
    let table = document.createElement("table");
    table.id = ID;
    table.className = "suggestions";
    table.style.position = 'absolute';

    let input_bounds = document.activeElement.getBoundingClientRect();
    table.style.backgroundColor = "lightblue";
    table.style.zIndex = 999;
    table.style.left = (input_bounds.left).toString() + "px";
    table.style.top = (input_bounds.top + input_bounds.height).toString()+"px";

    current_table = table;
    return table
}

function isActive()
{
   return document.getElementById(ID) != null;
}

function tearDown()
{
   if(isActive())
   {
       current_table.parentNode.removeChild(current_table);
   }
}

function display(mappings)
{
   var table = createSuggestionsTable();

   var suggestions = Object.values(mappings);
   var shortcuts = Object.keys(mappings);

   for(var i = 0; i < suggestions.length; i++)
   {
       var row = document.createElement("tr");
       var shortcutColumn = document.createElement("td");
       var suggestionsColumn = document.createElement("td");
       shortcutColumn.appendChild(document.createTextNode((shortcuts[i].toString())));
       suggestionsColumn.appendChild(document.createTextNode(suggestions[i]));
       row.append(shortcutColumn);
       row.append(suggestionsColumn);
       table.appendChild(row);
   }

   document.body.appendChild(table);

}

module.exports = {
    isActive: isActive,
    tearDown: tearDown,
    display: display
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

html = ['settings', 'popup'];
img = ['logo256.png'];
js = ['activated', 'button', 'form', 'settings'];
css = ['popup'];

html.forEach((html) => __webpack_require__(8)("./" + html + ".html"));
img.forEach((img) => __webpack_require__(11)("./" + img));
css.forEach((css) => __webpack_require__(13)("./" + css + ".css"));


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./popup.html": 9,
	"./settings.html": 10
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 8;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../assets/html/popup.html";

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../assets/html/settings.html";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./logo256.png": 12
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 11;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../assets/img/logo256.png";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./popup.css": 14
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 13;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../assets/css/popup.css";

/***/ })
/******/ ]);