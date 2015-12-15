/**
 * Licensed to Open-Ones Group under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Open-Ones Group licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package openones.webparser.stockparser;

import java.util.Collection;

import openones.stock.StockInfo;
import openones.webparser.ParserFactory;

import org.junit.Test;

public class StockParserTest {

    @Test
    public void testGetStock() {
        //DVSCParser parser = new DVSCParser();
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
