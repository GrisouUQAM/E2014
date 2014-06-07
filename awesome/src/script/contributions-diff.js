// Copyright VOGG 2013

//Fonction strip_tags
//Enelve le wikimarup
function strip_tags(input, allowed) {
  // http://kevin.vanzonneveld.net
  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}

/*
	Trouve l'insertion, la suppression entre deux textes donn�es.
	text1: Vieille version du texte.
	text2: Nouvelle version du texte.
	Retour: une string html contenant la valeur de la distance de leveinstein
*/
function getDiff(text1, text2) {
  var dmp = new diff_match_patch();
  var res = dmp.diff_main(strip_tags(text1), strip_tags(text2));
  dmp.diff_cleanupSemantic(res);
  $("#contr_value").text("Levenshtein distance value: " + dmp.diff_levenshtein(res));
  return dmp.diff_prettyHtml(res);
}

/*
	D�coupe un texte en un array de phrases. Une phrase commence par une MAJUSCULE et se 
	termine par un ".", "?" ou "!". Les caracteres d'une phrase sont a-z A-Z 0-9 _ : ( ) [ ] & ' " & % $ # @ *
	text: Text a decouper
	Retour: un tableau contenant tous les phrases s�par�s dans un texte
			Si aucune phrase n'est trouve, retourne NULL;
*/
function getSentences(text){
	//Strin d'expression reguliaire qui permet de "matcher" une phrase.
	//Pattern1: Une phrase commence par un caractere x et se termine par un point, un point d'exclamation.
	var pattern = /[A-Z]{1}[\w\s,:()\[\]"'&%$#@*]*[?!.]/g;
	var sentencesArray = text.match(pattern);
	return sentencesArray;
}

/*
 * @param {type} phrases1
 * @param {type} phrases2
 * @returns un Array d'Object avec les champs "index1" et "index2" qui correspondent aux indexs des matchs dans les deux arrays depart.
 * 
 */
function matchPhrases(phrases1, phrases2){
    var matchIndexes = [];
	if(phrases1 == null || phrases2 == null){
		return matchIndexes;
	}
	
    for (var i = 0; i < phrases1.length; i++) {
        for (var j = 0; j < phrases2.length; j++) {
            if (phrases1[i] === phrases2[j] && i !== j) {
                var match = {};
                match.index1 = i;
                match.index2 = j;
                matchIndexes.push(match);
            }
        }
    }
    return matchIndexes;
}

/**
 * 
 * @param {type} phrases1
 * @param {type} phrases2
 * @param {type} index1
 * @param {type} index2
 * @returns {Boolean} retourne si la phrase a ete deplacee.
 */
function detecteDeplacement(phrases1, phrases2, index1, index2){
	if(phrases1 == null || phrases2 == null){
		return false;
	}

    if (phrases1[index1] !== phrases2[index2]) {
        return false;
    }
	
    if (phrases1[index1] !== phrases2[index2]) {
        return false;
    }
	
    if (phrases1.length === phrases2.length) {
        if (index1 !== index2) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        var indexPrecedent = true;
        var indexSuivant = true;
        if (index1 > 0 && index2 > 0) {
            if (phrases1[index1-1] !== phrases2[index2-1]) {
                indexPrecedent = false;
            }
        }
        else {
            indexPrecedent = false;
        }
        if (index1 < phrases1.length-1 && index2 < phrases2.length-1) {
            if (phrases1[index1+1] !== phrases2[index2+1]) {
                indexSuivant = false;
            }
        }
        else {
            indexSuivant = false;
        }
        return (indexPrecedent || indexSuivant);
    }
}
    
/**
 * 
 * @param String texte1
 * @param String texte2
 * @returns Object qui contient 2 arrays "indexesTexte1" et "indexesTexte2" qui sont les indexs de toutes les phrases qui ont ete deplacees respectivement dans chacun des textes.
 * 
 * {
 *     indexesTexte1 = [1,2,3],
 *     indexesTexte2 = [5,8,17]
 * }
 */
function detecteDeplacementsDansTextes(texte1, texte2){
	var retourIndexes = {};
	retourIndexes.indexesTexte2 = [];
	retourIndexes.indexesTexte1 = [];

	if(texte1 == null || texte2 == null){
		return retourIndexes;
	}
	
	var phrases1 = getSentences(texte1);
	var phrases2 = getSentences(texte2);
	var indexes = matchPhrases(phrases1, phrases2);
	
	for (var i = 0; i < indexes.length; i++) {
		if (detecteDeplacement(phrases1, phrases2, indexes[i].index1, indexes[i].index2)) {
			retourIndexes.indexesTexte2.push(indexes[i].index2);
			retourIndexes.indexesTexte1.push(indexes[i].index1);
		}
	}
	return retourIndexes;
}