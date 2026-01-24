package com.nicetoday.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int ACTIVITY_RECOGNITION_PERMISSION_CODE = 10001;

    @Override
    public void onStart() {
        super.onStart();
        requestHealthPermissions();
    }

    private void requestHealthPermissions() {
        java.util.List<String> permissionsToRequest = new java.util.ArrayList<>();

        // Android 10 (Q) 及以上需要 ACTIVITY_RECOGNITION
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(this,
                    Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.ACTIVITY_RECOGNITION);
            }
        }

        // Android 6 (M) 及以上通常需要 BODY_SENSORS 用于某些健康数据
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (ContextCompat.checkSelfPermission(this,
                    Manifest.permission.BODY_SENSORS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.BODY_SENSORS);
            }
        }

        if (!permissionsToRequest.isEmpty()) {
            ActivityCompat.requestPermissions(
                    this,
                    permissionsToRequest.toArray(new String[0]),
                    ACTIVITY_RECOGNITION_PERMISSION_CODE);
        }
    }
}
