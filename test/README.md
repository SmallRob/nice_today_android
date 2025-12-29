# 测试脚本目录

本目录包含项目的所有测试脚本，按功能模块分类组织。

## 命名规范

- Shell脚本: `test-[功能名称].sh`
- PowerShell脚本: `test-[功能名称].ps1`
- Node.js测试脚本: `test-[功能名称].js`

## 现有测试脚本

### 兼容性测试
- `test-compatibility.sh` - 兼容性测试脚本

### 文件系统测试
- `test-filesystem-optimization.sh` - 文件系统优化测试
- `test-storage-functionality.sh` - 存储功能测试

### 通用测试
- `test-fix.js` - 通用修复测试脚本

## 添加新测试脚本

添加新的测试脚本时，请遵循以下步骤：

1. 按照命名规范创建测试脚本文件
2. 确保脚本具有可执行权限（Shell脚本）: `chmod +x test-[功能名称].sh`
3. 在本README.md中添加新脚本的描述
4. 确保脚本可以独立运行，不依赖特定的工作目录

## 运行测试

### 运行单个测试脚本
```bash
./test/test-compatibility.sh
```

### 运行所有Shell测试脚本
```bash
for script in test/*.sh; do
  echo "Running $script..."
  ./"$script"
done
```

### 运行Node.js测试脚本
```bash
node test/test-fix.js
```

## 注意事项

- 所有测试脚本应独立运行，不依赖外部状态
- 测试脚本应提供清晰的输出，包括成功/失败信息
- 遵循项目的错误处理策略
- 确保在测试完成后清理临时文件和状态
