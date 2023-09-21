import * as multer from 'multer';
import { extname } from 'path';

const storage = multer.memoryStorage();

export const multerConfig = {
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const ext = extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
      return cb(new Error('이미지파일만 업로드 가능합니다!'));
    }
    cb(null, true);
  },
};
