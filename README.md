# anve-upload-qiniu
  
  -[anve-upload-qiniu](https://github.com/shihao905/upload-qiniu.git)

## Install

```
$ npm install --save anve-upload-qiniu
```


## Usage

```
const QiniuUpload = require('./index');
const path = require('path');
new QiniuUpload({
  ACCESS_KEY: 'IxmVzoqgFkFcSQLaAaGkhNh_yrAmZQ1d6cMSMPL3', // your ACCESS_KEY
  SECRET_KEY: 'KYjmRDbWP_Zk9789MgHvOkWP63pmgWO662ABCTi4v', // your SECRET_KEY
  bucket: 'ultimavip', // your bucket
  uploadPath: 'test/', // qiniu files directory
  fileDirectory: path.resolve(__dirname, './dist') // your file directory
});
```
