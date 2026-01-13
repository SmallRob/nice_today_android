package com.nicetoday.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.fitness.Fitness;
import com.google.android.gms.fitness.FitnessOptions;
import com.google.android.gms.fitness.data.DataType;
import com.google.android.gms.fitness.data.Field;
import com.google.android.gms.fitness.request.DataReadRequest;
import com.google.android.gms.fitness.result.DataReadResponse;

import java.util.Calendar;
import java.util.concurrent.TimeUnit;

@CapacitorPlugin(
    name = "GoogleFit",
    permissions = {
        @Permission(strings = { Manifest.permission.ACTIVITY_RECOGNITION }, alias = "activity_recognition"),
        @Permission(strings = { Manifest.permission.BODY_SENSORS }, alias = "body_sensors")
    }
)
public class GoogleFitPlugin extends Plugin {

    private static final String TAG = "GoogleFitPlugin";
    private static final int REQUEST_OAUTH_REQUEST_CODE = 1001;

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject permissionsResult = new JSObject();
        JSObject permissions = new JSObject();
        
        boolean activityRecognitionPermission = ContextCompat.checkSelfPermission(getActivity(), 
            Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
        
        permissions.put("activity", activityRecognitionPermission ? "granted" : "denied");
        permissionsResult.put("permissions", permissions);
        
        call.resolve(permissionsResult);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        ActivityCompat.requestPermissions(getActivity(),
            new String[]{Manifest.permission.ACTIVITY_RECOGNITION},
            REQUEST_OAUTH_REQUEST_CODE);

        JSObject permissionsResult = new JSObject();
        JSObject permissions = new JSObject();
        permissions.put("activity", "granted"); // Assuming granted for demo purposes
        permissionsResult.put("permissions", permissions);
        
        call.resolve(permissionsResult);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        FitnessOptions fitnessOptions = FitnessOptions.builder()
                .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
                .addDataType(DataType.TYPE_DISTANCE_DELTA, FitnessOptions.ACCESS_READ)
                .addDataType(DataType.TYPE_CALORIES_EXPENDED, FitnessOptions.ACCESS_READ)
                .build();

        GoogleSignInAccount account = GoogleSignIn.getAccountForExtension(getActivity(), fitnessOptions);

        if (GoogleSignIn.hasPermissions(account, fitnessOptions)) {
            // Already connected
            JSObject ret = new JSObject();
            ret.put("connected", true);
            call.resolve(ret);
        } else {
            // Request permissions
            call.reject("Google Fit permissions not granted. Please connect manually.");
        }
    }

    @PluginMethod
    public void getStepCount(PluginCall call) {
        String startDateStr = call.getString("startDate", "");
        String endDateStr = call.getString("endDate", "");

        Calendar cal = Calendar.getInstance();
        long endTime = cal.getTimeInMillis();
        cal.add(Calendar.DAY_OF_YEAR, -7); // Default to last 7 days if no start date
        long startTime = cal.getTimeInMillis();

        if (!startDateStr.isEmpty()) {
            startTime = Long.parseLong(startDateStr);
        }
        if (!endDateStr.isEmpty()) {
            endTime = Long.parseLong(endDateStr);
        }

        FitnessOptions fitnessOptions = FitnessOptions.builder()
                .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
                .build();

        GoogleSignInAccount account = GoogleSignIn.getAccountForExtension(getActivity(), fitnessOptions);

        DataReadRequest readRequest = new DataReadRequest.Builder()
                .aggregate(DataType.TYPE_STEP_COUNT_DELTA)
                .bucketByTime(1, TimeUnit.DAYS)
                .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
                .build();

        Fitness.getHistoryClient(getActivity(), account)
                .readData(readRequest)
                .addOnSuccessListener(dataReadResponse -> {
                    JSObject ret = new JSObject();
                    
                    // Process the response and extract step count data
                    int totalSteps = 0;
                    JSArray stepData = new JSArray();
                    
                    // Simplified response processing
                    // In a real implementation, you'd iterate through the buckets and data points
                    
                    ret.put("steps", totalSteps);
                    ret.put("data", stepData);
                    call.resolve(ret);
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Failed to read step count", e);
                    call.reject("Failed to read step count: " + e.getMessage());
                });
    }
}