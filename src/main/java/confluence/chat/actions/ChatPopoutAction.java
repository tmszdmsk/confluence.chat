/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package confluence.chat.actions;

import com.atlassian.confluence.pages.PageManager;
import com.atlassian.confluence.security.PermissionManager;
import com.atlassian.confluence.web.context.HttpContext;
import static com.opensymphony.xwork.Action.SUCCESS;
import confluence.chat.manager.ChatManager;
import javax.servlet.http.HttpServletRequest;

/**
 *
 * @author t.adamski
 */
public class ChatPopoutAction extends AbstractChatAction {
    private final HttpContext context;

    public ChatPopoutAction(ChatManager chatManager, PageManager pageManager, PermissionManager permissionManager, HttpContext context) {
        super(chatManager, pageManager, permissionManager);
        this.context = context;
    }

    @Override
    public final String execute() throws Exception {
        return SUCCESS;
    }
    
    public String getChatboxId(){
        return context.getRequest().getParameter("chatboxId");
    }
}
