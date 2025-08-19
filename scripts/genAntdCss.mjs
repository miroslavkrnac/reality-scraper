import fs from 'fs';
import { extractStyle } from '@ant-design/static-style-extract';

const outputPath = './src/app/antd.min.css';

const css = extractStyle();
fs.writeFileSync(outputPath, css);

console.log('Ant Design CSS extracted successfully to:', outputPath);
