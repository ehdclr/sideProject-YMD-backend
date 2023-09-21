import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import { multerConfig } from '../utils/multer-config';
import { uploadS3 } from '../utils/s3-upload';

const uploadMultiple = multer(multerConfig).array('images', 5);

export const imageboardsPhotoUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      throw new BadRequestException(err.message);
    }

    if (!req.files || req.files.length === 0) {
      throw new BadRequestException('이미지 파일을 하나 이상 올려주세요');
    }

    try {
      const uploadResults = await Promise.all(
        (req.files as Express.Multer.File[]).map((file) =>
          uploadS3(file, 'boards'),
        ),
      );
      req.body.imageUrls = uploadResults.map((result) => result.Location);
      next();
    } catch (err) {
      throw new InternalServerErrorException(
        'S3에 이미지를 업로드 하는데 실패했습니다.',
      );
    }
  });
};
