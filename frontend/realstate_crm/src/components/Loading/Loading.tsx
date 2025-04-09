import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './Loading.module.css';

interface LoadingProps {
  isVisible: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return ( 
    <div className={styles["loading-overlay"]}>
      <DotLottieReact
        src="/blueLoading.lottie"
        loop
        autoplay
        backgroundColor="transparent"
        style={{ width: '600px', height: '600px' }}
      />
    </div>
  );
};

export default Loading;