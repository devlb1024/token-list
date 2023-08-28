import * as fs from 'fs';

export function writeJSONFile(filename: string, data: any): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, jsonString, 'utf8');
    console.log('JSON file written successfully:', filename);
  } catch (error) {
    console.error('Error writing JSON file:', error);
  }
}

export function readJSONFile(filename: string): any {
  try {
    const jsonString =  fs.readFileSync(filename, 'utf8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}
