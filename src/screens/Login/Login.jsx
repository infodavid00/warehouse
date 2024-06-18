import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import './Login.css'
import '../../index.css'
import Photo from '../../assets/login.svg'

export default function Login() {
  const [username,setusername] = useState('')
  const [password,setpassword] = useState('')
  let requirementsMet = username.length > 2 && password .length > 2;

  const [checked, setChecked] = useState(false);
  const handleChange = () => {
    setChecked(!checked);
  };

  const handleLogin = () => {
    const token = `${username}:${password}`
    const token_encoded = btoa(token)
    if (!checked) {
      sessionStorage.setItem('signature', token_encoded)
    } 
    else Cookies.set('signature', token_encoded)
    window.location.href = "/"
  }

  return (
    <div id='loginBody'>
      <div id='cont1'>
         <h1 style={{fontFamily: "extrabold"}}>Sign in </h1>

         <div className='cont1-pack'>
            <div className='cont1-pack-title'>Username</div>
            <input type="text" onChange={(e) => 
              setusername(e.target.value)} placeholder="my name" />
         </div>

         <div className='cont1-pack'>
            <div className='cont1-pack-title'>Password</div>
            <input type="password" onChange={(e) => 
              setpassword(e.target.value)} placeholder="123456" />
         </div>

         <div className='cont1-pack cont1-rm'>
          <div className='checkbox-container'>
            <input
             type='checkbox'
             checked={checked}
             onChange={handleChange}
             className='login-checkbox'
            />
          </div>
          <span className='input-checkbox-label'>Remember Me</span>
         </div>

         <div className='cont1-pack'>
            <button style={{
              opacity: requirementsMet ? 1 : 0.6,
              cursor: requirementsMet ? 'pointer' : 'auto',
            }} disabled={requirementsMet ? false : true} 
            onClick={()=> handleLogin()}>Continue</button>
         </div>
      </div>

      <div id='cont2'>
        <img src={Photo} id='login-img' />
      </div>
    </div>
  )
}
