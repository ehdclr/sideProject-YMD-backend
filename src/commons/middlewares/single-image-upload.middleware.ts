import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as multer from 'multer';
import { uploadS3 } from '../utils/s3-upload';
import { multerConfig } from '../utils/multer-config';
import { Request, Response, NextFunction } from 'express';

const upload = multer(multerConfig).single('image');

export const imageProfileUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload(req, res, async (err) => {
    if (err) {
      throw new BadRequestException(err.message);
    }

    if (!req.file) {
      throw new BadRequestException('이미지 파일을 올려주세요');
    }

    try {
      const uploadResult = await uploadS3(req.file, 'profiles');
      req.body.imageUrl = uploadResult.Location;
      next();
    } catch (err) {
      return new InternalServerErrorException(
        'S3에 이미지를 업로드 하는데 실패했습니다.',
      );
    }
  });
};
