package confluence.chat.actions;

import com.atlassian.confluence.event.events.security.LoginEvent;
import com.atlassian.confluence.event.events.security.LogoutEvent;
import com.atlassian.event.Event;
import com.atlassian.event.EventListener;
import com.atlassian.spring.container.ContainerManager;
import org.apache.log4j.Logger;
import java.util.HashMap;

public class LoginLogoutListener implements EventListener {

    private static final Logger log = Logger.getLogger(LoginLogoutListener.class);
    private ChatManager chatManager = (ChatManager) ContainerManager.getComponent("chatManager");
    private Class[] handledClasses = new Class[]{LoginEvent.class, LogoutEvent.class};

    @Override
    public void handleEvent(Event event) {
        if (event instanceof LoginEvent) {
            LoginEvent loginEvent = (LoginEvent) event;
            chatManager.setOnlineStatus(loginEvent.getUsername(), ChatStatus.NO_CHANGE);
        } else if (event instanceof LogoutEvent) {
            LogoutEvent logoutEvent = (LogoutEvent) event;
            chatManager.setOnlineStatus(logoutEvent.getUsername(), ChatStatus.NO_CHANGE);
        }
    }

    @Override
    public Class[] getHandledEventClasses() {
        return handledClasses;
    }
}