export enum S3ErrorMessages {
  CONFIG_EXCEPTION = "S3 Configuration is invalid",

  FILE_EMPTY_EXCEPTION = "File is empty",
  FILE_SIZE_OVERLOAD_EXCEPTION = "File size is too large",
  FILE_EXTENSION_EXCEPTION = "File extension is invalid",

  FILE_NOT_FOUND = "File was not found",
  UPLOAD_ERROR = "Failed to upload file",
  DOWNLOAD_ERROR = "Failed to load file",
  DELETE_ERROR = "Failed to delete file",
}
