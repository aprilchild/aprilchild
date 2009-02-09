amy.wizards = 
{
	shared:
	{
		renderAuthBoxHelper:function(wizardId, large)
		{
			var auth_box = null;
			if (null == amy.wizards[wizardId].vars.auth_box)
			{
				var box = $('auth-container').s('margin-top:20px;margin-left:4px').a($$()).i('auth-box');
				box.w(380).n('form-box?'.embed(large?' large':'')).a($$()).n('top').p().a($$()).n('content').a($$()).n('inner').p().p().a($$()).n('bottom');
				auth_box = $('auth-box').fc().ns().fc();
				amy.wizards[wizardId].vars.auth_box = auth_box;
			}
			else
			{
				auth_box = amy.wizards[wizardId].vars.auth_box;				
			}
			return auth_box;
		}
	},
	
	ask_document_overwrite:
	{
		template: '<div class="content"><h3><span id="label" style="color:#888"></span> already exists. Do you want to replace it?</h3><div id="auth-container" style="margin-top:20px;margin-left:4px"><div id="auth-box" class="form-box" style="width:300px"><div class="top"></div><div class="content"><div class="inner" id="form-inner"></div></div><div class="bottom"></div></div></div>',
		vars:
		{
		},
		onLaunch: function(params)
		{
			amy.wizards.ask_document_overwrite.vars.callbackComplete = params.callbackComplete;
			var auth_box = $('form-inner');
			var ht = '<div style="margin-top:8px">A file with the same name already exists in <span style="color:#888;font-weight:bold">' + params.parentPath + '</span>. Replacing it will overwrite its current contents.</div><div class="buttons"><input type="button" value="Cancel" onclick="amy.wizards.ask_document_overwrite.complete(false)" class="button"/> <input type="button" value="Replace" onclick="amy.wizards.ask_document_overwrite.complete(true)" class="button"/></div>';
			auth_box.t(ht);
			$('label').t(params.label);
		},
		complete: function(overwrite)
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.ask_document_overwrite.vars.callbackComplete(overwrite);
		}
	},
	
	new_filename:
	{
		template: '<div class="content"><h3>File name for <span id="filename" style="color:#888"></span></h3><div id="auth-container" style="margin-top:20px;margin-left:4px"><div id="auth-box" class="form-box" style="width:300px"><div class="top"></div><div class="content"><div class="inner" id="form-inner"></div></div><div class="bottom"></div></div></div>',
		vars:
		{
		},
		onLaunch: function(params)
		{
			amy.wizards.new_filename.vars.callbackComplete = params.callbackComplete;
			amy.wizards.new_filename.vars.filename_mask = params.mask;
			var auth_box = $('form-inner');
			var ht = '<table><tbody><tr><td><input type="text" class="text" id="f_filename" style="width:365px" /></td></tr><tr><td style="padding-top:10px">will become: <span id="c_filename" style="color:#666">' + params.mask.replace('$AMY{name}', '') + '</span></td></tr></tbody></table><div class="buttons"><input type="button" value="Create new file" onclick="amy.wizards.new_filename.proceed()" class="button"/></div>';
			auth_box.t(ht);
			$('filename').t(params.name);
			$('f_filename').e('keyup', amy.wizards.new_filename.key_handler).$.focus();
		},
		key_handler:function(evt)
		{
			evt.stop();
			if (13 == evt.keyCode)
			{
				amy.wizards.new_filename.proceed();
			}
			else
			{
				$('c_filename').t(amy.wizards.new_filename.vars.filename_mask.replace('$AMY{name}', '<strong>?</strong>'.embed($('f_filename').$.value)));
			}
		},
		complete: function(filename)
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.new_filename.vars.callbackComplete(filename);
		},
		proceed: function()
		{
			var f_filename = $('f_filename').$.value.trim();
			if ('' == f_filename)
			{
				client.view.showFlashMessage($loc('flash_invalid_filename'), 2);
			}
			else
			{
				amy.wizards.new_filename.complete(f_filename);
			}
		}
	},
	
	user_sign_in:
	{
		template: '<div class="info"><div class="top"></div><div class="content"><div class="inner"><h2>What\'s a service</h2><p>Amy Editor supports external authentication services. Simply put, you don\'t have to register on yet another web application (Amy Editor in this case). If you happen to have  an account somewhere else, you can use it here. Currently <strong>Facebook</strong> is fully supported, other services (eg. OpenID) are under consideration.</p><p>In case you don\'t have an external account, you may always register for a <a href="javascript:amy.wizards.user_sign_in.open_register()">free Amy account</a>.</p></div></div><div class="bottom"></div></div><div class="content"><h3 class="step">Please select preferred service</h3><p>Use Amy service if you don\'t have (or simply don\'t want to use) any other account on supported services.</p><form><table class="form"><tbody><tr><td><select style="width:200px" id="service_name" onchange="amy.wizards.user_sign_in.show_authentication()"><option value="amy">Amy</option><option value="facebook">Facebook</option></select></td></tr></tbody></table></form><div id="auth-container"></div><p style="margin-top:20px;color:#444">If you don\'t have any account here or on Facebook, you must <a href="javascript:amy.wizards.user_sign_in.open_register()">register first</a> prior logging in.</p></div>',
		vars:
		{
			auth_box:null
		},
		onLaunch: function(params)
		{
			amy.wizards.user_sign_in.vars.callbackComplete = params.callbackComplete;
			if (amy.wizards.user_sign_in.vars.auth_box && amy.wizards.user_sign_in.vars.auth_box.is())
			{
				amy.wizards.user_sign_in.vars.auth_box.rs();
			}
			amy.wizards.user_sign_in.vars.auth_box = null;
			amy.wizards.user_sign_in.vars.processing = false;
			amy.wizards.user_sign_in.show_authentication();
		},
		complete: function(user)
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.user_sign_in.vars.callbackComplete(user);
		},
		open_register: function()
		{
			client.view.hideWizardDialogWindow();
			setTimeout(client.controller.userRegister, 30);
		},		
		call_external_sign_in: function(url)
		{
			top.open(url);
		},
		external_sign_in_completed: function(user)
		{
			amy.wizards.user_sign_in.complete(user);
		},
		show_authentication:function()
		{
			var auth_box = amy.wizards.shared.renderAuthBoxHelper('user_sign_in');
			var combo = $('service_name');
			var service_id = $comboget(combo);
			var service_name = combo.$.options[combo.$.selectedIndex].value;
			if ('function' == typeof amy.wizards.user_sign_in['show_' + service_id])
			{
				auth_box.t('<h3>Service' + service_name + '</h3><div></div>');
				auth_box = auth_box.lc();
				amy.wizards.user_sign_in['show_' + service_id](amy.wizards.user_sign_in.vars.auth_box);
			}
			else
			{
				auth_box.t('<h3>Service not supported.</h3><div></div>');
			}
		},
		show_amy:function(authBox)
		{
			var ht = '<h4>Please enter your credentials</h4><p>This is the username and password you have chosen when registering to Amy Editor.</p>';
			ht += '<table><tbody><tr><td>Enter your username</td><td><input type="text" class="text" id="f_username"/></td></tr>';
			ht += '<tr><td>Password</td><td><input type="password" class="text" id="f_password"/></td></tr>';
			ht += '</tbody></table>';
			ht += '<div class="buttons"><input type="button" value="Log in to Amy Editor" onclick="amy.wizards.user_sign_in.login_amy()" class="button"/></div>';
			authBox.t(ht);
		},
		login_amy:function()
		{
			if (amy.wizards.user_sign_in.vars.processing)
			{
				return;
			}
			var f = {username:$('f_username').$.value, password:$('f_password').$.value};
			f.a = 'user_sign_in';
			amy.wizards.user_sign_in.vars.processing = true;
			$rpost(f,
				function(user)
				{
					amy.wizards.user_sign_in.vars.processing = false;
					client.view.hideFlashMessage();
					amy.wizards.user_sign_in.complete(user);
				},
				function(e)
				{
					amy.wizards.user_sign_in.vars.processing = false;
					client.view.showFlashMessage("An error occured while signing in, please check your username and password...", 2);
				}
			)
		},
		show_facebook:function(authBox)
		{
			authBox.t('<table style="margin-bottom:18px"><tbody><tr><td style="font-size:13px;padding-right:20px">Log in to Facebook</td><td><a href="javascript:amy.wizards.user_sign_in.call_external_sign_in(\'http://apps.facebook.com/amyeditor/\')"><img src="mm/i/facebook_login.gif" width="109" height="24" /></a></td></tr></tbody></table><p style="color:#888">Please note: the login process will open new browser window pointing to Facebook website, where you login and will be returned back to Amy Editor. You will be redirected automatically if you are already logged in to Facebook.</p>');
		}
	},
	
	user_register:
	{
		template: '<div class="info"><div class="top"></div><div class="content"><div class="inner"><h2>What\'s a service</h2><p>Amy Editor supports external authentication services. Simply put, you don\'t have to register on yet another web application (Amy Editor in this case). If you happen to have  an account somewhere else, you can use it here. Currently <strong>Facebook</strong> is fully supported, other services (eg. OpenID) are under consideration.</p><p>In case you don\'t have an external account, you may always register your Amy one.</p></div></div><div class="bottom"></div></div><div class="content"><h3 class="step">Why register?</h3><p>Registration in Amy Editor is simple, fast and adds significant benefits to you. When registered, you will be able to fully customize the editor. You can edit any settings such as bundles, themes and file associations. You will also be able to install and use existing third-party editor enhancements.</p><p>Registration is however strictly optional and you will never be limited in common use of the editor. There\'s also one sweet aspect - you can leverage your existing accounts on external services such as Facebook and don\'t have to register here.</p><div id="auth-container" style="margin-top:20px;margin-left:4px"><div id="auth-box" class="form-box" style="width:300px"><div class="top"></div><div class="content"><div class="inner" id="form-inner"></div></div><div class="bottom"></div></div></div></div>',
		vars:
		{
			auth_box:null
		},
		onLaunch: function(params)
		{
			amy.wizards.user_register.vars.callbackComplete = params.callbackComplete;
			amy.wizards.user_register.vars.processing = false;
			var auth_box = $('form-inner');
			var ht = '<h4>Please provide your credentials</h4><p style="color:#666">Username can contain alphanumeric characters only and/or underscore (eg. <strong>peter31</strong>, <strong>paul_johnson</strong>, ...).</p>';
			ht += '<table><tbody><tr><td>Enter your username</td><td><input type="text" class="text" id="f_username"/></td></tr>';
			ht += '<tr><td>Password</td><td><input type="password" class="text" id="f_password"/></td></tr>';
			ht += '<tr><td>Retype password</td><td><input type="password" class="text" id="f_password2"/></td></tr>';
			ht += '<tr><td>E-mail address</td><td><input style="width:240px" type="text" class="text" id="f_email"/></td></tr>';
			ht += '<tr><td>Name (nickname)</td><td><input style="width:240px" type="text" class="text" id="f_nickname"/></td></tr>';
			ht += '</tbody></table>';
			ht += '<div class="buttons"><input type="button" value="Finish registration to Amy Editor" onclick="amy.wizards.user_register.register()" class="button"/></div><p style="color:#444">If you have a Facebook account and you\'d like to use it, you can safely skip the registration and <a href="javascript:amy.wizards.user_register.open_login()">log in to Amy</a> right away.</p>';
			auth_box.t(ht);
		},
		complete: function(user)
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.user_register.vars.callbackComplete(user);
		},
		open_login: function()
		{
			client.view.hideWizardDialogWindow();
			setTimeout(client.controller.userSignIn, 200);
		},
		register: function()
		{
			if (amy.wizards.user_register.vars.processing)
			{
				return;
			}
			function raise_error(id, msg)
			{
				client.view.showFlashMessage(msg, 2);
			}
			var f = {};
			for (var k in {username:0, password:0, password2:0, email:0, nickname:0})
			{
				f[k] = $('f_' + k).$.value.trim();
			}
			if (0 == f.username.length)
			{
				raise_error('username', 'Username cannot be empty.');
				return;
			}
			if (0 == f.password.length)
			{
				raise_error('password', 'Password cannot be empty.');				
				return;
			}
			if (f.password != f.password2)
			{
				raise_error('password2', 'Passwords do not match.');
				return;
			}
			if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(f.email))
			{
				raise_error('email', 'Please provide a valid e-mail address.');
				return;
			}
			amy.wizards.user_register.vars.processing = true;
			client.view.showFlashMessage("Registering, please wait...");
			f.a = 'user_register';
			$rpost(f,
				function(user)
				{
					amy.wizards.user_register.vars.processing = false;
					client.view.hideFlashMessage();
					amy.wizards.user_register.complete(user);
				},
				function(e)
				{
					amy.wizards.user_register.vars.processing = false;
					client.view.showFlashMessage("An error occured while registering, please try again...", 2);
				}
			)
		}
	},	
	
	user_sign_out:
	{
		template: '<div class="content"><h3>Signing out of Amy Editor</h3><div id="auth-container" style="margin-top:20px;margin-left:4px"><div id="auth-box" class="form-box" style="width:300px"><div class="top"></div><div class="content"><div class="inner" id="form-inner"></div></div><div class="bottom"></div></div></div>',
		vars:
		{
		},
		onLaunch: function(params)
		{
			amy.wizards.user_sign_out.vars.callbackComplete = params.callbackComplete;
			amy.wizards.user_sign_out.vars.processing = false;
			var auth_box = $('form-inner');
			var ht = '<h4>Please confirm that you want to sign out from Amy Editor.</h4><p style="color:#666">Your session will expire, you will have to sign in again.</p>';
			ht += '<div class="buttons"><input type="button" value="Sign out from Amy Editor" onclick="amy.wizards.user_sign_out.proceed()" class="button"/></div>';
			auth_box.t(ht);
		},
		complete: function()
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.user_sign_out.vars.callbackComplete();
		},
		proceed: function()
		{
			if (amy.wizards.user_sign_out.vars.processing)
			{
				return;
			}
			amy.wizards.user_sign_out.vars.processing = true;
			client.view.showFlashMessage("Signing out, please wait...");
			$rpost({a:'user_sign_out'},
				function()
				{
					amy.wizards.user_sign_out.vars.processing = false;
					client.view.hideFlashMessage();
					amy.wizards.user_sign_out.complete();
				},
				function(e)
				{
					amy.wizards.user_sign_out.vars.processing = false;
					client.view.showFlashMessage("An error occured while signing out, please try again...", 2);
				}
			)
		}
	},	
	
	user_change_icon:
	{
		template: '<div class="info"><div class="top"></div><div class="content"><div class="inner"><h2>Currently selected icon</h2><p>Icon is used mostly for easier visual identification when collaboration features are used.</p><div id="icon"></div></div></div><div class="bottom"></div></div><div class="content"><h3>Change your identity icon</h3><div id="auth-container" style="margin-top:20px;margin-left:4px"><div id="auth-box" class="form-box" style="width:300px;"><div class="top"></div><div class="content"><div class="inner" id="form-inner"></div></div><div class="bottom"></div></div></div>',
		vars:
		{
		},
		onLaunch: function(params)
		{
			amy.wizards.user_change_icon.vars.callbackComplete = params.callbackComplete;
			amy.wizards.user_change_icon.vars.processing = false;
			var auth_box = $('form-inner');
			var ht = 'Please select an icon from the list:<table cellspacing="8" cellpadding="0"><tbody><tr>';
			for (var i=0; i<24; i++)
			{
				if (0 != i && 0 == i % 6)
				{
					ht += '</tr><tr>';
				}
				var letter = String.fromCharCode(97+i);
				ht += '<td style="width:52px;height:52px;text-align:center" valign="middle"><a href="javascript:amy.wizards.user_change_icon.set(\'?\')"><img src="mm/i/pictures/?.png" style="width:32px;height:32px;border:2px solid #bbb;-moz-border-radius:4px;-webkit-border-radius:4px;-webkit-transition-timing-function: ease-out;-webkit-transition-property: all;				-webkit-transition-duration: 0.1s;" /></a></td>'.embed(letter, letter);
			}
			ht += '</tr></tbody></table>Or enter full picture URL address:<br/><input type="text" id="f_url" class="text" style="width:346px;margin-top:10px" onblur="amy.wizards.user_change_icon.set_url();fry.keyboard.start()" onfocus="fry.keyboard.stop();"/>';
			ht += '<div class="buttons"><input type="button" value="Set your active icon" onclick="amy.wizards.user_change_icon.change()" class="button"/></div>';
			auth_box.t(ht);
			auth_box.g('table:0').e('mouseover', function(evt) {if('img'==evt.$.$.tagName.toLowerCase()) evt.$.w(48).h(48)}).e('mouseout', function(evt) {if('img'==evt.$.$.tagName.toLowerCase()) evt.$.w(32).h(32)});
			amy.wizards.amy
			$('f_url').$.value = client.model.user.getIconUrl();
			$('icon').a(client.view.renderUserIcon(48, '#aaa'));
		},
		complete: function(user)
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.user_change_icon.vars.callbackComplete(user);
		},
		set: function(letter)
		{
			var icon_url = 'mm/i/pictures/?.png'.embed(letter);
			$('f_url').$.value = icon_url;
			$('icon').rc().a(client.view.renderUserIcon(48, '#aaa', icon_url));
		},
		set_url: function()
		{
			var icon_url = $('f_url').$.value;
			$('icon').rc().a(client.view.renderUserIcon(48, '#aaa', icon_url));
		},
		change: function()
		{
			if (amy.wizards.user_change_icon.vars.processing)
			{
				return;
			}
			amy.wizards.user_change_icon.vars.processing = true;
			client.view.showFlashMessage("Changing your identity icon, please wait...");
			$rpost({a:'user_change_picture', url:$('f_url').$.value},
				function(user)
				{
					amy.wizards.user_change_icon.vars.processing = false;
					client.view.hideFlashMessage();
					amy.wizards.user_change_icon.complete(user);
				},
				function(e)
				{
					amy.wizards.user_change_icon.vars.processing = false;
					client.view.showFlashMessage("An error occured while changing your identity icon, please try again...", 2);
				}
			)
		}
	},
	
	collaboration_invite:
	{
		template: '<div class="content"><h3>Invite to collaboration on <span style="color:#777;font-size:18px" id="f_resource_path"></span></h3><div id="auth-container" style="margin-top:20px;margin-left:4px"><div class="bottom"></div></div></div>',
		vars:
		{
		},
		onLaunch: function(params)
		{
			// console.log('%o', params.resource);
			amy.wizards.collaboration_invite.vars.resource = params.resource;
			amy.wizards.collaboration_invite.vars.auth_box = null;
			amy.wizards.collaboration_invite.vars.callbackComplete = params.callbackComplete;
			var message = params.message ? params.message : '';
			amy.wizards.collaboration_invite.vars.processing = false;
			$('f_resource_path').t(params.resource.properties.label);
			var auth_box = amy.wizards.shared.renderAuthBoxHelper('collaboration_invite', true);
			var ht = '<h4>Please select who you want to invite.</h4><p style="color:#666">Invitations are sent using e-mail. When invitation is sent, a random ticket is generated. You can choose other way of informing the person about his invitation though. Simply pass the ticket string to her/him.</p>';

			if (!client.model.user.isDefault())
			{
				ht += '<div style="display:block;margin:16px"><a href="javascript:client.controller.showAddressBook(\'selector\', amy.wizards.collaboration_invite.set_user)">Use address book to select the person you want to invite</a></div>';				
			}
			ht += '<table><tbody><tr><td>Enter an e-mail address of the person you are inviting</td><td><input type="text" class="text" id="f_email" style="width:260px"/></td></tr>';
			ht += '<tr><td>Give her/him permission to</td><td><select id="f_permission" style="width:260px"><option value="read">read only</option><option value="write" selected="selected">help you writing</option><option value="execute">view, help you writing and save it for you</option></select></td></tr>';
			ht += '<tr><td>Invitation message (optional)</td><td><textarea class="text" id="f_message" style="width:380px;height:55px">?</textarea></td></tr>'.embed(message);
			ht += '</tbody></table>';

			ht += '<div class="buttons"><input type="button" value="Send invitation" onclick="amy.wizards.collaboration_invite.proceed()" class="button"/></div>';
			auth_box.t(ht);
		},
		set_user:function(user)
		{
			$('f_email').$.value = user.email;
		},
		complete: function(collaboration)
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.collaboration_invite.vars.callbackComplete(collaboration);
		},
		proceed: function()
		{
			if (amy.wizards.collaboration_invite.vars.processing)
			{
				return;
			}
			function raise_error(id, msg)
			{
				client.view.showFlashMessage(msg, 2);
			}
			var email = $('f_email').$.value;
			if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email))
			{
				raise_error('email', 'Please provide a valid e-mail address.');
				return;
			}
			amy.wizards.collaboration_invite.vars.processing = true;
			client.view.showFlashMessage("Sending invitation to ?, please wait...".embed(email));
			client.model.inviteCollaboration(amy.wizards.collaboration_invite.vars.resource, email, $comboget('f_permission'), $('f_message').$.value,
				function(collaboration)
				{
					amy.wizards.collaboration_invite.vars.processing = false;
					client.view.hideFlashMessage();
					amy.wizards.collaboration_invite.complete(collaboration);
				},
				function(e)
				{
					amy.wizards.collaboration_invite.vars.processing = false;
					client.view.showFlashMessage("An error occured while inviting, please try again...", 2);
					console.error(e);
				}
			);
		}
	},
	
	collaboration_accept:
	{
		template: '<div class="info"><div class="top"></div><div class="content"><div class="inner"><h2>What\'s a collaboration</h2><p>Collaboration means working on a document simultaneously by at least two persons. It starts with someone sending an invitation to document she is working on. Each invitation is represented by a random hash string which other person must enter as the invitation code in order to actually start collaborating.</p><p>As soon as the code is accepted, the invitee will see new document opened and can start collaborating on it immediatelly.</p></div></div><div class="bottom"></div></div><div class="content"><h3 class="step">Please enter invitation code</h3><p>You should have received it by e-mail or some other way.</p><div id="auth-container"></div></div>',
		vars:
		{
		},
		onLaunch: function(params)
		{
			// console.log('%o', params.resource);
			amy.wizards.collaboration_accept.vars.auth_box = null;
			amy.wizards.collaboration_accept.vars.callbackComplete = params.callbackComplete;
			amy.wizards.collaboration_accept.vars.processing = false;
			var auth_box = amy.wizards.shared.renderAuthBoxHelper('collaboration_accept');
			var ht = '<table><tbody><tr><td>Your invitation code</td><td><input type="text" class="text" id="f_hash" style="width:250px"/></td></tr>';
			ht += '</tbody></table>';

			ht += '<div class="buttons"><input type="button" value="Accept collaboration" onclick="amy.wizards.collaboration_accept.proceed()" class="button"/></div>';
			auth_box.t(ht);
		},
		complete: function(hash)
		{
			client.view.hideWizardDialogWindow();
			amy.wizards.collaboration_accept.vars.callbackComplete(hash);
		},
		proceed: function()
		{
			if (amy.wizards.collaboration_accept.vars.processing)
			{
				return;
			}
			function raise_error(id, msg)
			{
				client.view.showFlashMessage(msg, 2);
			}
			var hash = $('f_hash').$.value;
			if (32 != hash.length)
			{
				raise_error('hash', 'Please enter a valid invitation code.');
				return;
			}
			amy.wizards.collaboration_accept.vars.processing = true;
			amy.wizards.collaboration_accept.complete(hash);
		}
	},	

	open_project:
	{
		template: '<div class="info"><div class="top"></div><div class="content"><div class="inner"><h2>What\'s a project</h2><p>Project is a collection of resources(*) provided by third parties (such as your company, your fellow developers website and such) that is accessible to you.</p><p>Each project has its own unique URL address, pretty much like any standard web page. If you want to open a project, all you need is such URL.</p><p class="explanation">(*) If you don\'t know what a resource means, replace the word <strong>resource</strong> with <strong>text document</strong> for now and you\'ll be fine.</p></div></div><div class="bottom"></div></div><div class="content"><h3 class="step">Enter a project\'s URL</h3><p>When the address is filled with correct project\'s URL, you will be offered other options depending on project type. The address is checked <strong>as you type</strong>.</p><form><table class="form"><tbody><tr><td><input type="text" class="text" style="width:380px" value="" name="project_url" id="project_url" onkeypress="amy.wizards.open_project.check()" onblur="amy.wizards.open_project.check();fry.keyboard.start();" onfocus="fry.keyboard.stop()"  onkeyup="amy.wizards.open_project.check()"  onclick="amy.wizards.open_project.check()" /></td><td><div id="status" style="color:#888;font-size:10px"></div></td></tr></tbody></table></form><div id="auth-container"></div><ul class="options"><li>In case you have no idea what URL a project has, you might want to <a href="javascript:alert(\'Not implemented yet. See the blog entry about projects.\')">find it in the public list of projects</a>.</li><li>If your intention is just to see the Amy Editor and play with it, you may just as well <a href="javascript:amy.wizards.open_project.open_default()">open the default project</a> and start right-away.</li><li>You can also use set of predefined projects for accessing documents of your <a href="javascript:amy.wizards.open_project.open_default(\'ftp\')">FTP server</a>,  <a href="javascript:amy.wizards.open_project.open_default(\'dav\')">WebDAV server</a> or even <a href="javascript:amy.wizards.open_project.open_default(\'blog\')">your blog</a>.</li></ul></div>',
			
		vars:
		{
			auth_shown: false,
			last_project: null,
			check_running: false,
			check_cache: {}
		},

		onLaunch: function(params)
		{
			$('project_url').$.value = 'http://' + params.default_project_url;
			amy.wizards.open_project.check();
		},

		open_default: function(specific)
		{
			specific = specific || 'playground';
			var url = '';
			if ('php' == client.conf.environment)
			{
				url = 'http://' + self.location.host + self.location.pathname.replace('/amy_frame.php', '').replace('/amy.php', '') + '/projects/' + specific + '.php';
			}
			else
			{
				url = 'http://' + self.location.host + self.location.pathname.replace('amy_frame', '').replace('amy', '') + 'projects/' + specific;
			}
			$('project_url').$.value = url;
			amy.wizards.open_project.check();
		},

		check: function()
		{
			if (amy.wizards.open_project.vars.check_running)
			{
				return;
			}
			function stop_check()
			{
				amy.wizards.open_project.vars.check_running = false;
				$('status').t('');
			}
			function start_check()
			{
				amy.wizards.open_project.vars.check_running = true;
				$('status').t('<img src="mm/i/check-progress.gif" /> Checking...');
			}
			start_check();
			var prj_url = $('project_url').$.value;
			if ('http' != prj_url.substr(0,4))
			{
				prj_url = 'http://' + prj_url;
			}
			if (!prj_url.match(/http:\/\/[a-zA-Z-_0-9]{1,}/))
			{
				console.log('invalid url');
				return stop_check();
			}
			if (amy.wizards.open_project.vars.check_cache[prj_url])
			{
				stop_check();
				if (null != amy.wizards.open_project.vars.check_cache[prj_url])
				{
					amy.wizards.open_project.show_authentication(amy.wizards.open_project.vars.check_cache[prj_url]);
				}
				return;
			}
			amy.wizards.open_project.vars.check_cache[prj_url] = null;
            // console.info('Checking for project %s', prj_url);
		    $rpost
			(
				{a:'project_check', url:prj_url}, 
		    	function(r)
		    	{
					stop_check();
					amy.wizards.open_project.vars.check_cache[prj_url] = {};
					for (var i in r)
					{
						if ('_' != i.charAt(0) && '$' != i.charAt(0) && 'string' == typeof r[i])
						{
							amy.wizards.open_project.vars.check_cache[prj_url][i] = r[i];
						}
					}
		        	console.log('Project found: %o', amy.wizards.open_project.vars.check_cache[prj_url]);
					amy.wizards.open_project.show_authentication(amy.wizards.open_project.vars.check_cache[prj_url]);
		    	},
		    	function(e)
		    	{
					stop_check();
		        	console.warn('Does not exist: %s', prj_url);
					amy.wizards.open_project.hide_authentication();
		    	},
		 		'POST',
				client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
			);
		},

		hide_authentication: function()
		{
			var auth_box = $('auth-box');
			if (auth_box && auth_box.is())
			{
				auth_box.rs();
			}
		},

		show_authentication: function(project)
		{
			if (!amy.wizards.open_project.vars.auth_shown || '' == $('auth-container').t())
			{
				var box = $('auth-container').s('margin-top:20px;margin-left:4px').a($$()).i('auth-box');
				box.w(380).n('form-box').a($$()).n('top').p().a($$()).n('content').a($$()).n('inner').p().p().a($$()).n('bottom');
			}
			var auth_box = $('auth-box').fc().ns().fc();
			auth_box.t('<h3>' + project.name + '</h3><div></div>');
			auth_box = auth_box.lc();
			var auth_scheme = project.authentication_scheme;
			var handler_name = 'process_'+auth_scheme;
			if ('function' == typeof amy.wizards.open_project[handler_name])
			{
				amy.wizards.open_project[handler_name](project, auth_box);
			}
			else
			{
				auth_box.t('<h4>We are sorry...</h4><p>The project you entered requires an unsupported authentication scheme. You cannot continue opening the project. We simply do not know the appropriate way of sending your authentication information back to the project. Without you authenticating somehow, there is no way to access project resources.</p>');
			}
			amy.wizards.open_project.vars.auth_shown = true;
		},

		add_open_project_button: function(project, auth_box)
		{
			amy.wizards.open_project.vars.last_project = project;
			auth_box.at('<div class="buttons"><input type="button" value="Open &bull; ? &bull; project" onclick="amy.wizards.open_project.open()" id="butt-open-project" class="button"/></div>'.embed(project.name));
		},

		open: function()
		{
			var project = amy.wizards.open_project.vars.last_project;
			var auth_box = $('auth-box').fc().ns().fc();
			var old_content = auth_box.t();
			var handler_name = 'invoke_'+project.authentication_scheme;
			if ('function' == typeof amy.wizards.open_project[handler_name])
			{
				amy.wizards.open_project[handler_name](project, auth_box, 
				function(ticket)
				{
					// authenticated
					project.ticket = ticket;
					client.controller.openProject(project);
					auth_box.t('Populating project resources, please wait...');
				},
				function(e)
				{
					// authentication error
					auth_box.t(e);
					setTimeout(function(){auth_box.t(old_content);}, 3000);			
				});
			}
		},

		process_readonly: function(project, auth_box)
		{
			var ht = '<p>The project is read-only meaning you may view the resources, but cannot change them.</p>';
			auth_box.t(ht);
			amy.wizards.open_project.add_open_project_button(project, auth_box);	
		},

		invoke_readonly: function (project, auth_box, callbackOk, callbackError)
		{
			callbackOk('');
		},
		
		process_anyone: function(project, auth_box)
		{
			var ht = '<p>The project is open to anyone meaning you can freely modify its resources.</p>';
			auth_box.t(ht);
			amy.wizards.open_project.add_open_project_button(project, auth_box);
		},
		
		invoke_anyone: function(project, auth_box, callbackOk, callbackError)
		{
			callbackOk('');
		},

		process_external_login_handler: function (project, auth_box)
		{
			var ht = '<h4>Login required</h4><p>The project requires that you login first.</p>';
			ht += '<table><tbody><tr><td>Enter your username</td><td><input type="text" class="text" id="f_username" onblur="fry.keyboard.start();" onfocus="fry.keyboard.stop()"/></td></tr>';
			ht += '<tr><td>Password</td><td><input type="password" class="text" id="f_password" onblur="fry.keyboard.start();" onfocus="fry.keyboard.stop()"/></td></tr>';
			var params = {};
			if ('' != project.authentication_params)
			{
				try
				{
					eval('params = ' + project.authentication_params + ';');
				}
				catch (e){console.log(e)}
			}
			project.form_fields = {username:['text', '', ''], password:['password', '', '']};
			if (params['form'] && params.form['additional_fields'])
			{
				for (var key in params.form['additional_fields'])
				{
					var field = params.form['additional_fields'][key];
					ht += '<tr><td>' + field[1] + '</td><td>';
					switch (field[0])
					{
						case 'textarea':
						case 'select':
						case 'checkbox':
						case 'password':
						default:
						{
							ht += '<input type="text" class="text" id="f_' + key + '" value="' + field[2] + '" onblur="fry.keyboard.start();" onfocus="fry.keyboard.stop()"/>';
						}
					}
					project.form_fields[key] = field;
					ht += '</td></tr>';
				}
			}
			ht += '</tbody></table>';
			// console.log('%o', params);
			auth_box.t(ht);
			amy.wizards.open_project.add_open_project_button(project, auth_box);
			fry.keyboard.allowTextfieldsEditation();
		},

		invoke_external_login_handler: function (project, auth_box, callbackOk, callbackError)
		{
			var params = {a:'project_authenticate', url:project.url}
			if (project.predefinedAuthenticationParams)
			{
				for (var key in project.predefinedAuthenticationParams)
				{
					params[key] = project.predefinedAuthenticationParams[key];
				}
			}
			for (var key in project.form_fields)
			{
				var value = '';
				switch (project.form_fields[key][0])
				{
					case 'select':
					{
					}; break;
					case 'checkbox':
					{
					}; break;
					case 'password':
					case 'textarea':
					default:
					{
						value = $('f_' + key).$.value;
					}
				}
				params[key] = value;
			}
			if (null != auth_box)
			{
				auth_box.t('Attempting to open the project. Please wait...');
			}
			console.log('%', params);
			$rpost
			(
				params, 
		    	function(ticket)
		    	{
		        	console.log(ticket);
					callbackOk(ticket);
		    	},
		    	function(e)
		    	{
					console.warn(e);
					callbackError(e);
		    	},
		 		'POST',
				client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
			);
		}
	}	
}