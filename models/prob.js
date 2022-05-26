const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const probSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  snippet: {
    type: String,
    required: true,
  },
});

const Prob = mongoose.model("Prob", probSchema);

module.exports = Prob;
