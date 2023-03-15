import { UnityProvider } from 'contexts/UnityProvider';
import Play from '../Play';

const unityConfig = {
  loaderUrl: 'Build/1.loader.js',
  dataUrl: 'Build/1.data.unityweb',
  frameworkUrl: 'Build/1.framework.js.unityweb',
  codeUrl: 'Build/1.wasm.unityweb',
};

const Home = () => {
  return (
    <UnityProvider unityConfig={unityConfig}>
      <Play />
    </UnityProvider>
  );
};

export default Home;
