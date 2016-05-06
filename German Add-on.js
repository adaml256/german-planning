function colourTextSetup(search, colour){
  var ui = DocumentApp.getUi();
  
  //Prompt the user for what text should be searched for and coloured
  var textResult = ui.prompt('Text Colourer', 'Enter text to colour:', ui.ButtonSet.OK_CANCEL);
  if (textResult.getSelectedButton() != ui.Button.OK){
    return;
  }else{
    var search = textResult.getResponseText();
  }
  
  //Prompt the user for what colour should be used
  var colourResult = ui.prompt('Text Colourer', 'Enter colour to colour as (#FFFFFF is white):', ui.ButtonSet.OK_CANCEL);
  if (colourResult.getSelectedButton() != ui.Button.OK){
    colour = '#000000';
  }else{
    colour = colourResult.getResponseText();
  }
  
  //Colour the text (A separate function so that plan() can use preset options)
  colourText(search, colour);
}

function colourText(search, colour){
  //Get the text
  var text = DocumentApp.getActiveDocument().getBody().editAsText();
  
  //A loop to find all occurrences of the text that should be coloured
  var index = -1;
  while(true){
    index = text.getText().indexOf(search, index+1);
    
    if (index == -1){
      //Stop if the text does not appear
      break;
    }else{
      //Colour the text with the specified colour
      text.setForegroundColor(index, index + (search.length - 1), colour)
    }
  }
}

function dashText(){
  //Get the text
  var doc = DocumentApp.getActiveDocument().getBody();
  var text = doc.getText();
  
  //Initialise the regEx to be used - It finds a non-letter, a letter, another letter, and then another non-letter
  // \u00C4-\u00FC is a range of unicode characters which includes those with umlauts and the eszett
  var regEx = "([^\u00C4-\u00FCa-zA-Z,.])([\u00C4-\u00FCa-zA-Z])[\u00C4-\u00FCa-zA-Z]([^\u00C4-\u00FCa-zA-Z])";
  //Convert the regEx string into a regex that can be used
  var regExObj = new RegExp(regEx, "g");
  //Set the replace regex - It adds the first non-letter, the first letter, an underscore (to replace the second letter), and then the last non-letter
  var replaceString = '$1$2_$3   ';
  
  //Use the regex a few times in case multiple two-letter words appear next to each other
  for(ii = 0; ii < 4; ii++){
    //Find matches for the regex and replace them with the first letter and an underscore
    text = text.replace(regExObj, replaceString);
  }
  
  //Replace words of lengths up to 30 letters - should be a reasonably high limit
  for(i = 3; i < 30; i++){
    //Get the end of the old regEx - which includes all the letters to be replaced with underscores
    var end = regEx.slice(29);
    //Set the new regEx to be the same start as the old regEx, but with another letter in the middle
    regEx = "([^\u00C4-\u00FCa-zA-Z,.])([\u00C4-\u00FCa-zA-Z])[\u00C4-\u00FCa-zA-Z]" + end;
    var regExObj = new RegExp(regEx, "g");
    
    //Do the same thing to the replace regex to add another underscore, separated from others with a dash (to keep the word on one line)
    var replaceEnd = replaceString.slice(4);
    replaceString = "$1$2_-" + replaceEnd;
    
    //If the word is 9 letters add in an extra capture group to the regex to put the final letter in the plan
    if(i == 9){
      regEx = regEx.slice(0,-25) + "([\u00C4-\u00FCa-zA-Z])([^\u00C4-\u00FCa-zA-Z])";
      var regExObj = new RegExp(regEx, "g");
      replaceString = replaceString.slice(0,-7) + "$3$4    ";
    }
    
    //Use the regex a few times in case multiple words of the same length appear next to each other
    for(ii = 0; ii < 4; ii++){
      text = text.replace(regExObj, replaceString);
    }
  }
  
  //Repeat the same process but only for the first word - the regex starts at the beginning and not with a non-letter 
  var regEx = "^([\u00C4-\u00FCa-zA-Z])[\u00C4-\u00FCa-zA-Z]([^\u00C4-\u00FCa-zA-Z])";
  var regExObj = new RegExp(regEx, "g");
  var replaceString = '$1_$2    ';
  text = text.replace(regExObj, replaceString);
  
  for(i = 3; i < 30; i++){
    var end = regEx.slice(14);
    regEx = "^([\u00C4-\u00FCa-zA-Z])[\u00C4-\u00FCa-zA-Z]" + end;
    var regExObj = new RegExp(regEx, "g");
    
    var replaceEnd = replaceString.slice(2);
    replaceString = "$1_-" + replaceEnd;
    
    //If the word is 9 letters add in an extra capture group to the regex to put the final letter in the plan
    if(i == 9){
      regEx = regEx.slice(0,-25) + "([\u00C4-\u00FCa-zA-Z])([^\u00C4-\u00FCa-zA-Z])";
      var regExObj = new RegExp(regEx, "g");
      replaceString = replaceString.slice(0,-7) + "$3$4    ";
    }
    
    text = text.replace(regExObj, replaceString);
  }
  
  //Set the document to the new text with letters replaced by underscores
  doc.setText(text);
}

function plan(){
  //Replace letters in words with underscores separated by dashes
  dashText();
  //Colour the dashes white so that the underscores appear separated by spaces.
  colourText("-", "#FFFFFF");
}

function onOpen(){
  //Add UI menus to the google doc
  DocumentApp.getUi().createMenu('Plan').addItem('Planify', 'plan').addToUi();
  DocumentApp.getUi().createMenu('Dashes').addItem('Dashify', 'dashText').addToUi();
  DocumentApp.getUi().createMenu('Colour').addItem('Colourify', 'colourTextSetup').addToUi();
}