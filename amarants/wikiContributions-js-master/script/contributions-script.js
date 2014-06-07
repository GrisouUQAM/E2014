// Copyright VOGG 2013
// Revision ETE 2014 GF
var oldText, newText, wiki, analysisTable, url, user, activeAjaxConnections = 0,
tabSelected = "Articles";

function clearScreen() {
  if(tabSelected === "Articles"){
    $("#articles").html("");
    $("#titre").html("");
  }else if(tabSelected === "Talks"){
    $("#talks").html("");
  }
}

function stopLoading() {
  $("#loading").attr("src", "");
  $("#loading").hide();
}

function doNext(elem, curIndex) {
  $(elem.children()[curIndex++]).animate({
    top: "0%"
  }, 100, function () {
    doNext(elem, curIndex);
  });
}

function loading() {
  var parent_height = $('#loading').parent().height();
  var image_height = $('#loading').height();
  var parent_width = $('#loading').parent().width();
  var image_width = $('#loading').width();
  var top_margin = (parent_height - image_height) / 2;
  var left_margin = (parent_width - image_width) / 2;
  $('#loading').css('margin-top', top_margin);
  $('#loading').css('margin-left', left_margin);
  $("#loading").attr("src", "images/465.gif");
  $("#loading").show();
}

function callback_Q1(data, continueFlag) {
  var contributions = data.query.usercontribs, totalVal = 0, html_list_articles = "";
  
  var lastItem = $(".last_item .list_articles_item_pageid").val();
  $(".list_articles_item").removeClass("last_item");
  if(continueFlag){
    totalVal = parseInt($("#total_score_contr").text());
    html_list_articles = $("#articles").html();
  }else{
    $("#titre").html('Articles which ' + user + ' contributed to with total score: <span id="total_score_contr"></span>');
  }

  for (var i = 0; i < contributions.length; ++i) {
    if(lastItem != contributions[i].pageid){
      if(i === contributions.length - 1)
        html_list_articles += '<div class="list_articles_item last_item" onclick="getArticle(this);">';
      else
        html_list_articles += '<div class="list_articles_item" onclick="getArticle(this);">';

        html_list_articles += '<div class="list_articles_item_title">' + contributions[i].title + '</div>' +
                              '<span class="list_articles_item_surv"></span>' +
                              '<div class="list_articles_item_size">Size: ' + contributions[i].size + '</div>';
      if (contributions[i].sizediff < 0) {
        html_list_articles += '<div class="list_articles_item_size_diff">Size diff: <span class="sizediff_neg">' + Math.abs(contributions[i].sizediff) + '</span></div>';
      } else {
        html_list_articles += '<div class="list_articles_item_size_diff">Size diff: ' + contributions[i].sizediff + '</div>';
      }
      html_list_articles += '<span class="list_articles_item_time">' + contributions[i].timestamp + '</span>';
      html_list_articles += '<input class="list_articles_item_pageid" type="hidden" value="' + contributions[i].pageid + '"/>' +
        '<input class="list_articles_item_revid" type="hidden" value="' + contributions[i].revid + '"/>' +
        '<input class="list_articles_item_parentid" type="hidden" value="' + contributions[i].parentid + '"/></div>';
      totalVal += Math.abs(contributions[i].sizediff);/*on recupere nombre des contributions*/
    }
  }
  $("#total_score_contr").text(totalVal);
  stopLoading();
  $("#articles").html(html_list_articles);
  doNext($("#articles"), 0);
}

function callback_Q2(response) {
  var usercontribs = response.query.usercontribs;
  var html_list_talks = "";
  if (usercontribs.length > 0) {
    var i;
    for (i = 0; i < usercontribs.length; ++i) {
      html_list_talks += '<div class="list_talks_item">' +
                       '<div class="list_talks_item_title">' + usercontribs[i].title + '</div>' +
                       '<div class="list_talks_item_comment">' + usercontribs[i].comment + '</div></div>';
    }
    stopLoading();
    $("#talks").html(html_list_talks);
    doNext($("#talks"), 0);
  }
}

function callback_Q3(response) {
  oldText = response.parse.text["*"];
 // console.log("oldText",oldText);
}

function callback_Q4(response) {
  newText = response.parse.text["*"];
}

function doGet(url, query) {
  $.ajax({
    url: url,
    dataType: "jsonp",
    type: 'GET',
    success: function (response) {
      if (query === "Q1") {
        callback_Q1(response, false);
      } else if (query === "Q2") {
        callback_Q2(response);
      } else if (query === "Q3") {
        callback_Q3(response);
      } else if (query === "Q4") {
        callback_Q4(response);
      }else if (query === "Q5") {
        callback_Q1(response, true);
      }
    }
  });
}

