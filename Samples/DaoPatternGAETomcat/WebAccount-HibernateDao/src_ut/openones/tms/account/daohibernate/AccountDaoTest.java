package openones.tms.account.daohibernate;

import static org.junit.Assert.*;

import java.util.Date;
import java.util.List;

import openones.tms.account.entity.Account;
import openones.tms.account.hibernatedao.HibernateAccountDao;

import org.junit.Test;

public class AccountDaoTest {

    @Test
    public void testSave() {
        HibernateAccountDao home = new HibernateAccountDao();
        Account account = new Account("openones1", "Mr.Open", "test@gmail.com", new Date());
        home.save(account);
    }

    @Test
    public void testListAll() {
        HibernateAccountDao home = new HibernateAccountDao();
        List<Account> accountList = home.listAll();

        assertEquals(2, accountList.size());
    }

    @Test
    public void testFindById() {
        HibernateAccountDao home = new HibernateAccountDao();
        Account account = home.findById("openones");
        assertEquals("Mr.Open", account.getName());
        assertEquals("test@gmail.com", account.getEmail());
    }

}
