package com.nicetoday.app;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.util.Log;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

@CapacitorPlugin(name = "AppUpdate")
public class UpdatePlugin extends Plugin {
    private static final String TAG = "AppUpdatePlugin";
    private long downloadId = -1;

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url");
        String version = call.getString("version");

        if (url == null || url.isEmpty()) {
            call.reject("URL is required");
            return;
        }

        Log.d(TAG, "Starting download for version " + version + " from " + url);

        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("Nice Today 更新");
            request.setDescription("正在下载版本 " + version);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setMimeType("application/vnd.android.package-archive");
            
            // 设置下载路径
            String fileName = "nice_today_v" + version + ".apk";
            request.setDestinationInExternalFilesDir(getContext(), Environment.DIRECTORY_DOWNLOADS, fileName);

            DownloadManager downloadManager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            downloadId = downloadManager.enqueue(request);

            // 注册广播接收器监听下载完成
            getContext().registerReceiver(new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (id == downloadId) {
                        Log.d(TAG, "Download completed for ID: " + id);
                        installApk(context, downloadId);
                        // 注销接收器以避免泄漏 (实际应用中可能需要更优雅的管理)
                        try {
                            context.unregisterReceiver(this);
                        } catch (Exception e) {
                            Log.w(TAG, "Error unregistering receiver: " + e.getMessage());
                        }
                    }
                }
            }, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));

            call.resolve(new JSObject().put("message", "Download started").put("downloadId", downloadId));

        } catch (Exception e) {
            Log.e(TAG, "Error starting download: " + e.getMessage());
            call.reject("Failed to start download: " + e.getMessage());
        }
    }

    private void installApk(Context context, long downloadId) {
        try {
            DownloadManager downloadManager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
            Uri uri = downloadManager.getUriForDownloadedFile(downloadId);

            if (uri != null) {
                Log.d(TAG, "Installing APK from URI: " + uri.toString());
                
                Intent install = new Intent(Intent.ACTION_VIEW);
                install.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                
                // 处理 FileProvider
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    // 获取文件路径
                    Cursor cursor = downloadManager.query(new DownloadManager.Query().setFilterById(downloadId));
                    if (cursor != null && cursor.moveToFirst()) {
                        int columnIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI);
                        if (columnIndex != -1) {
                            String fileUri = cursor.getString(columnIndex);
                            if (fileUri != null) {
                                File file = new File(Uri.parse(fileUri).getPath());
                                Uri contentUri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", file);
                                install.setDataAndType(contentUri, "application/vnd.android.package-archive");
                            } else {
                                // Fallback
                                install.setDataAndType(uri, "application/vnd.android.package-archive");
                            }
                        } else {
                             install.setDataAndType(uri, "application/vnd.android.package-archive");
                        }
                        cursor.close();
                    } else {
                        install.setDataAndType(uri, "application/vnd.android.package-archive");
                    }
                } else {
                    install.setDataAndType(uri, "application/vnd.android.package-archive");
                }

                context.startActivity(install);
            } else {
                Log.e(TAG, "Download failed: URI is null");
            }
        } catch (Exception e) {
            Log.e(TAG, "Install failed: " + e.getMessage());
        }
    }
}
