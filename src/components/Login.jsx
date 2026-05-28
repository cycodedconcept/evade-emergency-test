import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import '../style.css';
import { Logo, Side, Google } from '../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../features/userSlice';
import { responderAgentLogin } from '../features/responderSlice';
import Swal from 'sweetalert2';


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');

  const { loading: adminLoading } = useSelector((state) => state.user);
  const { loading: agentLoading } = useSelector((state) => state.responder);
  const loading = loginType === 'admin' ? adminLoading : agentLoading;


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const isAdminLogin = loginType === 'admin';
  const isFormValid = isAdminLogin
    ? email.trim() !== '' && licenseKey.trim() !== '' && password.trim() !== ''
    : email.trim() !== '' && password.trim() !== '';

  const resetFormState = (nextType) => {
    setLoginType(nextType);
    setShowPassword(false);
    setEmail('');
    setPassword('');
    setLicenseKey('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isAdminLogin && (!email || !password || !licenseKey)) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in your license key, email, and password.',
        confirmButtonColor: '#7A0091'
      });
      return;
    }

    if (!isAdminLogin && (!email || !password)) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in your email and password.',
        confirmButtonColor: '#7A0091'
      });
      return;
    }

    if (password.length < 3) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'password can not be less than 3 characters...',
        confirmButtonColor: '#7A0091'
      });
      return;
    }

    try {
      Swal.fire({
        title: "Validating Credentials...",
        text: "Please wait while we process your request.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = isAdminLogin
        ? await dispatch(
            loginUser({
              license_key: licenseKey,
              email,
              password,
            })
          ).unwrap()
        : await dispatch(
            responderAgentLogin({
              email,
              password,
            })
          ).unwrap();

      Swal.close();

      if (response.message === 'Invalid credential') {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: response.message, // This will show "Invalid credential"
          confirmButtonColor: '#1f81ec'
        });
        return; // Exit early, don't proceed with successful login logic
      }

      if (
        response.message === "Login successful" ||
        response?.token ||
        /successful/i.test(response?.message || '')
      ) {
        navigate('/dashboard')
      }
    } catch (error) {
  
      let errorMessage = "Something went wrong";
      
      if (error && typeof error === "object") {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.payload && error.payload.message) {
          errorMessage = error.payload.message;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#1f81ec'
      });
    }
  }

  return (
    <>
     <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-6">
          <img src={Logo} alt="" className='p-2'/>
          <div className="p-1 p-lg-5">
              <h4 style={{color: '#14181F', fontWeight: '700'}}>Sign In</h4>
              <p style={{color: '#707A8F'}}>Don't have an account? <span style={{color: '#2E3192', fontWeight: '600'}}>Sign Up Here</span></p>

              <div
                className="d-flex mb-4"
                style={{
                  background: '#F5F7FA',
                  borderRadius: '14px',
                  padding: '6px',
                  gap: '6px',
                }}
              >
                <button
                  type="button"
                  onClick={() => resetFormState('admin')}
                  style={{
                    flex: 1,
                    border: 0,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    background: isAdminLogin ? '#2E3192' : 'transparent',
                    color: isAdminLogin ? '#fff' : '#707A8F',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => resetFormState('agent')}
                  style={{
                    flex: 1,
                    border: 0,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    background: !isAdminLogin ? '#2E3192' : 'transparent',
                    color: !isAdminLogin ? '#fff' : '#707A8F',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Agent
                </button>
              </div>
              
              <form className="rounded" onSubmit={handleLogin}>
                  {isAdminLogin ? (
                    <div className="form-group mb-0">
                      <label htmlFor="exampleInputEmail1">license key <span style={{color: '#707A8F'}}>*</span></label>
                      <input 
                        type="text" 
                        placeholder='Type your Liscence key here. . .'
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                      />
                    </div>
                  ) : null}
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
                          top: '57%',
                          right: '10px',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer'
                      }}
                      >
                      {showPassword ? <FontAwesomeIcon icon={faEye} style={{ color: '#707A8F' }} /> : <FontAwesomeIcon icon={faEyeSlash} style={{ color: '#707A8F' }} />}
                      </span>
                  </div>
                  <button 
                    className='log-btn my-3 my-lg-1 w-100' 
                    disabled={!isFormValid}
                    style={{
                      backgroundColor: isFormValid ? '#2E3192' : '#cccccc',
                      cursor: isFormValid ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {
                      loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="sr-only"></span>
                        </div>
                        <span>Logging in... </span>
                      </>
                      ) : ('Log In')
                    }
                    
                  </button>
              </form>
          </div>
        </div>
        <div className="col-sm-12 col-md-12 col-lg-6 tl">
          <img src={Side}  alt='' className='l-img h-100'/>
        </div>
     </div>
    </>
  )
}

export default Login
