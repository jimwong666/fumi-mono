const download = require('download-git-repo');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');

module.exports = function (downloadPath, target) {
  const _target = path.join(target);
  return new Promise(function (resolve, reject) {
    const spinner = ora(
      chalk.greenBright('Downloading template, wait a moment...\r\n'),
    );
    spinner.start();

    download(downloadPath, _target, { clone: true }, function (err) {
      if (err) {
        spinner.fail();
        reject(err);
        console.error(
          chalk.red(
            `${err}download template failed, please check your network connection and try again`,
          ),
        );
        process.exit(1);
      } else {
        spinner.succeed(
          chalk.greenBright(
            '✨ Download template successfully, start to config it: \n',
          ),
        );
        resolve(_target);
      }
    });
  });
};
