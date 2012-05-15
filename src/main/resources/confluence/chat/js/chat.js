function ChatBar(){
    var that = this;
    this.chatBoxes = new Array();
    this.heartBeatCount= 0;
    this.windowFocus = true;
    this.originalTitle = null;
    this.lastHeartBeatServerdate = 0;
    that.startChatSession();
    jQuery(document).ready(function(){
        that.originalTitle = document.title;
        if(AJS.params.remoteUser){
            jQuery.ajax({
                url: getBaseUrl()+"/ajax/chat/chatbar.action",
                success: function(html){
                    jQuery('body').append(html);

                    that.init();
                    
                }
            });
        }
    });    
}
ChatBar.prototype.getHeartbeatCount = function(){  
    return this.heartBeatCount;
}
ChatBar.prototype.startChatSession = function(){  
    var that = this;
    jQuery(document).ready(function(){
        
        if(AJS.params.remoteUser){
            
            jQuery.ajax({
                url: getBaseUrl()+"/chat/start.action",
                cache: false,
                dataType: "json",
                success: function(data) {
                    that.lastHeartBeatServerdate = data.lr;
                    if(typeof(data.chatboxes) != "undefined"){
                        that.retrieveChatMessages(data.chatboxes);
                    }
                    setInterval(function(){
                        that.chatHeartbeat();
                    }, 650);
                }
            });
            jQuery([window, document]).blur(function(){
                that.windowFocus = false;
            }).focus(function(){
                that.windowFocus = true;
                document.title = that.originalTitle;
            });
        }
    });    
}

ChatBar.prototype.chatHeartbeat = function(){
    var that = this;
    this.heartBeatCount++;
    
    if(typeof(chatBar) != "undefined"){
        if(!this.isOnline()){
            return;
        }
    }
    
    //    var itemsfound = 0;
    //	
    //    if (this.windowFocus == false) {
    // 
    //        var blinkNumber = 0;
    //        var titleChanged = 0;
    //        for (var x in newMessagesWin) {
    //            if (newMessagesWin[x] == true) {
    //                ++blinkNumber;
    //                if (blinkNumber >= blinkOrder) {
    //                    document.title = x+' says...';
    //                    titleChanged = 1;
    //                    break;	
    //                }
    //            }
    //        }
    //		
    //        if (titleChanged == 0) {
    //            document.title = this.originalTitle;
    //            blinkOrder = 0;
    //        } else {
    //            ++blinkOrder;
    //        }
    //
    //    } else {
    //        for (var x in newMessagesWin) {
    //            newMessagesWin[x] = false;
    //        }
    //    }

    //    for (var x in newMessages) {
    //        if (newMessages[x] == true) {
    //            if (chatboxFocus[x] == false) {
    //                //FIXME: add toggle all or none policy, otherwise it looks funny
    //                jQuery('#chatbox_'+x+' .cb-head').toggleClass('chatboxblink');
    //            }
    //        }
    //    }
	
    jQuery.ajax({
        url: getBaseUrl()+"/chat/heartbeat.action",
        cache: false,
        dataType: "json",
        data: {
            lr: this.lastHeartBeatServerdate
        },
        success: function(data) {
            
            that.lastHeartBeatServerdate = data.lr;
            if(typeof(data.chatboxes) != "undefined"){
                that.retrieveChatMessages(data.chatboxes);
            }
        }
    });
}


ChatBar.prototype.restructureChatBoxes = function() {
    var  align = 0;
    
    for (var id in this.chatBoxes) {
        if (jQuery("#chatbox_"+id).css('display') != 'none') {
            if (align == 0) {
                jQuery("#chatbox_"+id).css('right', '250px');
            } else {
                var width = (align)*(225+7)+250;
                jQuery("#chatbox_"+id).css('right', width+'px');
            }
            align++;
        }
    }
}

