package openones.sample.stock.dao;

import static org.junit.Assert.*;

import org.junit.Test;

public class DaoFactoryTest {

    @Test
    public void testGetStockDao() {
        IStockDao stockDao = DaoFactory.getStockDao();
        assertNotNull(stockDao);
    }

}
