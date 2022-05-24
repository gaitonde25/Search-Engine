const fs = require("fs");

// keywords file is read and not sorted(it was sorted aat time of creation) but there will be "" string in end so idf for that will be zero
let keywords;
fs.readFile("Keywords.txt", "utf8", (err, data) => {
  if (err) throw err;
  keywords = data.split("\n");
});

function wait2sec() {
  console.log("waiting ...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, 2000);
  });
}

function readFile(filename) {
  return new Promise((resolve) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) throw err;
      resolve(data.split("\n"));
    });
  });
}

function writeIdf() {
  return new Promise((resolve) => {
    let temp = "";
    idfArr.forEach((element) => {
      temp += element + "\n";
    });
    fs.writeFileSync("./idfArray.txt", temp, (err) => {
      if (err) throw err;
    });
    resolve(console.log("idf written"));
  });
}

function writeTfIdf() {
  return new Promise((resolve) => {
    let temp = "";
    temp += tfIdfMatrix.length + " " + keywords.length + "\n";
    for (let i = 0; i < tfIdfMatrix.length; i++) {
      console.log(" tf idf ", i);
      for (let j = 0; j < keywords.length; j++) {
        if (tfIdfMatrix[i][j] > 0) {
          temp +=
            String(i) +
            " " +
            String(j) +
            " " +
            String(tfIdfMatrix[i][j]) +
            "\n";
        }
      }
    }
    fs.writeFileSync("./tf-idfMatrix.txt", temp, (err) => {
      if (err) throw err;
    });
    resolve(console.log("Tf-Idf written"));
  });
}

function writeMagnitude() {
  return new Promise((resolve) => {
    let temp = "";
    Magnitude.forEach((element) => {
      temp += element + "\n";
    });
    fs.writeFileSync("./Magnitude.txt", temp, (err) => {
      if (err) throw err;
    });
    resolve(console.log("Magnitude written"));
  });
}

let tfMatrix = [];
let idfArr = [];
let tfIdfMatrix = [];
let Magnitude = [];

async function work() {
  const wait = await wait2sec();

  //generate tf matrix
  for (let i = 1; i <= 5573; i++) {
    // get the key words of ith problem
    let prob_kwords = await readFile(`./prob_keywords/Prob_${i}.txt`);
    prob_kwords = prob_kwords.sort();
    let arr = []; // arr to store tf vector for ith problem
    const size = keywords.length;

    // loop over all the keywords
    for (let j = 0; j < size; j++) {
      const start = prob_kwords.findIndex((element) => {
        return element == keywords[j];
      });
      let count;
      if (start == -1) {
        count = 0;
      } else {
        let end = prob_kwords.findIndex((element) => {
          return element > keywords[j];
        });
        if (end == -1) end = prob_kwords.length;
        count = end - start;
      }
      arr.push(count / prob_kwords.length);
    }
    tfMatrix.push(arr);
  }

  console.log(" cp 1");
  // Create idf array
  for (let i = 0; i < keywords.length; i++) {
    let count = 0;
    for (let j = 0; j < tfMatrix.length; j++) {
      if (tfMatrix[j][i] > 0) {
        count++;
      }
    }
    idfArr.push(Math.log10(tfMatrix.length / count));
  }

  console.log("cp 2");
  // Create tf-idf matrix
  for (let i = 0; i < tfMatrix.length; i++) {
    let arr = [];
    for (let j = 0; j < keywords.length; j++) {
      const prod = tfMatrix[i][j] * idfArr[j];
      arr.push(prod);
    }
    tfIdfMatrix.push(arr);
  }

  console.log("cp 3");
  // Create Magnitude array
  for (let i = 0; i < tfMatrix.length; i++) {
    let value = 0;
    for (let j = 0; j < keywords.length; j++) {
      value += tfIdfMatrix[i][j] * tfIdfMatrix[i][j];
    }
    value = Math.sqrt(value);
    Magnitude.push(value);
  }

  console.log("cp 4");
  // write the idf Array
  // console.log("IDF ARRAY ", idfArr);
  // console.log("TF IDF MAtrix ", tfIdfMatrix);
  // console.log("Magnitude ", Magnitude);
  await writeIdf();

  // write tf-idf Matrix
  await writeTfIdf();

  // write the Magnitude array
  await writeMagnitude();
}
work();
