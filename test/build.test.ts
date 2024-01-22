import { buildPath } from "../src";
import { readJSONFile } from "../src/utils/jsonUtils";
// https://bsquared-token.netlify.app/b2-test.json  
//  https://bsquared-token.netlify.app/glow-test.json  
describe('test', () => {

  test('readJSONFile', async () => {
    const path = buildPath('src/tokens',`kurama-test.json`)
    console.log("path", path);
    
    const file = readJSONFile(path);
    console.log("file" , file);
    
    
  })

})
