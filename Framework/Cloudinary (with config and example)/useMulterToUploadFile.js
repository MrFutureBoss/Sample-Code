import multer from "multer";
import path from "path";
import fs from "fs";

// Định nghĩa các định dạng file được chấp nhận
const allowedFormats = {
  image: ["jpg", "jpeg", "png", "gif", "svg"], // Ảnh
  video: ["mp4", "mov", "avi", "mkv"], // Video
  sound: ["mp3", "wav"], // Âm thanh
  doc: ["txt", "docx", "pdf"], // Tài liệu
};

// Hàm kiểm tra định dạng file và trả về loại file
const getFileType = (fileExtension) => {
  for (const [type, formats] of Object.entries(allowedFormats)) {
    if (formats.includes(fileExtension)) {
      return type; // Trả về loại file (image, video, sound, doc)
    }
  }
  return null; // Nếu không thuộc loại nào
};

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads"); // Sử dụng process.cwd() để lấy đường dẫn tuyệt đối
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
});

// Middleware để xử lý upload nhiều file
const uploadMiddleware = (fileType) => {
  return (req, res, next) => {
    const uploadHandler = upload.array("file");

    uploadHandler(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err); // Log lỗi từ multer
        return res.status(400).send("Error uploading files.");
      }

      if (!req.files || req.files.length === 0) {
        console.error("No files uploaded."); // Log nếu không có file nào được upload
        return res.status(400).send("No files uploaded.");
      }

      console.log("Uploaded files:", req.files); // Log các file đã upload

      const validFiles = req.files.filter((file) => {
        const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
        return allowedFormats[fileType].includes(fileExtension);
      });

      if (validFiles.length === 0) {
        console.error("Invalid file format."); // Log nếu định dạng file không hợp lệ
        return res.status(400).send(`Only ${fileType} files are allowed!`);
      }

      const tempFilePaths = validFiles.map((file) => file.path);
      req.tempFilePaths = tempFilePaths;

      console.log("Temporary file paths:", tempFilePaths); // Log đường dẫn file tạm thời
      next();
    });
  };
};

// Middleware cho từng loại file
const uploadImages = uploadMiddleware("image");
const uploadVideos = uploadMiddleware("video");
const uploadSounds = uploadMiddleware("sound");
const uploadDocs = uploadMiddleware("doc");

export { uploadImages, uploadVideos, uploadSounds, uploadDocs };