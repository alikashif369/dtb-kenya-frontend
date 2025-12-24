// "use client";
// import { useState, useEffect } from "react";

// interface CounterProps {
//   value: number;      // required
//   duration?: number;  // optional
// }

// export default function Counter({ value, duration = 1500 }: CounterProps) {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     let start = 0;
//     const end = Number(value);
//     if (start === end) return;

//     const increment = Math.ceil(end / (duration / 16));

//     const timer = setInterval(() => {
//       start += increment;
//       if (start >= end) {
//         start = end;
//         clearInterval(timer);
//       }
//       setCount(start);
//     }, 16);

//     return () => clearInterval(timer);
//   }, [value, duration]);

//   return <span>{count.toLocaleString()}</span>;
// }
 


"use client"; // <--- Required for state and effects

import { useState, useEffect } from "react";

interface CounterProps {
  value: number;       
  duration?: number;   
  formatter?: (val: number) => string; 
}

export default function Counter({ value, duration = 1500, formatter }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (start === end) return;

    // Calculation for smooth count
    const increment = Math.ceil(end / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  // Apply formatter or fallback to default toLocaleString
  const displayValue = formatter ? formatter(count) : count.toLocaleString();

  return <span>{displayValue}</span>; 
}