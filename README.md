to run the following code:
`npm run dev`
***HOW TO***

***TODO***
----------
- [ ] Then implement the Bomb card which will let the player attack all enemies in a circle around the player  
- [ ] Some type of leveling up feature.  
- [ ] Some type of difficulty based on their level. (maybe only applied at the start), Possibly some other type of difficulty based on the progress just in that match  
- [ ] Put captr logo at the top for branding  
- [ ] Random position and level for enemies at startups  
- [ ] Convert to either Supabase, PocketBase, or any cloud database that has no read/write limits  
***FUNCTIONS***
---------------

**getRandomNumber(max)** 
> generates a random number from 0 to max

**handleCardClick(cardNum)** 
> gets called onClick with the parameter being the card number you clicked on

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

**checkIsEnemy(rw,cw)** 
> checks if (rw,cw) has an enemy in that cell

**moveEnemy(direction,position)** 
> returns a new position number based on direction and position parameters

**movePlayer(ro,co)** 
> sets the player position to (ro,co) as long as there is no enemy in that cell and the player has enough tokens

**nextTurn()** 
> does a bunch of shit

**updateDatabase()** 
> updates the database to the new data, called after every turn

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
