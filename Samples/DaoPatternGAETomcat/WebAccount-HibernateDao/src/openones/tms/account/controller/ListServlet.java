package openones.tms.account.controller;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import openones.tms.account.dao.DaoManager;
import openones.tms.account.dao.IAccountDao;
import openones.tms.account.entity.Account;
import openones.tms.account.hibernatedao.HibernateAccountDao;

/**
 * Servlet implementation class ListServlet.
 */
public class ListServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public ListServlet() {
        super();
    }

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
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

        req.setAttribute("accountList", dao.listAll());

        req.getRequestDispatcher("/WEB-INF/pages/list.jsp").forward(req, resp);
    }

}
