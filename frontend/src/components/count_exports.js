var fso = new ActiveXObject("Scripting.FileSystemObject");
var file = fso.OpenTextFile("UserConfigManager.js", 1);
var content = file.ReadAll();
file.Close();

var count = 0;
var lines = content.split("\n");
for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("export default") >= 0) {
        WScript.Echo("Found 'export default' at line " + (i+1) + ": " + lines[i]);
        count++;
    }
}

WScript.Echo("Total export default statements: " + count);