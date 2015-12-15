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
package openones.tms.account.dao;

import java.util.Properties;

import org.apache.log4j.Logger;

/**
 * This class manages dao implementer(s).
 * @author thach.le
 */
public class DaoManager {
    /** Logger. */
    static final Logger LOG = Logger.getLogger("DaoManager");

    /** Properties of configuration file 'app.properties'. */
    private static Properties confProps = new Properties();

    /** Instance of IAccountDao. */
    private static IAccountDao accountDaoImpl;

    static {
        try {
            confProps.load(DaoManager.class.getResourceAsStream("/app.properties"));
        } catch (Exception ex) {
            LOG.error("Could not load configuration resource '/app.properties'.", ex);
        }

        // get class of DaoManager implementation.
        String accountDaoImplClassName = confProps.getProperty("AccountDaoImpl");
        Class accountDaoClass;
        try {
            accountDaoClass = Class.forName(accountDaoImplClassName);
            accountDaoImpl = (IAccountDao) accountDaoClass.newInstance();
        } catch (Exception ex) {
            LOG.error("Could not create instance of dao implementer '" + accountDaoImplClassName + "'.", ex);
        }
    }

    /**
     * Get an implementer of Account Dao.
     * @return implementer of Account Dao
     */
    public static IAccountDao getAccountDaoInstance() {
        return accountDaoImpl;
    }
}
