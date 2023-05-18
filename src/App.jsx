import { useState } from 'react'
import { Grid } from './Components/Grid'
import {auth, provider} from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { collection, addDoc, getDocs, setDoc, onSnapshot, getFirestore, query, where, doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig';



function App() {
  const [gameState, setgameState] = useState("Login"); //Login, Card, Game
  
  //USERS DATA
  const [cards, setcards] = useState(0)
  const [cash, setcash] = useState(0)
  const [email, setemail] = useState(0)
  const [enemylevels, setenemylevels] = useState(0)
  const [enemyposition, setenemyposition] = useState(0)
  const [maxenemylevel, setmaxenemylevel] = useState(0)
  const [maxtokens, setmaxtokens] = useState(0)
  const [playerlevel, setplayerlevel] = useState(0)
  const [playerposition, setplayerposition] = useState(0)
  const [status, setstatus] = useState(0)
  const [captrdollars, setcaptrdollars] = useState(0)
  const [turncount, setturncount] = useState(0)

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
      setmaxenemylevel(u.maxenemylevel);
      setmaxtokens(u.maxtokens);
      setplayerlevel(u.playerlevel);
      setplayerposition(u.playerposition);
      setstatus(u.status);
      setturncount(u.turncount);
      setcaptrdollars(u.captrdollars);
      setgameState("Game");
    }else{
      setgameState("Card");
    }
  }

  const createNewUser = async (u) => {
    console.log("Creating New User: ", u.email)
    await setDoc(doc(db, "users", `${u.email}`), {
      email: `${u.email}`,
      cards: [0,4,8,12],
      maxtokens: 4,
      playerlevel: 10,
      playerposition: [2,3],
      enemylevels: [2,2,1,1],
      enemyposition: [7,28,4,9],
      status: "Game",
      turncount: 0,
      cash: 10,
      maxenemyLevel: 2,
      captrdollars: 100
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
        pl: playerlevel
      }}/>
      ):gameState==="Login"?(
        <button className='btn btn-danger btn-md'
          onClick={handleGoogleSignIn}>
          Sign In With Google
        </button>  
      ):(
        <button onClick={() => setgameState("Game")}>GO TO GAME</button>
      )}
    </>
  )
}

export default App
