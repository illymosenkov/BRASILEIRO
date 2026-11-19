"""Use a normal debug Capacitor project to exercise the Android bridge on the emulator."""
from pathlib import Path
from shutil import copyfile
root=Path('android/app/src/main/java/br/bora/civic43')
path=root/'MainActivity.java'
path.write_text('''package br.bora.civic43;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import br.bora.civic41.BoraBackupPlugin;
public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle state) {
        registerPlugin(BoraBackupPlugin.class);
        super.onCreate(state);
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
''')
plugin=root.parent/'civic41/BoraBackupPlugin.java'
plugin.parent.mkdir(exist_ok=True)
copyfile('native/android/BoraBackupPlugin.java',plugin)
build=Path('android/app/build.gradle')
text=build.read_text().replace('versionCode 1','versionCode 404').replace('versionName "1.0"','versionName "4.3"')
assert 'versionCode 404' in text
build.write_text(text)
