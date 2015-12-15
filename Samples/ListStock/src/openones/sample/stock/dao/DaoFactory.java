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
package openones.sample.stock.dao;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import rocky.common.PropertiesManager;

/**
 * This class loads the DAO configuration. Then create instance for DAO objects.
 * 
 * @author Thach Le
 */
public class DaoFactory {
    final static Logger LOG = Logger.getLogger("DaoFactory");

    static Class stockDaoClass = null;
    static IStockDao stockDaoInst = null;

    static {
        try {
            // Load configuration file app.properties from CLASSPATH
            Properties props = PropertiesManager.newInstanceFromProps("/app.properties");
            // get class of StockDao implementation.
            String stockDaoClassName = props.getProperty("StockDaoImpl");

            stockDaoClass = Class.forName(stockDaoClassName);

            // Create an instance of IStockDao
            stockDaoInst = (IStockDao) stockDaoClass.newInstance();
        } catch (Exception ex) {
            LOG.log(Level.CONFIG, "Load configuration resource file /app.properties", ex);
        }
    }

    /**
     * Get the existed instance of StockDao.
     * 
     * @return
     */
    public static IStockDao getStockDao() {
        return stockDaoInst;
    }
}
