"use strict";
const qiniu = require("qiniu");
const fs = require("fs");
const path = require("path");
const fontColor = require("./style");
const ProgressBar = require("./progress");
class QiniuUpload {
  constructor(option) {
    qiniu.conf.ACCESS_KEY = option.ACCESS_KEY || null;
    qiniu.conf.SECRET_KEY = option.SECRET_KEY || null;
    this.bucket = option.bucket || null;
    this.uploadPath = option.uploadPath || null;
    this.fileDirectory = option.fileDirectory || null;
    this.token = null;
    this.loadSuccess = option.success || (()=>{});
    this.loadError = option.error || (()=>{});
    if (typeof option.openConfirm == 'boolean') {
      this.openConfirm = option.openConfirm;
    } else {
      this.openConfirm = true;
    }
    this.filesList = [];
    this.uploadFiles = [];
    this.errorFiles = [];
    this.openConfirm ? this.confirm() : this.init();
    this.uploading = false;
  }
  confirm() {
    process.stdin.setEncoding('utf8');
    console.log(fontColor.yellow, `请确认上传信息：`);
    console.log(fontColor.green, `---ACCESS_KEY：${qiniu.conf.ACCESS_KEY}`);
    console.log(fontColor.green, `---SECRET_KEY：${qiniu.conf.SECRET_KEY}`);
    console.log(fontColor.green, `---上传空间：${this.bucket}`);
    console.log(fontColor.green, `---空间文件目录：${this.uploadPath}`);
    console.log(fontColor.green, `---本地文件目录：${this.fileDirectory}`);
    console.log(fontColor.yellow, `确认开始上传吗(N/y)？`);
    process.stdin.on('data',(input)=>{
      if (this.uploading) return;
      input = input.toString().trim();
      if (['Y', 'y', 'YES', 'yes'].indexOf(input) > -1) {
        this.uploading = true;
        this.init(()=>{
          process.exit();
          this.uploading = false;
        });
      }else {
        process.exit();
      }
    })
  }
  init(exit) {
    this.getFileList((list) => {
      this.filesList = list;
      if (!this.filesList.length) {
        console.log(fontColor.yellow, "未找到可以上传的文件");
        return;
      }
      console.log(fontColor.yellow, "开始上传...");
      let pb = new ProgressBar("上传进度");
      this.filesList.map(file => {
        file.token = this.getToken(file.key);
        this.uploadFile(file, (err, ret) => {
          if (err) {
            console.log(fontColor.red, "上传失败：" + file.key);
            this.errorFiles.push(file);
            this.uploadFiles.push(file);
          } else {
            file.url = ret.key;
            this.uploadFiles.push(file);
          }
          pb.render({
            completed: this.uploadFiles.length,
            total: this.filesList.length
          });
          if (this.uploadFiles.length == this.filesList.length) {
            console.log(fontColor.green, "上传完成！");
            if (this.errorFiles.length) {
              console.log(fontColor.red, this.errorFiles.map(res=>(`上传失败：${res.localFile}`)).join('\n'))
              this.loadError(this.errorFiles);
            } else {
              this.loadSuccess(this.uploadFiles);
            }
            exit&&exit();
          }
        });
      });
    });
  }
  getFileByDir(dirPath, list) {
    fs.readdirSync(dirPath).map(url => {
      let u = dirPath + "/" + url;
      if (url.charAt(0) !== "." && fs.existsSync(u)) {
        if (fs.statSync(u).isDirectory()) {
          this.getFileByDir(u, list);
        } else {
          list.push({
            key: this.uploadPath + u.slice(this.fileDirectory.length),
            localFile: u
          });
        }
      }
    });
  }
  getFileList(cb) {
    let filesList = [];
    this.getFileByDir(this.fileDirectory, filesList);
    cb && cb(filesList);
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
