package com.nicetoday.app;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "MainActivity";
    
    @Override
    public void onResume() {
        super.onResume();
        
        // Check if the activity was launched with a file intent
        Intent intent = getIntent();
        if (Intent.ACTION_VIEW.equals(intent.getAction())) {
            Uri uri = intent.getData();
            if (uri != null) {
                handleFileUri(uri);
            }
        }
    }
    
    private void handleFileUri(Uri uri) {
        Log.d(TAG, "Handling file URI: " + uri.toString());
        
        try {
            String content = readTextFromUri(uri);
            // Send the content to the web view
            JSObject ret = new JSObject();
            ret.put("uri", uri.toString());
            ret.put("content", content);
            
            // Broadcast the file content to the web application
            this.bridge.triggerWindowJSEvent("documentFileOpened", ret.toString());
            
        } catch (Exception e) {
            Log.e(TAG, "Error reading file: " + e.getMessage(), e);
        }
    }
    
    private String readTextFromUri(Uri uri) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        try (InputStream inputStream = getContentResolver().openInputStream(uri);
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            
            String line;
            while ((line = reader.readLine()) != null) {
                stringBuilder.append(line);
                stringBuilder.append("\n");
            }
        }
        return stringBuilder.toString();
    }
}
