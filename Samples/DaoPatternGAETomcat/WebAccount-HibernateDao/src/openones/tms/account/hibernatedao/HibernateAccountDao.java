package openones.tms.account.hibernatedao;
// Generated Apr 30, 2012 3:38:32 PM by Hibernate Tools 3.4.0.CR1

import java.util.List;

import openones.tms.account.dao.IAccountDao;
import openones.tms.account.entity.Account;

import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

/**
 * Home object for domain model class Account.
 * @see openones.tms.account.entity.Account
 * @author Hibernate Tools
 */
public class HibernateAccountDao implements IAccountDao {

    private static final Logger log = Logger.getLogger(HibernateAccountDao.class);

    private final SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

    @Override
    public void save(Account account) {
        log.debug("persisting Account instance");
        Session session = sessionFactory.openSession();
        session.beginTransaction();
        try {
            session.save(account);
            session.getTransaction().commit();

            log.debug("persist successful");
        } catch (RuntimeException re) {
            log.error("save failed", re);
            throw re;
        } finally {
            session.close();
        }
    }

    @Override
    public Account findById(java.lang.String id) {
        log.debug("getting Account instance with id: " + id);
        Session session = sessionFactory.openSession();
        session.beginTransaction();
        try {
            Account instance = (Account) session.get("openones.tms.account.entity.Account", id);
            if (instance == null) {
                log.debug("get successful, no instance found");
            } else {
                log.debug("get successful, instance found");
            }
            session.getTransaction().commit();

            return instance;
        } finally {
            session.close();
        }
    }

    @Override
    public List<Account> listAll() {
        Session session = sessionFactory.openSession();
        session.beginTransaction();

        try {
            List result = session.createQuery("from Account").list();

            return result;
        } finally {
            session.close();
        }
    }
}
