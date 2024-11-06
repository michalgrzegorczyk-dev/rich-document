const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/app');
const outputFile = path.join(__dirname, 'output.txt');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Failed to list directory contents:', err);
  }

  let allData = '';

  files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    if (fs.statSync(filePath).isFile()) {
      allData += fs.readFileSync(filePath, 'utf8') + '\n';
    }
  });

  fs.writeFile(outputFile, allData, (err) => {
    if (err) {
      return console.error('Failed to write to file:', err);
    }
    console.log('All files have been concatenated into:', outputFile);
  });
});
