# anve-upload-qiniu
  
  -[https://github.com/shihao905/upload-qiniu.git](https://github.com/shihao905/upload-qiniu.git)

## install

```js
$ npm install --save anve-upload-qiniu
```

## use

```js
const QiniuUpload = require('./index');
const path = require('path');
new QiniuUpload({
   /**
   * ACCESS_KEY
  */
  ACCESS_KEY: 'IxmVzoqgaaaFvSQLqAaGkhNh_yrAmZQ1d6cMSMPL3',
  /**
   * SECRET_KEY
  */
  SECRET_KEY: 'KYjmRDbWP_Zk967MgHvOkWP6sssmgWO662ABCTi4v',
  /**
   * 空间名称
  */
  bucket: '******',
  /**
   * 空间文件目录
  */
  uploadPath: '******',
  /**
   * 本地文件目录
  */
  fileDirectory: path.resolve(__dirname, './dist'),
  /**
   * 是否打开上传前的提示 默认打开
  */
  openConfirm: false,
  /**
   * 上传成功回调
   * @param {array} files [成功文件列表]
  */
  success: function(files) {
    console.log('success',files)
  },
  /**
   * 上传失败回调
   * @param {array} files [失败文件列表]
  */
  error: function(files){
    console.log('error',files)
  }
});
```
