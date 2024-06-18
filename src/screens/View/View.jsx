import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import Header from '../../Components/Header/Header.jsx'
import './View.css'
import { useParams } from 'react-router-dom'

export default function View() {
  let { id } = useParams()
  const [showContent, setShowContent] = useState(false)
  const [data, setData]  = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(()=> {
   const token = sessionStorage.getItem('signature') ?? Cookies.get('signature')
   if (token) {
      setShowContent(true)
      fetch(`https://app.shipmondo.com/api/public/v3/sales_orders/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${token}`
        }
      }).then(response => {
        if (!response.ok) {
           throw { status:`${response.status}`};
        }
        return response.json(); 
      }).then(data => {
        setData(data)
      })
      .catch(error => {
       if (error.status === '404') {
         console.log('not found')
       } else if (error.status  === '401') {
        sessionStorage.removeItem('signature') 
        Cookies.remove('signature')
        window.location.reload()
       } else {

       }
      });
    } else window.location.href = "/login"
  }, []);

  return (
    <>
     { showContent && (
      <>
       <Header active={2} />
       <div className='main-cont'>
         <h1>Hello Mom! </h1>
       </div>
      </>
     )}
    </>
  )
}

