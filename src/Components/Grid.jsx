import React, { useState } from 'react';
import "./Grid.css"
import { Player } from './Player';
import { db } from '../firebaseConfig';
import { doc, setDoc, updateDoc } from "firebase/firestore"; 
import { cardInfo } from './Cards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'

export const Grid = ({pp}) => {
  
  //VARIABLES
  const SIZE = 36;
  const LEFT = 0;
  const RIGHT = 1;
  const UP = 2;
  const DOWN = 3;
  const MOVECOST = 2;
  
  const [maxPlayerTokens, setmaxPlayerTokens] = useState(pp.mt);
  const [gameMode, setGameMode] = useState(0);
  const [playerPosition, setPlayerPosition] = useState([pp.px, pp.py]);
  const [maxEnemyLevel, setMaxEnemyLevel] = useState(pp.mel);
  const [playerTokens, setPlayerTokens] = useState(pp.mt)
  const [playerLevel, setPlayerLevel] = useState(pp.pl)
  const [enemyPos, setEnemyPos] = useState(pp.ep)
  //const [enemyPos, setEnemyPos] = useState([7,28,15,3])
  const [enemyLevels, setEnemyLevels] = useState(pp.el)
  const [cards, setCards] = useState(pp.cards)
  const [email, setEmail] = useState(pp.em)
  const [turnCount, setTurnCount] = useState(pp.tc)
  const [cash, setCash] = useState(pp.cs)
  const [captrDollars, setCaptrDollars] = useState(pp.cd)

  //FUNCTIONS
  function getRandomNumber(max) {
    return Math.floor(Math.random() * max);
  }

  function handleCellClick(row, col) {
    if(gameMode===0){
      if (checkAdjacentToPlayer(row,col)) {
        movePlayer(row,col)
      }
    }
  }

  function getCoordinates(number){
    const a = (number - 1) % 6;
    const b = Math.floor((number - 1) / 6);
    return { a: a, b: b };
  }

  function getPosition(x,y){
    return x+y*6;
  }

  function checkAdjacentToPlayer(r,c){
    return (r === playerPosition[0] && Math.abs(c - playerPosition[1]) === 1) || 
    (c === playerPosition[1] && Math.abs(r - playerPosition[0]) === 1)
  }

  function checkIsEnemy(rw,cw){
    for(let count = 0; count < enemyPos.length; count++){
      let co = getCoordinates(enemyPos[count])
      let xco = co.a;
      let yco = co.b;
      if (rw === xco && Math.abs(cw) === yco){return true;}
    }
    return false
  }

  function moveEnemy(direction, position){
    if(direction==LEFT){if((position-1)%6==0){return 0;}else{return -1;}}
    if(direction==RIGHT){if((position)%6==0){return 0;}else{return 1;}}
    if(direction==UP){if((position-6)<=0){return 0;}else{return -6;}}
    if(direction==DOWN){if((position+6)>36){return 0;}else{return 6;}}
  }

  function movePlayer(ro,co){
    if (playerTokens<2 || checkIsEnemy(ro,co)){
    }else{
      setPlayerPosition([ro, co]);
      setPlayerTokens(playerTokens-MOVECOST);
    }
  }

  const updateDatabase = async () => {
    await updateDoc(doc(db, "users", `${email}`), {
      email: `${email}`,
      cards: [cards[0],cards[1],cards[2],cards[3]],
      maxtokens: maxPlayerTokens,
      playerlevel: playerLevel,
      playerposition: [playerPosition[0],playerPosition[1]],
      enemylevels: enemyLevels,
      enemyposition: enemyPos,
      turncount: turnCount,
      cash: cash,
      maxenemyLevel: maxEnemyLevel,
      captrdollars: captrDollars
    });
  }

  //GETS CALLED WHEN THE NEXT TURN BUTTON IS CLICKED. MOVES ENEMIES AND RESETS PLAYER TOKENS
  function nextTurn(){
    const direction = getRandomNumber(4);
    const uniquePos = [];
    const uniqueLevels = [];
    let newEnemyPos = []
    let newEnemyLevel = []
    let iter = 0;
    const randPos = getRandomNumber(36);
    const chance = getRandomNumber(4)+1;

    //PLAYER COLLISION DETECTION
    for(let i=0; i<enemyPos.length; i++){
      let newPosition = enemyPos[i] + moveEnemy(direction, enemyPos[i]);
      if(getCoordinates(newPosition).a === playerPosition[0] && getCoordinates(newPosition).b === playerPosition[1]){
        setPlayerLevel(playerLevel-enemyLevels[i])
      }else{
        newEnemyPos[iter] = newPosition;
        newEnemyLevel[iter] = enemyLevels[i];
        iter+=1;
      }
    }

    //REMOVES DUPLICATES FROM ENEMYS
    for (let i = 0; i < newEnemyPos.length; i++) {
      if (uniquePos.indexOf(newEnemyPos[i]) === -1) {
        uniquePos.push(newEnemyPos[i]);
        uniqueLevels.push(newEnemyLevel[i]);
      }else{
        uniqueLevels[uniquePos.indexOf(newEnemyPos[i])]+=newEnemyLevel[i];
      }
    }

    //SPAWN 25% CHANCE
    if(chance===3){
      if(uniquePos.indexOf(randPos) === -1 && !(getCoordinates(randPos).a === playerPosition[0] && getCoordinates(randPos).b === playerPosition[1])){
        uniquePos.push(randPos)
        uniqueLevels.push(getRandomNumber(maxEnemyLevel)+1)
      }
    }
    
    //SETS NEW ENEMY LOCATIONS AND LEVELS AND RESETS PLAYERS TOKENS
    setEnemyLevels(uniqueLevels);
    setEnemyPos(uniquePos);
    setPlayerTokens(maxPlayerTokens);
    setTurnCount(turnCount+1);
    
    //!!!Will Have To Update This With The New Locations Because Someone Could Manipulate The Fact That It Takes The Last Position Before Hitting Next Turn
    updateDatabase();
  }


  //GAME LOOP
  const rows = [];
  let cellColor = 0;
  let iteration = 0;
  
  for (let i = 0; i < 6; i++) {
    const cells = [];
    cellColor+=1;
    for (let j = 0; j < 6; j++) {
      let cellClasses = [];
      let contentClasses = [];
      let cellContent = null;
      cellColor+=1;
      
      //BOARD CORNERS STYLING
      if(j===0 && i===0){cellClasses.push('topleft')}
      if(j===5 && i===0){cellClasses.push('bottomleft')}
      if(j===0 && i===5){cellClasses.push('topright')}
      if(j===5 && i===5){cellClasses.push('bottomright')}

      //ADJACENT TO PLAYER STYLING
      if (checkAdjacentToPlayer(i,j)){
        if(checkIsEnemy(i,j) || playerTokens<MOVECOST){
        }else{
          cellClasses.push('adjacent')
        }
      }

      cellClasses.push('cell')
      
      //GRID STYLING (ALTERNATING)
      if(cellColor%2===0){cellClasses.push('odd')}else{cellClasses.push('even')}
      
      //PLAYER POSITION STYLING
      if (i === playerPosition[0] && j === playerPosition[1]) {contentClasses.push('player');cellContent = playerLevel;}
      
      //ENEMY POSITION STYLINGS
      if(checkIsEnemy(i,j)){
        contentClasses.push('enemy');
        
        
        let val = getPosition(i,j)+1;
        let ind = enemyPos.indexOf(val)
        
        if(enemyLevels[ind]<10){
          contentClasses.push('five');
        }else if(enemyLevels[ind]>=10 && enemyLevels[ind]<20){
          contentClasses.push('ten');
        }else if(enemyLevels[ind]>=20){
          contentClasses.push('twenty');
        }

        cellContent = enemyLevels[ind];
      }

      //RENDER THE CELLS
      cells.push(
        <div
          className={cellClasses.join(' ')}
          key={`${i}-${j}`}
          onClick={() => handleCellClick(i, j)}
        >
        <div className={contentClasses.join(' ')}>{cellContent}</div>
        </div>
      );
    }

    //RENDER ALL THE ROWS WITH CELLS INSIDE THEM
    rows.push(
      <div className="row" key={i}>
        {cells}
      </div>
    );
  
  }

  //RENDERS THE PAGE
  return (
    <>    
    <div className="status-bar">
      <div className="user-box"><FontAwesomeIcon icon={faUser} /></div>
      <div className="token-circle"><FontAwesomeIcon icon={faCircle} /></div>
      <div className="token-text">{playerTokens}/{maxPlayerTokens}</div>
      <div className="captrdollars-icon"><FontAwesomeIcon icon={faCoins} /></div>
      <div className="captrdollars-text">{captrDollars}</div>
      <div className="nextturn-box" onClick={() => nextTurn()} >
        <div className="nextturn-text">
          NEXT TURN
        </div>
        <div className="nextturn-arrow">
          <FontAwesomeIcon icon={faCaretRight} />
        </div>
      </div>
    </div>
    
    <div className="grid">
      {rows}
    </div>

    <div className="card-container">
      <div className="card card1"> 
        <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
        <div className="cardtokencost">{cardInfo[cards[0]].TokenCost}</div> 
        <div className="cardname">{cardInfo[cards[0]].Name}</div>
        <button className="cardinfobutton">i</button>
        <div className="cardupgradebutton"><FontAwesomeIcon icon={faCoins}/></div>
      </div>
      <div className="card card2"> 
        <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
        <div className="cardtokencost">{cardInfo[cards[1]].TokenCost}</div> 
        <div className="cardname">{cardInfo[cards[1]].Name}</div>
        <button className="cardinfobutton">i</button>
        <div className="cardupgradebutton"><FontAwesomeIcon icon={faCoins}/></div>
      </div>
      <div className="card card3"> 
        <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
        <div className="cardtokencost">{cardInfo[cards[2]].TokenCost}</div> 
        <div className="cardname">{cardInfo[cards[2]].Name}</div>
        <button className="cardinfobutton">i</button>
        <div className="cardupgradebutton"><FontAwesomeIcon icon={faCoins}/></div>
      </div>
      <div className="card card4"> 
        <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
        <div className="cardtokencost">{cardInfo[cards[3]].TokenCost}</div> 
        <div className="cardname">{cardInfo[cards[3]].Name}</div>
        <button className="cardinfobutton">i</button>
        <div className="cardupgradebutton"><FontAwesomeIcon icon={faCoins}/></div>
      </div>
      
    </div>
    </>
  );


}
