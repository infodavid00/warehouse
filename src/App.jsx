import { Routes, Route } from 'react-router-dom'
import Main from './screens/Main'
import Login from './screens/Login/Login'
import Overview from './screens/Overview/Overview'
import Order from './screens/Order/Order'
import View from './screens/View/View'

export default function App() {
  return (
    <>
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/overview" element={<Overview active={1} />} />
        <Route exact path="/orderlists" element={<Order active={2} />} />
        <Route exact path="/view/:id" element={<View active={3} />} />
      </Routes>
    </>
  )
}
