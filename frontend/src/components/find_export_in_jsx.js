var fso = new ActiveXObject("Scripting.FileSystemObject");
var file = fso.OpenTextFile("UserConfigManager.js", 1);
var content = file.ReadAll();
file.Close();

var lines = content.split("\n");
var inJSX = false;
var jsxStartPattern = /return\s*\(/;
var jsxEndPattern = /\);\s*$/;

for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    
    // 检查是否进入JSX区域
    if (jsxStartPattern.test(line)) {
        inJSX = true;
    }
    
    // 检查JSX区域内是否有export语句
    if (inJSX && line.indexOf("export") >= 0) {
        WScript.Echo("Found 'export' inside JSX at line " + (i+1) + ": " + line);
    }
    
    // 检查是否离开JSX区域
    if (inJSX && jsxEndPattern.test(line)) {
        inJSX = false;
    }
}