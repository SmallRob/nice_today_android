# Android 应用签名密钥库管理指南

## 概述

本指南说明了如何管理 Android 应用的签名密钥库，包括调试和发布版本的签名配置。

## 密钥库文件

项目中包含一个调试密钥库文件：
- 文件位置：`frontend/android/app/debug.keystore`
- 别名：`androiddebugkey`
- 密码：`android`
- 用途：用于调试版本的 APK 签名

## 常用 Keytool 命令

### 1. 查看密钥库信息
```bash
keytool -list -v -keystore frontend/android/app/debug.keystore -storepass android
```

### 2. 查看特定别名的证书信息
```bash
keytool -list -v -keystore frontend/android/app/debug.keystore -alias androiddebugkey -storepass android
```

### 3. 生成新的调试密钥库（如需要）
```bash
keytool -genkeypair -v -keystore frontend/android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

### 4. 导出证书指纹（SHA-1）
```bash
keytool -exportcert -list -v -keystore frontend/android/app/debug.keystore -alias androiddebugkey -storepass android
```

## Gradle 构建配置

项目中的 `build.gradle` 文件已配置签名信息：

```gradle
android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## 为发布版本创建专用密钥库

对于发布版本，建议创建专用的密钥库：

```bash
keytool -genkeypair -v -keystore release.keystore -alias your_key_alias -keyalg RSA -keysize 2048 -validity 10000
```

然后在 `build.gradle` 中添加相应的发布签名配置：

```gradle
signingConfigs {
    release {
        storeFile file('release.keystore')
        storePassword System.getenv("STORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

## 注意事项

1. **安全**：调试密钥库的密码是公开的（'android'），仅用于开发和调试
2. **发布**：生产应用必须使用安全的、受保护的专用密钥库
3. **备份**：发布密钥库是不可恢复的，务必妥善备份
4. **环境变量**：在 CI/CD 环境中，应使用环境变量存储密钥库密码

## 故障排除

### 错误：密钥库文件不存在
确保在项目根目录执行命令，或提供正确的相对路径。

### 错误：无效的密钥库密码
检查密码是否正确，调试密钥库的密码是 'android'。

### 错误：找不到别名
确保别名名称正确，调试密钥库的别名是 'androiddebugkey'。

```sh
cd ./frontend/android && keytool -list -v -keystore debug.keystore -storepass android
密钥库类型: PKCS12
密钥库提供方: SUN

您的密钥库包含 1 个条目

别名: androiddebugkey
创建日期: 2026年1月13日
条目类型: PrivateKeyEntry
证书链长度: 1
证书[1]:
所有者: CN=Android Debug, O=Android, C=US
发布者: CN=Android Debug, O=Android, C=US
序列号: 842f182a90391361
生效时间: Tue Jan 13 18:03:40 CST 2026, 失效时间: Sat May 31 18:03:40 CST 2053
证书指纹:
         SHA1: 29:D7:65:CC:07:58:5A:1F:B9:78:14:12:6A:95:38:77:4F:20:83:2F
         SHA256: BB:7B:8E:3B:70:65:2D:29:5C:48:81:A0:DD:F9:82:49:52:70:73:62:DD:A9:DE:23:87:60:E3:27:33:B3:87:CA
签名算法名称: SHA384withRSA
主体公共密钥算法: 2048 位 RSA 密钥
版本: 3
```