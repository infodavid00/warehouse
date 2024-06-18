
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import Header from '../../Components/Header/Header.jsx'
import './Order.css'
import { Search } from 'react-feather'

export default function Order({active}) {
  const [showContent, setShowContent] = useState(false)
  const [status, setStatus] = useState('loading')
  const [selectedOption,handleSelectChange] = useState('')
  const [data, setData]  = useState([])
  const [dataBackup, setDataBackup]  = useState([])
  const [search, setSearch] = useState('')
  const [trackLinks, setrackLinks] = useState([])

  useEffect(()=> {
    const token = sessionStorage.getItem('signature') ?? Cookies.get('signature');
    if (token) {
      setShowContent(true)
      fetch('https://app.shipmondo.com/api/public/v3/sales_orders', {
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
        setDataBackup(data)
        setData(data);
        setStatus('ok')
      })
      .catch(error => {
       if (error.status  === '401') {
        sessionStorage.removeItem('signature') 
        Cookies.remove('signature')
        window.location.reload()
       }
       // else {  console.log(error.status)  }
      });
    } else {
      window.location.href = "/login"
    }
  }, []);

  const pColor = (rep) => {
    const AF = ['A', 'B', 'C', 'D', 'E', 'F']
    const GL = ['G', 'H', 'I', 'J', 'K', 'L']
    const MR = ['M', 'N', 'O', 'P', 'Q', 'R']
    const SX = ['S', 'T', 'U', 'V', 'W', 'X']
    if (AF.includes(rep.toUpperCase())) {
      return 'green'
    } else if (AF.includes(rep.toUpperCase())) {
      return 'dodgerblue'
    } else if (AF.includes(rep.toUpperCase())) {
      return 'orange'
    } else if (AF.includes(rep.toUpperCase())) {
      return 'tomato'
    } else {
      return 'indigo'
    }
  }

  const statusColor = (stats) => {
     const cl = {
       bg: '',
       fg: ''
     } 
     
     if (stats === 'open') {
        cl.bg = 'rgba(0,0,200,0.1)',
        cl.fg = 'dodgerblue'
     } else if (stats === 'processing') {
        cl.bg = 'rgba(0,200,0,0.1)',
        cl.fg = 'rgba(0,160,0)'
     } else if (stats === 'packed') {
        cl.bg = 'rgba(0,200,0,0.1)',
        cl.fg = 'rgba(0,160,0)'
     } else if (stats === 'cancelled') {
        cl.bg = 'rgba(200,0,0,0.1)',
        cl.fg = 'tomato'
     } else if (stats === 'on_hold') {
        cl.bg = 'rgba(200,0,0,0.1)',
        cl.fg = 'tomato'
     } else if (stats === 'sent') {
        cl.bg = 'rgba(100,200,0,0.1)',
        cl.fg = 'orange'
     } else if (stats === 'picked_up') {
        cl.bg = 'rgba(100,200,0,0.1)',
        cl.fg = 'orange'
     } else if (stats === 'archived') {
        cl.bg = '#e9e9e9',
        cl.fg = 'black'
     } else if (stats === 'ready_for_pickup') {
        cl.bg = 'rgba(100,200,0,0.1)',
        cl.fg = 'orange'
     } else if (stats === 'released') {
        cl.bg = 'rgba(100,200,0,0.1)',
        cl.fg = 'orange'
     } else {
        cl.bg = '#e9e9e9',
        cl.fg = 'black'
     }
     return cl
  }

  const handleSearch = (e) => setSearch(e.target.value)

  useEffect(()=> {
    if (search.length === 0) setData(dataBackup)
    else {
     if (dataBackup.find(elem => elem.order_id === search))
        setData([dataBackup.find(elem => elem.order_id === search)])
     else setData([])
    }
  }, [search])

  const getTrackLink = id => {
     const token = sessionStorage.getItem('signature') ?? Cookies.get('signature');
     fetch('https://app.shipmondo.com/api/public/v3/shipments', {
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
        const needed = data.find(elem => elem.id === id)
        const packageNo = needed.parcels[0].pkg_nos
        const shippingAgent = needed.service_point?.shipping_agent ?? needed.carrier_code
        const packageType = needed.parcels[0]?.package_type
        const links = packageNo.map(elem => {
          return `https://track.shipmondo.com/${shippingAgent}/${elem}?type=${packageType}`
        })
        setrackLinks(links)
      })
      .catch(error => {
       if (error.status  === '401') {
        sessionStorage.removeItem('signature') 
        Cookies.remove('signature')
        window.location.reload()
       }
     });
  }

  const handleChange = (e) => {
    const selectedValue = e.target.value;
  
    if (!selectedValue.startsWith('http')) {
      window.open(`/view/${selectedValue}`, '_blank');
    } else if (selectedValue) {
      window.open(selectedValue, '_blank');
    }
  };

  return (
    <>
      {showContent && (
        <>
          <Header active={active} />
          <div className='main-cont'>
           {status === 'ok' ? (
            <>
            <h3 style={{marginTop:10}}> Order Listing </h3>
            <div id='ols-main'> 
              <div id='old-search'>
                <Search color='rgba(0,0,0,0.5)' />
                <input placeholder="Search Order" onChange={e => handleSearch(e)}  value={search} />
              </div>

              <table id='ols-table'>
               <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>STATUS</th>
                  <th>TOTAL</th>
                  <th>DATE ADDED</th>
                  <th>DATE MODIFIED</th>
                  <th>ACTIONS</th>
                </tr>
               </thead>
               <tbody>
                {data.map((elem, index) => (
                <tr key={index}>
                  <td className='ols-oid'>{elem.order_id}</td>
                  <td>
                    <div className='ols-cst-a'>
                      <div className='ols-cst-p' style={{ color: pColor(elem?.ship_to?.name[0].toUpperCase())}}>
                       {elem?.ship_to?.name[0].toUpperCase()}
                      </div>
                      <div className='ols-cst'>{elem?.ship_to?.name}</div>
                    </div>
                  </td>
                  <td>  
                    <button className='ols-btn' style={{
                      backgroundColor: statusColor(elem.order_status).bg, 
                      color: statusColor(elem.order_status).fg
                    }}>{elem.order_status}</button>
                  </td>
                  <td className='ols-dl'>
                    ${elem.payment_details?.amount_including_vat ?? '0.0'}
                  </td>
                  <td className='ols-dl'>{new Date(elem.created_at).toLocaleDateString()}</td>
                  <td className='ols-dl'>{new Date(elem.updated_at).toLocaleDateString()}</td>
                  <td>
                     <div className="dropdown-container">
                      <select className="elegant-dropdown"
                          onClick={()=> getTrackLink(elem.order_fulfillments[0]?.shipment_id)}
                          value={selectedOption} onChange={handleChange} onBlur={()=> setrackLinks([])}>
                         <option value="" disabled> Actions  </option>
                         <option value={elem.id}>View</option>
                         {trackLinks.map((elem,index) => (
                             <option key={elem} id={elem} value={elem}> Track </option>
                         ))}
                      </select>
                     </div>
                  </td>
                </tr>
                ))}
                </tbody>
             </table>
            </div>
            </>
            ) : (
              <div className='loader'></div>
            )}
          </div>
        </>
      )}
    </>
  )
}
