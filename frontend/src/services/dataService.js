// 解析CSV内容的辅助函数
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return []; // 至少需要标题行和一行数据
  
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => {
      // 移除字段值周围的引号
      let trimmedValue = value.trim();
      if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
        trimmedValue = trimmedValue.substring(1, trimmedValue.length - 1);
      }
      return trimmedValue;
    });
    
    if (values.length !== headers.length) continue; // 跳过格式不正确的行
    
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] || '';
    });
    
    data.push(entry);
  }
  
  return data;
};

// 获取器官节律数据
export const fetchOrganRhythmData = async () => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:33',message:'fetchOrganRhythmData called',data:{isElectron:typeof window.electronAPI!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    // 在Electron环境中，尝试多个可能的路径
    const possiblePaths = [
      './data/organRhythmData.csv',  // 相对路径
      '/data/organRhythmData.csv',   // 绝对路径
      'data/organRhythmData.csv'     // 无前导斜杠
    ];
    
    let response = null;
    let csvText = null;
    let lastError = null;
    
    for (const path of possiblePaths) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:45',message:'Trying CSV path',data:{path},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        
        response = await fetch(path);
        if (response.ok) {
          csvText = await response.text();
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:50',message:'CSV loaded successfully',data:{path,csvLength:csvText.length},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
          break;
        }
      } catch (err) {
        lastError = err;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:57',message:'CSV path failed',data:{path,error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
      }
    }
    
    if (!csvText) {
      throw new Error(`无法加载器官节律数据: ${lastError?.message || '所有路径都失败'}`);
    }
    
    const data = parseCSV(csvText);
    
    // 确保数据格式正确
    if (data.length === 0) {
      throw new Error('器官节律数据为空');
    }
    
    return {
      success: true,
      data: data.map(item => ({
        timeRange: item['时间段'],
        organ: item['部位'],
        description: item['说明'],
        activities: item['建议活动'],
        tips: item['健康提示']
      }))
    };
  } catch (error) {
    console.error('获取器官节律数据失败:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:75',message:'CSV load failed, using fallback',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    // 提供默认数据作为备选
    return {
      success: false,
      error: error.message,
      fallbackData: [
        {
          timeRange: "01:00-03:00",
          organ: "肝胆",
          description: "肝胆经当令，解毒代谢最活跃的时间",
          activities: "保证充足睡眠，避免熬夜",
          tips: "熬夜会加重肝胆负担，影响第二天精神状态"
        },
        {
          timeRange: "03:00-05:00",
          organ: "肺",
          description: "肺经当令，气血循环活跃，适合呼吸系统调理",
          activities: "深度睡眠中自然呼吸",
          tips: "早起后深呼吸练习，有益肺部健康"
        },
        {
          timeRange: "05:00-07:00",
          organ: "大肠",
          description: "大肠经当令，排便最佳时间",
          activities: "起床后喝温水，养成定时排便习惯",
          tips: "便秘者可顺时针按摩腹部，促进肠道蠕动"
        }
      ]
    };
  }
};