ChatBar.prototype.init = function(){
    var that = this;

    this.username = AJS.params.remoteUser;
    this.bar = jQuery('#chatbar');
    this.bar.find('.aui-dd-parent').dropDown("Standard", {
        alignment: "left", 
        useDisabled: true
    });
    this.onlineUsersBox =  this.bar.find('#chatbar-online-users');
    this.configurationBox =  this.bar.find('#chatbar-config');
    this.bar.find('#chatbar-button-online, #chatbar-online-users .cb-opt a').click(function(){
        if(!that.isOnline()){
            that.bar.find('#chatbar-button-config').click();
        } else {
            if(!that.configurationBox.is(':hidden')){
                that.configurationBox.fadeOut();
            }
            that.onlineUsersBox.fadeToggle();
        }
        return false;
        
        
    })
    this.bar.find('#chatbar-button-config ,#chatbar-config .cb-opt a').click(function(){
        if(!that.onlineUsersBox.is(':hidden')){
            that.onlineUsersBox.fadeOut();
        }
        that.configurationBox.fadeToggle();
        return false;
    })
    this.configurationBox.find('.chatbar-box-content  select[name=status]').change(function(){
        var status = jQuery(this).val();
        jQuery.ajax({
            url: getBaseUrl()+"/chat/setstatus.action",
            cache: false,
            data: {
                status: jQuery(this).val()
            },
            dataType: "json",
            success: function(data){
                that.setStatus(status);
            }
        });
    })
   
    
    this.chatOnlineUserDiv = this.onlineUsersBox.find('#chatbar-online-users-list');
    this.chatBox = this.chatOnlineUserDiv.find('.chat-user').clone(true);
    this.chatOnlineUserDiv.empty();
    this.getOnlineUsers();  
    this.intervall = setInterval(function(){
        that.getOnlineUsers();
    }, 5000);
}

ChatBar.prototype.getChatBoxes = function(){
    return this.chatBoxes;
}

ChatBar.prototype.isOnline = function(){
    return  this.bar.hasClass("online");   
}
ChatBar.prototype.setStatus = function(status) {
    if(status == "xa"){
        this.bar.removeClass("online").addClass("offline");
    }else {
        var online = this.isOnline();
        this.bar.removeClass("offline").addClass("online");
        if(!online){
            // aktualisieren die user
            this.getOnlineUsers();    
        }
    }
    this.bar.find('#chatbar-status').attr('class', status);
    
}

ChatBar.prototype.getOnlineUsers = function() {
    if(this.isOnline()){
        var that = this;
        jQuery.ajax({
            url: getBaseUrl()+"/chat/getonlineuser.action",
            cache: false,
            dataType: "json",
            success: function(data){
                that.refreshUser(data);
            }
        });
    }
}


/**
 *  optjext like: 
 *  chatboxid: ''
 *  chatuserList: ''
 *  dispayTitle: ''
 *  message
 */
ChatBar.prototype.chatWith = function(options){
    var opts= jQuery.extend({
        chatBoxId: null,
        chatUserList: null,
        dispayTitle: null,
        messages: new Array(),
        minimizeChatBox: false
    }, options);

    var chatBoxId = opts.chatBoxId;
    if(chatBoxId != null){
        if(typeof(this.chatBoxes[chatBoxId]) != "undefined"){
            this.chatBoxes[chatBoxId].focusChatBox();          
        }else {
            this.chatBoxes[chatBoxId] = new ChatBox(opts);
        }
    }else {
        AJS.log('ChatBar.prototype.chatWith: no chatBoxId given');
    }
    
}

ChatBar.prototype.refreshUser = function(data){
    var that = this;
    var tmpAttr = 'chatOfflineMeFlag-'+Math.round(Math.random() * 10000);
    this.chatOnlineUserDiv.find('.chat-user').attr(tmpAttr, 'true');
    var ownUserInList = false;
    jQuery.each(data.users, function(j,user){
        var username = user.un;
        var chatBoxId = user.id;
        if( that.username != user.un){
            var chatUser = that.chatOnlineUserDiv.find('.chat-user[chatBoxId='+chatBoxId+']');
            if(!chatUser.size()){
                chatUser =  that.chatBox.clone(true);
                chatUser.show();
                chatUser.attr('chatBoxId', chatBoxId);
                chatUser.attr('username', username);
                chatUser.find('img').attr('src', user.p);
                chatUser.find('.chat-user-info span').text(user.fn).addClass('user-hover-trigger').attr('data-username', username);
                chatUser.find('> div').attr('class', user.s);
                chatUser.click(function(){
                    that.chatWith({
                        chatBoxId: jQuery(this).attr('chatBoxId'),
                        chatUserList : jQuery(this).attr('username'),
                        dispayTitle : jQuery(this).find('.chat-user-info span').text()
                    });
                });
                that.chatOnlineUserDiv.append(chatUser);
                try{
                    AJS.Confluence.Binder.userHover();
                }catch(e){}
            } else {
                chatUser.find('> div').attr('class', user.s);
                var img = chatUser.find('img');
                if(img.attr('src') != user.p){
                    img.attr('src', user.p);
                }
                chatUser.removeAttr(tmpAttr);
            }
        }else {
            ownUserInList = true;
        }
    });
    
    this.chatOnlineUserDiv.find('.chat-user['+tmpAttr+']').remove();
    var count = data.users.length;
    if(count > 0 && ownUserInList){
        count--; 
    }
    this.bar.find('#chatbar-button-online span').text(count);
}


