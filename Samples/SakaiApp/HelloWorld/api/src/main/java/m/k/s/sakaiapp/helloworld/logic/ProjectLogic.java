package m.k.s.sakaiapp.helloworld.logic;

import java.util.List;

import m.k.s.sakaiapp.helloworld.model.Item;

/**
 * An example logic interface
 * 
 * @author Mike Jennings (mike_jennings@unc.edu)
 *
 */
public interface ProjectLogic {

	/**
	 * Get a list of Items
	 * @return
	 */
	public List<Item> getItems();
}
