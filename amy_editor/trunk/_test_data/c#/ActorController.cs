using System;
using System.Drawing;

using game;

namespace game.controller {

	public interface ActorController {

		void decidePressed(Actor actor);
		void cancelPressed(Actor actor);
	}
}