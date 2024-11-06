const fs = require('fs');
const path = require('path');

// Function to recursively list all files
function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Function to concatenate the content of all files into one
function concatenateFiles(basePath, outputFilePath) {
  const files = getAllFiles(basePath);
  let fileContents = '';

  files.forEach(file => {
    fileContents += fs.readFileSync(file, 'utf8') + '\n'; // Appends content of each file followed by a newline
  });

  fs.writeFileSync(outputFilePath, fileContents); // Write the combined content to output file
  console.log(`All files have been concatenated into ${outputFilePath}`);
}

// Specify the base directory and the output file
const basePath = path.join(__dirname, 'src/app');
const outputFilePath = path.join(__dirname, 'combined.txt');

// Call the function to concatenate files
concatenateFiles(basePath, outputFilePath);