ChatBar.prototype.getConfigParameter= function(param){
    return this.elem.find('.parameters input[name='+param+']').val();
    
}

ChatBar.prototype.retrieveChatMessages= function(chatboxes){
    var that = this;
    jQuery.each(chatboxes, function(j,chatbox){
        if(typeof(chatbox.messages) != "undefined" && typeof(that.chatBoxes[chatbox.id]) != "undefined"){
            jQuery.each(chatbox.messages, function(i,item){
                if (item)	{
                    that.chatBoxes[chatbox.id].retrieveMessage(item);      
                }
            });
        }else if (typeof(that.chatBoxes[chatbox.id]) == "undefined"){
            that.chatWith({
                chatBoxId: chatbox.id,
                chatUserList : chatbox.un[0],
                dispayTitle : chatbox.un[0],
                messages : chatbox.messages
            });
        }
    });
}

var chatBar = new ChatBar();






var blinkOrder = 0;

var chatboxFocus = new Array();
var newMessages = new Array();
var newMessagesWin = new Array();




/**
 * chatBoxId : chatboxid, 
 * chatUserList: chatUserList,
 *  minimizeChatBox: false,
 *  messages: messages,
 *   dispayTitle: dispayTitle
 */

   
           
            
           
function ChatBox(options){
    this.opt = jQuery.extend({
        chatBoxId: null,
        chatUserList: null,
        dispayTitle: null,
        messages: new Array()
    }, options);
    this.chatBoxId = this.opt.chatBoxId;
    this.chatUserList = this.opt.chatUserList;
    this.box = null;
    this.textarea = null;
    this.init();
    this.minimized = false;
    this.blinkInterval = null;
    var len=this.opt.messages.length;
    for ( var i=0; i<len; i++ ){
        this.retrieveMessage(this.opt.messages[i]);
    }
}
ChatBox.prototype.getId = function(){
    return this.chatBoxId;
}

ChatBox.prototype.isMinimized = function(){
    return this.minimized;
}

ChatBox.prototype.focusChatBox = function(){
    this.maximize();
    this.box.show();
}
ChatBox.prototype.startBlink = function(){
    if(!this.textarea.hasClass('cb-ts')
        && this.blinkInterval == null
        && chatBar.getHeartbeatCount() > 0
        ){
        var that = this
        this.blinkInterval = window.setInterval(function(){
            that.blink();
        }, 1000);
        
    }
}
ChatBox.prototype.stopBlink = function(){
    window.clearInterval(this.blinkInterval);
    this.blinkInterval = null;
    this.box.removeClass('blink');
}
ChatBox.prototype.blink = function(){
    this.box.toggleClass('blink');
}

ChatBox.prototype.init = function(){
    var that = this;
    this.box = jQuery('<div/>');
    this.box.addClass('chatbox').attr('id', 'chatbox_'+this.chatBoxId);
    var header =  jQuery('<div/>').addClass('cb-head');
    header.appendTo(this.box);
    var options = jQuery('<div/>').addClass('cb-opt');
    options.appendTo(header);
    jQuery('<a/>').attr('href', '#').text('-').click(function(){
        that.toggleChatBoxGrowth();
    }).appendTo(options);
    jQuery('<a/>').attr('href', '#').text('X')
    .click(function(){
        that.closeChatBox();
    }).appendTo(options);
    jQuery('<div/>').addClass('cb-title').text(this.chatUserList)
    .click(function(){
        that.maximize();
    }).appendTo(header);
    jQuery('<div/>').addClass('cb-content').appendTo(this.box);
    this.textarea= jQuery('<textarea/>');
    this.textarea.keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            that.send();
        }
    });
    
    this.textarea.blur(function(){
        //        chatboxFocus[chatBoxId] = false;
        jQuery(this).removeClass('cb-ts');
    }).focus(function(){
        jQuery(this).addClass('cb-ts');
        that.stopBlink();
    });
    jQuery('<div/>').addClass('cb-input').append(this.textarea).appendTo(this.box);
    that.box.appendTo(jQuery( "body" ));
     
    var chatBoxeslength = 0;
    var chatBoxes = chatBar.getChatBoxes();
    for (var x in chatBoxes) {
        if (!chatBoxes[x].isMinimized()) {
            chatBoxeslength++;
        }
    }
    
    var minWidth = this.box.width();
    
    if (chatBoxeslength == 0) {
        this.box.css('right', minWidth);
    } else {
        var width = (chatBoxeslength)*(minWidth+7)+250;
        this.box.css('right', width+'px');
    }
    this.box.show();
    

    if (this.minimizeChatBox == 1) {
        this.minimize();
    }
    

    

    
    

