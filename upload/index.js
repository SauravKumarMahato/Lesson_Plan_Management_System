const multer = require("multer");
const path = require("path");

exports.storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/files');
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;
        const extension = path.extname(file.originalname);
        cb(null, `${fileName}-${+Date.now()}${extension}`);
    }
})