function getNextUserContributions(timestamp){
  var uclimitContribution = getUclimitCourrent();
  var wikiUrl;
    wikiUrl = wiki + "/w/api.php?action=query&list=usercontribs&format=json&uclimit=" + uclimitContribution +
      "&ucuser=" + user + "&ucstart=" + timestamp +
      "&ucdir=older&ucnamespace=0&ucprop=ids%7Ctitle%7Ctimestamp%7Ccomment%7Csize%7Csizediff&&converttitles=";
  doGet(wikiUrl, "Q5");
}

function getJsonWiki() {
  clearScreen();
  var uclimitContribution = getUclimitCourrent();
  if ($.trim($("#user").val()).length === 0) {
    $("#user").css({
      "background-color": "#FFDBDB"
    });
    $("#user").focus();
    return;
  }
  if ($.trim($("#url").val()).length === 0) {
    $("#url").css({
      "background-color": "#FFDBDB"
    });
    $("#url").focus();
    return;
  }

  loading();

  url = $("#url").val();
  user = $("#user").val();
  wiki = "http://" + url;
  var wikiUrl;
  if ($("#advanced_search_elems_container").hasClass("visible_advance")) {
    wikiUrl = wiki + "/w/api.php?action=query&list=usercontribs&format=json&uclimit=" + uclimitContribution + "&ucuser=" + user +
      "&ucdir=older&ucnamespace=0&ucprop=ids%7Ctitle%7Ctimestamp%7Ccomment%7Csize%7Csizediff";
    if ($("#datepicker_from").val().length > 0) {
      wikiUrl += "&ucend=" + $("#datepicker_from").val() + "T00%3A00%3A00Z";
    }
    if ($("#datepicker_to").val().length > 0) {
      wikiUrl += "&ucstart=" + $("#datepicker_to").val() + "T00%3A00%3A00Z";
    }
    if ($('#minorEdit').is(":checked")) {
      wikiUrl += "&ucshow=!minor";
    }
    wikiUrl += "&converttitles=";
  } else {
    wikiUrl = wiki + "/w/api.php?action=query&list=usercontribs&format=json&uclimit=" + uclimitContribution + "&ucuser=" + user +
      "&ucdir=older&ucnamespace=0&ucprop=ids%7Ctitle%7Ctimestamp%7Ccomment%7Csize%7Csizediff&&converttitles=";
  }
  if(tabSelected === "Articles")
  {
    doGet(wikiUrl, "Q1");
  }else if(tabSelected === "Talks"){
    var jsonurlTalk = wiki + "/w/api.php?action=query&list=usercontribs&format=json&uclimit=500&ucuser=" + user +
      "&ucdir=older&ucnamespace=1&ucprop=title%7Ccomment%7Cparsedcomment";
    doGet(jsonurlTalk, "Q2");
  }
}

function getUclimitCourrent(){
  return Math.ceil(($("#articles").height() / 70));
}

$(document).ready(function () {
  $(document).tooltip();
  $("button").button();
  $("#datepicker_from").datepicker({changeMonth: true, changeYear: true}).datepicker("option", "dateFormat", "yy-mm-dd");
  $("#datepicker_to").datepicker({changeMonth: true, changeYear: true}).datepicker("option", "dateFormat", "yy-mm-dd");

  $('#url').bind('keypress', function (e) {
    var code = e.keyCode || e.which;
    if (code === 13) {
      getJsonWiki();
    } else {
      $("#url").css({
        "background-color": "#EBF3FF"
      });
    }
  });

  $('#user').bind('keypress', function (e) {
    var code = e.keyCode || e.which;
    if (code === 13) {
      getJsonWiki();
    } else {
      $("#user").css({
        "background-color": "#EBF3FF"
      });
    }
  });

  $('#tabs').tabs({
    activate: function (event, ui) {
      if (ui.newTab.context.text === "Articles") {
        tabSelected = "Articles";
        $("#tab_article").animate({ left: "0%" }, 400);
        setTimeout(function () {
          $("#tab").css({'z-index': '1'});
        }, 400);
        $("#tabs").removeClass("tabs_expand");
      } else {
        tabSelected = "Talks";
        $("#tab_article").css({'z-index': '-1'});
        $("#tab_article").animate({ left: "-100%", }, 400);
        $("#tabs").addClass("tabs_expand");
      }
    }
  });
  
  $('#tab_article').tabs();
  
  $("#articles").scroll(function(event){
    var elem = $(this);
    if (elem[0].scrollHeight - elem.scrollTop() - 100 < elem.outerHeight()){
      getNextUserContributions($(".last_item .list_articles_item_time").text());
    }
  });

  $("#btn_advanced_search").click(function () {
    if ($("#advanced_search_elems_container").hasClass("hidden_advance")) {
      $("#advanced_search_elems_container").removeClass("hidden_advance");
      $("#advanced_search_elems_container").addClass("visible_advance");
      $("#advanced_search_elems_container").slideDown(400);
    } else {
      $("#advanced_search_elems_container").removeClass("visible_advance");
      $("#advanced_search_elems_container").addClass("hidden_advance");
      $("#advanced_search_elems_container").slideUp(400);
    }
  });
});

