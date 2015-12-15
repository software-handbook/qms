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
package openones.swtgui;

import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.swt.widgets.Menu;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.MenuItem;
import org.eclipse.swt.widgets.ToolBar;
import org.eclipse.swt.widgets.ToolItem;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Label;
import swing2swt.layout.BorderLayout;
import org.eclipse.wb.swt.SWTResourceManager;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.widgets.Tree;
import org.eclipse.swt.widgets.TreeItem;
import org.eclipse.swt.custom.CBanner;
import org.eclipse.swt.widgets.Table;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.layout.GridLayout;

/**
 * @author ThachLN
 *
 */
public class EclipseGUI {

    /**
     * Launch the application.
     * @param args
     */
    public static void main(String[] args) {
        Display display = Display.getDefault();
        Shell shell = new Shell();
        shell.setSize(450, 300);
        shell.setText("SWT Application");
        shell.setLayout(new BorderLayout(0, 0));
        
        Menu menu = new Menu(shell, SWT.BAR);
        shell.setMenuBar(menu);
        
        MenuItem mntmFile = new MenuItem(menu, SWT.CASCADE);
        mntmFile.setText("File");
        
        Menu menu_1 = new Menu(mntmFile);
        mntmFile.setMenu(menu_1);
        
        MenuItem mntmOpen = new MenuItem(menu_1, SWT.NONE);
        mntmOpen.setText("Open...");
        
        MenuItem mntmHelp = new MenuItem(menu, SWT.CASCADE);
        mntmHelp.setText("Help");
        
        Menu menu_2 = new Menu(mntmHelp);
        mntmHelp.setMenu(menu_2);
        
        MenuItem mntmAbout = new MenuItem(menu_2, SWT.NONE);
        mntmAbout.setText("About");
        
        ToolBar toolBar = new ToolBar(shell, SWT.FLAT | SWT.RIGHT);
        toolBar.setToolTipText("Open folder");
        toolBar.setBackground(SWTResourceManager.getColor(SWT.COLOR_TITLE_INACTIVE_BACKGROUND));
        toolBar.setLayoutData(BorderLayout.NORTH);
        
        ToolItem tltmOpen = new ToolItem(toolBar, SWT.NONE);
        tltmOpen.setText("Open");
        
        SashForm sashForm = new SashForm(shell, SWT.NONE);
        sashForm.setLayoutData(BorderLayout.CENTER);

        shell.open();
        shell.layout();
        while (!shell.isDisposed()) {
            if (!display.readAndDispatch()) {
                display.sleep();
            }
        }
    }
}
