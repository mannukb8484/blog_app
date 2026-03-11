const multer =require('multer');
// s7:
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const fileStrorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // toISOString() contains colons (:), illegal characters for filenames on Windows.
    // soln: .replace(/:/g, '-')=> cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

module.exports=multer({ storage: fileStrorage, fileFilter: filefilter }).single("image");