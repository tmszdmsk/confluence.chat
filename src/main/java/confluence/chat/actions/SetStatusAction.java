package confluence.chat.actions;

import com.atlassian.confluence.core.Beanable;
import com.atlassian.confluence.core.ConfluenceActionSupport;
import com.atlassian.spring.container.ContainerManager;
import com.opensymphony.webwork.ServletActionContext;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.lang.StringUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

public class SetStatusAction extends ConfluenceActionSupport implements Beanable {

    private ChatManager chatManager = (ChatManager) ContainerManager.getComponent("chatManager");
    private PlatformTransactionManager transactionManager = (PlatformTransactionManager) ContainerManager.getComponent("transactionManager");

    @Override
    public final String execute() throws Exception {
        HttpServletRequest request = ServletActionContext.getRequest();
        String status = request.getParameter("status");
        if (StringUtils.isNotBlank(status)) {
            ChatStatus chatStatus = ChatStatus.ONLINE;
            if ("chat".equals(status)) {
                chatStatus = ChatStatus.ONLINE;
            } else if ("dnd".equals(status)) {
                chatStatus = ChatStatus.DO_NOT_DISTURB;
            } else if ("away".equals(status)) {
                chatStatus = ChatStatus.AWAY;
            } else if ("xa".equals(status)) {
                chatStatus = ChatStatus.OFFLINE;
            }

            final ChatStatus saveChatStatus = chatStatus;
            TransactionTemplate tt = new TransactionTemplate();
            tt.setTransactionManager(transactionManager);
            tt.execute(new TransactionCallbackWithoutResult() {

                @Override
                protected void doInTransactionWithoutResult(TransactionStatus ts) {
                    ChatUser chatUser = chatManager.getChatUser(getRemoteUser());
                    chatUser.getPreferences().setChatStatus(saveChatStatus);
                    chatManager.setPreferencesOfUser(chatUser.getUsername(), chatUser.getPreferences());
                    chatManager.setOnlineStatus(getRemoteUser(), saveChatStatus);
                }
            });
        }
        return SUCCESS;
    }

    @Override
    public Object getBean() {
        return true;
    }
}
