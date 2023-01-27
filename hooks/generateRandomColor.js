import {useState} from 'react';
  
const useGenerateRandomColor = () => {
    const [color,setColor] = useState("");

    /**
   * @param {number} min
   * @param {number} max
   */
    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min) ) + min;
    }

    const generateColor = () =>{
      const r = randomInt(1, 250);
      const g = randomInt(1, 250);
      const b = randomInt(1, 250);
     
     setColor('rgb(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ')');
    };

    return {color,generateColor};
};

export default useGenerateRandomColor;
