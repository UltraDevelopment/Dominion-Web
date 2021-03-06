package net.ultradev.dominion.game.card.action;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONObject;
import net.ultradev.dominion.game.Turn;
import net.ultradev.dominion.game.card.Card;
import net.ultradev.dominion.game.player.Player;

public abstract class Action {
	
	public enum AmountType { CHOOSE_AMOUNT, SPECIFIC_AMOUNT, UNTIL, RANGE, SELF };
	public enum ActionTarget { EVERYONE, OTHERS, SELF };
	
	private List<Action> callbacks;
	private String identifier, description;
	private ActionTarget target;
	
	/**
	 * Keeps track of which card triggered the action for subactions
	 */
	private Map<Player, Card> triggers;
	
	public Action(String identifier, String description, ActionTarget target) {
		this.identifier = identifier;
		this.description = description;
		this.callbacks = new ArrayList<>();
		this.target = target;
		this.triggers = new HashMap<>();
	}
	
	public String getIdentifier() {
		return identifier;
	}
	
	public String getDescripton() {
		return description;
	}
	
	public List<Action> getCallbacks() {
		return callbacks;
	}
	
	public ActionTarget getTarget() {
		return target;
	}
	
	public void addCallback(Action action) {
		callbacks.add(action);
	}

	public void setTrigger(Player player, Card card) {
		triggers.put(player, card);
	}
	
	public boolean hasTrigger(Player player) {
		return triggers.containsKey(player);
	}
	
	public Card getTrigger(Player player) {
		return triggers.get(player);
	}
	
	public void removeTrigger(Player player) {
		if(hasTrigger(player)) {
			triggers.remove(player);
		}
	}
	
	public JSONObject finish(Turn turn) {
		return finish(turn, turn.getPlayer());
	}
	
	public boolean isMultiTargeted() {
		return target.equals(ActionTarget.EVERYONE) || target.equals(ActionTarget.OTHERS);
	}
	
	public boolean isCompleted(Turn turn) {
		return true;
	}
	
	/**
	 * @param turn Used when breaking out of a slave action
	 * @return 
	 */
	public JSONObject finish(Turn turn, Player player) { 
		return new JSONObject()
					.accumulate("response", "OK")
					.accumulate("result", ActionResult.DONE);
	}
		
	public abstract JSONObject play(Turn turn, Card card);

	public JSONObject selectCard(Turn turn, Card card) {
		return turn.getGame().getGameServer().getGameManager().getInvalid("Cannot select a card for this action");
	}
	
}
