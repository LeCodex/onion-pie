const express = require("express");
const router = express.Router();

router.get('/', function (req, res) {
  res.sendFile("../../build/index.html");
});

module.exports = router;