/**
 * 文本编码检测工具
 * 用于检测和转换文本文件的编码，特别是中文文本
 */

/**
 * 检测文本编码
 * @param {ArrayBuffer} buffer - 文件内容的 ArrayBuffer
 * @returns {string} 检测到的编码名称
 */
export function detectEncoding(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const length = Math.min(10000, uint8Array.length); // 只检查前10000字节

  // 检测 BOM (Byte Order Mark)
  if (uint8Array.length >= 3 &&
      uint8Array[0] === 0xEF &&
      uint8Array[1] === 0xBB &&
      uint8Array[2] === 0xBF) {
    return 'UTF-8';
  }

  if (uint8Array.length >= 2 &&
      uint8Array[0] === 0xFF &&
      uint8Array[1] === 0xFE) {
    return 'UTF-16LE';
  }

  if (uint8Array.length >= 2 &&
      uint8Array[0] === 0xFE &&
      uint8Array[1] === 0xFF) {
    return 'UTF-16BE';
  }

  // 检测是否为纯 ASCII
  let isPureAscii = true;
  for (let i = 0; i < length; i++) {
    if (uint8Array[i] > 127) {
      isPureAscii = false;
      break;
    }
  }
  if (isPureAscii) {
    return 'ASCII';
  }

  // 检测 UTF-8 模式
  let isLikelyUTF8 = true;
  let utf8Score = 0;

  for (let i = 0; i < length; i++) {
    const byte = uint8Array[i];

    if (byte < 128) {
      // ASCII 字符，继续
      continue;
    } else if ((byte & 0xE0) === 0xC0) {
      // 2字节 UTF-8 序列
      if (i + 1 >= length || (uint8Array[i + 1] & 0xC0) !== 0x80) {
        isLikelyUTF8 = false;
        break;
      }
      utf8Score += 1;
      i += 1;
    } else if ((byte & 0xF0) === 0xE0) {
      // 3字节 UTF-8 序列
      if (i + 2 >= length ||
          (uint8Array[i + 1] & 0xC0) !== 0x80 ||
          (uint8Array[i + 2] & 0xC0) !== 0x80) {
        isLikelyUTF8 = false;
        break;
      }
      // 检查是否为中文字符 (0x4E00-0x9FFF)
      const codePoint = ((byte & 0x0F) << 12) |
                        ((uint8Array[i + 1] & 0x3F) << 6) |
                        (uint8Array[i + 2] & 0x3F);
      if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) {
        utf8Score += 3; // 中文字符权重更高
      }
      i += 2;
    } else if ((byte & 0xF8) === 0xF0) {
      // 4字节 UTF-8 序列
      if (i + 3 >= length ||
          (uint8Array[i + 1] & 0xC0) !== 0x80 ||
          (uint8Array[i + 2] & 0xC0) !== 0x80 ||
          (uint8Array[i + 3] & 0xC0) !== 0x80) {
        isLikelyUTF8 = false;
        break;
      }
      utf8Score += 2;
      i += 3;
    } else {
      // 无效的 UTF-8 序列
      isLikelyUTF8 = false;
      break;
    }
  }

  if (isLikelyUTF8 && utf8Score > 0) {
    return 'UTF-8';
  }

  // 检测 GBK/GB2312 (中文常用编码)
  let isLikelyGBK = true;
  let gbkScore = 0;

  for (let i = 0; i < length; i++) {
    const byte = uint8Array[i];

    if (byte < 128) {
      // ASCII 字符，继续
      continue;
    } else if (byte >= 0x81 && byte <= 0xFE) {
      // GBK 高位字节
      if (i + 1 >= length) {
        isLikelyGBK = false;
        break;
      }
      const lowByte = uint8Array[i + 1];
      // GBK 低位字节范围
      if ((lowByte >= 0x40 && lowByte <= 0x7E) ||
          (lowByte >= 0x80 && lowByte <= 0xFE)) {
        gbkScore += 2;
        i += 1;
      } else {
        isLikelyGBK = false;
        break;
      }
    } else {
      // 无效的 GBK 字节
      isLikelyGBK = false;
      break;
    }
  }

  if (isLikelyGBK && gbkScore > 0) {
    return 'GBK';
  }

  // 检测 Big5 (繁体中文)
  let isLikelyBig5 = true;
  let big5Score = 0;

  for (let i = 0; i < length; i++) {
    const byte = uint8Array[i];

    if (byte < 128) {
      continue;
    } else if (byte >= 0x81 && byte <= 0xFE) {
      if (i + 1 >= length) {
        isLikelyBig5 = false;
        break;
      }
      const lowByte = uint8Array[i + 1];
      // Big5 低位字节范围
      if ((lowByte >= 0x40 && lowByte <= 0x7E) ||
          (lowByte >= 0xA1 && lowByte <= 0xFE)) {
        big5Score += 2;
        i += 1;
      } else {
        isLikelyBig5 = false;
        break;
      }
    } else {
      isLikelyBig5 = false;
      break;
    }
  }

  if (isLikelyBig5 && big5Score > 0) {
    return 'Big5';
  }

  // 默认返回 UTF-8
  return 'UTF-8';
}

/**
 * 使用检测到的编码解码文本
 * @param {ArrayBuffer} buffer - 文件内容的 ArrayBuffer
 * @param {string} encoding - 编码名称
 * @returns {string} 解码后的文本
 */
export function decodeText(buffer, encoding) {
  try {
    // 创建 TextDecoder
    const decoder = new TextDecoder(encoding, { fatal: false });
    return decoder.decode(buffer);
  } catch (error) {
    console.warn(`使用 ${encoding} 解码失败，尝试使用 UTF-8`, error);
    // 回退到 UTF-8
    const decoder = new TextDecoder('UTF-8', { fatal: false });
    return decoder.decode(buffer);
  }
}

/**
 * 智能读取文件内容，自动检测编码
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
export async function readFileWithEncodingDetection(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const buffer = event.target.result;
        const encoding = detectEncoding(buffer);
        const content = decodeText(buffer, encoding);
        console.log(`文件 ${file.name} 检测到编码: ${encoding}`);
        resolve(content);
      } catch (error) {
        console.error('读取文件失败:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 尝试多种编码读取文件，直到找到正确的
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
export async function readFileWithMultipleEncodings(file) {
  const encodings = ['UTF-8', 'GBK', 'GB2312', 'Big5', 'UTF-16LE', 'UTF-16BE'];

  for (const encoding of encodings) {
    try {
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const decoder = new TextDecoder(encoding, { fatal: true });
            const result = decoder.decode(e.target.result);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('读取失败'));
        reader.readAsArrayBuffer(file);
      });
      console.log(`成功使用 ${encoding} 编码读取文件 ${file.name}`);
      return content;
    } catch (error) {
      console.log(`尝试 ${encoding} 编码失败`);
      continue;
    }
  }

  // 所有编码都失败，使用非严格模式的 UTF-8
  console.warn(`所有编码尝试失败，使用非严格模式的 UTF-8 读取文件 ${file.name}`);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const decoder = new TextDecoder('UTF-8', { fatal: false });
      resolve(decoder.decode(e.target.result));
    };
    reader.readAsArrayBuffer(file);
  });
}

export default {
  detectEncoding,
  decodeText,
  readFileWithEncodingDetection,
  readFileWithMultipleEncodings
};
