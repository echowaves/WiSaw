package com.echowaves.wisaw;

import com.facebook.react.ReactActivity;

import android.content.Intent; // <-- and this

import android.util.Log;

import org.json.JSONObject;


import io.branch.referral.Branch;
import io.branch.referral.BranchError;

import io.branch.rnbranch.RNBranchModule;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "WiSaw";
    }

		// Override onStart, onNewIntent:
	@Override
	protected void onStart() {
			super.onStart();
			// Branch init
			Branch.getInstance().initSession(new Branch.BranchReferralInitListener() {
					@Override
					public void onInitFinished(JSONObject referringParams, BranchError error) {
							if (error == null) {
									Log.i("BRANCH SDK", referringParams.toString());
									// Retrieve deeplink keys from 'referringParams' and evaluate the values to determine where to route the user
									// Check '+clicked_branch_link' before deciding whether to use your Branch routing logic
							} else {
									Log.i("BRANCH SDK", error.getMessage());
							}
					}
			}, this.getIntent().getData(), this);
	}

	@Override
	public void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
 		RNBranchModule.onNewIntent(intent);
	}
}
