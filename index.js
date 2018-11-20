const qiniu = require("qiniu");
const fs = require("fs");
const path = require("path");
const fontColor = require("./style");
const ProgressBar = require('./progress');
class QiniuUpload {
  constructor(option) {
    qiniu.conf.ACCESS_KEY = option.ACCESS_KEY || null;
    qiniu.conf.SECRET_KEY = option.SECRET_KEY || null;
    this.bucket = option.bucket || null;
    this.uploadPath = option.uploadPath || null;
    this.fileDirectory = option.fileDirectory || null;
    this.token = null;
    this.filesList = [];
    this.uploadFiles = [];
    this.init();
  }
  init() {
    this.getFileList(() => {
      if (!this.filesList.length) {
        console.log(fontColor.yellow, "未找到可以上传的文件");
        return;
      }
      console.log(fontColor.yellow, "开始上传...");
      let pb = new ProgressBar('上传进度');
      this.filesList.map(file => {
        file.token = this.getToken(file.key);
        this.uploadFile(file, (err, ret) => {
          if (err) {
            console.log(fontColor.red, "上传失败：" + file.key);
            console.log(err);
            this.uploadFiles.push(file);
          } else {
            file.url = ret.key;
            this.uploadFiles.push(file);
          }
          pb.render({ completed: this.uploadFiles.length, total: this.filesList.length });
          if (this.uploadFiles.length == this.filesList.length) {
            console.log(fontColor.green, "上传完成！");
          }
        });
      });
    });
  }
  getFileList(cb) {
    let filesList = [];
    fs.readdir(this.fileDirectory, (err, files) => {
      if (!err) {
        files.map(path => {
          if ( path.charAt(0) !== '.' && fs.statSync(this.fileDirectory + "/" + path).isFile()) {
            filesList.push({
              key: (this.uploadPath || "") + path,
              localFile: (this.fileDirectory || "") + "/" + path
            });
          }
        });
        this.filesList = filesList;
        cb&&cb();

      } else {
        console.log(error);
      }
    });
  }
  getToken(key) {
    let putPolicy = new qiniu.rs.PutPolicy({
      scope: `${this.bucket}:${key}`
    });
    return putPolicy.uploadToken();
  }
  uploadFile(file, cb) {
    let formUploader = new qiniu.form_up.FormUploader();
    let extra = new qiniu.form_up.PutExtra();
    formUploader.putFile(
      file.token,
      file.key,
      file.localFile,
      extra,
      (err, ret) => {
        cb && cb(err, ret);
      }
    );
  }
}
module.exports = QiniuUpload;
