const fs = require('fs');
const https = require('follow-redirects').https;

const { version } = require('./node_modules/@apollo/rover/package.json');
const repository = 'https://github.com/apollographql/rover';
const name = 'rover';

// URL of the image
const url = `${repository}/releases/download/v${version}/${name}-v${version}-x86_64-unknown-linux-gnu.tar.gz`;
console.log(url);

https.get(url, (res) => {
  const path = `${__dirname}/layers/rover/rover.tar.gz`;
  const filePath = fs.createWriteStream(path);
  res.pipe(filePath);
  filePath.on('finish', () => {
    filePath.close();
    console.log('Download Completed');
  });
});
