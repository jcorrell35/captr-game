import { useState } from 'react'
import { Grid } from './Components/Grid'
import {auth, provider} from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { collection, addDoc, getDocs, setDoc, onSnapshot, getFirestore, query, where, doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import "./Components/Grid.css";
import GoogleLogo from './google.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretSquareDown, faCoins } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faHeartCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { faMoneyCheck } from '@fortawesome/free-solid-svg-icons';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar }  from './Components/Progress';
import { cardInfo } from './Components/Cards';

import selectCardSound from "./sfx/select_card.mp3";
import loginScreenSound from "./sfx/login_screen.mp3";
import nextGameSound from "./sfx/next_game.mp3";
import startGameSound from "./sfx/start_game.mp3";
import move_Sound from "./sfx/move.mp3";
import attack_Sound from "./sfx/attack.mp3";
import takeDamageSound from "./sfx/take_damage.mp3";
import kill_Sound from "./sfx/kill.mp3";
import gameOverSound from "./sfx/game_over.mp3";
import nextTurnSound from "./sfx/next_turn.mp3";

function App() {
  const [gameState, setgameState] = useState("Login"); //Login, Card, Game (SET THIS TO LOGIN TO TEST LOGIN SCREEN)
  const STARTING_GAME = {
    maxtokens: 4,
    playerlevel: 10,
    playerposition: [3,2],
    enemylevels: [2,2,1,1,2,1],
    enemyposition: [7,28,4,9,6,15],
    turncount: 0,
    cash: 100,
    maxenemylevel: 2,
    captrdollars: 10,
    maxplayerlevel: 10
  };

  //USERS DATA
  const [cards, setcards] = useState([])
  const [cash, setcash] = useState(100)
  const [email, setemail] = useState("captrgametest@gmail.com")
  const [enemylevels, setenemylevels] = useState([2,1,2,1,2,1,2])
  const [enemyposition, setenemyposition] = useState([5,6,25,28,27,2,14])
  const [maxenemylevel, setmaxenemylevel] = useState(2)
  const [maxtokens, setmaxtokens] = useState(10)
  const [maxplayerlevel, setmaxplayerlevel] = useState(10)
  const [playerlevel, setplayerlevel] = useState(10)
  const [playerposition, setplayerposition] = useState([0,0])
  const [status, setstatus] = useState("Card")
  const [captrdollars, setcaptrdollars] = useState(100)
  const [turncount, setturncount] = useState(0)
  const [username, setusername] = useState("captrgam")
  const [xp, setxp] = useState(0)
  const [user, setUser] = useState(0)

  //SOUNDS
  const select_cardSound = new Audio(selectCardSound); //implemented
  const login_screenSound = new Audio(loginScreenSound); //implemented
  const next_gameSound = new Audio(nextGameSound);
  const start_gameSound = new Audio(startGameSound); //implemented
  const moveSound = new Audio(move_Sound); //implemented
  const attackSound = new Audio(attack_Sound); //implemented
  const take_damageSound = new Audio(takeDamageSound);
  const killSound = new Audio(kill_Sound); //implemented
  const game_overSound = new Audio(gameOverSound); //implemented
  const next_turnSound = new Audio(nextTurnSound); //implemented, but need a sound effect file for it 
  select_cardSound.preload = 'auto';  // tells browser to load it immediately
  select_cardSound.load();
  start_gameSound.preload = 'auto';
  start_gameSound.load();
  moveSound.preload = 'auto';
  moveSound.load();
  attackSound.preload = 'auto';
  attackSound.load();
  take_damageSound.preload = 'auto';
  take_damageSound.load();
  killSound.preload = 'auto';
  killSound.load();
  game_overSound.preload = 'auto';
  game_overSound.load();
  next_turnSound.preload = 'auto';
  next_turnSound.load(); 

  const handleGoogleSignIn=()=>{
    signInWithPopup(auth, provider).then((result)=>{
      fetchUser(result.user);
    }).catch((err)=>{
      console.log(err);
    })
  }

  const fetchUser = async (u) => {
    const docRef = doc(db, "users", `${u.email}`);
    const docSnapshot = await getDoc(docRef);
    if(!docSnapshot.exists()){
      createNewUser(u);
    }else{
      retrieveUserInfo(docSnapshot.data());
    }     
  }

  const retrieveUserInfo = async (u) => {
    console.log("User Data: ", u)
    console.log(u.status)
    if(u.status=="Game"){
      setcards(u.cards || []);
      setcash(u.cash);
      setemail(u.email);
      setenemylevels(u.enemylevels);
      setenemyposition(u.enemyposition);
      setmaxenemylevel(u.maxenemyLevel);
      setmaxtokens(u.maxtokens);
      setplayerlevel(u.playerlevel);
      setplayerposition(u.playerposition);
      setstatus(u.status);
      setturncount(u.turncount);
      setcaptrdollars(u.captrdollars);
      setusername(u.username);
      setxp(u.xp);
      setmaxplayerlevel(u.maxplayerlevel);
      setgameState("Game");
    }else{
      setcards(u.cards || []);
      setcash(u.cash);
      setemail(u.email);
      setenemylevels(u.enemylevels);
      setenemyposition(u.enemyposition);
      setmaxenemylevel(u.maxenemyLevel);
      setmaxtokens(u.maxtokens);
      setplayerlevel(u.playerlevel);
      setplayerposition(u.playerposition);
      setstatus(u.status);
      setturncount(u.turncount);
      setcaptrdollars(u.captrdollars);
      setusername(u.username);
      setxp(u.xp);
      setmaxplayerlevel(u.maxplayerlevel);
      setgameState(u.status);
    }
  }

  function removeGmailDomain(email) {
    if (email.endsWith('@gmail.com')) {
      let newenemail = email.slice(0,10); // Remove the last 10 characters
      return newenemail;
    }
    return email; // Return the email as is if it doesn't end with "@gmail.com"
  }

  function prevent(fn, defaultOnly) {
    return (e, ...params) => {
        e && e.preventDefault()
        !defaultOnly && e && e.stopPropagation()
        fn(e, ...params)
    }
  }

  function handleDisplayClick(buttontype){
    
    if (buttontype==="profile"){
      setgameState("UserInfo");
    }

  }

  function handleCardClick(cardNum){
    if(cardNum%4!==0){
      return;
    }

    select_cardSound.play();

    if(cards.indexOf(cardNum) !== -1){
      setcards(cards.filter((card) => card !== cardNum));
    }else if(cards.length < 4){
      setcards([...cards, cardNum]);
    }
  }

  function getCardColorClass(cardNum){
    if(cardNum%4===0){return "card1"}
    if(cardNum%4===1){return "card2"}
    if(cardNum%4===2){return "card3"}
    return "card4"
  }

  async function startGame(em){
    if(cards.length !== 4){
      return;
    }

    

    setmaxtokens(STARTING_GAME.maxtokens);
    setplayerlevel(STARTING_GAME.playerlevel);
    setplayerposition([...STARTING_GAME.playerposition]);
    setenemylevels([...STARTING_GAME.enemylevels])
    setenemyposition([...STARTING_GAME.enemyposition])
    setturncount(STARTING_GAME.turncount)
    setcash(STARTING_GAME.cash)
    setmaxenemylevel(STARTING_GAME.maxenemylevel)
    setcaptrdollars(STARTING_GAME.captrdollars)
    setmaxplayerlevel(STARTING_GAME.maxplayerlevel)
    setstatus("Game");
    await setDoc(doc(db, "users", `${email}`), {
      email: `${email}`,
      cards: cards,
      maxtokens: STARTING_GAME.maxtokens,
      playerlevel: STARTING_GAME.playerlevel,
      playerposition: [...STARTING_GAME.playerposition],
      enemylevels: [...STARTING_GAME.enemylevels],
      enemyposition: [...STARTING_GAME.enemyposition],
      status: "Game",
      turncount: STARTING_GAME.turncount,
      cash: STARTING_GAME.cash,
      maxenemyLevel: STARTING_GAME.maxenemylevel,
      captrdollars: STARTING_GAME.captrdollars,
      username: `${username}`,
      xp: xp,
      maxplayerlevel: STARTING_GAME.maxplayerlevel
    });
    setgameState("Game");
    start_gameSound.play();
  }

  function handleGameReset(){
    setcards([]);
    setmaxtokens(STARTING_GAME.maxtokens);
    setplayerlevel(STARTING_GAME.playerlevel);
    setplayerposition([...STARTING_GAME.playerposition]);
    setenemylevels([...STARTING_GAME.enemylevels]);
    setenemyposition([...STARTING_GAME.enemyposition]);
    setturncount(STARTING_GAME.turncount);
    setcash(STARTING_GAME.cash);
    setmaxenemylevel(STARTING_GAME.maxenemylevel);
    setcaptrdollars(STARTING_GAME.captrdollars);
    setmaxplayerlevel(STARTING_GAME.maxplayerlevel);
    setstatus("Card");
    setgameState("GameOver");
  }

  function handleNextGame(){
    //start_gameSound.play();
    next_gameSound.play();
    setgameState("Card");
  }

  function handleExitClick(){
    setgameState("Card");
  }

  const createNewUser = async (u) => {
    console.log("Creating New User: ", u.email)
    await setDoc(doc(db, "users", `${u.email}`), {
      email: `${u.email}`,
      cards: [],
      maxtokens: 4,
      playerlevel: 10,
      playerposition: [2,3],
      enemylevels: [2,2,1,1,4,3],
      enemyposition: [7,28,4,9,6,15],
      status: "Card",
      turncount: 0,
      cash: 10,
      maxenemyLevel: 4,
      captrdollars: 10,
      username: `${removeGmailDomain(u.email)}`,
      xp: 0,
      maxplayerlevel: 10
    });
    fetchUser(u);
  }

  return (
    <> 
    {gameState==="Game"?(
      <Grid pp={
       {px: playerposition[0],
        py: playerposition[1], 
        ep: enemyposition, 
        el: enemylevels, 
        tc: turncount, 
        cs: cash, 
        mel: maxenemylevel, 
        cd: captrdollars,
        mt: maxtokens,
        em: email,
        cards: cards,
        pl: playerlevel,
        un: username,
        xp: xp,
        mpl: maxplayerlevel,
        status: gameState
      }} onGameReset={handleGameReset}/>
      ):gameState==="Login"?(
        
        <div className='btnlogin'
          //onLoad={login_screenSound.play()}
          onClick={handleGoogleSignIn}>
            SIGN IN WITH GOOGLE
            
          <img className="googlelogo" src={GoogleLogo}/>
        </div>   
      ):gameState==="GameOver"?(
        <div className="nextgamebutton" onClick={() => handleNextGame()}>
          NEXT GAME
        </div>
      ):gameState==="Card"?(//CARD SELECTION SCREEN RENDER
        <>
            <div className="status-barcard">
              <div className="user-box" onClick={prevent(()=>handleDisplayClick("profile",0))}><div className="usericon" ><FontAwesomeIcon icon={faUser} /></div></div>
              <div className="token-containercard"><div className="token-circlecard"><FontAwesomeIcon icon={faCircle} /></div><div className="token-text">{cards.length}/4</div></div>
              <div className="cashcontainercard"><div className="cashsymbolcard"><FontAwesomeIcon icon={faMoneyCheck} /></div><div className="cash-text">{cash}</div></div>
              <div className={cards.length===4 ? "nextturn-boxcard startenabled" : "nextturn-boxcard startdisabled"} onClick={() => startGame(email)}>
                <div className="nextturn-text">
                  START <br></br>GAME
                </div>
                <div className="nextturn-arrow">
                  <FontAwesomeIcon icon={faCaretRight} />
                </div>
              </div>
            </div>

            <div className="card-select-container">
              {cardInfo.map((card, cardNum) => {
                const selected = cards.indexOf(cardNum) !== -1;
                const locked = cardNum%4!==0;

                return (
                  <div
                    className={`card card-select-option ${getCardColorClass(cardNum)} ${selected ? "cardselectselected" : "cardselectdeselected"} ${locked ? "cardselectlocked" : ""}`}
                    key={card.Name}
                    onClick={() => handleCardClick(cardNum)}
                  >  
                    <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle} /></div>
                    <div className="cardtokencost">{card.TokenCost}</div> 
                    <div className="cardname">{card.Name}</div>
                    <div className="cardselectcheck">{selected ? cards.indexOf(cardNum)+1 : ""}</div>
                    {locked ? <div className="cardlock"><FontAwesomeIcon icon={faLock} /></div> : null}
                  </div>
                )
              })}
            </div>
            
            
        </>
      ):gameState==="UserInfo"?(
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
      ):(
        <>
        </>
      )}
    </>
  )
}

export default App
