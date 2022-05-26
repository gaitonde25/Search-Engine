const File = require("../models/file");
const Prob = require("../models/prob");

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

function find_prob(id) {
  return Prob.findOne({
    id: id,
  });
}

const details = async (req, res) => {
  const id = Number(req.params.id);
  const prob_mg = await find_prob(id);
  const prob_name = prob_mg.name;
  const prob_url = prob_mg.url;
  let prob_text = await find_file(`Problem_${id + 1}`);
  prob_text = prob_text.text;
  let prob_inp = await find_file(`Prob_inp_${id + 1}`);
  prob_inp = prob_inp.text;
  let prob_out = await find_file(`Prob_out_${id + 1}`);
  prob_out = prob_out.text;
  let prob_tags = await find_file(`Prob_tag_${id + 1}`);
  prob_tags = prob_tags.text;
  return res.render("details", {
    name: prob_name,
    url: prob_url,
    text: prob_text,
    title: "Problem details",
    input: prob_inp,
    output: prob_out,
    Tags: prob_tags,
  });
};

module.exports = {
  details,
};
