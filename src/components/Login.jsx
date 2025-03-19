import React, { useState } from 'react'
import '../style.css';
import { Logo, Side, Google } from '../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  // Check if both fields have values
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <>
     <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-6">
          <img src={Logo} alt="" className='p-2'/>
          <div className="p-5">
              <h4 style={{color: '#14181F', fontWeight: '700'}}>Sign In</h4>
              <p style={{color: '#707A8F'}}>Don't have an account? <span style={{color: '#2E3192', fontWeight: '600'}}>Sign Up Here</span></p>
              
              <form className="bg-white rounded">
                  <div className="form-group mb-3">
                      <label htmlFor="exampleInputEmail1">Email <span style={{color: '#707A8F'}}>*</span></label>
                      <input 
                        type="email" 
                        placeholder='Type email here. . .' 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>
                  <div className="form-group" style={{ position: 'relative' }}>
                      <label htmlFor="exampleInputPassword1">Password</label>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder='Type password here. . .'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                      onClick={togglePasswordVisibility}
                      style={{
                          position: 'absolute',
                          top: '70%',
                          right: '10px',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer'
                      }}
                      >
                      {showPassword ? <FontAwesomeIcon icon={faEye} style={{ color: '#707A8F' }} /> : <FontAwesomeIcon icon={faEyeSlash} style={{ color: '#707A8F' }} />}
                      </span>
                  </div>
                  <button 
                    className='log-btn mt-2 w-100' 
                    disabled={!isFormValid}
                    style={{
                      backgroundColor: isFormValid ? '#2E3192' : '#cccccc',
                      cursor: isFormValid ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Sign Up
                  </button>
                  <div className="line-with-text">
                  <span className="line-text">Or</span>
                  </div>
                  <button className='g-btn w-100'><img src={Google} alt=''/> Sign Up with Google</button>
              </form>
          </div>
        </div>
        <div className="col-sm-12 col-md-12 col-lg-6">
          <img src={Side}  alt='' className='l-img h-100'/>
        </div>
     </div>
    </>
  )
}

export default Login