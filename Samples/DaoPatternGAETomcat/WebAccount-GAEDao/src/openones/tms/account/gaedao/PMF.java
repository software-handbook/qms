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
package openones.tms.account.gaedao;

import java.util.List;
import java.util.logging.Logger;

import javax.jdo.JDOHelper;
import javax.jdo.PersistenceManager;
import javax.jdo.PersistenceManagerFactory;
import javax.jdo.Query;

public final class PMF {
    final static Logger LOG = Logger.getLogger("PMF");
    private static final PersistenceManagerFactory pmfInstance = JDOHelper
            .getPersistenceManagerFactory("transactions-optional");

    private PMF() {
    }

    public static PersistenceManagerFactory get() {
        return pmfInstance;
    }

    public static boolean save(Object obj) {
        PersistenceManager pm = get().getPersistenceManager();
        try {
            pm.makePersistent(obj);
        } finally {
            pm.close();
        }
        return true;
    }

    public static Object getObjectById(String id, Class clazz) {
        PersistenceManager pm = get().getPersistenceManager();

        Query query = pm.newQuery(clazz);
        query.setFilter("id == idParam");
        query.declareParameters("String idParam");

        List<Object> eventDtoList = (List<Object>) query.execute(id);

        return (eventDtoList.iterator().hasNext()) ? eventDtoList.get(0) : null;
    }

    public static Object getAllObjects(Class clazz) {
        PersistenceManager pm = get().getPersistenceManager();
        Query query = pm.newQuery(clazz);
        return query.execute();
        // String query = "select from " + clazz.getName();
        // return pm.newQuery(query).execute();
    }
}
