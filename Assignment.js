var XMLHttpRequest = require('xhr2');
const key = 'dict.1.1.20210216T114936Z.e4989dccd61b9626.373cddfbfb8a3b2ff30a03392b4e0b076f14cff9';

function getText(){
    // read text from URL location
    let request = new XMLHttpRequest();
    request.open('GET', 'http://norvig.com/big.txt', true);
    request.send(null);
    request.onreadystatechange = async function () {
        if (request.readyState === 4 && request.status === 200) {
            const type = request.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
               const onlyLetters = lettersOnly(request.responseText);
               const words = onlyLetters.toLowerCase().split(/\s+/);
               const wordOccurences = countoccurences(words);
               const sortedList = sort(wordOccurences);
               const top10 = sortedList.slice(0,9);
               const resultsPromises = top10.map(word => {
               return lookup(word[0]);
               })
               const apiResults = await Promise.allSettled(resultsPromises);
               const finalResults = apiResults.map((result, i ) => {
                let value  = {Word: top10[i][0], Output: {count: top10[i][1]}} ;
                if (result.status === 'fulfilled') {
                    value.Output.pos = result?.value?.def[0]?.pos ? result?.value?.def[0]?.pos : '';
                    value.Output.synonoms = result?.value?.def[0]?.tr ? result?.value?.def[0]?.tr : '';
                   }
                   return value;
               })
               console.log(finalResults, "final Results.....!!!!!!");
                return request.responseText;
            }
        }
    }
}

function lettersOnly(str) {
	return str.replace(/[^a-z A-Z]/g,"");
}

function countoccurences(list) {
 return list.reduce((acc, word) => {
 if(!acc[word]) {
    acc[word] = 1;
 } else {
    acc[word]++;
 }
 return acc;
 }, {})
}

function sort(wordOccurences) {
    const sortable = [];
    for (const word in wordOccurences) {
        sortable.push([word, wordOccurences[word]]);
    }
    
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    return sortable;
}

function lookup(word) {
return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('GET', `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${key}&lang=en-ru&text=${word}`, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
           resolve(JSON.parse(request.responseText));
        }
    }
})
}


getText();