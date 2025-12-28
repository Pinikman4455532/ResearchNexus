const express = require("express");
const router = express.Router();

router.get("/:id", (req, res) => {
  const userId = req.params.id;

  res.json({
    message: "Dashboard loaded successfully",
    userId,
    quickAccess: [
      { title: "Search & Discover", link: "/search" },
      { title: "Research Tool", link: "/tools" },
      { title: "Community", link: "/community" }
    ]
  });
});

module.exports = router;
