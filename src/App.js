import './App.css';
import Denoiser from './Denoiser';
import Denoiserfile from './Denoiserfile';

function App() {
  return (
    <>
    <h1>Denoiser with Mic includes pause count</h1>
      <Denoiser />
      <br></br>
      <h1>Denoiser with file upload</h1>
      <Denoiserfile />
    </>
  );
}

export default App;
