package openones.tms.account;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import openones.tms.account.dao.DaoManager;
import openones.tms.account.dao.IAccountDao;
import openones.tms.account.entity.Account;

import org.apache.log4j.Logger;

public class WebAccountGAEServlet extends HttpServlet {
    /** Logger. */
    static final Logger LOG = Logger.getLogger("WebAccountGAEServlet");

    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String btnAdd = req.getParameter("btnAdd");
        IAccountDao dao = DaoManager.getAccountDaoInstance();

        if ("Add".equals(btnAdd)) { // Button Add is clicked
            String id = req.getParameter("id");
            String name = req.getParameter("name");
            String email = req.getParameter("email");
            String birthday = req.getParameter("birthday");
            Date birthdayDate = null;

            if ((birthday != null) && (birthday.length() > 0)) {
                SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yy");
                try {
                    birthdayDate = sdf.parse(birthday);
                } catch (ParseException ex) {
                    ex.printStackTrace();
                }
            }

            dao.save(new Account(id, name, email, birthdayDate));
        }

        List<Account> accoutList = dao.listAll();
        if (accoutList != null) {
            req.setAttribute("accountList", dao.listAll());
        }

        try {
            req.getRequestDispatcher("/WEB-INF/pages/list.jsp").forward(req, resp);
        } catch (ServletException ex) {
            LOG.error("Error in display view.", ex);
        }
    }
}
