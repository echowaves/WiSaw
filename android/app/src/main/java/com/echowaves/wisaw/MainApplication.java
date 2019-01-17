package com.echowaves.wisaw;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.smixx.fabric.FabricPackage;
import io.amarcruz.photoview.PhotoViewPackage;
// import Branch and RNBranch
import io.branch.rnbranch.RNBranchPackage;
import io.branch.referral.Branch;

import com.RNFetchBlob.RNFetchBlobPackage;
import org.reactnative.camera.RNCameraPackage;
import com.rjblopes.opensettings.OpenSettingsPackage;
import com.reactlibrary.securekeystore.RNSecureKeyStorePackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new FabricPackage(),
            new RNBranchPackage(),
            new PhotoViewPackage(),
            new RNFetchBlobPackage(),
            new RNCameraPackage(),
            new OpenSettingsPackage(),
            new RNSecureKeyStorePackage(),
            new RNScreensPackage(),
            new RNGestureHandlerPackage()
      );
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
    Branch.getAutoInstance(this);
    SoLoader.init(this, /* native exopackage */ false);
  }
}
