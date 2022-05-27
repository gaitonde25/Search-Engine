const keyword_extractor = require("keyword-extractor");
const Prob = require("../models/prob");
const converter = require("number-to-words");
const SpellChecker = require("simple-spellchecker");
const File = require("../models/file");

function find_prob(id) {
  return Prob.findOne({
    id: id,
  });
}

function find_file(name) {
  return new Promise((resolve) => {
    resolve(
      File.findOne({
        name: name,
      })
    );
  }).catch((err) => {
    console.log(err);
  });
}

const search = async (req, res) => {
  // all the files are read only once when search is made for 1st time
  if (flag == 0) {
    console.log("reading files");
    global.keywords = await find_file("Keywords");
    keywords = keywords.text.split("\n");

    global.idfArr = await find_file("idfArray");
    idfArr = idfArr.text.split("\n");

    global.tfidfArr = await find_file("tf-idfMatrix");
    tfidfArr = tfidfArr.text.split("\n");

    global.prob_mag = await find_file("Magnitude");
    prob_mag = prob_mag.text.split("\n");
  }
  flag = 1;

  let query = req.body.query;
  query = query.toLowerCase();
  console.log(" Query", query);
  if (query.length == 0) {
    res.redirect("./");
  }

  // find numbers in the query
  const regex = /\d+/g;
  const matches = query.match(regex);
  // convert numbers to words and add it in query
  if (matches != null) {
    for (let i = 0; i < matches.length; i++) {
      query += " " + converter.toWords(Number(matches[i]));
    }
  }

  // add corrected words in query if there are any
  const words = query.split(" ");
  for (let i = 0; i < words.length; i++) {
    const dictionary = SpellChecker.getDictionarySync("en-US");
    const misspelled = !dictionary.spellCheck(words[i]);
    if (misspelled) {
      const suggestions = dictionary.getSuggestions(words[i]);
      query += " " + suggestions[0];
      // const size = Math.min(suggestions.length, 3);
      // for (let j = 0; j < size; j++) {
      //   query += " " + suggestions[j];
      // }
    }
  }

  console.log("updated", query);
  // OPEN keywords file

  // let keywords = await find_file("Keywords");
  // keywords = keywords.text.split("\n");
  // let keywords = fs.readFileSync("./Keywords.txt", "utf8").split("\n");

  // extract keywords from the query
  let qkwords = keyword_extractor.extract(query, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: false,
  });

  // sort the query keywords
  qkwords = qkwords.sort();

  let qarr = []; // arr to store tf vector for query
  const size = keywords.length;

  // loop over all the keywords
  for (let j = 0; j < size; j++) {
    const start = qkwords.findIndex((element) => {
      return element == keywords[j];
    });
    let count;
    if (start == -1) {
      count = 0;
    } else {
      let end = qkwords.findIndex((element) => {
        return element > keywords[j];
      });
      if (end == -1) end = qkwords.length;
      count = end - start;
    }
    qarr.push(count / qkwords.length);
  }

  // OPEN idfArr file

  // let idfArr = await find_file("idfArray");
  // idfArr = idfArr.text.split("\n");
  // let idfArr = fs.readFileSync("./idfArray.txt", "utf8").split("\n");

  // transform tf vector for query to tf-idf vector and also calculate magnitude of it
  let Mag = 0;
  for (let i = 0; i < qarr.length; i++) {
    qarr[i] = qarr[i] * idfArr[i];
    Mag += qarr[i] * qarr[i];
  }
  Mag = Math.sqrt(Mag);
  console.log("Mag", Mag);
  if (!(Mag > 0)) {
    let top10prob = [{ error: "no prob" }];
    res.render("index", { title: "Noodle", top10prob });
  }
  // OPEN tfidfMatrix

  // let tfidfArr = await find_file("tf-idfMatrix");
  // tfidfArr = tfidfArr.text.split("\n");
  // let tfidfArr = fs.readFileSync("./tf-idfMatrix.txt", "utf8").split("\n");

  const n = Number(tfidfArr[0].split(" ")[0]);
  const k = Number(tfidfArr[0].split(" ")[1]);

  // Create and fill tfIdfMatrix with 0
  let tfIdfMatrix = [];

  for (let i = 0; i < n; i++) {
    let tempArr = [];
    for (let j = 0; j < k; j++) {
      tempArr.push(0);
    }
    tfIdfMatrix.push(tempArr);
  }

  for (let i = 1; i < tfidfArr.length; i++) {
    let temp = tfidfArr[i].split(" ");
    let ii = Number(temp[0]),
      jj = Number(temp[1]),
      val = Number(temp[2]);
    tfIdfMatrix[ii][jj] = val;
  }

  // OPEN magnitude file

  // let prob_mag = await find_file("Magnitude");
  // prob_mag = prob_mag.text.split("\n");
  // let prob_mag = fs.readFileSync("./Magnitude.txt", "utf8").split("\n");

  // create similarity array
  let similarity = [];
  for (let i = 0; i < n; i++) {
    let dot_p = 0;
    for (let j = 0; j < k; j++) {
      dot_p += tfIdfMatrix[i][j] * qarr[j];
    }
    similarity.push([i + 1, dot_p / (Mag * prob_mag[i])]);
  }

  // sort the similarity array
  similarity = similarity.sort((a, b) => {
    return b[1] - a[1];
  });

  let top10prob = [];
  for (let i = 0; i < 10; i++) {
    let prob_ind = similarity[i][0];
    let prob_mg = await find_prob(prob_ind - 1);

    let prob_name = prob_mg.name;
    const prob_url = prob_mg.url;
    const snippet = prob_mg.snippet;

    // console.log(prob_name);
    //let prob_name = fs.readFileSync(`./Problem_names.txt`, "utf8").split("\n");
    // const prob_url = fs.readFileSync(`./Problem_urls.txt`, "utf8").split("\n");

    // remove b' ' from the name
    // prob_name = prob_name[prob_ind - 1];
    // prob_name = prob_name.slice(2, prob_name.length - 2);
    // get snippet from prob_text
    // prob_text = prob_text.split("\n")[0];
    // prob_text = prob_text.slice(2, prob_text.length - 1);

    let prob = {
      id: prob_ind - 1,
      name: prob_name,
      url: prob_url,
      snippet: snippet,
    };
    top10prob.push(prob);
    // console.log(" Name - ", prob_name[prob_ind - 1]);
    // console.log(" URL - ", prob_url[prob_ind - 1]);
    // console.log(prob_text);
  }

  res.render("index", { title: "Noodle", top10prob });
};
module.exports = {
  search,
};
