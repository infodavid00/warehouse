
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import Header from '../../Components/Header/Header.jsx'

export default function Overview({active}) {
  const [showContent, setShowContent] = useState(false)

  useEffect(()=> {
   const token =  sessionStorage.getItem('signature') ?? Cookies.get('signature');
   if (token) setShowContent(true)
   else {
     window.location.href = "/login"
   }
  }, []);

  return (
    <>
      {showContent && (
        <>
          <Header active={active} />
          <div className='main-cont'>
            <h1> Overview </h1>
          </div>
        </>
      )}
    </>
  )
}
