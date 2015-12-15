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

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

import openones.stock.StockInfo;

import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.DomNodeList;
import com.gargoylesoftware.htmlunit.html.HtmlDivision;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlTable;
import com.gargoylesoftware.htmlunit.html.HtmlTableRow;

/**
 * Bộ phân tích thông tin cổ phiếu từ trang web của DVSC http://www.dvsc.com.vn.  
 * @author Thach Le
 */
public class DVSCParser implements IStockParser {
    final static Logger LOG = Logger.getLogger("DVSCParser");
    final static String PREFIX_STOCKQUERY = "http://www.dvsc.com.vn/DVSC/User/HistoricalPrice.aspx?code=";
    private static final int IDX_DATE = 0;
    private static final int IDX_GIATC = 1;
    private static final int IDX_GIATRAN = 2;
    private static final int IDX_GIASAN = 3;
    private static final int IDX_GIADONGCUA = 4;
    private static final int IDX_KL = 5;


    public DVSCParser() {
    }

    @Override
    public Collection<StockInfo> getStockList(String symbol) {
        Collection<StockInfo> stockList = new ArrayList<StockInfo>();
        
        final WebClient webClient = new WebClient();
        HtmlPage startPage;
        try {
            webClient.setJavaScriptEnabled(false);
            startPage = webClient.getPage(PREFIX_STOCKQUERY + symbol);
            
            // Lấy nội dung cửa sổ bên phải
            HtmlElement htmlRightBody = startPage.getElementById("mainbody-right");
            HtmlDivision divBienDongPhieu = htmlRightBody.getElementById("biendongphieu");
            
            //HtmlDivision mainDiv = (HtmlDivision) element;
            
            //System.out.println("element=" + htmlRightBody);
            //System.out.println("divBienDongPhieu=" + divBienDongPhieu);
            //ArrayList<Object> list = (ArrayList<Object>) htmlRightBody.getByXPath("div/table");
            //return: HtmlTable[<table cellpadding="0" cellspacing="0" border="0" width="100%">]
            ArrayList<HtmlTable> listTables = (ArrayList<HtmlTable>) htmlRightBody.getByXPath("div/table");
            HtmlTable httmlResultTable = listTables.get(0);
            
            HtmlTableRow htmlContentRow = httmlResultTable.getRow(3);
            //System.out.println("htmlContentRow=" + htmlContentRow);
            
            DomNodeList<HtmlElement> htmlTableList = htmlContentRow.getElementsByTagName("table");
            
            // Get the table of price list. It has 6 columns:
            // Ngày, Giá TC, Giá Trần, Giá Sàn, Giá đóng cửa, Khối lượng

            HtmlTable htmlContentTable = (HtmlTable) htmlTableList.get(0).getElementsByTagName("table").get(0);
            //System.out.println("htmlTableList 0=" + htmlContentTable);
            
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
            Date date;
            StockInfo stock;
             
            // Scan data, skip the header row
            HtmlTableRow row;
            Locale locale = Locale.FRENCH;
            NumberFormat numberFormat = NumberFormat.getNumberInstance(locale);
            for (int i = 1; i < htmlContentTable.getRowCount(); i++) {
                row = htmlContentTable.getRow(i);
                stock = new StockInfo(symbol);
                date = sdf.parse(row.getCell(IDX_DATE).getTextContent());
                
                stock.setDate(date);
                stock.setRefPrice(numberFormat.parse(row.getCell(IDX_GIATC).getTextContent()).floatValue());
                //stock.setRefPrice(Float.valueOf(row.getCell(IDX_GIATC).getTextContent()));
                stock.setCeilPrice(numberFormat.parse(row.getCell(IDX_GIATRAN).getTextContent()).floatValue());
                
                
                stock.setFloPrice(numberFormat.parse(row.getCell(IDX_GIASAN).getTextContent()).floatValue());
                
                
                stock.setClosedPrice(numberFormat.parse(row.getCell(IDX_GIADONGCUA).getTextContent()).floatValue());
                
                
                stock.setVolume(numberFormat.parse(row.getCell(IDX_KL).getTextContent()).floatValue());
                
                
                stockList.add(stock);
            }
        } catch (Exception ex) {
            LOG.log(Level.SEVERE, "Parse content of: " + (PREFIX_STOCKQUERY + symbol), ex);
        }
        return stockList;

    }

}
