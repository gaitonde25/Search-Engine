const fs = require("fs");
const keyword_extractor = require("keyword-extractor");

let keyWords = new Set();
let probKeyWords = [];

let names = fs.readFileSync("Problem_names.txt", "utf8").split("\n");
for (let i = 1; i < names.length; i++) {
  let filename = "./Problems/Problem_";
  filename += i;
  filename += ".txt";
  let data = fs.readFileSync(filename, "utf8");
  data += names[i - 1];
  let keyWord = keyword_extractor.extract(data, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: false,
  });

  // apply the extractor for 2nd time after removing the " b' " due to utf-encoding
  // let temp = "";
  // keyWord.forEach((element) => {
  //   element = element.toLowerCase();
  //   temp += element + " ";
  // });
  // let keyWord2 = keyword_extractor.extract(temp, {
  //   language: "english",
  //   remove_digits: true,
  //   return_changed_case: true,
  //   remove_duplicates: false,
  // });
  //done

  let p_keyWords = [];
  keyWord.forEach((element) => {
    keyWords.add(element);
    p_keyWords.push(element);
  });
  probKeyWords.push(p_keyWords);
}

keyWords = [...keyWords];
//   console.log(keyWords.length);
//   console.log(keyWords);
//   console.log(" prob kwords \n");
//   console.log(probKeyWords.length);
//   console.log(probKeyWords[0]);
keyWords = keyWords.sort();
let temp = "";
keyWords.forEach((element) => {
  temp += element + "\n";
});
// write a keywords file
fs.writeFileSync("Keywords.txt", temp, (err) => {
  if (err) throw err;
});

for (let i = 0; i < probKeyWords.length; i++) {
  const filename = `./prob_keywords/Prob_${i + 1}.txt`;
  let data = "";
  probKeyWords[i] = probKeyWords[i].sort();
  probKeyWords[i].forEach((element) => {
    data += element + "\n";
  });
  fs.writeFileSync(filename, data, (err) => {
    if (err) throw err;
  });
}
