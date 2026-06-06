To run the game you first need to install [npm](https://www.npmjs.com/) and [vite](https://formulae.brew.sh/formula/vite). Then run the following code:
`npm run dev`

***GAME DESCRIPTION***
----------------------
CAPTR is a turn-based card combat game on a 6x6 grid. The player spends tokens to move around the board or use cards against enemies. Enemies move each turn, can merge together, and damage the player when they collide with them. Defeating enemies gives the player CAPTR dollars and XP. CAPTR dollars can be used to upgrade cards, token space, and max health.

***TODO***
----------
- [ ] Implement feature in card selection menu where you can unlock different card tiers to choose. They turn a little brighter with a dollar symbol (like the one we already have but styled/colored like the lock symbool is) with how much it is to upgrade. (Tier II: 250 Tier III: 1500 Tier IV: 5000). As you level up Novice I, Novice II, Novice III. You will unlock the tiers to be able to purchase. Novice II you unlock second tier. Novice III you unlock third tier. Novice IV you unlock fourth tier.
    - [ ] You earn dollars by killing enemies. Implement a feature where every time you kill an enemy you get more dollars (you start with 100, these dollars already exist).
- [x] Fix zoom of screen at some point. Also fix when you zoom in web page it scales the spacing and it looks strange. (Should this even try to be fixed?)
- Maybe even just force full screen or something idk.
- [ ] Then implement the Bomb card which will let the player attack all enemies in a circle around the player
- [ ] Some type of leveling up feature.  
- [ ] Some type of difficulty based on their level. (maybe only applied at the start), Possibly some other type of difficulty based on the progress just in that match  
- [ ] Put captr logo at the top for branding  
- [ ] Random position and level for enemies at startups  
- [ ] Convert to either Supabase, PocketBase, or any cloud database that has no read/write limits  
***FUNCTIONS***
---------------

**prevent(fn, defaultOnly)** 
> wraps a click/event handler so it can prevent default browser behavior and optionally stop event bubbling

**handleDollarIncrease()** 
> starts the CAPTR dollar increase animation

**handleDollarChangeAnimationEnd()** 
> resets the CAPTR dollar animation after it finishes

**handleLevelDecrease()** 
> starts the player health decrease animation

**handleLevelChangeAnimationEnd()** 
> resets the player health animation after it finishes

**getRandomNumber(max)** 
> generates a random number from 0 to max

**getIndexOfEnemyPosition(x,y)** 
> finds the index of the enemy at coordinate (x,y) inside the enemy position array

**handleCardClick(cardNum)** 
> gets called onClick with the parameter being the card number you clicked on

**handleDisplayClick(buttontype, cn)** 
> opens the correct popup/menu for card info, card upgrades, profile info, or token upgrades

**handleExitClick()** 
> closes the current popup/menu and returns the game mode back to normal

**checkAttack(x,y)** 
> checks if there is an enemy adjacent to the player

**handleCellClick(row,col)** 
> handles clicking on a cell(moving, attacking, etc...)

**getCoordinates(number)** 
> converts a position number(1-36) into a coordinate(x,y)

**getPosition(x,y)** 
> converts a coordinate(x,y) into a position number(1-36)

**checkAdjacentToPlayer(r,c)** 
> checks if (r,c) is adjacent to the player

**inSameRowAsPlayer(r,c)** 
> checks if (r,c) is in the same row as the player

**inSameColumnAsPlayer(r,c)** 
> checks if (r,c) is in the same column as the player

**isAroundPlayer(r,c)** 
> checks if (r,c) is in one of the 8 surrounding cells around the player

**checkIsEnemy(rw,cw)** 
> checks if (rw,cw) has an enemy in that cell

**checkStrike(x,y)** 
> checks if there is an enemy at any selected cell

**checkRanged(x,y)** 
> checks if there is an enemy in the same row or column as the player

**checkBomb(x,y)** 
> checks if there is an enemy in one of the cells surrounding the player

**attackEnemy(gm,x,y)** 
> applies card damage to the selected enemy, removes it if defeated, rewards CAPTR dollars and XP, heals the player if the card has healing, spends tokens, and resets game mode

**moveEnemy(direction,position)** 
> returns a new position number based on direction and position parameters

**movePlayer(ro,co)** 
> sets the player position to (ro,co) as long as there is no enemy in that cell and the player has enough tokens

**nextTurn()** 
> does a bunch of shit

**updateDatabase()** 
> updates the database to the new data, called after every turn

**resetGame()** 
> resets the match after the player dies, clears selected cards, saves the reset data, and sends the player to the next game screen

**upgradeCard(cn)** 
> upgrades one of the player's equipped cards if they have enough CAPTR dollars

**upgradeTokens(x)** 
> increases the player's max token space if they have enough CAPTR dollars

**upgradeMaxLevel(x)** 
> increases the player's max health if they have enough CAPTR dollars

***APP FUNCTIONS***
-------------------

**handleGoogleSignIn()** 
> signs the player in with Google and then loads or creates their saved user data

**fetchUser(u)** 
> checks Firestore for an existing user document and either creates a new user or retrieves saved data

**retrieveUserInfo(u)** 
> loads saved user data from Firestore into React state and sends the player to the correct screen

**removeGmailDomain(email)** 
> creates a username from a Gmail address by removing the @gmail.com part

**handleDisplayClick(buttontype)** 
> opens the user info screen from the card selection page

**handleCardClick(cardNum)** 
> selects or deselects an unlocked tier I card in the card selection menu

**getCardColorClass(cardNum)** 
> returns the card color class based on the card's tier position

**startGame(em)** 
> starts a new match with the 4 selected cards and saves the new game data

**handleGameReset()** 
> resets app-level game values after death and shows the NEXT GAME screen

**handleNextGame()** 
> sends the player from the NEXT GAME screen to the card selection menu

**createNewUser(u)** 
> creates a new Firestore user document and starts the player at the card selection screen

***COMPONENTS***
----------------

**Grid** 
> renders the main CAPTR game board, status bar, cards, popups, enemy movement, player actions, upgrades, and database updates

**ProgressBar** 
> displays a progress bar based on a width and percent value, used for XP/rank progress

**Player** 
> renders the player div

**Enemy** 
> renders the enemy div

**cardInfo** 
> stores all card names, token costs, damage values, healing values, upgrade costs, and descriptions

**NEW CARD SETUP**
------------------
1.  Add the card and it's tiers to the "Cards.jsx" file
2.  Edit handleCellClick function to do an action when the specific card is clicked on (checks the gameMode)
3.  If needed, make a checkNameOfCard function to check if the player can make that move

**CARDS**
---------
[TIER]  
  
DAMAGE    : How many damage points will be applied when using the card.  
TOKENCOST : How many tokens it costs to use the card once.  
100P      : Damage per 100 tokens.

RULES
> Tiers of cards should have exponential growth for their 100P number


**attack**
> Deals (DAMAGE) damage to an adjacent enemy.
> 100P = DAMAGE * FLOOR (10/TOKENCOST)

**steal**
> Deals (DAMAGE) damage to an adjacent enemy and heals (DAMAGE) to the player.

**strike**
[I]  
[II]  
[III]  
[IV]  

**bomb**
[I]  
[II]  
[III]  
[IV]  

***CHANGE LOG***
----------------

**Today**
> Added card selection before each new game.
> Added locked visuals for higher-tier cards.
> Added NEXT GAME screen after death.
> Reset game state when health reaches 0 or below.
> Fixed floating button positioning.
> Updated card selection to require 4 cards before starting.
