/**
 * 把其他文件下的 markdown 文件复制到 docs 下面
 * wj
 * */

const path = require('path');
const fs = require('fs');
const { Transform } = require('stream');

// 创建自定义转换流的类
class MyTransform extends Transform {
  constructor(props) {
    super(props);
    const { fromFileDir } = props;
    this._fromFileDir = fromFileDir;
  }
  _transform(chunk, encoding, callback) {
    let _chunk = null;
    // 根目录的readme.md
    if (this._fromFileDir.indexOf('\\README.md') > 0) {
      _chunk = Buffer.from(
        chunk.toString().replace('English | [简体中文](./README.zh-CN.md)', ''),
      );
      this.push(
        `---
hero:
  title: Fumi
  description: 基于 Umi 的最佳实践 - 企业级前端开发框架
  actions:
    - text: 快速上手
      link: /
    - text: Git
      link: /
features:
  - title: 专业
    emoji: 💎
    description: 提供 Umi 的最佳实践和简约配置
  - title: 多样
    emoji: 🌈
    description: 提供足以覆盖多种场景的组件 Demo
  - title: 快速
    emoji: 🚀
    description: 继承 Umi 的急速开发与快速构建
---

` + _chunk,
      );
    }
    // 根目录的readme.zh-CN.md
    else if (this._fromFileDir.indexOf('\\README.en-US.md') > 0) {
      // 			_chunk = Buffer.from(
      // 				chunk.toString().replace('简体中文 | [English](./README.md)', ''),
      // 			);
      // 			this.push(
      // 				`---
      // title: 关于SSSS的项目文档
      // hero:
      //   title: SSSS
      //   desc: 📖 关于SSSS的项目文档
      // footer: 😊😁😎😉😜🤞✌
      // ---
      // ` + _chunk,
      // 			);
    } else {
      this.push(chunk);
    }

    callback();
  }
}

// 此处会删除 docs 目录下的文件夹
const delDr = function (dir) {
  if (!fs.existsSync(dir)) return;
  const recursion = function (dir) {
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
      const stat = fs.statSync(dir + '/' + file);
      if (stat && stat.isDirectory()) {
        recursion(dir + '/' + file);
      } else {
        fs.unlinkSync(dir + '/' + file);
      }
    });
    fs.rmdirSync(dir);
  };
  recursion(dir);
};

const getDir = function (dirName) {
  let fromFilePath = [],
    toFilePath = [];
  // 递归查找文件夹下的目标文件
  const recursion = function (dir) {
    // dirArr.forEach(function(dir){
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
      if (file === 'static' || file === 'node_modules') {
        return false;
      }
      const filePath = dir + '/' + file,
        stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        recursion(filePath);
      } else {
        if (path.extname(filePath) === '.md') {
          const resultPath = path.resolve(__dirname, filePath);
          fromFilePath.push(resultPath.replace(/\\/g, '/'));
          toFilePath.push(
            resultPath
              .replace('packages', dirName)
              .replace('README', 'index')
              .replace('\\src', '')
              .replace(/\\/g, '/'),
          );
        }
      }
    });
  };
  recursion('./packages');
  fromFilePath.push(
    path.resolve(__dirname, './README.md'),
    // path.resolve(__dirname, './README.zh-CN.md'),
  );
  toFilePath.push(
    path.resolve(__dirname, `./${dirName}/index.md`),
    // path.resolve(__dirname, `./${dirName}/index.zh-CN.md`),
  );
  return [fromFilePath, toFilePath];
};

const copyFile = function (fromFile, toFile) {
  for (let index in fromFile) {
    if (fromFile.hasOwnProperty(index)) {
      const fromFileDir = fromFile[index],
        toFileDir = toFile[index];

      // 查找toFileDir路径下的文件夹，没有就创建
      for (let i = 1; i < toFileDir.split('/').length; i++) {
        fs.existsSync(toFileDir.split('/', i).join('/')) ||
          fs.mkdirSync(toFileDir.split('/', i).join('/'));
      }
      const rs = fs.createReadStream(fromFileDir, {
        autoClose: true,
        encoding: 'utf-8',
        highWaterMark: 64 * 1024 * 1024,
        flags: 'r',
      });

      const ws = fs.createWriteStream(toFileDir, {
        encoding: 'utf-8',
        flags: 'a',
        highWaterMark: 16 * 1024 * 1024,
        autoClose: true,
      });
      rs.pipe(new MyTransform({ fromFileDir })).pipe(ws);
    }
  }
};

delDr('./docs');
copyFile(...getDir('docs'));
