document.addEventListener("keyup", displaySuggestions);

let _current_word = "";



function displaySuggestions(activeElement)
{
   if(!activeElementIsTextField()){
      return;
   }

   current_table = document.getElementById("suggestionsTable");


   console.log(current_table);
   if(current_table != null)
   {
      document.body.removeChild(current_table);
   }

   if(document.activeElement.value == ""){
         return;
   }

   table = document.createElement("table");
   table.id = "suggestionsTable"

    table.style.position = 'fixed';
    var input_bounds = document.activeElement.getBoundingClientRect();

    table.style.left = (input_bounds.left).toString() + "px";
    table.style.top = (input_bounds.top + 20).toString()+"px";

   console.log(document.activeElement.value);
   suggestions = getSuggestions(getCurrentWord(document.activeElement));
   for(i = 0; i < suggestions.length; i++)
   {
       row = document.createElement("tr");
      row.append(document.createTextNode(suggestions[i]));
      table.appendChild(row);
   }

   document.body.appendChild(table);
}

function activeElementIsTextField()
{
   var activeElement = document.activeElement;
   return activeElement.tagName == 'INPUT';
}

function wordCompletion(activeElement, userChoice ='world')
{
    activeElement.value = replaceWordAt(
        activeElement.value,
        activeElement.selectionStart,
        userChoice);
}

function replaceWordAt(str, i, word, delimiter=' ')
{
    startOfWord = word.lastIndexOf(delimiter, i);
    before = str.substring(0, startOfWord);
    after  = str.substring(i);
    return before + word + after;
}

function storeCurrentWord(){
    if(activeElementIsTextField())
    {
        _current_word = getCurrentWord(document.activeElement);
        console.log(_current_word);
        console.log("Suggestions: " + getSuggestions(_current_word));
    }
}


//Assumes that the caret is at the end of a word in a text field
function getCurrentWord(inputField)
{
   text = inputField.value;
   caret = inputField.selectionStart;

   if(caret == 0)
   {
      return "";
   }

   prev = text.charAt(caret - 1);

   //Make sure caret is at the end of a developing word
   if(prev.match(/\w/) && (caret == text.length || text.charAt(caret).match(/\W/)))
   {
      //Iterate backwards to find the first instance of a white space
      var startOfWord = indexOfStartOfCurrentWord(text, caret);

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

function indexOfStartOfCurrentWord(text, caret)
{
      //Iterate backwards to find the first instance of a white space
      var i = caret;
      while(i > 0 && text.charAt(i - 1).match(/\w/))
      {
          i--;
      }

      return i;
}

function getSuggestions(incomplete_string)
{
   return [incomplete_string + "ua", incomplete_string + "oa", incomplete_string + "ia"];
}
