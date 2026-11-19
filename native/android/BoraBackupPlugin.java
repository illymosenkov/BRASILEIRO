package br.bora.civic41;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "BoraBackup")
public class BoraBackupPlugin extends Plugin {
    private static final int MAX_BACKUP_BYTES = 1024 * 1024;

    @PluginMethod
    public void saveBackup(PluginCall call) {
        String json = call.getString("json");
        if (json == null || json.isEmpty() || json.getBytes(StandardCharsets.UTF_8).length > MAX_BACKUP_BYTES) {
            call.reject("Некорректный размер файла прогресса.");
            return;
        }

        Intent picker = new Intent("android.intent.action.CREATE_DOCUMENT");
        picker.addCategory(Intent.CATEGORY_OPENABLE);
        picker.setType("application/json");
        picker.putExtra(Intent.EXTRA_TITLE, "bora-progress.json");
        openPicker(call, picker, "onSaveBackup");
    }

    @PluginMethod
    public void openBackup(PluginCall call) {
        Intent picker = new Intent("android.intent.action.OPEN_DOCUMENT");
        picker.addCategory(Intent.CATEGORY_OPENABLE);
        picker.setType("*/*");
        openPicker(call, picker, "onOpenBackup");
    }

    private void openPicker(PluginCall call, Intent picker, String callback) {
        try {
            startActivityForResult(call, picker, callback);
        } catch (RuntimeException failure) {
            call.reject("Не удалось открыть системное окно файлов Android.");
        }
    }

    private Uri selectedFile(PluginCall call, ActivityResult result) {
        if (call == null) return null;
        Intent resultData = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || resultData == null || resultData.getData() == null) {
            call.resolve(new JSObject().put("cancelled", true));
            return null;
        }
        return resultData.getData();
    }

    @ActivityCallback
    private void onSaveBackup(PluginCall call, ActivityResult result) {
        Uri destination = selectedFile(call, result);
        if (destination == null) return;
        byte[] contents = call.getString("json").getBytes(StandardCharsets.UTF_8);

        new Thread(() -> {
            try (OutputStream output = getContext().getContentResolver().openOutputStream(destination, "wt")) {
                if (output == null) throw new IOException("File unavailable");
                output.write(contents);
            } catch (IOException | RuntimeException failure) {
                call.reject("Не удалось записать файл. Попробуй сохранить его в «Загрузки».");
                return;
            }
            call.resolve();
        }, "bora-backup-write").start();
    }

    @ActivityCallback
    private void onOpenBackup(PluginCall call, ActivityResult result) {
        Uri source = selectedFile(call, result);
        if (source == null) return;

        new Thread(() -> {
            try {
                String json = readBackup(source);
                call.resolve(new JSObject().put("json", json));
            } catch (IOException | RuntimeException failure) {
                call.reject("Не удалось прочитать файл прогресса Bora.");
            }
        }, "bora-backup-read").start();
    }

    private String readBackup(Uri source) throws IOException {
        try (InputStream input = getContext().getContentResolver().openInputStream(source)) {
            if (input == null) throw new IOException("File unavailable");
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            for (int count; (count = input.read(buffer)) != -1;) {
                if (bytes.size() + count > MAX_BACKUP_BYTES) throw new IOException("File too large");
                bytes.write(buffer, 0, count);
            }
            return new String(bytes.toByteArray(), StandardCharsets.UTF_8);
        }
    }
}