//    chatboxFocus[chatBoxId] = false;
//
//    jQuery("#chatbox_"+chatBoxId+" .chatboxtextarea").blur(function(){
//        chatboxFocus[chatBoxId] = false;
//        jQuery("#chatbox_"+chatBoxId+" .chatboxtextarea").removeClass('chatboxtextareaselected');
//    }).focus(function(){
//        chatboxFocus[chatBoxId] = true;
//        newMessages[chatBoxId] = false;
//        jQuery('#chatbox_'+chatBoxId+' .cb-head').removeClass('chatboxblink');
//        jQuery("#chatbox_"+chatBoxId+" .chatboxtextarea").addClass('chatboxtextareaselected');
//    });
//
//    jQuery("#chatbox_"+chatBoxId).click(function() {
//        if (jQuery('#chatbox_'+chatBoxId+' .cb-content').css('display') != 'none') {
//            jQuery("#chatbox_"+chatBoxId+" .chatboxtextarea").focus();
//        }
//    });

//    jQuery("#chatbox_"+chatBoxId).show();
}



ChatBox.prototype.closeChatBox = function() {
    this.box.hide();
    chatBar.restructureChatBoxes();
    jQuery.post(getBaseUrl()+"/chat/close.action", {
        close: this.chatUserList
    } );
}
ChatBox.prototype.minimize = function () {
    var newCookie = this.chatBoxId;

    if (AJS.Cookie.read('cb-min')) {
        newCookie += '|'+AJS.Cookie.read('cb-min');
    }
    AJS.Cookie.save('cb-min',newCookie);
    this.box.find('.cb-content ,  .cb-input').hide();
    this.minimized = true;	
}
ChatBox.prototype.maximize = function () {
    var minimizedChatBoxes = new Array();
    if (AJS.Cookie.read('cb-min')) {
        minimizedChatBoxes = AJS.Cookie.read('cb-min').split(/\|/);
    }

    var newCookie = '';
    for (var i=0;i<minimizedChatBoxes.length;i++) {
        if (minimizedChatBoxes[i] != this.chatBoxId) {
            newCookie += this.chatBoxId+'|';
        }
    }
    newCookie = newCookie.slice(0, -1)
    AJS.Cookie.save('cb-min', newCookie);
    this.box.find('.cb-content ,  .cb-input').show();
    this.box.find(".cb-content").scrollTop(this.box.find(".cb-content")[0].scrollHeight);
    this.minimized = false; 
    this.textarea.focus();
}


ChatBox.prototype.toggleChatBoxGrowth = function () {
    if (this.isMinimized()) {  
        this.maximize();
    } else {
        this.minimize();
    }
	
}


