import Cookies from 'js-cookie';
import { useEffect } from 'react';

export default function Main() {
  useEffect(()=> {
    const token = sessionStorage.getItem('signature') ?? Cookies.get('signature');
    if (token) {
     window.location.href = "/overview";
    } else {
     window.location.href = "/login";
    }
  }, [])
}
