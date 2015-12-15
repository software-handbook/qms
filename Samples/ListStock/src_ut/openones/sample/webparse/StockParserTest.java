package openones.sample.webparse;

import java.util.Collection;

import openones.stock.StockInfo;
import openones.webparser.ParserFactory;
import openones.webparser.stockparser.IStockParser;

import org.junit.Test;

public class StockParserTest {

    @Test
    public void testGetStock() {
        IStockParser parser;
        try {
            parser = ParserFactory.createStockParser("openones.webparser.stockparser.DVSCParser");
            Collection<StockInfo> stockList = parser.getStockList("ACB");
            for (StockInfo stock : stockList) {
                System.out.println(stock.getDate() + ";" + stock.getRefPrice() + ";" + stock.getCeilPrice() + ";" +
                                   stock.getFloPrice() + ";" + stock.getClosedPrice() + ";" + stock.getVolume());
            }
        } catch (Exception ex) {
            // TODO Auto-generated catch block
            ex.printStackTrace();
        }
    }

}
