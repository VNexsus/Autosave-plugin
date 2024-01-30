/*
 (c) VNexsus 2023

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function(window, undefined){
 
	window.timer = null;
	window.autosave_interval = null;
	window.next_run = null;
	window.topswitch = null;
	window.checkbox = null;
	window.combo = null;
	window.select = null;
 
    window.Asc.plugin.init = function()  {
		window.autosave_interval = window.Asc.plugin.getSavedInterval();
		window.Asc.plugin.startTimer();
		
		window.topswitch = $(`<div class="btn-slot" style="display: flex; align-items: center;">
								<input id="sw-autosave" class="toggle" type="checkbox" style="width: 0;height: 0;">
								<label id="slider" for="sw-autosave" style="background: var(--border-color-shading); display: flex; flex-direction: row; align-items: center; position: relative; border: 1px solid var(--border-divider); width: 3rem; border-radius: 1.6rem; height: 1.6rem; vertical-align: baseline; text-align: left; padding: 0 .3rem; margin: 0 5px; cursor: pointer; opacity: 0.9;">
									<label id="knob" for="sw-autosave" style="content: ''; width: 1rem; height: 1rem; border: 1px solid var(--border-preview-hover); border-radius: 50%; position: relative; display: inline-block; cursor: pointer; transition: all .15s; left: 0"></label>
								</label>
								<label id="autosave-label" for="sw-autosave" style="font-size: x-small; cursor: pointer; opacity: 0.8;">Автосохранение</label>
							</div>`);
		window.topswitch.find('#sw-autosave').on('change', function(){
			window.Asc.plugin.updateTSWState();
			if(window.topswitch.find('#sw-autosave').prop('checked')){
				if(window.checkbox)
					window.checkbox.prop('checked', true).trigger('change');
				else{
					window.autosave_interval = window.autosave_interval || 600;
					window.Asc.plugin.setSavedInterval(window.autosave_interval);
				}
			}
			else{
				if(window.checkbox)
					window.checkbox.prop('checked', false).trigger('change');
				else{
					window.autosave_interval = null;
					window.Asc.plugin.setSavedInterval(window.autosave_interval);
				}
			}
		});
		if(window.autosave_interval)
			window.topswitch.find('#sw-autosave').prop('checked', true).trigger('change');
		
		window.parent.$('.hedset:first').append(topswitch);

		$(window.parent).on('focus',function() {
			var i = window.Asc.plugin.getSavedInterval();
			if(i != window.autosave_interval){
				window.autosave_interval = i;
				window.Asc.plugin.startTimer();
				
				if(window.autosave_interval){
					window.topswitch.find('#sw-autosave').prop('checked', true);
					try{
						window.checkbox.prop('checked', true);
						window.select.find('li[data-value="'+ window.autosave_interval +'"]').addClass('selected',true).click();
						window.combo.removeClass("disabled");
						window.combo.find('button').removeClass('disabled');
						window.combo.css('pointer-events','auto');
					} catch(e){}
				}
				else{
					window.topswitch.find('#sw-autosave').prop('checked', false);
					try{
						window.checkbox.prop('checked', false);
						window.combo.addClass("disabled");
						window.combo.find('button').addClass('disabled');
						window.combo.css('pointer-events','none');
						window.select.find('li[data-value="600"]').addClass('selected',true).click();
					} catch(e){}
				}
				window.Asc.plugin.updateTSWState();
			}
			else if(Math.floor(Date.now()/1000) > window.next_run) {
				window.Asc.plugin.startTimer();
			}
		});
    
	};
	
	window.Asc.plugin.updateTSWState = function() {
		if(window.topswitch.find('#sw-autosave').prop('checked')){
			window.topswitch.find('#knob').css('background', 'var(--text-contrast-background)');
			window.topswitch.find('#knob').css('left','calc(100% - 1rem)');
		}
		else{
			window.topswitch.find('#knob').css('background', 'var(--background-scrim)');
			window.topswitch.find('#knob').css('left','0');
		}
	}
	
	window.Asc.plugin.getSavedInterval = function() {
		if(window.localStorage && typeof(window.localStorage.getItem)){
			return parseInt(window.localStorage.getItem("de-settings-autosave-interval"));
		}
	};
	
	window.Asc.plugin.setSavedInterval = function(interval) {
		if(window.localStorage && typeof(window.localStorage.setItem))
			if(interval)
				window.localStorage.setItem("de-settings-autosave-interval", interval);
			else
				window.localStorage.removeItem("de-settings-autosave-interval");
		window.autosave_interval = interval;
	};

	window.Asc.plugin.startTimer = function() {
		if(window.timer){
			window.clearTimeout(window.timer);
			window.timer = null;
			window.next_run = null;
		}
		if(window.autosave_interval){
			window.timer = window.setTimeout(window.Asc.plugin.autosave, window.autosave_interval * 1000);
			window.next_run = Math.floor(Date.now()/1000) + window.autosave_interval;
		}
	};

	window.Asc.plugin.event_onDocumentContentReady = function()  {
		var observer = new MutationObserver(function(mutations) {
			if (window.parent.$("#panel-settings").length > 0 && window.parent.$("#panel-settings").find(".periodic-autosave").length == 0) {
				window.autosave_interval = window.Asc.plugin.getSavedInterval();
				var container = $(`<tr class="periodic-autosave"><td colspan="2">
										<span>
											<label class="checkbox-indeterminate">
												<input id="chb-autosave" type="checkbox" class="checkbox__native">
												<label for="chb-autosave"></label>
												<span>Автоматически сохранять документ каждые </span>
											</label>
											<span class="input-group combobox input-group-nr" style="width:80px;display: inline-block">
												<input id="selected-value" type="text" class="form-control" spellcheck="false" placeholder="" data-hint="" data-hint-direction="bottom" data-hint-offset="big" readonly="readonly" data-can-copy="false">
												<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>
												<ul class="dropdown-menu menu-aligned ps-container oo" style="min-width: 80px;" role="menu"></ul>
											</span>
										</span>
									</td></tr>`);
				window.checkbox = container.find('#chb-autosave');
				window.combo = container.find('.combobox');
				window.select = container.find('.dropdown-menu');
				window.select.append('<li id="" data-value="60"><a tabindex="-1" type="menuitem">1 мин</a></li>');
				window.select.append('<li id="" data-value="180"><a tabindex="-1" type="menuitem">3 мин</a></li>');
				window.select.append('<li id="" data-value="300"><a tabindex="-1" type="menuitem">5 мин</a></li>');
				window.select.append('<li id="" data-value="600"><a tabindex="-1" type="menuitem">10 мин</a></li>');
				window.select.append('<li id="" data-value="900"><a tabindex="-1" type="menuitem">15 мин</a></li>');
				
				window.select.find('li').on('click', function(){
					window.select.find('li').removeClass('selected');
					$(this).addClass('selected');
					var selected_item = $(this).find('a');
					window.combo.find('input').val(selected_item.text());
					if(window.checkbox.prop('checked'))
						window.Asc.plugin.setSavedInterval(parseInt($(this).attr('data-value')));
					window.Asc.plugin.startTimer();
				});
				
				window.checkbox.on('change', function(e){
					if(window.checkbox.prop('checked')) {
						window.Asc.plugin.setSavedInterval(window.select.find('li.selected').attr('data-value'));
						window.Asc.plugin.startTimer();
						window.combo.removeClass("disabled");
						window.combo.find('button').removeClass('disabled');
						window.combo.css('pointer-events','auto');
						window.topswitch.find('#sw-autosave').prop('checked', true);
					}
					else {
						window.Asc.plugin.setSavedInterval(null);
						window.Asc.plugin.startTimer();
						window.combo.addClass("disabled");
						window.combo.find('button').addClass('disabled');
						window.combo.css('pointer-events','none');
						window.topswitch.find('#sw-autosave').prop('checked', false);
					}
					window.Asc.plugin.updateTSWState();
				});
				
				window.combo.find('input').on('click', function(e){ 
					$(this).next().click();
					e.preventDefault();
					return false;
				});

				if(window.autosave_interval){
					window.checkbox.prop('checked', true);
					window.select.find('li[data-value="'+ window.autosave_interval +'"]').addClass('selected',true).click();
					window.combo.removeClass("disabled");
					window.combo.find('button').removeClass('disabled');
					window.combo.css('pointer-events','auto');
				}
				else{
					window.checkbox.prop('checked', false);
					window.combo.addClass("disabled");
					window.combo.find('button').addClass('disabled');
					window.combo.css('pointer-events','none');
					window.select.find('li[data-value="600"]').addClass('selected',true).click();
				}

				window.parent.$(".editsave:not(.divider-group)").after(container);
				
				observer.disconnect();
			}
		});
		observer.observe(window.parent.document, {attributes: false, childList: true, characterData: false, subtree: true});
	};
	
	window.Asc.plugin.autosave = function() {
		var e = window.parent.DE || window.parent.PE || window.parent.SSE;
		if(e.controllers.Main.application.getController("Viewport").getView('Common.Views.Header').readOnly != true){
			if(parent.AscDesktopEditor.LocalFileGetSaved()){
				var e = parent.editor || parent.Asc.editor;
				if(e) {
					if(e.asc_isDocumentCanSave()) {
						e.asc_Save();
					}
					else {
						window.Asc.plugin.startTimer();
					}
				}
				else
					console.log('unknown editor');
			}
			else{
				window.Asc.plugin.startTimer();
			}
		}
		else{
			window.Asc.plugin.startTimer();
		}

	};
	
	window.Asc.plugin.onsaveend = function() {
		window.Asc.plugin.startTimer();
	};

	var defaultMethod = parent.DesktopOfflineAppDocumentEndSave;

	parent.DesktopOfflineAppDocumentEndSave = function(a,b,c){
		window.Asc.plugin.onsaveend();
		defaultMethod(a,b,c);
	}

})(window, undefined);
