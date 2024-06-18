import './Header.css'
import {useState, useEffect} from 'react'
import Cookies from 'js-cookie'
import { Menu } from 'react-feather'
import { Link } from 'react-router-dom'
import Logo from '../../assets/logo.svg'

export default function Header({active}) {
  const [username, setUsername] = useState('')

  useEffect(()=> {
    const signature =  sessionStorage.getItem('signature') ?? Cookies.get('signature');
    const username = atob(signature).split(':')[0]
    setUsername(username)
  }, [])  

  const tabs = [
    {
      name: 'Overview',
      link: '/overview',
      id: 1
    },
    {
      name: 'Order Lists',
      link: '/orderlists',
      id: 2
    }
  ]

  const handleLogout = () => {
    sessionStorage.removeItem('signature') 
    Cookies.remove('signature')
    window.location.reload()
  }

  return (
    <div id='header'>
      <div id='header-cont1'> 
        <img src={Logo} id='header-logo' onClick={()=> window.location.href = '/'} />
        <div id='header-cont1-tab'>
          {tabs.map((elem, index)=> (
            <Link 
             className={ elem.id === active ? 'tabs tabs-active' : 'tabs'} 
             key={index} to={elem.link}>
             {elem.name}
            </Link>
          ))}
          <button className='tabs tabs-so' onClick={()=> handleLogout()}>Sign out</button>
        </div>
      </div>
      <div id='header-cont2'>
        <div id='header2-u'>{username}</div>
        <div id='header2-p'>{username[0]}</div>
      </div>
    </div>
  )
}

