import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import Header from '../../Components/Header/Header.jsx'
import './View.css'
import { useParams } from 'react-router-dom'
import {
   Calendar, 
   ShoppingBag, 
   ShoppingCart, 
   Mail, 
   Smartphone,
   User,
   Printer
} from 'react-feather'

export default function View() {
  let { id } = useParams()
  const [showContent, setShowContent] = useState(false)
  const [data, setData]  = useState(null)
  const [trackLink, setrackLink] = useState(null)
  const [shippingMethod, setShippingMethod] = useState(null)


  const makeRequest = (url, func) => {
    const token = sessionStorage.getItem('signature') ?? Cookies.get('signature')
    fetch(url, {
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
        func(data)

        
        fetch('https://app.shipmondo.com/api/public/v3/shipment_templates', {
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
        }).then(d => {
           const target = d.find(elem => elem.id === data.shipment_template_id)
           
           if (target?.name) setShippingMethod(target?.name)
           else setShippingMethod(false)
        }).catch(error => {
           if (error.status  === '401') {
            sessionStorage.removeItem('signature') 
            Cookies.remove('signature')
            window.location.reload()
           }
        });
        

        const i = data?.order_fulfillments[0]?.shipment_id
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
           const needed = data.find(elem => elem.id === i)
           if (needed !== undefined) {
              const packageNo = needed.parcels[0].pkg_nos
              const shippingAgent =
                 needed.service_point?.shipping_agent ?? needed.carrier_code
              const packageType = needed.parcels[0]?.package_type
              const link = packageNo.map(elem => {
                 return `https://track.shipmondo.com/${shippingAgent}/${elem}?type=${packageType}`
              })
              if (link?.length > 0)  {  setrackLink(link[0]) } 
              else setrackLink(false)
            } else setrackLink(false)
        }).catch(error => {
           if (error.status  === '401') {
            sessionStorage.removeItem('signature') 
            Cookies.remove('signature')
            window.location.reload()
           }
        });
    })
    .catch(error => {
      if (error.status  === '401') {
        sessionStorage.removeItem('signature') 
        Cookies.remove('signature')
        window.location.reload()
      } else func(false)
    });
  }

  useEffect(()=> {
   const token = sessionStorage.getItem('signature') ?? Cookies.get('signature')
   if (token) {
      setShowContent(true)
      makeRequest(`https://app.shipmondo.com/api/public/v3/sales_orders/${id}`, setData)
    } else window.location.href = "/login"
  }, []);

