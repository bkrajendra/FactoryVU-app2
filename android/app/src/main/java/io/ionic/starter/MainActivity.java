package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.rajendrakhope.plugins.mdns.MdnsDiscoveryPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(MdnsDiscoveryPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
