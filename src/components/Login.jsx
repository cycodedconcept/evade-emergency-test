import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import '../style.css';
import { Logo, Side, Google } from '../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Form, useNavigate } from 'react-router-dom';
import { loginUser } from '../features/userSlice';
import Swal from 'sweetalert2';


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loading, error, success } = useSelector((state) => state.user);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in both your email and password.',
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
        title: "Validating Pin...",
        text: "Please wait while we process your request.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await dispatch(loginUser({formData})).unwrap();
      console.log(response)

      Swal.close();

      if (response.message[0].type === "admin") {
        navigate('/dashboard')
      }
    } catch (error) {
      if (error) {
        console.error("Login Failed:", error);
            
          let errorMessage = "Something went wrong";
      
          if (error && typeof error === "object") {
              if (Array.isArray(error)) {
                  errorMessage = error.map(item => item.message).join(", ");
              } else if (error.message) {
                  errorMessage = error.message;
              } else if (error.response && error.response.data) {
                  errorMessage = Array.isArray(error.response.data) 
                      ? error.response.data.map(item => item.message).join(", ") 
                      : error.response.data.message || JSON.stringify(error.response.data);
              }
          }
      
          Swal.fire({
              icon: "error",
              title: "Error Occurred",
              text: errorMessage,
          });
      }
    }
  }

  return (
    <>
     <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-6">
          <img src={Logo} alt="" className='p-2'/>
          <div className="p-5">
              <h4 style={{color: '#14181F', fontWeight: '700'}}>Sign In</h4>
              <p style={{color: '#707A8F'}}>Don't have an account? <span style={{color: '#2E3192', fontWeight: '600'}}>Sign Up Here</span></p>
              
              <form className="bg-white rounded" onSubmit={handleLogin}>
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
                    {
                      loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="sr-only"></span>
                        </div>
                        <span>Logging in... </span>
                      </>
                      ) : ('Sign Up')
                    }
                    
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