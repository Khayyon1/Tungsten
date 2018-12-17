const TabX = require('./tabx');
const TableView = require("./assets/js/viewstrats/fixedstrat");
const applySettings = require("./browserspec/settings");
//const bgmodels = require("./models/messenger-models");
const mocknext = require("./models/mock/nextword_mock")
const mockcomp = require("./models/mock/wordcomplete_mock")

let display = new TableView(document);
let tabx = new TabX(mockcomp,
   mocknext,
   display,
   document);

applySettings(tabx);
