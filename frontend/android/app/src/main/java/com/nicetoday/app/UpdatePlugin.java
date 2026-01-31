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
import java.util.Timer;
import java.util.TimerTask;

@CapacitorPlugin(name = "AppUpdate")
public class UpdatePlugin extends Plugin {
    private static final String TAG = "AppUpdatePlugin";
    private static final String UPDATE_FILE_NAME = "nice-today-update.apk";
    private long downloadId = -1;
    private Timer progressTimer;

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url");
        // String version = call.getString("version"); // 保留用于日志

        if (url == null || url.isEmpty()) {
            call.reject("URL is required");
            return;
        }

        Context context = getContext();
        
        try {
            DownloadManager downloadManager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);

            // 清理旧的更新文件
            File externalDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (externalDir != null) {
                File oldFile = new File(externalDir, UPDATE_FILE_NAME);
                if (oldFile.exists()) {
                    boolean deleted = oldFile.delete();
                    Log.d(TAG, "Deleted old update file: " + deleted);
                }
            }

            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("Nice Today 更新");
            request.setDescription("正在下载新版本...");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setMimeType("application/vnd.android.package-archive");
            
            // 设置固定下载路径
            request.setDestinationInExternalFilesDir(context, Environment.DIRECTORY_DOWNLOADS, UPDATE_FILE_NAME);
            
            // 允许漫游和计费网络
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);

            // 添加请求头
            request.addRequestHeader("User-Agent", "NiceToday-Android");
            request.addRequestHeader("Accept", "*/*");
            request.addRequestHeader("Cache-Control", "no-cache");

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                request.setRequiresCharging(false);
            }

            downloadId = downloadManager.enqueue(request);
            Log.d(TAG, "Download enqueued with ID: " + downloadId);

            // 开始轮询进度
            startProgressPolling(context, downloadManager);

            // 注册广播接收器
            BroadcastReceiver onComplete = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (downloadId == id) {
                        Log.d(TAG, "Download complete for ID: " + id);
                        stopProgressPolling();

                        // 发送最终进度
                        JSObject ret = new JSObject();
                        ret.put("downloaded", 100);
                        ret.put("total", 100);
                        ret.put("status", DownloadManager.STATUS_SUCCESSFUL);
                        notifyListeners("downloadProgress", ret);

                        installApk(context);

                        try {
                            context.unregisterReceiver(this);
                        } catch (Exception e) {
                            Log.w(TAG, "Error unregistering receiver: " + e.getMessage());
                        }
                    }
                }
            };

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(onComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED);
            } else {
                context.registerReceiver(onComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
            }

            JSObject ret = new JSObject();
            ret.put("message", "Download started");
            ret.put("downloadId", downloadId);
            call.resolve(ret);

        } catch (Exception e) {
            Log.e(TAG, "Error starting download: " + e.getMessage());
            call.reject("Failed to start download: " + e.getMessage());
        }
    }

    private void startProgressPolling(Context context, DownloadManager downloadManager) {
        stopProgressPolling();
        progressTimer = new Timer();
        progressTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                DownloadManager.Query query = new DownloadManager.Query();
                query.setFilterById(downloadId);
                Cursor cursor = downloadManager.query(query);
                if (cursor != null && cursor.moveToFirst()) {
                    int bytesDownloadedIndex = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR);
                    int bytesTotalIndex = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES);
                    int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);

                    if (bytesDownloadedIndex != -1 && bytesTotalIndex != -1) {
                        long bytesDownloaded = cursor.getLong(bytesDownloadedIndex);
                        long bytesTotal = cursor.getLong(bytesTotalIndex);
                        int status = cursor.getInt(statusIndex);

                        JSObject ret = new JSObject();
                        ret.put("downloaded", bytesDownloaded);
                        ret.put("total", bytesTotal);
                        ret.put("status", status);
                        notifyListeners("downloadProgress", ret);
                    }
                    cursor.close();
                }
            }
        }, 200, 500);
    }

    private void stopProgressPolling() {
        if (progressTimer != null) {
            progressTimer.cancel();
            progressTimer = null;
        }
    }

    private void installApk(Context context) {
        try {
            File externalDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (externalDir == null) {
                Log.e(TAG, "External storage not available");
                return;
            }

            File file = new File(externalDir, UPDATE_FILE_NAME);
            if (!file.exists()) {
                Log.e(TAG, "Update file not found: " + file.getAbsolutePath());
                return;
            }

            Log.d(TAG, "Installing APK from: " + file.getAbsolutePath());

            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Uri contentUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                contentUri = FileProvider.getUriForFile(
                    context,
                    context.getPackageName() + ".fileprovider",
                    file
                );
            } else {
                contentUri = Uri.fromFile(file);
            }

            install.setDataAndType(contentUri, "application/vnd.android.package-archive");
            context.startActivity(install);

        } catch (Exception e) {
            Log.e(TAG, "Install failed: " + e.getMessage());
        }
    }
}
