package net.ultradev.dominion.servlets;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;
import net.ultradev.dominion.game.GameManager;
import net.ultradev.dominion.game.LocalGame;

/**
 * Servlet implementation class Test
 */
@WebServlet({ "/API", "/api" })
public class API extends HttpServlet {
	
	//Auto generated ID
	private static final long serialVersionUID = 1L;

	//AJAX CALLS
		// Create game > ?action=create&type=local
		// Game info > ?action=info&type=local
		// Set config > ?action=setconfig&type=local&key=players&value=4
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public API() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		res.setContentType("application/json");
		res.setCharacterEncoding("utf-8");
		
		if(req.getParameter("action") == null || req.getParameter("type") == null) {
			res.getWriter().append(new JSONObject()
									.accumulate("response", "invalid")
									.accumulate("reason", "Need a type & action").toString());
		}
		
		String type = req.getParameter("type").toLowerCase();
		if(type.equals("local")) {
			LocalGame g = LocalGame.getGame(req.getSession());
			res.getWriter().append(GameManager.handleLocalRequest(getParameters(req), g, req.getSession()).toString());
			return;
		}
		
		res.getWriter().append(new JSONObject()
				.accumulate("response", "invalid")
				.accumulate("reason", "Unhandled game type: " + type).toString());
	}
	
	public Map<String, String> getParameters(HttpServletRequest req) {
		Map<String, String> params = new HashMap<>();
		for(String s : req.getParameterMap().keySet())
			params.put(s, req.getParameter(s));
		return params;
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}