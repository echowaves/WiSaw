package com.echowaves.wisaw;

import android.app.Application;
import android.util.Log;

import com.facebook.react.PackageList;
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.bridge.JavaScriptExecutorFactory;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
// import Branch and RNBranch
import io.branch.referral.Branch;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

		@Override
		protected List<ReactPackage> getPackages() {
		  return new PackageList(this).getPackages();
		}

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
		// Branch logging for debugging
		Branch.enableDebugMode();
		// Branch object initialization
		Branch.getAutoInstance(this);
    SoLoader.init(this, /* native exopackage */ false);
  }
}