const downloadPdf = (url, name) => {
  const token = sessionStorage.getItem('signature') ?? Cookies.get('signature');
  
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw { status: `${response.status}` };
    }
    return response.json();  // Parse the response as JSON
  })
  .then(data => {
    console.log(data)
    const base64 = data.packing_slips[0].base64;  // Extract the base64 string
    const binaryString = atob(base64);  // Decode the base64 string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });  // Create a Blob object
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = name;  // Set the desired filename
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 0);  // Clean up the URL object
  })
  .catch(error => {
    if (error.status === '401') {
      sessionStorage.removeItem('signature');
      Cookies.remove('signature');
      window.location.reload();
    } else {
      console.error('Download error:', error);
    }
  });
};


  return (
    <>
     { showContent && (
      <>
       <Header active={2} />
      {data && (
       <>
       <div className='main-cont'>
         <h3 style={{marginTop:10}}> Order Details </h3>
         <div id='view-top-cont'>
           <div className='vtc-bud'>  
             <h3>Order Details: &nbsp; {data.order_id} </h3>
             {/**/}
             <div className='vtcb-l' style={{ marginTop: 15 }}>
                <div className='vtcb-lsub'>
                  <Calendar color='rgba(0,0,0,0.3)' />
                  <div> Date Added </div>
                </div>
                <div className='vtcb-l-t'> {new Date(data.created_at).toLocaleDateString()} </div>
             </div>
             <div className='vtcb-l'>
                <div className='vtcb-lsub'>
                  <ShoppingBag color='rgba(0,0,0,0.3)' />
                  <div> Payment Method </div>
                </div>
                <div className='vtcb-l-t'>
                  ${data.payment_details?.amount_including_vat ?? '0.0'} 
                </div>
             </div>
             <div className='vtcb-l' style={{borderBottom: 0}}>
                <div className='vtcb-lsub'>
                  <ShoppingCart color='rgba(0,0,0,0.3)' />
                  <div> Shipping Method </div>
                </div>
                {shippingMethod === null ? <div className='loader-view'></div> :
                  shippingMethod === false ? 
                  <div className='vtcb-l-t'>Cannot Determine</div> :
                  <div className='vtcb-l-t'> {shippingMethod} </div>
                }
             </div>
             {/**/}
           </div>




           <div className='vtc-bud'>  
             <h3>Customer Details </h3>
             {/**/}
             <div className='vtcb-l' style={{ marginTop: 15 }}>
                <div className='vtcb-lsub'>
                  <User color='rgba(0,0,0,0.3)' />
                  <div> Customer </div>
                </div>
                <div className='vtcb-l-t'> {data.ship_to.name} </div>
             </div>
             <div className='vtcb-l'>
                <div className='vtcb-lsub'>
                  <Mail color='rgba(0,0,0,0.3)' />
                  <div> Email </div>
                </div>
                <div className='vtcb-l-t'> {data.ship_to.email} </div>
             </div>
             <div className='vtcb-l' style={{borderBottom: 0}}>
                <div className='vtcb-lsub'>
                  <Smartphone color='rgba(0,0,0,0.3)' />
                  <div> Phone </div>
                </div>
                <div className='vtcb-l-t'>{data.ship_to.mobile}</div>
             </div>
             {/**/}
           </div>




           <div className='vtc-bud'>  
             <h3>Shipping Details </h3>
             {/**/}
             <div className='vtcb-l' style={{ marginTop: 15 }}>
                <div className='vtcb-lsub'>
                  <ShoppingCart color='rgba(0,0,0,0.3)' />
                  <div> Shipping </div>
                </div>
                <div className='vtcb-l-t'> {data.order_status} </div>
             </div>
             <div className='vtcb-l'>
                <div className='vtcb-lsub'>
                  <Printer color='rgba(0,0,0,0.3)' />
                  <div> Invoice </div>
                </div>
                <div className='vtcb-l-t'> 
                 {data.order_fufillments &&
                 data.order_fufillments[0] && 
                 data.order_fufillments[0]?.created_at ? 
                  new Date(data.order_fufillments[0]?.created_at).toLocaleDateString() : 
                  new Date(data.created_at).toLocaleDateString() 
                 } </div>
             </div>
             <div className='vtcb-l' style={{borderBottom: 0}}>
                <div className='vtcb-lsub'>
                  <ShoppingCart color='rgba(0,0,0,0.3)' />
                  <div> Shipping Method </div>
                </div>
                {trackLink === null ? <div className='loader-view'></div> :
                  trackLink === false ? <div className='vtcb-l-t'>No Track Link</div> :
                   <div className='vtcb-l-t' style={{
                   textDecoration: 'underline', cursor: 'pointer'
                   }} onClick={() => {
                     window.open(trackLink, '_blank')
                   }}>Track</div>
                }
             </div>
             {/**/}
           </div>
         </div>


         <div id='view-bottom-cont'>
          <h3>Other Informations </h3>
          <div className='vbc-l' style={{ marginTop: '0.5em'}}>
            <div>Packing Slip </div>
            <button onClick={()=> 
             downloadPdf(
               `https://app.shipmondo.com/api/public/v3/sales_orders/${id}/packing_slips`,
               'packing_slip'
              )}> Get </button>
          </div>
          <div className='vbc-l'>
            <div>Pick List </div>
            <button onClick={()=> 
             downloadPdf(
               'https://app.shipmondo.com/api/public/v3/pick_lists',
               'pick_list'
              )}> Get </button>
          </div>
          <div className='vbc-l' style={{ borderBottom: 0 }}>
            <div>Proforma Invoice </div>
            <button onClick={()=> 
             downloadPdf(
               `https://app.shipmondo.com/api/public/v3/shipments/${id}/proforma_invoices`,
               'proforma_invoice'
              )}> Get </button>
          </div>
         </div>
       </div>
       </>
       )}
      </>
     )}
    </>
  )
}

