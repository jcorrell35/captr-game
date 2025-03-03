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
import { ProgressBar }  from './Components/Progress';
import { cardInfo } from './Components/Cards';

function App() {
  const [gameState, setgameState] = useState("Login"); //Login, Card, Game (SET THIS TO LOGIN TO TEST LOGIN SCREEN)

  //USERS DATA
  const [cards, setcards] = useState([0,4,8,20])
  const [cash, setcash] = useState(100)
  const [email, setemail] = useState("captrgametest@gmail.com")
  const [enemylevels, setenemylevels] = useState([2,1,2,1,3,1,2])
  const [enemyposition, setenemyposition] = useState([5,6,25,28,27,2,14])
  const [maxenemylevel, setmaxenemylevel] = useState(3)
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
      setcards(u.cards);
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
      setcards(u.cards);
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

  function startGame(em){
    setmaxtokens(4);
    setplayerlevel(10);
    setplayerposition([3,2]);
    setenemylevels([2,2,1,1,4,3])
    setenemyposition([7,28,4,9,6,15])
    setturncount(0)
    setcash(100)
    setmaxenemylevel(4)
    setcaptrdollars(10)
    setmaxplayerlevel(10)
    setcards([0,4,8,12]); //MAKE THIS THE CARDS THAT ARE SELECTED
    setstatus("Game");
    setgameState("Game");
  }

  function handleExitClick(){
    setgameState("Card");
  }

  const createNewUser = async (u) => {
    console.log("Creating New User: ", u.email)
    await setDoc(doc(db, "users", `${u.email}`), {
      email: `${u.email}`,
      cards: [0,4,8,12],
      maxtokens: 4,
      playerlevel: 10,
      playerposition: [2,3],
      enemylevels: [2,2,1,1,4,3],
      enemyposition: [7,28,4,9,6,15],
      status: "Game",
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
      }}/>
      ):gameState==="Login"?(
        <div className='btnlogin'
        
          onClick={handleGoogleSignIn}>
            SIGN IN WITH GOOGLE
          <img className="googlelogo" src={GoogleLogo}/>
        </div>   
      ):gameState==="Card"?(//CARD SELECTION SCREEN RENDER
        <>
            <div className="status-barcard">
              <div className="user-box" onClick={prevent(()=>handleDisplayClick("profile",0))}><div className="usericon" ><FontAwesomeIcon icon={faUser} /></div></div>
              <div className="token-containercard"><div className="token-circlecard"><FontAwesomeIcon icon={faCircle} /></div><div className="token-text">{maxtokens==0 ? '--' : maxtokens}</div></div>
              <div className="cashcontainercard"><div className="cashsymbolcard"><FontAwesomeIcon icon={faMoneyCheck} /></div><div className="cash-text">{cash}</div></div>
              <div className="nextturn-boxcard" onClick={() => startGame(email)}>
                <div className="nextturn-text">
                  START <br></br>GAME
                </div>
                <div className="nextturn-arrow">
                  <FontAwesomeIcon icon={faCaretRight} />
                </div>
              </div>
            </div>

            {/* WE NEED TO MODIFY THIS TO BE FUNCTIONAL BY PICKING CARDS */}
            <div className="card-container">
              <div className="card card1" onClick={() => handleCardClick(cards[0])}>  
                <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle} /></div>
                <div className="cardtokencost">{cardInfo[cards[0]].TokenCost}</div> 
                <div className="cardname">{cardInfo[cards[0]].Name}</div>
                <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",0))}>i</button>
              </div>
              <div className="card card2"onClick={() => handleCardClick(cards[1])}> 
                <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
                <div className="cardtokencost">{cardInfo[cards[1]].TokenCost}</div> 
                <div className="cardname">{cardInfo[cards[1]].Name}</div>
                <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",1))}>i</button>
              </div>
              <div className="card card3" onClick={() => handleCardClick(cards[2])}> 
                <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
                <div className="cardtokencost">{cardInfo[cards[2]].TokenCost}</div> 
                <div className="cardname">{cardInfo[cards[2]].Name}</div>
                <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",2))}>i</button>
              </div>  
              <div className="card card4" onClick={() => handleCardClick(cards[3])}> 
                <div className="cardtokenicon"><FontAwesomeIcon icon={faCircle}/></div>
                <div className="cardtokencost">{cardInfo[cards[3]].TokenCost}</div> 
                <div className="cardname">{cardInfo[cards[3]].Name}</div>
                <button className="cardinfobutton" onClick={prevent(()=>handleDisplayClick("info",3))}>i</button>
              </div>
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