function getArticle(item) {
  var article = "";
  loading();
  var title = $(item).find(".list_articles_item_title").text();
  // console.log("titre :" , title);
  
  var parentid = $(item).find(".list_articles_item_parentid").val();
  //tester article dans local storage
  if(typeof localStorage!='undefined' && JSON) { 
  if(existeArticle(parentid)  == true){
  
      lectureArticle(parentid);
	  
	  
	  
  
  }else{
     // console.log("parentid :" , parentid);
  var revid = $(item).find(".list_articles_item_revid").val();
  // console.log("revid :" , revid);
  var oldRevisionContent = wiki + "/w/api.php?action=parse&format=json&oldid=" + parentid + "&prop=text";
    // console.log("oldRevisionContent :" , oldRevisionContent);
  
  var userRevisionContent = wiki + "/w/api.php?action=parse&format=json&oldid=" + revid + "&prop=text";
    // console.log("userRevisionContent :" , userRevisionContent);
  
  
	
		 
  $.when(
    $.ajax({
      beforeSend: function (xhr) {
        activeAjaxConnections++;
      },
      url: oldRevisionContent,
      dataType: "jsonp",
      type: 'GET',
      success: function (response) {
        callback_Q3(response);
      }
    }),
    $.ajax({
      url: userRevisionContent,
      dataType: "jsonp",
      type: 'GET',
      success: function (response) {
        callback_Q4(response);
      }
    })
  ).then(function () {
    activeAjaxConnections--;
    analysisTable = getDiff(oldText, newText);
    article += analysisTable;
    if (activeAjaxConnections === 0) {
      $("#article_head").text("Article: '" + title + "' on " + $("#url").val());
	
      $("#contr_survived").text("The contribution survived: N/A");
      $("#article").html(analysisTable);
      stopLoading();
    }
  console.log(analysisTable);
     var resultContribution = getvalueContribution(oldText, newText);
	
	 
	saveArticle(title, parentid, article,resultContribution);
	
	
  });
   
  }
     }else alert("localStorage n'est pas supporté");
  
  
  
  
  
  
 
  
}
/*verifier existance article*/


function existeArticle (parentid){

var tabArticle = [];
var trouve = false;
if(localStorage.getItem("listes Article") != null){
    object = JSON.parse(localStorage.getItem("listes Article"));
	
		console.log(object);
   
    var lenghtTab = object.tabArticle.length;
	console.log(lenghtTab);
	
	for(var i = 0; i < lenghtTab; i++ ){
	 
 
  if(object.tabArticle[i].parentid == parentid && !trouve){
  
    trouve = true;
	//return trouve; 
	//alert("article  trouvé");
   }
  }
 }
return trouve;
}
/*sauv*/

 function saveArticle(title, parentid, article,resultContribution){
 	var tabArticle = [];	
	 if(localStorage.getItem("listes Article") == null){
 
   

   	var object ={};
	    object.tabArticle = tabArticle;

   
   var objectArticle={};
	 objectArticle.title = title;
	 objectArticle.parentid = parentid;
	 objectArticle.article = article;
	 objectArticle.resultContribution = resultContribution;
   
   
  object.tabArticle[0] = objectArticle;
 
  
   localStorage.setItem("listes Article",JSON.stringify(object));
  
 
 }else{
 
   var objectArticle={};
	 objectArticle.title = title;
	 objectArticle.parentid = parentid;
	 objectArticle.article = article;
	 objectArticle.resultContribution = resultContribution;
   
   var object = JSON.parse(localStorage.getItem("listes Article"));
   
    var lenghtTab = object.tabArticle.length;
	 object.tabArticle[lenghtTab] = objectArticle;
	 
	localStorage.setItem("listes Article",JSON.stringify(object));
 
 }
}

/*lecture*/

 function lectureArticle(parentid){
 
 	var tabArticle = [];
	
	 if(typeof localStorage!='undefined' && JSON){
   
   var object = JSON.parse(localStorage.getItem("listes Article"));
   
    var lenghtTab = object.tabArticle.length;
	
	for(var i = 0; i < lenghtTab; i++ ){
	 
 
  if(object.tabArticle[i].parentid == parentid){
  
   // alert("lecture  effectuée");
     title = object.tabArticle[i].title;
	 // console.log("title recup" +title);
     article = object.tabArticle[i].article;
	 // console.log("article recup" +article);
	resultContribution = object.tabArticle[i].resultContribution;
   }
 }
   //alert("lecture  effectuée");
  
      

    if (activeAjaxConnections === 0) {
      $("#article_head").text("Article: '" + title + "' on " + $("#url").val());
	  
	   $("#contr_value").text("Levenshtein distance value: " + resultContribution);
      $("#contr_survived").text("The contribution survived: N/A");
      $("#article").html(article);
     stopLoading();
    }
 // alert("afficher a partir du localstorage");

  

   } else alert("localStorage n'est pas supporté");


}
