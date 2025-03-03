import React, { useRef, useState } from 'react';
import "./Grid.css"
import { Player } from './Player';
import { db } from '../firebaseConfig';
import { doc, setDoc, updateDoc } from "firebase/firestore"; 
import { cardInfo } from './Cards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretSquareDown, faCoins } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faHeartCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { faMoneyCheck } from '@fortawesome/free-solid-svg-icons';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar }  from './Progress';

export const Grid = ({pp}) => {
  
  //VARIABLES
  const SIZE = 36;
  const LEFT = 0;
  const RIGHT = 1;
  const UP = 2;
  const DOWN = 3;
  const MOVECOST = 2;
  const dollarChange = useRef();
  const levelChange = useRef();
  
  //ANIMATIONS
  const handleDollarIncrease = () => {dollarChange.current.style.animation="2s ease-in-out 0s 1 dollarIncrease";}
  const handleDollarChangeAnimationEnd = () => {dollarChange.current.style.animation = "none";}
  const handleLevelDecrease = () => {levelChange.current.style.animation = "2s ease-in-out 0s 1 levelDecrease";}
  const handleLevelChangeAnimationEnd = () => {levelChange.current.style.animation = "none";}

  const [maxPlayerTokens, setmaxPlayerTokens] = useState(pp.mt);
  const [gameMode, setGameMode] = useState(0);
  const [playerPosition, setPlayerPosition] = useState([pp.px, pp.py]);
  const [maxEnemyLevel, setMaxEnemyLevel] = useState(pp.mel);
  const [playerTokens, setPlayerTokens] = useState(pp.mt)
  const [playerLevel, setPlayerLevel] = useState(pp.pl)
  const [maxPlayerLevel, setMaxPlayerLevel] = useState(pp.mpl)
  const [enemyPos, setEnemyPos] = useState(pp.ep)
  const [enemyLevels, setEnemyLevels] = useState(pp.el)
  const [cards, setCards] = useState(pp.cards)
  const [email, setEmail] = useState(pp.em)
  const [turnCount, setTurnCount] = useState(pp.tc)
  const [cash, setCash] = useState(pp.cs)
  const [captrDollars, setCaptrDollars] = useState(pp.cd)
  const [cardInfoSelected, setCardInfoSelected] = useState(-1)
  const [username, setUsername] = useState(pp.un);
  const [xp, setXP] = useState(pp.xp)
  const [status, setStatus] = useState(pp.gs)

  //FUNCTIONS
  function prevent(fn, defaultOnly) {
    return (e, ...params) => {
        e && e.preventDefault()
        !defaultOnly && e && e.stopPropagation()
        fn(e, ...params)
    }
  }

  function getRandomNumber(max) {
    return Math.floor(Math.random() * max);
  }

  function getIndexOfEnemyPosition(x,y){
    return enemyPos.indexOf(getPosition(x,y)+1);
  }

  function getCoordinates(number){
    const a = (number - 1) % 6;
    const b = Math.floor((number - 1) / 6);
    return { a: a, b: b };
  }

  function getPosition(x,y){
    return x+y*6;
  }

  function handleCardClick(cardNum){
    if(gameMode===cardNum+1){
      setGameMode(0);
    }else{
      if(playerTokens>=cardInfo[cardNum].TokenCost){
        setGameMode(cardNum+1);
      }else{
        
      }
    }
  }

  function handleCellClick(row, col) {
    if(row === playerPosition[0] && col===playerPosition[1]){
      console.log("CLICKED THE PLAYER")
      //SET GAME MODE TO -5
      setGameMode(-5)
    }else{
      if(gameMode===0){
        if (checkAdjacentToPlayer(row,col)){
            movePlayer(row,col)
        }
      }else if(gameMode>=1 && gameMode<=4){
        //ATTACK
        if(checkAttack(row,col)){
          attackEnemy(gameMode, row, col)
        }
      }else if(gameMode>=5 && gameMode<=8){
        //STEAL
        if(checkAttack(row,col)){
          attackEnemy(gameMode, row, col)
        }
      }else if(gameMode>=9 && gameMode<=12){
        //STRIKE
        if(checkStrike(row,col)){
          attackEnemy(gameMode, row, col)
        }
      }else if(gameMode>=13 && gameMode<=16){
        //THIEF
        if(checkStrike(row,col)){
          attackEnemy(gameMode, row, col)
        }
      }else if(gameMode>=17 && gameMode<=20){
        //THIEF
        if(checkRanged(row,col)){
          attackEnemy(gameMode, row, col)
        }
      }else if(gameMode>=21 && gameMode<=24){
        //THIEF
        if(checkBomb(row,col)){
          attackEnemy(gameMode, row, col)
        }
      }else if(row === playerPosition[0] && col===playerPosition[1]){
        console.log("CLICKED THE PLAYER")
      }
    } 
  }

  function handleDisplayClick(buttontype,cn){
    
    if(buttontype==="info"){
      setGameMode(-1);
      setCardInfoSelected(cn);
    }else if (buttontype==="upgrade"){
      
      if((cards[cn]+1)%4==0){
        
      }else{
        setGameMode(-2);
        setCardInfoSelected(cn);
      }
    }else if (buttontype==="profile"){
      setGameMode(-3);
    }else if (buttontype==="token"){
      setGameMode(-4);
    };

  }

  function handleExitClick(){
    setGameMode(0);
  }

  function checkAdjacentToPlayer(r,c){
    return (r === playerPosition[0] && Math.abs(c - playerPosition[1]) === 1) || 
    (c === playerPosition[1] && Math.abs(r - playerPosition[0]) === 1)
  }

  function inSameRowAsPlayer(r,c){
    return(r===playerPosition[0]);
  }

  function inSameColumnAsPlayer(r,c){
    return(c===playerPosition[1]);
  }

  function isAroundPlayer(r,c){
    if(r===playerPosition[0] && c===(playerPosition[1]+1)
    || r===playerPosition[0] && c===(playerPosition[1]-1)
    || r===playerPosition[0]+1 && c===(playerPosition[1])
    || r===playerPosition[0]-1 && c===(playerPosition[1])
    || r===playerPosition[0]+1 && c===(playerPosition[1]+1)
    || r===playerPosition[0]-1 && c===(playerPosition[1]-1)
    || r===playerPosition[0]+1 && c===(playerPosition[1]-1)
    || r===playerPosition[0]-1 && c===(playerPosition[1]+1))
    {
      return true;
    }else{
      return false;
    }
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

  function checkAttack(x,y){
    if(checkAdjacentToPlayer(x,y)){
      if(checkIsEnemy(x,y)){
        return true;
      }
    }
    return false;
  }

  function checkStrike(x,y){
    if(checkIsEnemy(x,y)){
      return true;
    }
    return false;
  }

  function checkRanged(x,y){
    if(inSameRowAsPlayer(x,y) || inSameColumnAsPlayer(x,y)){
      if(checkIsEnemy(x,y)){
        return true;
      }
    }
    return false;
  }

  function checkBomb(x,y){
    if(isAroundPlayer(x,y)){
      if(checkIsEnemy(x,y)){
        return true;
      }
    }
  }

  function attackEnemy(gm, x,y){
    const tokens = cardInfo[gm-1].TokenCost; //1-4
    const dmg = cardInfo[gm-1].Damage;
    let enPos = getIndexOfEnemyPosition(x,y);
    const unattackedEnemyPos = enemyPos;
    const unattackedEnemyLevels = enemyLevels;
    let playerNewDollars = captrDollars;
    let playerNewXP = xp;
    let healthOfEnemy = enemyLevels[enPos];
    if(healthOfEnemy<dmg){
      
    }else{
      healthOfEnemy=dmg;
    }
    unattackedEnemyLevels[enPos] = unattackedEnemyLevels[enPos]-dmg;

    if(unattackedEnemyLevels[enPos]<=0){
      playerNewDollars = captrDollars+dmg;
      playerNewXP = xp+(dmg*10);
      handleDollarIncrease();
      const a = unattackedEnemyPos.splice(enPos, 1)
      const b = unattackedEnemyLevels.splice(enPos, 1)
    }

    setEnemyPos(unattackedEnemyPos);
    setEnemyLevels(unattackedEnemyLevels);
    if(playerLevel  + cardInfo[gm-1].Heal >= maxPlayerLevel){
      setPlayerLevel(maxPlayerLevel);
    }else{
      setPlayerLevel(playerLevel + cardInfo[gm-1].Heal)
    }
    setPlayerPosition([playerPosition[0],playerPosition[1]]);
    setPlayerTokens(playerTokens-tokens);
    setCaptrDollars(playerNewDollars);
    setXP(playerNewXP);
    setGameMode(0);
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
      captrdollars: captrDollars,
      username: `${username}`,
      xp: xp,
      status: "Game"
    });
  }

  function nextTurn(){
    const direction = getRandomNumber(4);
    const uniquePos = [];
    const uniqueLevels = [];
    let newEnemyPos = []
    let newEnemyLevel = []
    let newMaxEnemyLevel = maxEnemyLevel;
    let iter = 0;
    let enemyCollided = 0;
    let randPos = getRandomNumber(36);
    let chance = 0;

    if(turnCount<25){
      chance = getRandomNumber(16)+1;
    }else if(turnCount<50){
      chance = getRandomNumber(22)+1;
    }else if(turnCount<100){
      chance = getRandomNumber(28)+1;
    }else if(turnCount<200){
      chance = getRandomNumber(36)+1;
    }
    
    //PLAYER COLLISION DETECTION AND MOVE ENEMY IF THERE IS NO COLLISION DETECTION
    for(let i=0; i<enemyPos.length; i++){
      let newPosition = enemyPos[i] + moveEnemy(direction, enemyPos[i]);
      if(getCoordinates(newPosition).a === playerPosition[0] && getCoordinates(newPosition).b === playerPosition[1]){
        setPlayerLevel(playerLevel-enemyLevels[i])
        handleLevelDecrease();
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
        enemyCollided+=1;
      }
    }

    //SPAWN 50% CHANCE CHANGE THIS

    let enemyCount = enemyPos.length;

    console.log(chance);
    console.log(chance);
    console.log(enemyCount);
    if(chance >= enemyCount){
      let a = true;
      
      while(a && enemyCount<=32){
        randPos = getRandomNumber(36);
        if(uniquePos.indexOf(randPos) === -1 && !(getCoordinates(randPos).a === playerPosition[0] && getCoordinates(randPos).b === playerPosition[1])){
          uniquePos.push(randPos)
          uniqueLevels.push(getRandomNumber(maxEnemyLevel)+1)
          a = false;
        }else{

        }
      }
    }
    if(enemyCollided>0){
      for(let i = 0; i < enemyCollided; i ++){
        randPos = getRandomNumber(36);
        if(uniquePos.indexOf(randPos) === -1 && !(getCoordinates(randPos).a === playerPosition[0] && getCoordinates(randPos).b === playerPosition[1])){
          uniquePos.push(randPos)
          uniqueLevels.push(getRandomNumber(maxEnemyLevel)+1)
        }
      }
      enemyCollided = 0;
    }else{

    }
    
    //SETS NEW ENEMY LOCATIONS AND LEVELS AND RESETS PLAYERS TOKENS
    setEnemyLevels(uniqueLevels);
    setEnemyPos(uniquePos);
    setPlayerTokens(maxPlayerTokens);
    setTurnCount(turnCount+1);
    setXP(xp+5);
    if(turnCount==10){
      newMaxEnemyLevel+=1;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }else if(turnCount==10){
      newMaxEnemyLevel+=1;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }else if(turnCount==30){
      newMaxEnemyLevel+=1;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }else if(turnCount==40){
      newMaxEnemyLevel+=1;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }else if(turnCount==50){
      newMaxEnemyLevel+=1;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }else if(turnCount==100){
      newMaxEnemyLevel+=5;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }else if(turnCount==150){
      newMaxEnemyLevel+=10;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }else if(turnCount==200){
      newMaxEnemyLevel+=20;
      setMaxEnemyLevel(newMaxEnemyLevel);
    }
    
    //!!!Will Have To Update This With The New Locations Because Someone Could Manipulate The Fact That It Takes The Last Position Before Hitting Next Turn
    updateDatabase();
  }

  function upgradeCard(cn){
    //CHANGE THIS TO VARIABLE FOR UPGRADE COST
    const cardUpgradeCost=cardInfo[cards[cn]].UpgradeCost;
    if(captrDollars>=cardUpgradeCost){
      let ci = cards;
      ci[cn]=ci[cn]+1
      setCards(ci);
      setCaptrDollars(captrDollars-cardUpgradeCost);
      setGameMode(0);
    }else{
      //INSUFFICIENT FUNDS NOTIFICATION OF SOME SORT
    }
    
    

  }

  function upgradeTokens(x){
    if(captrDollars >= ((maxPlayerTokens)*5)){
      setGameMode(0);
      setmaxPlayerTokens(x);
      setCaptrDollars(captrDollars-((maxPlayerTokens)*5))
    }
  }

  function upgradeMaxLevel(x){
    if(captrDollars >= 10){
      setMaxPlayerLevel(x);
      setCaptrDollars(captrDollars-10);
      setGameMode(0);
      //setPlayerLevel(playerLevel + 1);
    }
    
  }

  //GAME LOOP
  const rows = [];
  let cellColor = 0;
  let iteration = 0;
  let card1Classes = ["card","card1","carddeselected"];
  let card2Classes = ["card","card2","carddeselected"];
  let card3Classes = ["card","card3","carddeselected"];
  let card4Classes = ["card","card4","carddeselected"];

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
      if (checkAdjacentToPlayer(i,j) && gameMode===0){
        if(checkIsEnemy(i,j) || playerTokens<MOVECOST){
        }else{
          cellClasses.push('adjacent')
        }
      }

      //ATTACKING AN ADJACENT ENEMY
      if (checkAttack(i,j) && gameMode>0 && gameMode <=8){
        if(playerTokens<cardInfo[gameMode-1].TokenCost){
        }else{
          cellClasses.push('adjacent')
        }
      }

      //STRIKING ANY ENEMY
      if (checkStrike(i,j) && gameMode>=9 && gameMode <=16){
        if(playerTokens<cardInfo[gameMode-1].TokenCost){
        }else{
          cellClasses.push('adjacent')
        }
      }

      //RANGING AN ENEMY
      if (checkRanged(i,j) && gameMode>=17 && gameMode <=20){
        if(playerTokens<cardInfo[gameMode-1].TokenCost){ 
        }else{
          cellClasses.push('adjacent')
        }
      }

      //BOMB AN ENEMY
      if (checkBomb(i,j) && gameMode>=21 && gameMode <=24){
        if(playerTokens<cardInfo[gameMode-1].TokenCost){ 
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
        {contentClasses.join(' ') == "player" ? 
        <><div className={contentClasses.join(' ')} ref={levelChange} onAnimationEnd={handleLevelChangeAnimationEnd}>{cellContent}</div></> 
        : <><div className={contentClasses.join(' ')}>{cellContent}</div></>
        }
         </div>
      );
    }

    //RENDER ALL THE ROWS WITH CELLS INSIDE THEM
    rows.push(
      <div className="row" key={i}>
        {cells}
      </div>
    );

    if((gameMode-1)===cards[0]){
      card1Classes.pop()
      card1Classes.push("cardselected")
    }
    if((gameMode-1)===cards[1]){
      card2Classes.pop()
      card2Classes.push("cardselected")
    }
    if((gameMode-1)===cards[2]){
      card3Classes.pop()
      card3Classes.push("cardselected")
    }
    if((gameMode-1)===cards[3]){
      card4Classes.pop()
      card4Classes.push("cardselected")
    }
  }

  //RENDERS THE PAGE
  return (
    <>   
    {gameMode===-1?(//INFOBUTTON
        <>
          <div className="noticecontainer" onClick={() => handleExitClick()}>
            <div className="noticeinfocircle">i</div>
            <div className="noticecardinfocontainer">
              <div className="noticecardinfoname">{cardInfo[cards[cardInfoSelected]].Name}</div>
              <div className="noticecardstats">
                <div className="noticecardinfocostamount-icon"><FontAwesomeIcon icon={faCircle} /></div>
                <div className="noticecardinfocostamount">{cardInfo[cards[cardInfoSelected]].TokenCost}</div>
                <div className="noticecardinfodamageamount-icon"><FontAwesomeIcon icon={faBolt} /></div>
                <div className="noticecardinfodamageamount">{cardInfo[cards[cardInfoSelected]].Damage}</div>
                <div className="noticecardinfohealamount-icon"><FontAwesomeIcon icon={faHeartCirclePlus} /></div>
                <div className="noticecardinfohealamount">{cardInfo[cards[cardInfoSelected]].Damage}</div>
              </div>
            </div>
            <div className="noticecarddescription">{cardInfo[cards[cardInfoSelected]].Description}</div>            
            <div className="noticedismiss">CLICK ANYWHERE TO DISMISS</div>
          </div>
        </>
      ):gameMode===-2?(//UPGRADEBUTTON
        <>
          <div className="noticecontainer" >
            <div className="noticeinfocircle-upgrade"><span className="noticefacoins-upgrade"><FontAwesomeIcon icon={faCoins}/></span></div>
            <div className="noticecardinfocontainer">
              <div className="noticecardinfoname">{cardInfo[cards[cardInfoSelected]+1].Name}</div>
              <div className="noticecardstats">
                <div className="noticecardinfocostamount-icon"><FontAwesomeIcon icon={faCircle} /></div>
                <div className="noticecardinfocostamount">{cardInfo[cards[cardInfoSelected]+1].TokenCost}</div>
                <div className="noticecardinfodamageamount-icon"><FontAwesomeIcon icon={faBolt} /></div>
                <div className="noticecardinfodamageamount">{cardInfo[cards[cardInfoSelected]+1].Damage}</div>
                <div className="noticecardinfohealamount-icon"><FontAwesomeIcon icon={faHeartCirclePlus} /></div>
                <div className="noticecardinfohealamount">{cardInfo[cards[cardInfoSelected]+1].Heal}</div>
              </div>
            </div>
            
            <div className="noticecarddescription">WOULD YOU LIKE TO UPGRADE TO {cardInfo[cards[cardInfoSelected]+1].Name} FOR <span className="noticefacoins"><FontAwesomeIcon icon={faCoins}/></span> {cardInfo[cards[cardInfoSelected]].UpgradeCost}?</div>
            <div className="noticebuttons">
              <div className="noticebuttonyes" onClick={() => upgradeCard(cardInfoSelected)}>YES</div>
              <div className="noticebuttonno" onClick={() => handleExitClick()}>NO</div>
            </div>
            
          </div>
        </>
      ):gameMode===-3?(//USERBUTTON
        <>
          <div className="noticecontainer" onClick={() => handleExitClick()}> 
            <div className="noticeinfocircle-profile"><span className="noticeprofile"><FontAwesomeIcon icon={faUser}/></span></div>
            <div className="noticecardinfocontainer">
              <div className="noticecardinfoname">{username}</div>
              <div className="break"></div>
              <div className="noticecardinfoname">{xp < 50 ? <> <div className="rankcontainer"><div className="circlerank"><span className="rankicon"><FontAwesomeIcon icon={faCaretDown}/></span></div><div className="noticeprofileranktext">NOVICE I</div></div> <ProgressBar width={120} percent = {0}/></>
                                                  :xp <= 1000 ? <> <div className="rankcontainer"><div className="circlerank"><span className="rankicon"><FontAwesomeIcon icon={faCaretDown}/></span></div><div className="noticeprofileranktext">NOVICE I</div></div> <ProgressBar width={120} percent = {xp/1000}/></>
                                                  :xp <= 2000 ? <><div className="rankcontainer"><div className="circlerank"><span className="rankicon"><FontAwesomeIcon icon={faCaretDown}/></span></div><div className="noticeprofileranktext">NOVICE II</div></div> <ProgressBar width={120} percent={(xp-1000)/1000}/></>
                                                  :xp <= 4000 ? <><div className="rankcontainer"><div className="circlerank"><span className="rankicon"><FontAwesomeIcon icon={faCaretDown}/></span></div><div className="noticeprofileranktext">NOVICE III</div></div> <ProgressBar width={120} percent={(xp-2000)/2000}/></>
                                                  :xp <= 8000 ? <><div className="rankcontainer"><div className="circlerank"><span className="rankicon"><FontAwesomeIcon icon={faSort}/></span></div><div className="noticeprofileranktext">ADEPT I</div></div> <ProgressBar width={120} percent={(xp-4000)/4000}/></>
                                                  : xp <= 16000 ? <><div className="rankcontainer"><div className="circlerank"><span className="rankicon"><FontAwesomeIcon icon={faSort}/></span></div><div className="noticeprofileranktext">ADEPT II</div></div> <ProgressBar width={120} percent={(xp-8000)/8000}/></>
                                                  : xp <= 32000 ? <><div className="rankcontainer"><div className="circlerank"><span className="rankicon"><FontAwesomeIcon icon={faSort}/></span></div><div className="noticeprofileranktext">ADEPT III</div></div> <ProgressBar width={120} percent={(xp-16000)/16000}/></>
                                                  : xp <= 64000 ? <><FontAwesomeIcon icon={faUser} /><span>NOVICE IV</span> </>
                                                  : xp <= 128000 ? <><FontAwesomeIcon icon={faUser} /><span>PRO I</span> </>
                                                  : xp <= 256000 ? <><FontAwesomeIcon icon={faUser} /><span>PRO II</span> </>
                                                  : xp <= 512000 ? <><FontAwesomeIcon icon={faUser} /><span>PRO III</span> </>
                                                  : xp <= 1024000 ? <><FontAwesomeIcon icon={faUser} /><span>PRO IV</span> </>
                                                  :"WTF BRO"
                                                ``} </div>  
                                              
             <div className="cashcontainer"><div className="cashsymbol"><FontAwesomeIcon icon={faMoneyCheck} /></div><div className="noticecardinfoname">{cash}</div></div>
            </div>
            <div className="noticedismiss">CLICK ANYWHERE TO DISMISS</div>
          </div>
        </>
      ):gameMode===-4?(//TOKENBUTTON
        <>     
          <div className="noticecontainer-token" >
            <div className="noticeinfocircle-upgrade"><span className="noticefacoins-upgrade"><FontAwesomeIcon icon={faCoins}/></span></div>
            <div className="noticecarddescription-tokens">WOULD YOU LIKE TO UPGRADE YOUR TOKEN SPACE TO <span className="noticefatokenupgrade-icon"><FontAwesomeIcon icon={faCircle}/></span> {maxPlayerTokens+1} FOR <span className="noticefatokenupgrade-icontokens"><FontAwesomeIcon icon={faCoins}/></span> {maxPlayerTokens*5}?</div>
            <div className="noticebuttons">
              <div className="noticebuttonyes" onClick={() => upgradeTokens(maxPlayerTokens)}>YES</div>
              <div className="noticebuttonno" onClick={() => handleExitClick()}>NO</div>
            </div>
          </div>
        </>
      ):gameMode===-5?(//UPGRADEMAXHEALTH
        <>     
          <div className="noticecontainer-token" >
            <div className="noticeinfocircle-upgrade"><span className="noticefacoins-upgrade"><FontAwesomeIcon icon={faCoins}/></span></div>
            <div className="noticecarddescription-tokens">WOULD YOU LIKE TO UPGRADE YOUR MAX HEALTH TO <span className="noticecardinfohealamount-icon"><FontAwesomeIcon icon={faHeartCirclePlus}/></span> {maxPlayerLevel+1} FOR <span className="noticefatokenupgrade-icontokens"><FontAwesomeIcon icon={faCoins}/></span> 10?</div>
            <div className="noticebuttons">
              <div className="noticebuttonyes" onClick={() => upgradeMaxLevel(maxPlayerLevel+1)}>YES</div>
              <div className="noticebuttonno" onClick={() => handleExitClick()}>NO</div>
            </div>
          </div>
        </>
      ):(
        <>
        <div className="status-bar">
          <div className="user-box" onClick={prevent(()=>handleDisplayClick("profile",0))}><div className="usericon" ><FontAwesomeIcon icon={faUser} /></div></div>
          <div className="token-container" onClick={prevent(()=>handleDisplayClick("token",0))}><div className="token-circle"><FontAwesomeIcon icon={faCircle} /></div><div className="token-text">{playerTokens==0 ? '--' : playerTokens}/{maxPlayerTokens}</div></div>
          <div className="captrdollars-container">
          <div className="captrdollars-icon" ><FontAwesomeIcon icon={faCoins} /></div>
          <div className="captrdollars-text" ref={dollarChange} onAnimationEnd={handleDollarChangeAnimationEnd}>{captrDollars}</div></div>
          <div className="nextturn-box" onClick={() => nextTurn()} >
            <div className="nextturn-text">
              NEXT <br></br>TURN
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
          <div className={card1Classes.join(' ')} onClick={() => handleCardClick(cards[0])}>  
            <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle} /></div>
            <div className="cardtokencost">{cardInfo[cards[0]].TokenCost}</div> 
            <div className="cardname">{cardInfo[cards[0]].Name}</div>
            <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",0))}>i</button>
            <div className="cardupgradebutton" onClick={prevent(()=>handleDisplayClick("upgrade",0))}><span><FontAwesomeIcon icon={faCoins}/></span></div>      </div>
          <div className={card2Classes.join(' ')} onClick={() => handleCardClick(cards[1])}> 
            <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
            <div className="cardtokencost">{cardInfo[cards[1]].TokenCost}</div> 
            <div className="cardname">{cardInfo[cards[1]].Name}</div>
            <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",1))}>i</button>
            <div className="cardupgradebutton" onClick={prevent(()=>handleDisplayClick("upgrade",1))}><span><FontAwesomeIcon icon={faCoins}/></span></div>      </div>
          <div className={card3Classes.join(' ')} onClick={() => handleCardClick(cards[2])}> 
            <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
            <div className="cardtokencost">{cardInfo[cards[2]].TokenCost}</div> 
            <div className="cardname">{cardInfo[cards[2]].Name}</div>
            <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",2))}>i</button>
            <div className="cardupgradebutton" onClick={prevent(()=>handleDisplayClick("upgrade",2))}><span><FontAwesomeIcon icon={faCoins}/></span></div>      </div>
          <div className={card4Classes.join(' ')} onClick={() => handleCardClick(cards[3])}> 
            <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
            <div className="cardtokencost">{cardInfo[cards[3]].TokenCost}</div> 
            <div className="cardname">{cardInfo[cards[3]].Name}</div>
            <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",3))}>i</button>
            <div className="cardupgradebutton" onClick={prevent(()=>handleDisplayClick("upgrade",3))}><span><FontAwesomeIcon icon={faCoins}/></span></div>
          </div>
        </div>
        </>
    )}
    </>
  );


}
