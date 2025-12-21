export const restartApp = () => {
    // 在原生应用中，可能需要特定的插件来真正重启，
    // 但对于大多数Web/Capacitor应用，重新加载页面或跳转到根路径足以重置状态。
    // 清除一些临时的内存状态可能是必要的。

    // 强制从服务器重新加载（忽略缓存）
    window.location.href = window.location.origin + '/?t=' + Date.now();
};