ChatBox.prototype.send = function() {
    var that = this;
    var message = AJS.escapeHtml(this.textarea .val());
    //        message = message.replace(/^\s+|\s+jQuery/g,"");


    this.textarea .val('').focus().css('height','44px');
    if (message != '') {
        jQuery.post(getBaseUrl()+"/chat/send.action", {
            to: this.chatUserList, 
            message: message
        } , function(data){
            if(typeof(data.chatboxes) != "undefined" ){
                chatBar.retrieveChatMessages(data.chatboxes);
            }
        });
    }
    return false;
//   
//
//    var adjustedHeight = chatboxtextarea.clientHeight;
//    var maxHeight = 94;
//
//    if (maxHeight > adjustedHeight) {
//        adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
//        if (maxHeight)
//            adjustedHeight = Math.min(maxHeight, adjustedHeight);
//        if (adjustedHeight > chatboxtextarea.clientHeight)
//            jQuery(chatboxtextarea).css('height',adjustedHeight+8 +'px');
//    } else {
//        jQuery(chatboxtextarea).css('overflow','auto');
//    }
	 
}
ChatBox.prototype.retrieveMessage = function(item){
    if(item == null){
        return;
    }
    this.startBlink();
    if(this.box.is(':hidden')){
        this.box.show();
        chatbar.restructureChatBoxes();
    }
    var message = this.replaceChatMessage(item.m);
    var content = this.box.find('.cb-content');
    
    var dt = new Date(item.t);
    var holderId = dt.getFullYear()+''+dt.getMonth()+dt.getDate()+dt.getHours()+dt.getMinutes();
    var messageBox = content.find('.cb-mc[slot='+holderId+']');
    if(messageBox.size() == 0){
        // pro zeit / datum eine box
        messageBox = jQuery('<div/>').addClass('cb-mc').attr('slot', holderId);    
        messageBox.appendTo(content);
    
        var messageTime= jQuery('<div/>').addClass('cb-mt');    
        messageTime.text(this.formatTime(dt));
        messageTime.appendTo(messageBox)
    
    }
    // habe nun aktuellen messageBox -> ist letzter eintrag auch von item.f.un  user?
    var userBox =  messageBox.find('.cb-ut:last');
    if(userBox.attr('unid') != item.f.id){
        userBox = null;
    }
    
    var messageHolder ;
    if(userBox == null ){
        userBox = jQuery('<div/>').addClass('cb-ut').attr('unid', item.f.id);    
        userBox.appendTo(messageBox)
        var userLink = jQuery('<a/>').attr('href', AJS.contextPath() + '/display/~'+item.f.un )
        userLink.addClass('userLogoLink').attr('data-username', item.f.un)
        var userLogo = jQuery('<img/>').attr('src', AJS.contextPath() + item.f.p).attr('alt','User icon: ' + item.f.un).attr('title',item.f.fn);
        userLogo.appendTo(userLink);
        // user image am content
        userLink.appendTo(userBox)
        messageHolder =   jQuery('<div/>').addClass('cb-mh');
        var from = jQuery('<div/>').addClass('cb-f').text(item.f.fn);
        from.appendTo(messageHolder)
        messageHolder.appendTo(userBox)
        try{
            AJS.Confluence.Binder.userHover();
        }catch(e){}
    }else {
        messageHolder =    userBox.find('.cb-mh') ;
    }
    //     nun einfach die nachricht noch drann
    var messageItem = jQuery('<div/>').addClass('cb-mtext').html(message).attr('t',item.t);
    messageItem.appendTo(messageHolder);
    
    content.scrollTop(content[0].scrollHeight);
   
}

ChatBox.prototype.formatTime =  function(dt) {
    if(typeof dt == "object"){
        var hours = dt.getHours();
        var minutes = dt.getMinutes();

        // the above dt.get...() functions return a single digit
        // so I prepend the zero here when needed
        if (hours < 10) 
            hours = '0' + hours;

        if (minutes < 10) 
            minutes = '0' + minutes;

        return hours + ":" + minutes;
    }
    return "";
} 

ChatBox.prototype.replaceChatMessage =  function(text){
    
    text = this.urlify(text);
    text = this.replaceEmoticons(text);
    return text;
    
}
ChatBox.prototype.replaceEmoticons =  function(text){
    var emoticons = {
        ':-)' : 'happy',
        ':)'  : 'happy',
        ':]'  : 'happy',
        ':-D' : 'big-grin',
        ':D' : 'big-grin',
        '=)'  : 'happy',
        ':-*' : 'kiss',
        ':*' : 'kiss',
        ';-)' : 'winking',
        ';)' : 'winking',
        ':-P' : 'tongue',
        ':-p' : 'tongue',
        ':P' : 'tongue',
        ':p' : 'tongue',
        '=P' : 'tongue',
        ':-O' : 'surprise',
        ':-o' : 'surprise',
        ':O' : 'surprise',
        ':o' : 'surprise',
        ':D'  : 'big-grin',
        ':-|'  : 'straight-face',
        ':whistle:'  : 'whistle',
        ':oops:'  : 'oops',
        ':">': 'oops'
 
    },  patterns = [],
    metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

    // build a regex pattern for each defined property
    for (var i in emoticons) {
        if (emoticons.hasOwnProperty(i)){ // escape metacharacters
            patterns.push('('+i.replace(metachars, "\\$&")+')');
        }
    }

    // build the regular expression and replace
    
    return text.replace(new RegExp(patterns.join('|'),'g'), function (match) {
        return typeof emoticons[match] != 'undefined' ?
        '<img title="'+emoticons[match]+'" src="'+getBaseUrl()+'/download/resources/confluence.chat/clear.png" class="smiley '+emoticons[match]+'"/>' :
        match;
    });
    
}
ChatBox.prototype.urlify =  function(text){
    if(typeof text != 'undefined'){
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '" target="_blank" title="'+url+'">' + url + '</a>';
        })
    }else {
        return "";
    }
}